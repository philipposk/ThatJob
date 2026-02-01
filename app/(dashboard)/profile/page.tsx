'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

interface Language {
  language: string;
  level: string;
}

interface EducationDetail {
  degree: string;
  institution: string;
  field: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  thesis?: string;
  courses?: Array<{ name: string; description: string }>;
  institution_url?: string;
}

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  birthday: string;
  photo_url: string;
  languages: Language[];
  education_details: EducationDetail[];
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    birthday: '',
    photo_url: '',
    languages: [],
    education_details: [],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Load from localStorage for guest
        const guestMode = localStorage.getItem('guest_mode');
        if (guestMode === 'true') {
          setIsGuest(true);
          const guestProfile = localStorage.getItem('guest_profile');
          if (guestProfile) {
            setProfile(JSON.parse(guestProfile));
          } else {
            // Set default values from user's info
            setProfile({
              full_name: 'Filippos Ktistakis',
              email: 'phktistakis@gmail.com',
              phone: '71688311',
              linkedin_url: 'https://www.linkedin.com/in/filippos-dimitrios-ktistakis-b7b1aa242/',
              github_url: 'https://github.com/philipposk',
              portfolio_url: '6x7.gr',
              address: 'Grønjordskollegiet 1',
              city: 'Copenhagen',
              country: 'Denmark',
              postal_code: '2300',
              birthday: '',
              photo_url: '',
              languages: [{ language: 'Danish', level: 'Beginner (Module 3)' }],
              education_details: [],
            });
          }
        }
        setLoading(false);
        return;
      }

      // Load from database for authenticated users
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          portfolio_url: data.portfolio_url || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          postal_code: data.postal_code || '',
          birthday: data.birthday || '',
          photo_url: data.photo_url || '',
          languages: (data.languages as Language[]) || [],
          education_details: (data.education_details as EducationDetail[]) || [],
        });
      } else {
        // Set defaults
        setProfile({
          ...profile,
          email: user.email || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isGuest) {
        setError('Please sign in or use guest mode');
        return;
      }

      if (isGuest) {
        // Save to localStorage for guest
        localStorage.setItem('guest_profile', JSON.stringify(profile));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return;
      }

      // Save to database for authenticated users
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: user.id,
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            linkedin_url: profile.linkedin_url,
            github_url: profile.github_url,
            portfolio_url: profile.portfolio_url,
            address: profile.address,
            city: profile.city,
            country: profile.country,
            postal_code: profile.postal_code,
            birthday: profile.birthday || null,
            photo_url: profile.photo_url,
            languages: profile.languages,
            education_details: profile.education_details,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = () => {
    setProfile({
      ...profile,
      languages: [...profile.languages, { language: '', level: '' }],
    });
  };

  const removeLanguage = (index: number) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((_, i) => i !== index),
    });
  };

  const updateLanguage = (index: number, field: 'language' | 'level', value: string) => {
    const updated = [...profile.languages];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, languages: updated });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education_details: [
        ...profile.education_details,
        {
          degree: '',
          institution: '',
          field: '',
          start_date: '',
          end_date: '',
          courses: [],
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education_details: profile.education_details.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: keyof EducationDetail, value: any) => {
    const updated = [...profile.education_details];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education_details: updated });
  };

  const addCourse = (eduIndex: number) => {
    const updated = [...profile.education_details];
    if (!updated[eduIndex].courses) {
      updated[eduIndex].courses = [];
    }
    updated[eduIndex].courses!.push({ name: '', description: '' });
    setProfile({ ...profile, education_details: updated });
  };

  const removeCourse = (eduIndex: number, courseIndex: number) => {
    const updated = [...profile.education_details];
    if (updated[eduIndex].courses) {
      updated[eduIndex].courses = updated[eduIndex].courses!.filter((_, i) => i !== courseIndex);
    }
    setProfile({ ...profile, education_details: updated });
  };

  const updateCourse = (eduIndex: number, courseIndex: number, field: 'name' | 'description', value: string) => {
    const updated = [...profile.education_details];
    if (updated[eduIndex].courses) {
      updated[eduIndex].courses![courseIndex] = {
        ...updated[eduIndex].courses![courseIndex],
        [field]: value,
      };
    }
    setProfile({ ...profile, education_details: updated });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
          Profile saved successfully!
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="Filippos Ktistakis"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="phktistakis@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="71688311"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Birthday (Optional)</label>
            <input
              type="date"
              value={profile.birthday}
              onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">LinkedIn URL</label>
            <input
              type="url"
              value={profile.linkedin_url}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">GitHub URL</label>
            <input
              type="url"
              value={profile.github_url}
              onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Portfolio Website</label>
            <input
              type="text"
              value={profile.portfolio_url}
              onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="6x7.gr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Photo URL (Optional)</label>
            <input
              type="url"
              value={profile.photo_url}
              onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground mb-2"
            placeholder="Grønjordskollegiet 1"
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="Copenhagen"
            />
            <input
              type="text"
              value={profile.postal_code}
              onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="2300"
            />
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
              placeholder="Denmark"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-foreground">Languages</h3>
            <button
              onClick={addLanguage}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Language
            </button>
          </div>
          {profile.languages.map((lang, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={lang.language}
                onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                placeholder="Language (e.g., Danish)"
              />
              <input
                type="text"
                value={lang.level}
                onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                placeholder="Level (e.g., Beginner Module 3)"
              />
              <button
                onClick={() => removeLanguage(index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-foreground">Education Details</h3>
            <button
              onClick={addEducation}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Education
            </button>
          </div>
          {profile.education_details.map((edu, index) => (
            <div key={index} className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="Degree (e.g., MSc Computational Physics)"
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="Institution (e.g., University of Copenhagen)"
                />
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="Field of Study"
                />
                <input
                  type="url"
                  value={edu.institution_url || ''}
                  onChange={(e) => updateEducation(index, 'institution_url', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="Institution Website (for AI to fetch courses)"
                />
                <input
                  type="date"
                  value={edu.start_date}
                  onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={edu.end_date || ''}
                  onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="End Date (optional)"
                />
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="GPA (optional)"
                />
                <input
                  type="text"
                  value={edu.thesis || ''}
                  onChange={(e) => updateEducation(index, 'thesis', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                  placeholder="Thesis Title (optional)"
                />
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-foreground">Courses</label>
                  <button
                    onClick={() => addCourse(index)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    + Add Course
                  </button>
                </div>
                {edu.courses?.map((course, courseIndex) => (
                  <div key={courseIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(index, courseIndex, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                      placeholder="Course Name"
                    />
                    <input
                      type="text"
                      value={course.description}
                      onChange={(e) => updateCourse(index, courseIndex, 'description', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                      placeholder="Course Description"
                    />
                    <button
                      onClick={() => removeCourse(index, courseIndex)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {(!edu.courses || edu.courses.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add courses manually, or provide institution URL for AI to fetch course information
                  </p>
                )}
              </div>

              <button
                onClick={() => removeEducation(index)}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove Education
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
