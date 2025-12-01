'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export default function AuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const sync = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const token = await getToken();
          if (token) {
            await api.syncUser({
              email: user.emailAddresses[0]?.emailAddress || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
            }, token);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user, getToken]);

  return null;
}
