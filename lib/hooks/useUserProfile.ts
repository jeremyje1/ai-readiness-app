/**
 * User Profile Hook
 * Replaces localStorage-based data with database-persisted user profiles
 *
 * Usage:
 * const { profile, loading, updateProfile, refreshProfile } = useUserProfile();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id?: string;
  user_id?: string;
  email: string;
  full_name?: string;
  job_title?: string;
  department?: string;
  phone?: string;

  // Institution
  institution_id?: string;
  institution_name?: string;
  institution_type?: 'K12' | 'HigherEd' | 'District' | 'University' | 'Community College' | 'Trade School' | 'default';
  institution_size?: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  student_count?: number;
  faculty_count?: number;
  staff_count?: number;
  annual_budget?: number;

  // Location
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;

  // Assessment preferences
  preferred_mode?: 'quick' | 'comprehensive' | 'full';
  assessment_context?: Record<string, any>;

  // Onboarding
  onboarding_completed?: boolean;
  onboarding_step?: number;
  onboarding_data?: Record<string, any>;

  // Subscription
  subscription_tier?: string;
  subscription_status?: 'active' | 'inactive' | 'trial' | 'expired';
  trial_ends_at?: string;

  // Preferences
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;

  // Audit fields
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;

  // From joined institution data
  institution_full_name?: string;
  institution_slug?: string;
  institution_org_type?: string;
  institution_headcount?: number;
  institution_budget?: number;

  // Helper flag
  needs_setup?: boolean;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  saveOnboardingData: (data: Record<string, any>) => Promise<boolean>;
  completeOnboarding: () => Promise<boolean>;
  isOnboardingComplete: boolean;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch profile from database
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setProfile(null);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);

        // Update last_login_at
        if (data.profile.user_id) {
          await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ last_login_at: new Date().toISOString() }),
            credentials: 'include'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile in database
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  // Save onboarding data
  const saveOnboardingData = useCallback(async (data: Record<string, any>): Promise<boolean> => {
    return await updateProfile({
      onboarding_data: data,
      onboarding_step: data.step || (profile?.onboarding_step || 0) + 1
    });
  }, [updateProfile, profile]);

  // Complete onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    return await updateProfile({
      onboarding_completed: true
    });
  }, [updateProfile]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase.auth]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    saveOnboardingData,
    completeOnboarding,
    isOnboardingComplete: profile?.onboarding_completed || false
  };
}

// Migration helper: Move localStorage onboarding data to database
export async function migrateLocalStorageToProfile() {
  try {
    // Check for old localStorage onboarding data
    const onboardingData = localStorage.getItem('onboarding-tour-completed');
    const userPreferences = localStorage.getItem('user-preferences');
    const institutionData = localStorage.getItem('institution-data');

    if (!onboardingData && !userPreferences && !institutionData) {
      return; // Nothing to migrate
    }

    const updates: Partial<UserProfile> = {};

    if (onboardingData) {
      updates.onboarding_completed = onboardingData === 'true';
    }

    if (userPreferences) {
      try {
        updates.preferences = JSON.parse(userPreferences);
      } catch (e) {
        console.warn('Failed to parse user preferences');
      }
    }

    if (institutionData) {
      try {
        const instData = JSON.parse(institutionData);
        updates.institution_name = instData.name;
        updates.institution_type = instData.type;
        updates.student_count = instData.studentCount;
        updates.onboarding_data = instData;
      } catch (e) {
        console.warn('Failed to parse institution data');
      }
    }

    // Save to database
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include'
    });

    if (response.ok) {
      // Clear localStorage after successful migration
      localStorage.removeItem('onboarding-tour-completed');
      localStorage.removeItem('user-preferences');
      localStorage.removeItem('institution-data');
      console.log('✅ Successfully migrated localStorage data to profile');
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
}
