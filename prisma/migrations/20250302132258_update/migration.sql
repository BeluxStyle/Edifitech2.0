/*
  Warnings:

  - Added the required column `cp` to the `Edificio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `edificio` ADD COLUMN `cp` VARCHAR(191) NOT NULL;
