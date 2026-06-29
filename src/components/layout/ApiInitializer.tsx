'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { setTokenProvider, userApi } from '@/services/api';

export function ApiInitializer({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const registered = useRef(false);

  // 1. Set the token provider so all axios requests get the Clerk JWT
  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  // 2. Auto-register the user in our DB the very first time they land on the dashboard.
  //    The backend upsert is idempotent so this is safe to call every session.
  useEffect(() => {
    if (!isSignedIn || !user || registered.current) return;
    registered.current = true;

    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const name = user.fullName ?? undefined;
    const avatar = user.imageUrl ?? undefined;
    const clerkId = user.id;

    userApi
      .create({ clerkId, email, name, avatar })
      .catch(() => {
        // Silently ignore — the backend upsert handles duplicates,
        // and the auth middleware also auto-creates on every request.
      });
  }, [isSignedIn, user]);

  return <>{children}</>;
}
