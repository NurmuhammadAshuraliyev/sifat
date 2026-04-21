/*
  Warnings:

  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - Changed the type of `category` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "customers_phone_key";

-- DropIndex
DROP INDEX "products_name_idx";

-- DropIndex
DROP INDEX "sale_items_productId_idx";

-- DropIndex
DROP INDEX "sale_items_saleId_idx";

-- DropIndex
DROP INDEX "sales_createdAt_idx";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt";

-- DropEnum
DROP TYPE "ProductCategory";
