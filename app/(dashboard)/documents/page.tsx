'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Load from localStorage for guest
      const guestDocs = JSON.parse(localStorage.getItem('guest_documents') || '[]');
      setDocuments(guestDocs);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('generated_documents')
      .select('*, job_postings(title, company)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
    } else {
      setDocuments(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Generated Documents</h1>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No documents generated yet</p>
          <Link
            href="/generate"
            className="text-blue-600 hover:text-blue-700"
          >
            Generate your first CV/Cover Letter
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold mb-2">
                {doc.job_postings?.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {doc.job_postings?.company || 'Unknown Company'}
              </p>
              <div className="flex justify-between items-center text-sm mb-4">
                <span>Match: {doc.alignment_score || 'N/A'}%</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/documents/${doc.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  View
                </Link>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
