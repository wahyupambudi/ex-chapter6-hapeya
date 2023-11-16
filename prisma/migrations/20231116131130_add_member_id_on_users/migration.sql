-- CreateEnum
CREATE TYPE "roles" AS ENUM ('member', 'admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "memberId" "roles" NOT NULL DEFAULT 'member';
