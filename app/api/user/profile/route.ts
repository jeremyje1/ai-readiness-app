/**
 * User Profile API Route
 * Handles user profile CRUD operations with database persistence
 * Replaces localStorage-based onboarding data
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please log in to access your profile' },
        { status: 401 }
      );
    }

    // Fetch user profile with institution data
    const { data: profile, error: profileError } = await supabase
      .from('user_profile_with_institution')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, return a default structure
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          profile: {
            user_id: user.id,
            email: user.email,
            onboarding_completed: false,
            institution_type: 'default',
            needs_setup: true
          }
        });
      }

      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Extract and validate profile data
    const profileData = {
      user_id: user.id,
      email: user.email,
      full_name: body.full_name || body.name,
      job_title: body.job_title || body.title,
      department: body.department,
      phone: body.phone,

      // Institution data
      institution_name: body.institution_name || body.institutionName,
      institution_type: body.institution_type || body.institutionType || body.organizationType,
      institution_size: body.institution_size || body.institutionSize,
      student_count: body.student_count || body.studentCount,
      faculty_count: body.faculty_count || body.facultyCount,
      staff_count: body.staff_count || body.staffCount,
      annual_budget: body.annual_budget || body.budget,

      // Location
      city: body.city,
      state: body.state,
      country: body.country || 'US',
      timezone: body.timezone,

      // Assessment preferences
      preferred_mode: body.preferred_mode || body.mode || 'quick',
      assessment_context: body.assessment_context || body.context || {},

      // Onboarding
      onboarding_completed: body.onboarding_completed || body.onboardingCompleted || false,
      onboarding_step: body.onboarding_step || body.step || 0,
      onboarding_data: body.onboarding_data || body.onboardingData || {},

      // Subscription
      subscription_tier: body.subscription_tier || body.tier,
      subscription_status: body.subscription_status || body.status,

      // Preferences and metadata
      preferences: body.preferences || {},
      metadata: body.metadata || {},

      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(profileData).forEach(key => {
      if (profileData[key as keyof typeof profileData] === undefined) {
        delete profileData[key as keyof typeof profileData];
      }
    });

    // Upsert profile (insert or update)
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return NextResponse.json(
        { error: 'Failed to save profile', details: error.message },
        { status: 500 }
      );
    }

    // If institution data provided, also create/update institution
    if (body.institution_name || body.institutionName) {
      const institutionData = {
        name: body.institution_name || body.institutionName,
        org_type: body.institution_type || body.organizationType || 'default',
        headcount: body.student_count || body.studentCount || 0,
        budget: body.annual_budget || body.budget || 0,
        owner_user_id: user.id,
        slug: `inst-${user.id}`
      };

      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .upsert(institutionData, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (!instError && institution) {
        // Update profile with institution_id
        await supabase
          .from('user_profiles')
          .update({ institution_id: institution.id })
          .eq('user_id', user.id);

        // Create institution membership
        await supabase
          .from('institution_memberships')
          .upsert({
            institution_id: institution.id,
            user_id: user.id,
            role: 'owner',
            active: true
          }, {
            onConflict: 'institution_id,user_id'
          });
      }
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profile saved successfully'
    });

  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Partial update - only update provided fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Map all possible fields
    const fieldMappings: Record<string, string> = {
      full_name: 'full_name',
      name: 'full_name',
      job_title: 'job_title',
      title: 'job_title',
      department: 'department',
      phone: 'phone',
      institution_name: 'institution_name',
      institutionName: 'institution_name',
      institution_type: 'institution_type',
      institutionType: 'institution_type',
      organizationType: 'institution_type',
      institution_size: 'institution_size',
      institutionSize: 'institution_size',
      student_count: 'student_count',
      studentCount: 'student_count',
      faculty_count: 'faculty_count',
      facultyCount: 'faculty_count',
      staff_count: 'staff_count',
      staffCount: 'staff_count',
      annual_budget: 'annual_budget',
      budget: 'annual_budget',
      city: 'city',
      state: 'state',
      country: 'country',
      timezone: 'timezone',
      preferred_mode: 'preferred_mode',
      mode: 'preferred_mode',
      assessment_context: 'assessment_context',
      context: 'assessment_context',
      onboarding_completed: 'onboarding_completed',
      onboardingCompleted: 'onboarding_completed',
      onboarding_step: 'onboarding_step',
      step: 'onboarding_step',
      onboarding_data: 'onboarding_data',
      onboardingData: 'onboarding_data',
      subscription_tier: 'subscription_tier',
      tier: 'subscription_tier',
      subscription_status: 'subscription_status',
      status: 'subscription_status',
      preferences: 'preferences',
      metadata: 'metadata',
      last_login_at: 'last_login_at'
    };

    Object.keys(body).forEach(key => {
      const mappedKey = fieldMappings[key];
      if (mappedKey && body[key] !== undefined) {
        updates[mappedKey] = body[key];
      }
    });

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
