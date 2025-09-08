// Minimal, framework-free type guards
export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function hasString(obj: Record<string, unknown>, key: string): obj is Record<string, string> {
  return typeof obj[key] === "string";
}

export function pickString(obj: unknown, key: string): string | null {
  if (!isObject(obj)) return null;
  const val = obj[key];
  return typeof val === "string" ? val : null;
}

export function requireStrings<TKeys extends string>(
  obj: unknown,
  keys: TKeys[]
): obj is Record<TKeys, string> {
  if (!isObject(obj)) return false;
  for (const k of keys) {
    if (typeof obj[k] !== "string") return false;
  }
  return true;
}
