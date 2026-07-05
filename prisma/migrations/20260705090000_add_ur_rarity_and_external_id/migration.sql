-- AlterEnum
ALTER TYPE "DokkanRarity" ADD VALUE 'UR';

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Character_externalId_key" ON "Character"("externalId");
