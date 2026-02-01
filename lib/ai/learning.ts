import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import { createClient } from '../supabase/server';
import { cache, CacheKeys } from '../cache/redis';
import { logger } from '../logger';
import type { UserAIProfile, WorkExperience, Education, Project } from '@/types/user';

export async function extractUserProfile(userId: string, isGuest: boolean = false, guestMaterials?: any[]): Promise<UserAIProfile> {
  // Check cache first (only for authenticated users)
  if (!isGuest) {
    const cached = cache.get<UserAIProfile>(CacheKeys.userProfile(userId));
    if (cached) {
      return cached;
    }
  }

  let materials: any[] = [];

  if (isGuest && guestMaterials) {
    // Use guest materials from localStorage
    materials = guestMaterials;
  } else if (!isGuest) {
    // Get materials from database for authenticated users
    const supabase = await createClient();
    const { data: dbMaterials, error } = await supabase
      .from('user_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching materials', { error, userId });
      throw new Error('Failed to fetch materials');
    }

    materials = dbMaterials || [];
  }

  if (!materials || materials.length === 0) {
    // Return empty profile instead of throwing error
    return {
      id: '',
      user_id: userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      summary: null,
      last_updated: new Date().toISOString(),
    };
  }

  // Combine all content
  const combinedContent = materials
    .map((m) => `${m.type || 'other'}: ${m.content || ''}`)
    .join('\n\n');

  // Use AI to extract profile information
  const prompt = `Extract the following information from the user's materials (CVs, cover letters, degrees, etc.):

1. Skills (technical and soft skills) - return as array
2. Work Experience - return as array of objects with: title, company, start_date, end_date, description, skills
3. Education - return as array of objects with: degree, institution, field, start_date, end_date, gpa (if available), thesis (if available)
4. Projects - return as array of objects with: name, description, technologies, url (if available), start_date, end_date
5. Summary - a 2-3 sentence professional summary

Materials:
${combinedContent}

Return ONLY valid JSON in this format:
{
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "...", "company": "...", ...}],
  "education": [{"degree": "...", "institution": "...", ...}],
  "projects": [{"name": "...", "description": "...", ...}],
  "summary": "..."
}`;

  try {
    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content: 'You are an expert at extracting structured information from CVs and professional documents. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }
    );

    const extracted = JSON.parse(response.choices[0].message.content || '{}');

    const profile: UserAIProfile = {
      id: '',
      user_id: userId,
      skills: extracted.skills || [],
      experience: extracted.experience || [],
      education: extracted.education || [],
      projects: extracted.projects || [],
      summary: extracted.summary || null,
      last_updated: new Date().toISOString(),
    };

    // Save to database (only for authenticated users)
    if (!isGuest) {
      const supabase = await createClient();
      const { error: upsertError } = await supabase
        .from('user_ai_profile')
        .upsert(
          {
            user_id: userId,
            skills: profile.skills,
            experience: profile.experience,
            education: profile.education,
            projects: profile.projects,
            summary: profile.summary,
            last_updated: profile.last_updated,
          },
          { onConflict: 'user_id' }
        );

      if (upsertError) {
        logger.error('Error saving AI profile', { error: upsertError, userId });
      }

      // Cache for 1 hour
      cache.set(CacheKeys.userProfile(userId), profile, 3600);
    } else {
      // For guest mode, save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`guest_ai_profile_${userId}`, JSON.stringify(profile));
      }
    }

    return profile;
  } catch (error: any) {
    logger.error('Error extracting user profile', { error, userId });
    throw new Error('Failed to extract user profile');
  }
}
