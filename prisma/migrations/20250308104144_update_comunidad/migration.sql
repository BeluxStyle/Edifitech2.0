-- AlterTable
ALTER TABLE `instalacion` ADD COLUMN `comunidadId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Instalacion` ADD CONSTRAINT `Instalacion_comunidadId_fkey` FOREIGN KEY (`comunidadId`) REFERENCES `Comunidad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
