-- Ensure the default Country exists before adding the FK constraint.
-- Idempotent: matches the seed's upsert behavior. Required for fresh
-- deploys where prisma seed has not run yet, otherwise the ADD CONSTRAINT
-- below either aborts (if rows exist) or every subsequent insert breaks.
INSERT INTO "Country" (id, name, code, "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Guatemala', 'GT', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Safety: abort if any existing TransporterProfile row has a non-Guatemala
-- country value that would be destroyed by the blanket backfill below.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "TransporterProfile"
    WHERE "country" IS NOT NULL AND "country" <> 'GT' AND "country" <> 'Guatemala'
  ) THEN
    RAISE EXCEPTION 'Migration aborted: TransporterProfile contains non-Guatemala country values that would be destroyed. Manual data migration required first.';
  END IF;
END $$;

-- Add countryCode to User (new column, default backfills existing rows)
ALTER TABLE "User" ADD COLUMN "countryCode" VARCHAR(3) NOT NULL DEFAULT 'GT';

-- Add countryCode to TransporterProfile (preserve data: column-add → backfill → drop old)
-- Step 1: add new column with default so existing rows get 'GT' automatically
ALTER TABLE "TransporterProfile" ADD COLUMN "countryCode" VARCHAR(3) NOT NULL DEFAULT 'GT';

-- Step 2: explicit backfill (guarded above; no non-Guatemala data expected)
UPDATE "TransporterProfile" SET "countryCode" = 'GT';

-- Step 3: drop the old free-text country column
ALTER TABLE "TransporterProfile" DROP COLUMN "country";

-- CreateIndex
CREATE INDEX "User_countryCode_idx" ON "User"("countryCode");

-- CreateIndex
CREATE INDEX "TransporterProfile_countryCode_idx" ON "TransporterProfile"("countryCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterProfile" ADD CONSTRAINT "TransporterProfile_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
