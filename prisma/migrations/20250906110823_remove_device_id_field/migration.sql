/*
  Warnings:

  - You are about to drop the column `deviceId` on the `user_session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_session_deviceId_idx";

-- AlterTable
ALTER TABLE "user_session" DROP COLUMN "deviceId";
