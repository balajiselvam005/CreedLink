-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('LICENSE', 'COLLABORATION', 'REVENUE_SHARE', 'PARTNERSHIP');

-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "type" "AgreementType";
