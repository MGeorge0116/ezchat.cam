export interface SessionUser {
  id: string;
  email: string | null;
  username: string;
}

export interface Session {
  user: SessionUser | null;
}

export async function getSession(): Promise<Session> {
  // Stub: return null if you don't use NextAuth.
  return { user: null };
}
