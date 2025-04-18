-- DropForeignKey
ALTER TABLE `edificio` DROP FOREIGN KEY `Edificio_comunidadId_fkey`;

-- DropIndex
DROP INDEX `Edificio_comunidadId_fkey` ON `edificio`;

-- AddForeignKey
ALTER TABLE `Edificio` ADD CONSTRAINT `Edificio_comunidadId_fkey` FOREIGN KEY (`comunidadId`) REFERENCES `Comunidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
