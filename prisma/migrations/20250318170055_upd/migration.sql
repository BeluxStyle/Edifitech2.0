-- AlterTable
ALTER TABLE `contacto` MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `location` VARCHAR(191) NULL,
    MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'Vecino';
