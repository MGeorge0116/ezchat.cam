// prisma/seed.ts
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const password = "password123";
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: "me@example.com" },
    update: {},
    create: {
      email: "me@example.com",
      username: "me",
      passwordHash: hash
    }
  });

  console.log("✅ Seeded user:", {
    email: user.email,
    username: user.username,
    password
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
