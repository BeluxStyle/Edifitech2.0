/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `user` table. All the data in the column will be lost.
  - Added the required column `cp` to the `Comunidad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comunidad` ADD COLUMN `cp` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `subscriptionId`;
