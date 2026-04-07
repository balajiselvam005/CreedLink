/*
  Warnings:

  - You are about to drop the column `description` on the `Agreement` table. All the data in the column will be lost.
  - You are about to drop the column `terms` on the `Agreement` table. All the data in the column will be lost.
  - The `status` column on the `Agreement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `content` to the `Agreement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'SENT', 'PENDING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "description",
DROP COLUMN "terms",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "receiverSignature" TEXT,
ADD COLUMN     "receiverSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiverSignedAt" TIMESTAMP(3),
ADD COLUMN     "senderSignature" TEXT,
ADD COLUMN     "senderSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderSignedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT';
