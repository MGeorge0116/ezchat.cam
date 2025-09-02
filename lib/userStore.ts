import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Get by id */
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

/** Get by email (case-insensitive) */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

/** Get by username (case-insensitive) */
export async function getUserByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username: username.toLowerCase() } });
}

/** Email OR username */
export async function findByIdentifier(identifier: string): Promise<User | null> {
  return identifier.includes("@")
    ? getUserByEmail(identifier)
    : getUserByUsername(identifier);
}

/** Ensure a unique username; append a counter if needed */
export async function ensureUniqueUsername(base: string): Promise<string> {
  const clean = base.replace(/\s+/g, "").toLowerCase() || "user";
  let candidate = clean;
  let i = 0;
  // Loop until a unique username is found
  // (We use findUnique to leverage the unique index)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    i += 1;
    candidate = `${clean}${i}`;
  }
}

/** Create a user */
export async function createUser(input: {
  username: string;
  email: string;
  passwordHash?: string | null;
}): Promise<User> {
  return prisma.user.create({
    data: {
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash ?? null,
    },
  });
}

/** Mark a user as age-verified */
export async function setAgeVerified(userId: string, when = new Date()): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { ageVerifiedAt: when },
  });
}

export type PublicUser = Pick<User, "id" | "username" | "email" | "createdAt">;

export function toPublicUser(u: User): PublicUser {
  const { id, username, email, createdAt } = u;
  return { id, username, email, createdAt };
}
