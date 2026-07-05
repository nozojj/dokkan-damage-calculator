/*
  Warnings:

  - Added the required column `rarity` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DokkanRarity" AS ENUM ('SSR', 'LR');

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "rarity" "DokkanRarity" NOT NULL;
