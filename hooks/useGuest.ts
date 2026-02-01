'use client';

import { useState, useEffect } from 'react';

export function useGuest() {
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const guestMode = localStorage.getItem('guest_mode');
    const id = localStorage.getItem('guest_id');

    if (guestMode === 'true' && id) {
      setIsGuest(true);
      setGuestId(id);
    }
  }, []);

  const saveGuestData = (key: string, data: any) => {
    if (isGuest && guestId) {
      localStorage.setItem(`guest_${key}`, JSON.stringify(data));
    }
  };

  const loadGuestData = (key: string) => {
    if (isGuest && guestId) {
      const data = localStorage.getItem(`guest_${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

  const migrateToAccount = async (userId: string) => {
    // Migrate all guest data to account
    const materials = loadGuestData('materials') || [];
    const documents = loadGuestData('documents') || [];
    const profile = loadGuestData('ai_profile');

    // In a real implementation, would send to API to migrate
    localStorage.removeItem('guest_mode');
    localStorage.removeItem('guest_id');
    setIsGuest(false);
    setGuestId(null);
  };

  return {
    isGuest,
    guestId,
    saveGuestData,
    loadGuestData,
    migrateToAccount,
  };
}
