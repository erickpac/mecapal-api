-- Remove countryCode from User.
-- The user account is no longer tied to a single country: Mekapal is multi-country
-- and a user may create delivery addresses in any operating country. The country of
-- an address is derived through the Address -> State -> Country hierarchy, so the
-- User.countryCode FK was redundant pass-through data.
-- TransporterProfile.countryCode (the transporter's own fiscal/operating country) is kept.
DROP INDEX IF EXISTS "User_countryCode_idx";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_countryCode_fkey";
ALTER TABLE "User" DROP COLUMN IF EXISTS "countryCode";
