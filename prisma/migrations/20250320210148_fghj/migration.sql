/*
  Warnings:

  - You are about to drop the column `categoryId` on the `producto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `producto` DROP FOREIGN KEY `Producto_categoryId_fkey`;

-- DropIndex
DROP INDEX `Producto_categoryId_fkey` ON `producto`;

-- AlterTable
ALTER TABLE `producto` DROP COLUMN `categoryId`,
    ADD COLUMN `subcategoryId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
