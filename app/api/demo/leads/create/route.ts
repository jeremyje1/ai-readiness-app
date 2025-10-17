import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  institutionName: string;
  institutionType: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();
    
    // Validate required fields
    const requiredFields: (keyof LeadData)[] = [
      'firstName',
      'lastName',
      'email',
      'institutionName',
      'institutionType',
      'role'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Extract UTM parameters from referer
    const utmParams: Record<string, string> = {};
    try {
      const refererUrl = new URL(referer);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        const value = refererUrl.searchParams.get(param);
        if (value) utmParams[param] = value;
      });
    } catch (e) {
      // Referer may not be a valid URL
    }
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('demo_leads')
      .select('id, email, completed_at')
      .eq('email', body.email.toLowerCase())
      .single();
    
    if (existingLead) {
      // Return existing lead ID if not completed
      if (!existingLead.completed_at) {
        return NextResponse.json(
          {
            success: true,
            leadId: existingLead.id,
            message: 'Welcome back! Continue your assessment.'
          },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          }
        );
      } else {
        // Lead already completed - create new entry
        console.log(`Lead ${body.email} already completed assessment. Creating new entry.`);
      }
    }
    
    // Create new lead record
    const { data: newLead, error: insertError } = await supabase
      .from('demo_leads')
      .insert({
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email.toLowerCase(),
        institution_name: body.institutionName,
        institution_type: body.institutionType,
        role: body.role,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referer,
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_term: utmParams.utm_term || null,
        utm_content: utmParams.utm_content || null,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating demo lead:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save lead information'
        },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        leadId: newLead.id,
        message: 'Lead created successfully'
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in demo leads create:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
