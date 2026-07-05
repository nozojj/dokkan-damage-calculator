-- CreateTable
CREATE TABLE "Enemy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DokkanType" NOT NULL,
    "atk" INTEGER NOT NULL,
    "def" INTEGER NOT NULL,
    "superAttackMultiplier" DOUBLE PRECISION NOT NULL,
    "damageReductionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enemy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageEnemy" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "stageId" TEXT NOT NULL,
    "enemyId" TEXT NOT NULL,

    CONSTRAINT "StageEnemy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StageEnemy_stageId_enemyId_key" ON "StageEnemy"("stageId", "enemyId");

-- AddForeignKey
ALTER TABLE "StageEnemy" ADD CONSTRAINT "StageEnemy_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageEnemy" ADD CONSTRAINT "StageEnemy_enemyId_fkey" FOREIGN KEY ("enemyId") REFERENCES "Enemy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
