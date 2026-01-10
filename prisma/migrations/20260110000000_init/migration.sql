-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'TRANSPORTER', 'ADMIN', 'BACKOFFICE');

-- CreateEnum
CREATE TYPE "TransporterStatus" AS ENUM ('PENDING_DOCUMENTS', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'VAN', 'TRUCK', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('LIGHT', 'HEAVY', 'BOTH');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ValidationEntityType" AS ENUM ('VEHICLE', 'TRANSPORTER_PROFILE');

-- CreateEnum
CREATE TYPE "RejectionCategory" AS ENUM ('POOR_QUALITY_PHOTOS', 'EXPIRED_DOCUMENTS', 'INFORMATION_MISMATCH', 'ADDITIONAL_DOCUMENTATION_REQUIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "ZonePreference" AS ENUM ('PREFERRED', 'NEUTRAL', 'EXCLUDED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "companyName" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransporterProfile" (
    "id" UUID NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiration" TIMESTAMP(3) NOT NULL,
    "licenseFrontPhotoUrl" TEXT NOT NULL,
    "licenseBackPhotoUrl" TEXT NOT NULL,
    "idPhotoUrl" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "insurancePolicy" TEXT NOT NULL,
    "insuranceExpiration" TIMESTAMP(3) NOT NULL,
    "insuranceDocumentUrl" TEXT NOT NULL,
    "status" "TransporterStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransporterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "alias" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Guatemala',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vin" VARCHAR(17) NOT NULL,
    "color" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "loadType" "LoadType" NOT NULL,
    "maxWeightKg" DOUBLE PRECISION NOT NULL,
    "maxVolumeM3" DOUBLE PRECISION NOT NULL,
    "frontPhotoUrl" TEXT NOT NULL,
    "rearPhotoUrl" TEXT NOT NULL,
    "sidePhotoUrl" TEXT NOT NULL,
    "interiorPhotoUrl" TEXT NOT NULL,
    "registrationDocUrl" TEXT NOT NULL,
    "insuranceDocUrl" TEXT NOT NULL,
    "insuranceExpiration" TIMESTAMP(3) NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationLog" (
    "id" UUID NOT NULL,
    "entityType" "ValidationEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "rejectionCategory" "RejectionCategory",
    "rejectionDetails" TEXT,
    "checklist" JSONB,
    "reviewedBy" UUID NOT NULL,
    "transporterId" UUID NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "countryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipality" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stateId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "polygon" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "municipalityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransporterZonePreference" (
    "id" UUID NOT NULL,
    "preference" "ZonePreference" NOT NULL DEFAULT 'NEUTRAL',
    "transporterId" UUID NOT NULL,
    "zoneId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransporterZonePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoSub_key" ON "User"("cognitoSub");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TransporterProfile_userId_key" ON "TransporterProfile"("userId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");

-- CreateIndex
CREATE INDEX "ValidationLog_entityType_entityId_idx" ON "ValidationLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ValidationLog_transporterId_idx" ON "ValidationLog"("transporterId");

-- CreateIndex
CREATE INDEX "ValidationLog_reviewedBy_idx" ON "ValidationLog"("reviewedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_isActive_idx" ON "Country"("isActive");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "State"("countryId");

-- CreateIndex
CREATE INDEX "State_isActive_idx" ON "State"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "State_countryId_code_key" ON "State"("countryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "State_countryId_name_key" ON "State"("countryId", "name");

-- CreateIndex
CREATE INDEX "Municipality_stateId_idx" ON "Municipality"("stateId");

-- CreateIndex
CREATE INDEX "Municipality_isActive_idx" ON "Municipality"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_stateId_code_key" ON "Municipality"("stateId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_stateId_name_key" ON "Municipality"("stateId", "name");

-- CreateIndex
CREATE INDEX "Zone_municipalityId_idx" ON "Zone"("municipalityId");

-- CreateIndex
CREATE INDEX "Zone_isActive_idx" ON "Zone"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_municipalityId_code_key" ON "Zone"("municipalityId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_municipalityId_name_key" ON "Zone"("municipalityId", "name");

-- CreateIndex
CREATE INDEX "TransporterZonePreference_transporterId_idx" ON "TransporterZonePreference"("transporterId");

-- CreateIndex
CREATE INDEX "TransporterZonePreference_zoneId_idx" ON "TransporterZonePreference"("zoneId");

-- CreateIndex
CREATE INDEX "TransporterZonePreference_preference_idx" ON "TransporterZonePreference"("preference");

-- CreateIndex
CREATE UNIQUE INDEX "TransporterZonePreference_transporterId_zoneId_key" ON "TransporterZonePreference"("transporterId", "zoneId");

-- AddForeignKey
ALTER TABLE "TransporterProfile" ADD CONSTRAINT "TransporterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationLog" ADD CONSTRAINT "ValidationLog_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationLog" ADD CONSTRAINT "ValidationLog_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipality" ADD CONSTRAINT "Municipality_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterZonePreference" ADD CONSTRAINT "TransporterZonePreference_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterZonePreference" ADD CONSTRAINT "TransporterZonePreference_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

