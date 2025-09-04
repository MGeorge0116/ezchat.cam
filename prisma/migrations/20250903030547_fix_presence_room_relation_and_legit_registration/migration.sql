/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Room` table. All the data in the column will be lost.
  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."RegistrationMethod" AS ENUM ('PASSWORD', 'OAUTH', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."Message_roomId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Room_lastSeenAt_idx";

-- DropIndex
DROP INDEX "public"."Room_name_idx";

-- DropIndex
DROP INDEX "public"."Room_ownerId_idx";

-- DropIndex
DROP INDEX "public"."User_email_idx";

-- DropIndex
DROP INDEX "public"."User_username_idx";

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "legitRegisteredAt" TIMESTAMP(3),
ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "registeredIp" TEXT,
ADD COLUMN     "registeredUserAgent" TEXT,
ADD COLUMN     "registrationMethod" "public"."RegistrationMethod" NOT NULL DEFAULT 'PASSWORD',
ADD COLUMN     "tosAcceptedAt" TIMESTAMP(3),
ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."Presence" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RegistrationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "public"."RegistrationMethod" NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,

    CONSTRAINT "RegistrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Presence_lastSeen_idx" ON "public"."Presence"("lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_roomId_username_key" ON "public"."Presence"("roomId", "username");

-- CreateIndex
CREATE INDEX "RegistrationEvent_userId_createdAt_idx" ON "public"."RegistrationEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "_UserRooms_B_index" ON "public"."_UserRooms"("B");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Presence" ADD CONSTRAINT "Presence_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Presence" ADD CONSTRAINT "Presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistrationEvent" ADD CONSTRAINT "RegistrationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserRooms" ADD CONSTRAINT "_UserRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserRooms" ADD CONSTRAINT "_UserRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
