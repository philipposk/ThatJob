'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industries: [] as string[],
    roles: [] as string[],
    skills: [] as string[],
    experience_level: 'mid' as 'entry' | 'mid' | 'senior' | 'lead',
    alignment_level: 50,
    preferred_platforms: [] as string[],
    is_default: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const response = await fetch('/api/preferences');
    const data = await response.json();

    if (data.success) {
      setPreferences(data.data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      setShowForm(false);
      setFormData({
        name: '',
        industries: [],
        roles: [],
        skills: [],
        experience_level: 'mid',
        alignment_level: 50,
        preferred_platforms: [],
        is_default: false,
      });
      loadPreferences();
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Job Preferences</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Profile'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Create Preference Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-foreground">Profile Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-foreground">Default Alignment</label>
              <input
                type="range"
                min="10"
                max="90"
                step="20"
                value={formData.alignment_level}
                onChange={(e) =>
                  setFormData({ ...formData, alignment_level: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400">{formData.alignment_level}%</div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-foreground">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Set as Default Profile</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {preferences.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">No preferences saved yet</p>
          </div>
        ) : (
          preferences.map((pref) => (
            <div key={pref.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {pref.name} {pref.is_default && <span className="text-blue-600 dark:text-blue-400">(Default)</span>}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Alignment: {pref.alignment_level}% • Industries: {pref.industries.length} • Roles:{' '}
                    {pref.roles.length}
                  </p>
                </div>
                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
