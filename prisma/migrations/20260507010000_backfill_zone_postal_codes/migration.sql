-- Backfill Zone.postalCode for rows seeded with placeholder codes (Z01..Z25)
-- to use real Guatemala postal codes (01001..01025).
-- Pattern: 'Z' + NN -> '010' + NN. Idempotent — does nothing on already-migrated data.
UPDATE "Zone"
SET "postalCode" = '010' || SUBSTRING("postalCode" FROM 2)
WHERE "postalCode" LIKE 'Z%';
