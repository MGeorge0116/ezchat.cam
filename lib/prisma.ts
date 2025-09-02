import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Reuse the client in dev to avoid too many open connections
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["warn", "error"], // set to ['query','info','warn','error'] if you want verbose logging
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
