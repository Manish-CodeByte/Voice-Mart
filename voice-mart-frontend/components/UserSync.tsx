'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function UserSync() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          const response = await fetch('http://localhost:5001/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add Authorization header if you want to verify the token on backend
              // 'Authorization': `Bearer ${await getToken()}` 
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
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, user]);

  return null; // This component doesn't render anything
}
