import { emailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phone?: string;
  title?: string;
  billing: 'monthly' | 'yearly';
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistrationData = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.organization) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate a temporary password if none provided
    const tempPassword = body.password || `TempPass${Date.now()}!`;

    // Create Supabase Auth user
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Authentication service not available' },
        { status: 500 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: body.firstName,
        last_name: body.lastName,
        full_name: `${body.firstName} ${body.lastName}`,
        organization: body.organization,
        phone: body.phone,
        title: body.title,
        billing: body.billing,
        created_via: 'registration_flow'
      }
    });

    if (authError) {
      console.error('Supabase user creation error:', authError);
      return NextResponse.json(
        { error: `Registration failed: ${authError.message}` },
        { status: 400 }
      );
    }

    const userId = authData.user?.id || `fallback_${Date.now()}`;

    console.log('✅ User created in Supabase Auth:', {
      userId,
      email: body.email,
      name: `${body.firstName} ${body.lastName}`
    });

    // Send welcome email with temporary password
    try {
      // Determine the base URL from request or use custom domain
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const baseUrl = host ? `${protocol}://${host}` : 'https://aiblueprint.k12aiblueprint.com';

      // Get institutional context from middleware headers
      const institutionType = request.headers.get('x-institution-type') as 'K12' | 'HigherEd' | 'default' || 'default';
      const domainContext = request.headers.get('x-domain-context') || undefined;

      await emailService.sendWelcomeEmail({
        userEmail: body.email,
        userName: `${body.firstName} ${body.lastName}`,
        institutionName: body.organization,
        userId,
        baseUrl: baseUrl,
        institutionType: institutionType,
        domainContext: domainContext
      });

      console.log(`✅ Welcome email sent to ${body.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Create response with user ID in header
    const response = NextResponse.json(
      {
        success: true,
        userId,
        message: 'User registered successfully',
        tempPassword: !body.password ? tempPassword : undefined // Only send if we generated it
      },
      { status: 200 }
    );

    response.headers.set('user-id', userId);

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'User registration endpoint - POST only' },
    { status: 405 }
  );
}
