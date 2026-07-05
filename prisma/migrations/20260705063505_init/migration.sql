-- CreateEnum
CREATE TYPE "DokkanType" AS ENUM ('STR', 'AGL', 'TEQ', 'INT', 'PHY');

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DokkanType" NOT NULL,
    "baseAtk" INTEGER NOT NULL,
    "baseDef" INTEGER NOT NULL,
    "kiMultiplier" DOUBLE PRECISION NOT NULL,
    "superAttackMultiplier" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);
