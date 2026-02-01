'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GuestPage() {
  const router = useRouter();

  useEffect(() => {
    // Set guest mode in localStorage
    localStorage.setItem('guest_mode', 'true');
    localStorage.setItem('guest_id', `guest-${Date.now()}`);
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Setting up guest mode...</p>
      </div>
    </div>
  );
}
