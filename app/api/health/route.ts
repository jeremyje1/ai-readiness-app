import { env, isEnvConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    stripe: {
      status: 'ok' | 'error';
      mode?: 'test' | 'live';
      error?: string;
    };
    email: {
      status: 'ok' | 'error';
      provider: string;
      error?: string;
    };
    openai: {
      status: 'ok' | 'error';
      error?: string;
    };
  };
  environment: {
    nodeEnv: string;
    appUrl: string;
    buildTime?: string;
  };
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok' },
      stripe: { status: 'ok' },
      email: { status: 'ok', provider: 'postmark' },
      openai: { status: 'ok' }
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      appUrl: env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  };

  // First check if environment is configured
  if (!isEnvConfigured()) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Environment not properly configured',
        checks: {
          database: { status: 'error', error: 'Environment not configured' },
          stripe: { status: 'error', error: 'Environment not configured' },
          email: { status: 'error', provider: 'none', error: 'Environment not configured' },
          openai: { status: 'error', error: 'Environment not configured' }
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          appUrl: 'not_configured'
        }
      },
      { status: 503 }
    );
  }

  // Check database connectivity
  try {
    const dbStart = Date.now();
    const supabase = await createClient();
    const { error } = await supabase
      .from('ai_readiness_assessments')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows, which is fine

    result.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart
    };
  } catch (error) {
    result.checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
    result.status = 'unhealthy';
  }

  // Check Stripe configuration
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil'
    });

    // Just verify we can create a client
    const mode = process.env.STRIPE_SECRET_KEY.includes('_test_') ? 'test' : 'live';

    result.checks.stripe = {
      status: 'ok',
      mode
    };
  } catch (error) {
    result.checks.stripe = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Stripe configuration error'
    };
    result.status = result.status === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  // Check email configuration
  try {
    if (!process.env.POSTMARK_API_TOKEN && process.env.NODE_ENV === 'production') {
      throw new Error('Email service not configured for production');
    }

    result.checks.email = {
      status: 'ok',
      provider: process.env.POSTMARK_API_TOKEN ? 'postmark' : 'disabled'
    };
  } catch (error) {
    result.checks.email = {
      status: 'error',
      provider: 'none',
      error: error instanceof Error ? error.message : 'Email configuration error'
    };
    result.status = result.status === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  // Check OpenAI configuration
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    result.checks.openai = {
      status: 'ok'
    };
  } catch (error) {
    result.checks.openai = {
      status: 'error',
      error: error instanceof Error ? error.message : 'OpenAI configuration error'
    };
    result.status = result.status === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  // Add response headers for monitoring
  const headers = {
    'X-Health-Status': result.status,
    'X-Response-Time': `${Date.now() - startTime}ms`,
    'Cache-Control': 'no-store, max-age=0'
  };

  return NextResponse.json(result, {
    status: result.status === 'healthy' ? 200 : result.status === 'degraded' ? 206 : 503,
    headers
  });
}