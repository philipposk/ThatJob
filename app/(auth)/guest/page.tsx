'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GuestPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Setting up guest mode...');

  useEffect(() => {
    const setupGuest = () => {
      try {
        // Set guest mode in localStorage
        const guestId = `guest-${Date.now()}`;
        localStorage.setItem('guest_mode', 'true');
        localStorage.setItem('guest_id', guestId);
        
        // Initialize empty arrays for guest data
        if (!localStorage.getItem('guest_materials')) {
          localStorage.setItem('guest_materials', '[]');
        }
        if (!localStorage.getItem('guest_documents')) {
          localStorage.setItem('guest_documents', '[]');
        }
        
        setStatus('Redirecting to dashboard...');
        
        // Small delay to ensure localStorage is set
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } catch (error) {
        console.error('Error setting up guest mode:', error);
        setStatus('Error setting up guest mode. Please try again.');
      }
    };

    setupGuest();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}
