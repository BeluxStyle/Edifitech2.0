-- DropForeignKey
ALTER TABLE `producto` DROP FOREIGN KEY `Producto_categoryId_fkey`;

-- DropIndex
DROP INDEX `Producto_categoryId_fkey` ON `producto`;

-- CreateTable
CREATE TABLE `Subcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `categoriaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Subcategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
