// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\lib\session.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export const SESSION_COOKIE = "ezchat_auth";
const DEFAULT_TTL_S = 60 * 60 * 24 * 7; // 7 days

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hmacSHA256(key: string, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function getSecret() {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

export function signToken(payload: Record<string, any>) {
  const header = { alg: "HS256", typ: "JWT" };
  const h64 = base64url(JSON.stringify(header));
  const p64 = base64url(JSON.stringify(payload));
  const data = `${h64}.${p64}`;
  const sig = base64url(hmacSHA256(getSecret(), data));
  return `${data}.${sig}`;
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    const [h64, p64, sig] = token.split(".");
    if (!h64 || !p64 || !sig) return null;
    const data = `${h64}.${p64}`;
    const expected = base64url(hmacSHA256(getSecret(), data));
    const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) return null;
    const payload = JSON.parse(Buffer.from(p64, "base64").toString("utf8"));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, userId: string, ttl = DEFAULT_TTL_S) {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const token = signToken({ uid: userId, exp });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttl,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}
