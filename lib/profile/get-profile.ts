import { createClient } from '../supabase/server';
import { logger } from '../logger';

export interface UserProfile {
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  birthday?: string;
  photo_url?: string;
  languages?: Array<{ language: string; level: string }>;
  education_details?: Array<{
    degree: string;
    institution: string;
    field: string;
    start_date: string;
    end_date?: string;
    gpa?: string;
    thesis?: string;
    courses?: Array<{ name: string; description: string }>;
    institution_url?: string;
  }>;
}

export async function getUserProfile(
  userId: string,
  isGuest: boolean = false,
  guestProfileData?: UserProfile
): Promise<UserProfile | null> {
  try {
    if (isGuest) {
      // For server-side, use provided guestProfileData
      if (guestProfileData) {
        return guestProfileData;
      }
      // For client-side, load from localStorage
      if (typeof window !== 'undefined') {
        const guestProfile = localStorage.getItem('guest_profile');
        if (guestProfile) {
          return JSON.parse(guestProfile);
        }
      }
      return null;
    }

    // Load from database for authenticated users
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching user profile', { error, userId });
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || undefined,
      linkedin_url: data.linkedin_url || undefined,
      github_url: data.github_url || undefined,
      portfolio_url: data.portfolio_url || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      postal_code: data.postal_code || undefined,
      birthday: data.birthday || undefined,
      photo_url: data.photo_url || undefined,
      languages: (data.languages as Array<{ language: string; level: string }>) || undefined,
      education_details: (data.education_details as UserProfile['education_details']) || undefined,
    };
  } catch (error: any) {
    logger.error('Error in getUserProfile', { error, userId });
    return null;
  }
}
