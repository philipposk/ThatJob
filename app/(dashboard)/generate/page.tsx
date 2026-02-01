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

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputMethod === 'url' ? jobUrl : undefined,
          description: inputMethod === 'text' ? jobText : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setJobPosting(data.job_posting);
        setMatchingScore(data.matching_score);
      }
    } catch (error) {
      console.error('Error analyzing job:', error);
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
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Generate CV & Cover Letter</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Job Posting Input</h2>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={inputMethod === 'url'}
                onChange={() => setInputMethod('url')}
              />
              <span>URL</span>
            </label>
            <label className="flex items-center space-x-2 ml-4">
              <input
                type="radio"
                checked={inputMethod === 'text'}
                onChange={() => setInputMethod('text')}
              />
              <span>Paste Text</span>
            </label>
          </div>

          {inputMethod === 'url' ? (
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/view/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
          ) : (
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste job description here..."
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || (!jobUrl && !jobText)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Job'}
          </button>
        </div>

        {matchingScore && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Job Matching Score</h2>
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Generation Settings</h2>

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
