/*
  Warnings:

  - The `position` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `first_login` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('pending', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('suggestion', 'compliment', 'complaint', 'positive', 'other');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "position",
ADD COLUMN     "position" BOOLEAN,
DROP COLUMN "first_login",
ADD COLUMN     "first_login" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "enquiries" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'pending',
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "name" VARCHAR(100),
    "email" VARCHAR(150),
    "type" "FeedbackType" NOT NULL DEFAULT 'other',
    "rating" SMALLINT,
    "message" TEXT NOT NULL,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);
