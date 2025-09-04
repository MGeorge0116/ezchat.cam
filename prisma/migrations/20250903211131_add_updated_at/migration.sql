-- Add the column with a default so existing rows get a value
ALTER TABLE "User"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Optional: drop the default; Prisma's @updatedAt will keep it current
ALTER TABLE "User"
ALTER COLUMN "updatedAt" DROP DEFAULT;
