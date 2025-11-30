'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function UserSync() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken();
          const response = await fetch('http://localhost:5001/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              uid: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync user with backend');
          } else {
            console.log('✅ User synced with backend');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, user, getToken]);

  return null; // This component doesn't render anything
}
