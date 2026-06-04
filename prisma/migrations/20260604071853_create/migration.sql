/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NasiyaStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "nasiyaId" TEXT;

-- CreateTable
CREATE TABLE "nasiyalar" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "saleId" TEXT,
    "aslSumma" DECIMAL(12,2) NOT NULL,
    "qolganQarz" DECIMAL(12,2) NOT NULL,
    "izoh" TEXT,
    "status" "NasiyaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nasiyalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasiya_tolovlar" (
    "id" TEXT NOT NULL,
    "nasiyaId" TEXT NOT NULL,
    "summa" DECIMAL(12,2) NOT NULL,
    "izoh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nasiya_tolovlar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_nasiyaId_fkey" FOREIGN KEY ("nasiyaId") REFERENCES "nasiyalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasiyalar" ADD CONSTRAINT "nasiyalar_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasiya_tolovlar" ADD CONSTRAINT "nasiya_tolovlar_nasiyaId_fkey" FOREIGN KEY ("nasiyaId") REFERENCES "nasiyalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
