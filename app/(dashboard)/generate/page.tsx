'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function GeneratePage() {
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [inputMethod, setInputMethod] = useState<'url' | 'text'>('url');
  const [loading, setLoading] = useState(false);
  const [jobPosting, setJobPosting] = useState<any>(null);
  const [matchingScore, setMatchingScore] = useState<any>(null);
  const [alignment, setAlignment] = useState<10 | 30 | 50 | 70 | 90>(50);
  const [generateCv, setGenerateCv] = useState(true);
  const [generateCover, setGenerateCover] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setJobPosting(null);
    setMatchingScore(null);
    
    try {
      // Check if user is guest
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const isGuest = !user && localStorage.getItem('guest_mode') === 'true';
      const guestId = localStorage.getItem('guest_id');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isGuest && guestId) {
        headers['x-guest-mode'] = 'true';
        headers['x-guest-id'] = guestId;
      }

      const response = await fetch('/api/job', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: inputMethod === 'url' ? jobUrl.trim() : undefined,
          description: inputMethod === 'text' ? jobText.trim() : undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to analyze job posting');
      }
      
      if (data.success) {
        setJobPosting(data.job_posting);
        setMatchingScore(data.matching_score);
        
        // For guest mode, save to localStorage
        if (isGuest && guestId) {
          const guestJobs = JSON.parse(localStorage.getItem('guest_jobs') || '[]');
          guestJobs.push(data.job_posting);
          localStorage.setItem('guest_jobs', JSON.stringify(guestJobs));
        }
      } else {
        throw new Error(data.error || 'Failed to analyze job posting');
      }
    } catch (error: any) {
      console.error('Error analyzing job:', error);
      setError(error.message || 'Failed to analyze job posting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobPosting) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_posting_id: jobPosting.id,
          generate_cv: generateCv,
          generate_cover: generateCover,
          alignment_level: alignment.toString(),
          export_format: 'generic',
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = `/documents/${data.document.id}`;
      }
    } catch (error) {
      console.error('Error generating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Generate CV & Cover Letter</h1>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Job Posting Input</h2>
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-foreground">
              <input
                type="radio"
                checked={inputMethod === 'url'}
                onChange={() => {
                  setInputMethod('url');
                  setError(null);
                }}
                className="w-4 h-4"
              />
              <span>URL</span>
            </label>
            <label className="flex items-center space-x-2 ml-4 text-foreground">
              <input
                type="radio"
                checked={inputMethod === 'text'}
                onChange={() => {
                  setInputMethod('text');
                  setError(null);
                }}
                className="w-4 h-4"
              />
              <span>Paste Text</span>
            </label>
          </div>

          {inputMethod === 'url' ? (
            <div>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => {
                  setJobUrl(e.target.value);
                  setError(null);
                }}
                placeholder="https://linkedin.com/jobs/view/... or https://indeed.com/..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-900 text-foreground"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Note: Some websites may block automated access. If the URL doesn't work, switch to "Paste Text" and copy the job description.
              </p>
            </div>
          ) : (
            <textarea
              value={jobText}
              onChange={(e) => {
                setJobText(e.target.value);
                setError(null);
              }}
              placeholder="Paste the complete job description here... (title, company, requirements, responsibilities, etc.)"
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-900 text-foreground"
            />
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || (inputMethod === 'url' && !jobUrl.trim()) || (inputMethod === 'text' && !jobText.trim())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Job'}
          </button>
        </div>

        {matchingScore && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Job Matching Score</h2>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Overall Match</span>
                  <span>{matchingScore.overall_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${matchingScore.overall_score}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Skills Match</span>
                  <span>{matchingScore.skills_match}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${matchingScore.skills_match}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {jobPosting && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Generation Settings</h2>
            
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Job:</strong> {jobPosting.title || 'Untitled'} at {jobPosting.company || 'Unknown Company'}
              </p>
            </div>

            <div className="mb-4">
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={generateCv}
                  onChange={(e) => setGenerateCv(e.target.checked)}
                />
                <span>Generate CV</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={generateCover}
                  onChange={(e) => setGenerateCover(e.target.checked)}
                />
                <span>Generate Cover Letter</span>
              </label>
            </div>

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
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>30%</span>
                <span>50%</span>
                <span>70%</span>
                <span>90%</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || (!generateCv && !generateCover)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate CV & Cover Letter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
