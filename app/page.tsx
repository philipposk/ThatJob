import Link from "next/link";

// Force static generation for local dev
export const dynamic = 'force-static';

import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          🎯 AI-Powered CV & Cover Letter Generator
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
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
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground"
          >
            Try as Guest
          </Link>
        </div>
      </div>
    </main>
  );
}
