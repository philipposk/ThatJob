'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedDocument();
  }, [token]);

  const loadSharedDocument = async () => {
    try {
      const { data: shareLink, error: shareError } = await supabase
        .from('shared_documents')
        .select('*, generated_documents(*, job_postings(*))')
        .eq('share_token', token)
        .single();

      if (shareError || !shareLink) {
        setError('Shared document not found or expired');
        setLoading(false);
        return;
      }

      // Check expiration
      if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
        setError('This shared link has expired');
        setLoading(false);
        return;
      }

      // Update access count
      await supabase
        .from('shared_documents')
        .update({ access_count: (shareLink.access_count || 0) + 1 })
        .eq('id', shareLink.id);

      setDocument(shareLink.generated_documents);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !document) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Document Not Available</h1>
          <p className="text-gray-600">{error || 'Document not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        <p className="text-sm">This is a read-only shared document</p>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {document.job_postings?.title || 'Shared Document'}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">CV</h2>
          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {document.cv_content}
          </div>
        </div>

        {document.cover_content && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Cover Letter</h2>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
              {document.cover_content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
