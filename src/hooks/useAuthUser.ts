'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';

export function useAuthUser() {
  const { data: session, status } = useSession();
  const { currentUser, setCurrentUser, isLoading: userStoreLoading } = useUserStore();

  useEffect(() => {
    const syncUserData = async () => {
      if (status === 'authenticated' && session?.user) {
        if (session.user.id && session.user.name) {
          await setCurrentUser({
              id: session.user.id,
              name: session.user.name,
              email: session.user.email || '',
              avatar_url: session.user.image || session.user.avatar_url || '',
              created_at: ''
          });
        }
      }
    };

    syncUserData();
  }, [session, status, setCurrentUser]);

  return {
    user: session?.user || currentUser,
    isLoading: status === 'loading' || userStoreLoading,
    isAuthenticated: status === 'authenticated'
  };
}