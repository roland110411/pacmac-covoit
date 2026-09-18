-- DropForeignKey
ALTER TABLE "Passager" DROP CONSTRAINT "Passager_chauffeurId_fkey";

-- AlterTable
ALTER TABLE "Passager" ALTER COLUMN "chauffeurId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Passager" ADD CONSTRAINT "Passager_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
