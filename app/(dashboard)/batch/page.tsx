'use client';

import { useState } from 'react';

export default function BatchPage() {
  const [jobUrls, setJobUrls] = useState('');
  const [alignment, setAlignment] = useState(50);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleBatchGenerate = async () => {
    const urls = jobUrls.split('\n').filter((url) => url.trim());
    if (urls.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_urls: urls,
          alignment_level: alignment,
          export_format: 'generic',
          generate_cv: true,
          generate_cover: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.job_ids || []);
      }
    } catch (error) {
      console.error('Error in batch generation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Batch Generate CVs & Cover Letters</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Job Postings</h2>
        <textarea
          value={jobUrls}
          onChange={(e) => setJobUrls(e.target.value)}
          placeholder="Paste job URLs (one per line)&#10;https://linkedin.com/jobs/view/123&#10;https://indeed.com/viewjob?jk=abc"
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />

        <div className="mb-4">
          <label className="block mb-2">Company Alignment: {alignment}%</label>
          <input
            type="range"
            min="10"
            max="90"
            step="20"
            value={alignment}
            onChange={(e) => setAlignment(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleBatchGenerate}
          disabled={loading || !jobUrls.trim()}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Generate for ${jobUrls.split('\n').filter(u => u.trim()).length} Jobs`}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Processing Status</h2>
          <div className="space-y-2">
            {results.map((jobId, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Job {index + 1}</span>
                <span className="text-sm text-blue-600">Processing...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
