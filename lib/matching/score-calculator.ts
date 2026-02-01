import { extractUserProfile } from '../ai/learning';
import type { JobPosting, JobRequirements, JobMatchingScore } from '@/types/job';
import { logger } from '../logger';

export async function calculateMatchingScore(
  userId: string,
  jobPosting: JobPosting
): Promise<JobMatchingScore> {
  try {
    const userProfile = await extractUserProfile(userId);
    const requirements = jobPosting.requirements as JobRequirements;

    if (!requirements) {
      return {
        id: '',
        user_id: userId,
        job_posting_id: jobPosting.id,
        overall_score: 0,
        skills_match: 0,
        experience_match: 0,
        education_match: 0,
        culture_fit: 0,
        match_details: {
          matching_skills: [],
          missing_skills: [],
          education_match: false,
          culture_alignment: [],
        },
        created_at: new Date().toISOString(),
      };
    }

    // Calculate skills match
    const userSkills = userProfile.skills.map((s) => s.toLowerCase());
    const requiredSkills = (requirements.skills || []).map((s) => s.toLowerCase());
    const matchingSkills = userSkills.filter((s) =>
      requiredSkills.some((rs) => s.includes(rs) || rs.includes(s))
    );
    const skillsMatch = requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 0;

    // Calculate experience match
    const userExperienceYears = userProfile.experience.reduce((total, exp) => {
      const start = new Date(exp.start_date);
      const end = exp.end_date ? new Date(exp.end_date) : new Date();
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + years;
    }, 0);
    
    const requiredYears = requirements.experience_years || 0;
    const experienceMatch = requiredYears > 0
      ? Math.min(100, Math.round((userExperienceYears / requiredYears) * 100))
      : 100;

    // Calculate education match
    const requiredEducation = requirements.education || [];
    const userEducation = userProfile.education.map((e) => e.degree.toLowerCase());
    const educationMatch = requiredEducation.length > 0
      ? userEducation.some((ue) =>
          requiredEducation.some((re) => ue.includes(re.toLowerCase()))
        )
        ? 100
        : 0
      : 100;

    // Calculate culture fit (simplified - would use company info)
    const cultureFit = 75; // Placeholder

    // Overall score (weighted average)
    const overallScore = Math.round(
      skillsMatch * 0.4 +
        experienceMatch * 0.3 +
        educationMatch * 0.2 +
        cultureFit * 0.1
    );

    const missingSkills = requiredSkills.filter(
      (rs) => !userSkills.some((us) => us.includes(rs) || rs.includes(us))
    );

    return {
      id: '',
      user_id: userId,
      job_posting_id: jobPosting.id,
      overall_score: overallScore,
      skills_match: skillsMatch,
      experience_match: experienceMatch,
      education_match: educationMatch,
      culture_fit: cultureFit,
      match_details: {
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        education_match: educationMatch === 100,
        culture_alignment: [],
      },
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Error calculating matching score', { error, userId });
    throw new Error('Failed to calculate matching score');
  }
}
