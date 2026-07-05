-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "StageEnemy" ADD COLUMN     "guardReduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "waveOrder" INTEGER NOT NULL DEFAULT 0;
