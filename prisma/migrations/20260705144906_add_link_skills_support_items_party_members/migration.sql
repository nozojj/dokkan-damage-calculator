-- CreateTable
CREATE TABLE "LinkSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterLinkSkill" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "linkSkillId" TEXT NOT NULL,

    CONSTRAINT "CharacterLinkSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSupportItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "supportItemId" TEXT NOT NULL,

    CONSTRAINT "CharacterSupportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterPartyMember" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "CharacterPartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkSkill_name_key" ON "LinkSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterLinkSkill_characterId_linkSkillId_key" ON "CharacterLinkSkill"("characterId", "linkSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSupportItem_characterId_supportItemId_key" ON "CharacterSupportItem"("characterId", "supportItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterPartyMember_characterId_memberId_key" ON "CharacterPartyMember"("characterId", "memberId");

-- AddForeignKey
ALTER TABLE "CharacterLinkSkill" ADD CONSTRAINT "CharacterLinkSkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLinkSkill" ADD CONSTRAINT "CharacterLinkSkill_linkSkillId_fkey" FOREIGN KEY ("linkSkillId") REFERENCES "LinkSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSupportItem" ADD CONSTRAINT "CharacterSupportItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSupportItem" ADD CONSTRAINT "CharacterSupportItem_supportItemId_fkey" FOREIGN KEY ("supportItemId") REFERENCES "SupportItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPartyMember" ADD CONSTRAINT "CharacterPartyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPartyMember" ADD CONSTRAINT "CharacterPartyMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
