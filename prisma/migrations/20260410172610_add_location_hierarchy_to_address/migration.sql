-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "municipalityId" UUID,
ADD COLUMN     "stateId" UUID,
ADD COLUMN     "zoneId" UUID;

-- CreateIndex
CREATE INDEX "Address_stateId_idx" ON "Address"("stateId");

-- CreateIndex
CREATE INDEX "Address_municipalityId_idx" ON "Address"("municipalityId");

-- CreateIndex
CREATE INDEX "Address_zoneId_idx" ON "Address"("zoneId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
