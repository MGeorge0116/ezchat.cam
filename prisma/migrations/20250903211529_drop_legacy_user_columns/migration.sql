/*
  Warnings:

  - You are about to drop the column `ageVerifiedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `legitRegisteredAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privacyAcceptedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registeredAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registeredIp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registeredUserAgent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registrationMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tosAcceptedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Presence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistrationEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserRooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Presence" DROP CONSTRAINT "Presence_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Presence" DROP CONSTRAINT "Presence_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RegistrationEvent" DROP CONSTRAINT "RegistrationEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserRooms" DROP CONSTRAINT "_UserRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserRooms" DROP CONSTRAINT "_UserRooms_B_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "ageVerifiedAt",
DROP COLUMN "legitRegisteredAt",
DROP COLUMN "privacyAcceptedAt",
DROP COLUMN "registeredAt",
DROP COLUMN "registeredIp",
DROP COLUMN "registeredUserAgent",
DROP COLUMN "registrationMethod",
DROP COLUMN "tosAcceptedAt";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."Presence";

-- DropTable
DROP TABLE "public"."RegistrationEvent";

-- DropTable
DROP TABLE "public"."Room";

-- DropTable
DROP TABLE "public"."_UserRooms";

-- DropEnum
DROP TYPE "public"."RegistrationMethod";
