// File: lib/currentUser.ts
// TODO: Replace with your real auth/session lookup.
export async function getCurrentUsername(): Promise<string | null> {
  // Example: return the logged-in username or null if not signed in.
  return 'seymour'; // <- placeholder; lowercase slug used in /room/[username]
}
