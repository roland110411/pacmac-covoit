-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passager" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chauffeurId" INTEGER NOT NULL,

    CONSTRAINT "Passager_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Passager" ADD CONSTRAINT "Passager_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
