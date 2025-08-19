import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { headers } from 'next/headers';

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phone?: string;
  title?: string;
  billing: 'monthly' | 'yearly';
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

    // Generate a unique user ID (in a real app, this would save to a database)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a production environment, you would:
    // 1. Save user data to your database
    // 2. Hash passwords if applicable
    // 3. Send welcome email
    // 4. Set up user session/token
    
    console.log('User Registration:', {
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      organization: body.organization,
      phone: body.phone,
      title: body.title,
      billing: body.billing,
      createdAt: new Date().toISOString()
    });

    // Store user data temporarily (in production, use proper database)
    // This is a simplified example - you'd want to use a proper database
    const userData = {
      id: userId,
      ...body,
      createdAt: new Date().toISOString(),
      status: 'pending_payment'
    };

    // Send welcome email
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
        message: 'User registered successfully' 
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
