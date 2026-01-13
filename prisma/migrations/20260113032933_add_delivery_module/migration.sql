-- CreateEnum
CREATE TYPE "DeliveryRequestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OFFERS_RECEIVED', 'ACCEPTED', 'IN_PROGRESS', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "DeliveryRequest" (
    "id" UUID NOT NULL,
    "loadType" "LoadType" NOT NULL,
    "pickupAddressId" UUID NOT NULL,
    "deliveryAddressId" UUID NOT NULL,
    "calculatedDistanceKm" DOUBLE PRECISION NOT NULL,
    "estimatedWeightKg" DOUBLE PRECISION NOT NULL,
    "estimatedVolumeM3" DOUBLE PRECISION,
    "packageDescription" VARCHAR(500) NOT NULL,
    "declaredValue" DOUBLE PRECISION,
    "isFragile" BOOLEAN NOT NULL DEFAULT false,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
    "specialInstructions" VARCHAR(300),
    "pickupDate" DATE NOT NULL,
    "pickupTimeStart" TIME(0) NOT NULL,
    "pickupTimeEnd" TIME(0) NOT NULL,
    "deliveryDeadline" TIMESTAMP(3) NOT NULL,
    "offerWindowMinutes" INTEGER NOT NULL DEFAULT 60,
    "offerExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" "DeliveryRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "clientId" UUID NOT NULL,
    "acceptedOfferId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryOffer" (
    "id" UUID NOT NULL,
    "offeredPrice" DOUBLE PRECISION NOT NULL,
    "estimatedTimeMinutes" INTEGER NOT NULL,
    "estimatedPickupTime" TIMESTAMP(3) NOT NULL,
    "estimatedDeliveryTime" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(500),
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "netEarnings" DOUBLE PRECISION NOT NULL,
    "status" "DeliveryOfferStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryRequestId" UUID NOT NULL,
    "transporterId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRequest_acceptedOfferId_key" ON "DeliveryRequest"("acceptedOfferId");

-- CreateIndex
CREATE INDEX "DeliveryRequest_clientId_idx" ON "DeliveryRequest"("clientId");

-- CreateIndex
CREATE INDEX "DeliveryRequest_status_idx" ON "DeliveryRequest"("status");

-- CreateIndex
CREATE INDEX "DeliveryRequest_offerExpiresAt_idx" ON "DeliveryRequest"("offerExpiresAt");

-- CreateIndex
CREATE INDEX "DeliveryOffer_deliveryRequestId_idx" ON "DeliveryOffer"("deliveryRequestId");

-- CreateIndex
CREATE INDEX "DeliveryOffer_transporterId_idx" ON "DeliveryOffer"("transporterId");

-- CreateIndex
CREATE INDEX "DeliveryOffer_status_idx" ON "DeliveryOffer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOffer_deliveryRequestId_transporterId_key" ON "DeliveryOffer"("deliveryRequestId", "transporterId");

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_pickupAddressId_fkey" FOREIGN KEY ("pickupAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOffer" ADD CONSTRAINT "DeliveryOffer_deliveryRequestId_fkey" FOREIGN KEY ("deliveryRequestId") REFERENCES "DeliveryRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOffer" ADD CONSTRAINT "DeliveryOffer_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOffer" ADD CONSTRAINT "DeliveryOffer_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
