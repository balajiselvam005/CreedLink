/*
  Warnings:

  - A unique constraint covering the columns `[agreementNumber]` on the table `Agreement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agreementNumber` to the `Agreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "agreementNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_agreementNumber_key" ON "Agreement"("agreementNumber");
