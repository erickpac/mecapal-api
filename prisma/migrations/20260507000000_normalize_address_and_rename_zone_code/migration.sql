-- Rename Zone.code to Zone.postalCode (preserves data)
ALTER TABLE "Zone" RENAME COLUMN "code" TO "postalCode";

-- Update unique index to reference new column name
DROP INDEX "Zone_municipalityId_code_key";
CREATE UNIQUE INDEX "Zone_municipalityId_postalCode_key" ON "Zone"("municipalityId", "postalCode");

-- Drop denormalized columns from Address (data now lives in linked State/Municipality/Zone)
ALTER TABLE "Address"
  DROP COLUMN "city",
  DROP COLUMN "state",
  DROP COLUMN "postalCode",
  DROP COLUMN "country";

-- Remove any orphan addresses that lack a state or municipality
-- (these would violate the upcoming NOT NULL constraints)
DELETE FROM "Address" WHERE "stateId" IS NULL OR "municipalityId" IS NULL;

-- Recreate Address foreign keys with stricter ON DELETE behavior (was SetNull, now Restrict)
ALTER TABLE "Address" DROP CONSTRAINT "Address_stateId_fkey";
ALTER TABLE "Address" DROP CONSTRAINT "Address_municipalityId_fkey";

ALTER TABLE "Address"
  ALTER COLUMN "stateId" SET NOT NULL,
  ALTER COLUMN "municipalityId" SET NOT NULL;

ALTER TABLE "Address" ADD CONSTRAINT "Address_stateId_fkey"
  FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Address" ADD CONSTRAINT "Address_municipalityId_fkey"
  FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
