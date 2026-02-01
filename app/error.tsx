'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isEnvError = error.message?.includes('environment variable') || 
                     error.message?.includes('Missing Supabase');

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
        {isEnvError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Configuration Error:</strong> Missing environment variables.
            </p>
            <p className="text-xs text-yellow-700">
              Please check Vercel Dashboard → Settings → Environment Variables
              and ensure all required variables are set.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">{error.message}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
