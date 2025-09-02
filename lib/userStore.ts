// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\lib\userStore.ts
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export type User = {
  id: string;
  username: string;
  usernameLower: string;
  email: string;
  emailLower: string;
  passwordHash: string;
  createdAt: string; // ISO
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "users.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsers(): User[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_PATH)) return [];
  try {
    const raw = fs.readFileSync(USERS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

function normalize(s: string) {
  return String(s || "").trim();
}
function lower(s: string) {
  return normalize(s).toLowerCase();
}

export function isUsernameTaken(username: string): boolean {
  const users = loadUsers();
  const u = lower(username);
  return users.some((x) => x.usernameLower === u);
}

export function isEmailTaken(email: string): boolean {
  const users = loadUsers();
  const e = lower(email);
  return users.some((x) => x.emailLower === e);
}

export function getUserById(id: string): User | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

export function getUserByIdentifier(identifier: string): User | null {
  const users = loadUsers();
  const idLower = lower(identifier);
  // Match by email or username (case-insensitive)
  return (
    users.find((u) => u.emailLower === idLower) ||
    users.find((u) => u.usernameLower === idLower) ||
    null
  );
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
  const users = loadUsers();
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id,
    username: normalize(username),
    usernameLower: lower(username),
    email: normalize(email),
    emailLower: lower(email),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export type PublicUser = Pick<User, "id" | "username" | "email" | "createdAt">;
export function toPublicUser(u: User): PublicUser {
  const { id, username, email, createdAt } = u;
  return { id, username, email, createdAt };