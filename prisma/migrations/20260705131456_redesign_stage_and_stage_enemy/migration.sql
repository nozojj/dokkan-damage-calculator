/*
  Warnings:

  - You are about to drop the column `enemyId` on the `StageEnemy` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `StageEnemy` table. All the data in the column will be lost.
  - Added the required column `difficulty` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atk` to the `StageEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `def` to the `StageEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hp` to the `StageEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StageEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `StageEnemy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StageEnemy" DROP CONSTRAINT "StageEnemy_enemyId_fkey";

-- DropIndex
DROP INDEX "StageEnemy_stageId_enemyId_key";

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "enemyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "event" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StageEnemy" DROP COLUMN "enemyId",
DROP COLUMN "order",
ADD COLUMN     "atk" INTEGER NOT NULL,
ADD COLUMN     "def" INTEGER NOT NULL,
ADD COLUMN     "hp" BIGINT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "DokkanType" NOT NULL;

-- CreateTable
CREATE TABLE "StageMechanic" (
    "id" TEXT NOT NULL,
    "mechanic" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,

    CONSTRAINT "StageMechanic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StageMechanic" ADD CONSTRAINT "StageMechanic_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
