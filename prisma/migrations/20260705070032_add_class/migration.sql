/*
  Warnings:

  - Added the required column `class` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DokkanClass" AS ENUM ('SUPER', 'EXTREME');

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "class" "DokkanClass" NOT NULL;
