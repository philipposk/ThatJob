import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">
          🎯 AI-Powered CV & Cover Letter Generator
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Generate tailored CVs and cover letters that match your skills to job requirements
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started Free
          </Link>
          <Link
            href="/guest"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Try as Guest
          </Link>
        </div>
      </div>
    </main>
  );
}
