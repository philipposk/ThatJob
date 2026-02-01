'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import ChatInterface from '@/components/chat/ChatInterface';

export default function DocumentViewPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cv' | 'cover' | 'merged'>('cv');
  const [alignment, setAlignment] = useState(50);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Load from localStorage for guest
      const guestDocs = JSON.parse(localStorage.getItem('guest_documents') || '[]');
      const doc = guestDocs.find((d: any) => d.id === documentId);
      if (doc) {
        setDocument(doc);
        setAlignment(doc.alignment_score || 50);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('generated_documents')
      .select('*, job_postings(*)')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading document:', error);
    } else {
      setDocument(data);
      setAlignment(data.alignment_score || 50);
    }

    setLoading(false);
  };

  const handleDownload = async (type: 'cv' | 'cover' | 'merged') => {
    if (!document) return;

    let url = '';
    if (type === 'cv') url = document.cv_pdf_url || '';
    if (type === 'cover') url = document.cover_pdf_url || '';
    if (type === 'merged') url = document.merged_pdf_url || '';

    if (url) {
      window.open(url, '_blank');
    } else {
      // Generate PDF on the fly if not exists
      alert('PDF not yet generated. Please wait...');
    }
  };

  const handleMerge = async () => {
    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });

      const data = await response.json();
      if (data.success) {
        setDocument((prev: any) => ({
          ...prev,
          merged_pdf_url: data.merged_pdf_url,
        }));
        setActiveTab('merged');
      }
    } catch (error) {
      console.error('Error merging documents:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!document) {
    return <div className="p-8">Document not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {document.job_postings?.title || 'Untitled Document'}
        </h1>
        <p className="text-gray-600">
          {document.job_postings?.company || 'Unknown Company'} • Match: {document.alignment_score || 'N/A'}% •{' '}
          {new Date(document.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b flex">
              <button
                onClick={() => setActiveTab('cv')}
                className={`px-4 py-2 ${activeTab === 'cv' ? 'border-b-2 border-blue-600' : ''}`}
              >
                CV
              </button>
              <button
                onClick={() => setActiveTab('cover')}
                className={`px-4 py-2 ${activeTab === 'cover' ? 'border-b-2 border-blue-600' : ''}`}
              >
                Cover Letter
              </button>
              {document.merged_pdf_url && (
                <button
                  onClick={() => setActiveTab('merged')}
                  className={`px-4 py-2 ${activeTab === 'merged' ? 'border-b-2 border-blue-600' : ''}`}
                >
                  Merged
                </button>
              )}
            </div>

            <div className="p-6">
              {activeTab === 'cv' && (
                <div className="whitespace-pre-wrap">{document.cv_content}</div>
              )}
              {activeTab === 'cover' && (
                <div className="whitespace-pre-wrap">{document.cover_content}</div>
              )}
              {activeTab === 'merged' && document.merged_pdf_url && (
                <iframe
                  src={document.merged_pdf_url}
                  className="w-full h-[800px] border"
                />
              )}
            </div>

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => handleDownload('cv')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download CV
              </button>
              <button
                onClick={() => handleDownload('cover')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download Cover
              </button>
              {!document.merged_pdf_url && (
                <button
                  onClick={handleMerge}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Merge Documents
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Adjust & Regenerate</h3>
            <div className="mb-4">
              <label className="block mb-2">Company Alignment: {alignment}%</label>
              <input
                type="range"
                min="10"
                max="90"
                step="20"
                value={alignment}
                onChange={(e) => setAlignment(parseInt(e.target.value) as 10 | 30 | 50 | 70 | 90)}
                className="w-full"
              />
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Regenerate
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">💬 Chat with AI</h3>
            <ChatInterface documentId={documentId} />
          </div>
        </div>
      </div>
    </div>
  );
}
