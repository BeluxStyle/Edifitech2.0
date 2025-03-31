-- DropForeignKey
ALTER TABLE `contacto` DROP FOREIGN KEY `Contacto_comunidadId_fkey`;

-- DropForeignKey
ALTER TABLE `contacto` DROP FOREIGN KEY `Contacto_edificioId_fkey`;

-- DropIndex
DROP INDEX `Contacto_comunidadId_fkey` ON `contacto`;

-- DropIndex
DROP INDEX `Contacto_edificioId_fkey` ON `contacto`;

-- AlterTable
ALTER TABLE `contacto` MODIFY `comunidadId` VARCHAR(191) NULL,
    MODIFY `edificioId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Contacto` ADD CONSTRAINT `Contacto_comunidadId_fkey` FOREIGN KEY (`comunidadId`) REFERENCES `Comunidad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contacto` ADD CONSTRAINT `Contacto_edificioId_fkey` FOREIGN KEY (`edificioId`) REFERENCES `Edificio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
