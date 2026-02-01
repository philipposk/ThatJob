'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    materials: 0,
    documents: 0,
    jobs: 0,
    avgMatch: 0,
  });
  const router = useRouter();

  useEffect(() => {
    checkUser();
    loadStats();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const guestMode = localStorage.getItem('guest_mode');
      if (!guestMode) {
        router.push('/login');
        return;
      }
    }

    setUser(user);
  };

  const loadStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Load from localStorage for guest
      const guestId = localStorage.getItem('guest_id');
      if (guestId) {
        // Load guest stats from localStorage
        const materials = JSON.parse(localStorage.getItem('guest_materials') || '[]');
        const documents = JSON.parse(localStorage.getItem('guest_documents') || '[]');
        setStats({
          materials: materials.length,
          documents: documents.length,
          jobs: 0,
          avgMatch: 0,
        });
      }
      return;
    }

    // Load from database
    const [materialsRes, documentsRes] = await Promise.all([
      supabase.from('user_materials').select('id', { count: 'exact' }),
      supabase.from('generated_documents').select('id', { count: 'exact' }),
    ]);

    setStats({
      materials: materialsRes.count || 0,
      documents: documentsRes.count || 0,
      jobs: 0,
      avgMatch: 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Materials
            </Link>
            <Link
              href="/generate"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Generate CV/Cover
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">{stats.materials}</div>
            <div className="text-gray-600">Materials</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">{stats.documents}</div>
            <div className="text-gray-600">Documents</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">{stats.jobs}</div>
            <div className="text-gray-600">Jobs Analyzed</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">{stats.avgMatch}%</div>
            <div className="text-gray-600">Avg Match</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/upload"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              📤 Upload Materials
            </Link>
            <Link
              href="/generate"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              🎯 Generate CV/Cover
            </Link>
            <Link
              href="/documents"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              📄 View Documents
            </Link>
            <Link
              href="/preferences"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              ⚙️ Preferences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
