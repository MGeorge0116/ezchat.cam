export interface Credentials {
  email?: string;
  username?: string;
  password: string;
}

export async function validateCredentials(_c: Credentials): Promise<boolean> {
  // Keep behavior minimal; fill in if you need server-side validation.
  return true;
}
