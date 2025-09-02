// web/components/Providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider reads /api/auth/session and provides useSession/signIn/signOut
  return <SessionProvider>{children}</SessionProvider>;
}
