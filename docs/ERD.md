```mermaid
erDiagram

        UserRole {
            CLIENT CLIENT
TRANSPORTER TRANSPORTER
ADMIN ADMIN
BACKOFFICE BACKOFFICE
        }
    


        TransporterStatus {
            PENDING_DOCUMENTS PENDING_DOCUMENTS
PENDING_REVIEW PENDING_REVIEW
ACTIVE ACTIVE
SUSPENDED SUSPENDED
        }
    


        VehicleType {
            CAR CAR
VAN VAN
TRUCK TRUCK
MOTORCYCLE MOTORCYCLE
        }
    


        LoadType {
            LIGHT LIGHT
HEAVY HEAVY
BOTH BOTH
        }
    


        VehicleStatus {
            PENDING_REVIEW PENDING_REVIEW
ACTIVE ACTIVE
SUSPENDED SUSPENDED
        }
    


        ValidationEntityType {
            VEHICLE VEHICLE
TRANSPORTER_PROFILE TRANSPORTER_PROFILE
        }
    


        RejectionCategory {
            POOR_QUALITY_PHOTOS POOR_QUALITY_PHOTOS
EXPIRED_DOCUMENTS EXPIRED_DOCUMENTS
INFORMATION_MISMATCH INFORMATION_MISMATCH
ADDITIONAL_DOCUMENTATION_REQUIRED ADDITIONAL_DOCUMENTATION_REQUIRED
OTHER OTHER
        }
    


        ZonePreference {
            PREFERRED PREFERRED
NEUTRAL NEUTRAL
EXCLUDED EXCLUDED
        }
    


        DeliveryRequestStatus {
            DRAFT DRAFT
PUBLISHED PUBLISHED
OFFERS_RECEIVED OFFERS_RECEIVED
ACCEPTED ACCEPTED
IN_PROGRESS IN_PROGRESS
PICKED_UP PICKED_UP
DELIVERED DELIVERED
CANCELLED CANCELLED
        }
    


        DeliveryOfferStatus {
            PENDING PENDING
ACCEPTED ACCEPTED
REJECTED REJECTED
EXPIRED EXPIRED
CANCELLED CANCELLED
        }
    


        CommissionType {
            PERCENTAGE PERCENTAGE
FIXED_AMOUNT FIXED_AMOUNT
        }
    


        ReviewType {
            CLIENT_TO_TRANSPORTER CLIENT_TO_TRANSPORTER
TRANSPORTER_TO_CLIENT TRANSPORTER_TO_CLIENT
        }
    


        DeletionReason {
            NO_LONGER_USE NO_LONGER_USE
CREATED_ANOTHER_ACCOUNT CREATED_ANOTHER_ACCOUNT
PRIVACY_CONCERNS PRIVACY_CONCERNS
APP_ISSUES APP_ISSUES
BAD_EXPERIENCE BAD_EXPERIENCE
MISSING_FEATURES MISSING_FEATURES
PREFER_NOT_TO_SAY PREFER_NOT_TO_SAY
OTHER OTHER
        }
    


        PaymentMethodType {
            CARD CARD
        }
    


        CardBrand {
            VISA VISA
MASTERCARD MASTERCARD
AMEX AMEX
DISCOVER DISCOVER
OTHER OTHER
        }
    


        TransactionStatus {
            PENDING PENDING
PROCESSING PROCESSING
SUCCEEDED SUCCEEDED
FAILED FAILED
REFUNDED REFUNDED
PARTIALLY_REFUNDED PARTIALLY_REFUNDED
CANCELLED CANCELLED
        }
    


        TransactionType {
            PAYMENT PAYMENT
REFUND REFUND
        }
    


        OrderStatus {
            CONFIRMED CONFIRMED
IN_PROGRESS IN_PROGRESS
PICKED_UP PICKED_UP
IN_TRANSIT IN_TRANSIT
DELIVERED DELIVERED
COMPLETED COMPLETED
CANCELLED CANCELLED
        }
    


        BankAccountType {
            CHECKING CHECKING
SAVINGS SAVINGS
        }
    


        SettlementStatus {
            PENDING PENDING
PAID PAID
        }
    


        BankAccountStatus {
            PENDING_VERIFICATION PENDING_VERIFICATION
VERIFIED VERIFIED
REJECTED REJECTED
SUSPENDED SUSPENDED
        }
    


        IncidentStatus {
            OPEN OPEN
INVESTIGATING INVESTIGATING
RESOLVED RESOLVED
CLOSED CLOSED
        }
    


        IncidentSeverity {
            LOW LOW
MEDIUM MEDIUM
HIGH HIGH
CRITICAL CRITICAL
        }
    


        IncidentType {
            DELAY DELAY
DAMAGE DAMAGE
LOSS LOSS
FRAUD FRAUD
OTHER OTHER
        }
    


        IncidentResolution {
            RESOLVED_SATISFACTORILY RESOLVED_SATISFACTORILY
CLOSED_WITHOUT_RESOLUTION CLOSED_WITHOUT_RESOLUTION
        }
    


        UserAction {
            NONE NONE
WARNING WARNING
SUSPENSION SUSPENSION
BAN BAN
        }
    


        NotificationType {
            NEW_DELIVERY_OPPORTUNITY NEW_DELIVERY_OPPORTUNITY
NEW_OFFER_RECEIVED NEW_OFFER_RECEIVED
OFFER_ACCEPTED OFFER_ACCEPTED
OFFER_REJECTED OFFER_REJECTED
OFFER_EXPIRED OFFER_EXPIRED
ORDER_CONFIRMED ORDER_CONFIRMED
ORDER_PICKED_UP ORDER_PICKED_UP
ORDER_IN_TRANSIT ORDER_IN_TRANSIT
ORDER_DELIVERED ORDER_DELIVERED
ORDER_COMPLETED ORDER_COMPLETED
ORDER_CANCELLED ORDER_CANCELLED
PAYMENT_RECEIVED PAYMENT_RECEIVED
SETTLEMENT_PAID SETTLEMENT_PAID
INCIDENT_CREATED INCIDENT_CREATED
INCIDENT_UPDATED INCIDENT_UPDATED
INCIDENT_RESOLVED INCIDENT_RESOLVED
SYSTEM_ANNOUNCEMENT SYSTEM_ANNOUNCEMENT
ACCOUNT_UPDATE ACCOUNT_UPDATE
        }
    


        NotificationChannel {
            IN_APP IN_APP
PUSH PUSH
EMAIL EMAIL
SMS SMS
        }
    


        NotificationStatus {
            PENDING PENDING
SENT SENT
DELIVERED DELIVERED
FAILED FAILED
READ READ
        }
    
  "User" {
    String id "🗝️"
    String cognitoSub 
    String email 
    String phone 
    String firstName 
    String lastName 
    UserRole role 
    String companyName "❓"
    String taxId "❓"
    String profilePhotoUrl "❓"
    String stripeCustomerId "❓"
    Float averageRating 
    Int totalReviews 
    DateTime deletedAt "❓"
    DateTime deletionScheduledFor "❓"
    DeletionReason deletionReason "❓"
    String deletionOtherReason "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "AccountDeletionAudit" {
    String id "🗝️"
    DateTime requestedAt 
    DateTime scheduledFor 
    DateTime processedAt "❓"
    DateTime canceledAt "❓"
    DeletionReason reason "❓"
    String otherReason "❓"
    String ipAddress "❓"
    String userAgent "❓"
    }
  

  "TransporterProfile" {
    String id "🗝️"
    String idNumber "❓"
    String licenseNumber 
    DateTime licenseExpiration 
    String licenseFrontPhotoUrl 
    String licenseBackPhotoUrl 
    String idPhotoUrl 
    String address 
    String city 
    String state 
    String postalCode 
    String country 
    String insurancePolicy 
    DateTime insuranceExpiration 
    String insuranceDocumentUrl 
    TransporterStatus status 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Address" {
    String id "🗝️"
    String alias 
    String street 
    Float latitude "❓"
    Float longitude "❓"
    String contactName "❓"
    String contactPhone "❓"
    Boolean isDefault 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Vehicle" {
    String id "🗝️"
    String brand 
    String model 
    Int year 
    String licensePlate 
    String vin 
    String color 
    VehicleType vehicleType 
    LoadType loadType 
    Float maxWeightKg 
    Float maxVolumeM3 
    String frontPhotoUrl 
    String rearPhotoUrl 
    String sidePhotoUrl 
    String interiorPhotoUrl 
    String registrationDocUrl 
    String insuranceDocUrl 
    DateTime insuranceExpiration 
    VehicleStatus status 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "ValidationLog" {
    String id "🗝️"
    ValidationEntityType entityType 
    String entityId 
    String action 
    RejectionCategory rejectionCategory "❓"
    String rejectionDetails "❓"
    Json checklist "❓"
    Boolean emailSent 
    DateTime createdAt 
    }
  

  "Country" {
    String id "🗝️"
    String name 
    String code 
    Boolean isActive 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "State" {
    String id "🗝️"
    String name 
    String code 
    Boolean isActive 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Municipality" {
    String id "🗝️"
    String name 
    String code 
    Boolean isActive 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Zone" {
    String id "🗝️"
    String name 
    String postalCode 
    Float latitude "❓"
    Float longitude "❓"
    Json polygon "❓"
    Boolean isActive 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "TransporterZonePreference" {
    String id "🗝️"
    ZonePreference preference 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "DeliveryRequest" {
    String id "🗝️"
    LoadType loadType 
    Float calculatedDistanceKm 
    Float estimatedWeightKg 
    Float estimatedVolumeM3 "❓"
    String packageDescription 
    Float declaredValue "❓"
    Boolean isFragile 
    Boolean requiresSignature 
    String specialInstructions "❓"
    DateTime pickupDate 
    DateTime pickupTimeStart 
    DateTime pickupTimeEnd 
    DateTime deliveryDeadline 
    Int offerWindowMinutes 
    DateTime offerExpiresAt 
    DeliveryRequestStatus status 
    String acceptedOfferId "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "DeliveryOffer" {
    String id "🗝️"
    Float offeredPrice 
    Int estimatedTimeMinutes 
    DateTime estimatedPickupTime 
    DateTime estimatedDeliveryTime 
    String notes "❓"
    CommissionType commissionType 
    Float commissionPercent "❓"
    Float commissionFixedAmount "❓"
    Float commissionMinimum "❓"
    Float commissionMaximum "❓"
    Float commissionAmount 
    Boolean commissionExempt 
    Float taxPercent 
    Float taxAmount 
    Boolean taxExempt 
    Float subtotal 
    Float totalClientPrice 
    Float netEarnings 
    DeliveryOfferStatus status 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "PaymentMethod" {
    String id "🗝️"
    String stripePaymentMethodId 
    String stripeCustomerId 
    PaymentMethodType type 
    CardBrand cardBrand 
    String cardLast4 
    Int cardExpMonth 
    Int cardExpYear 
    Boolean isDefault 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Transaction" {
    String id "🗝️"
    String stripePaymentIntentId 
    String stripeChargeId "❓"
    TransactionType type 
    TransactionStatus status 
    Float amount 
    String currency 
    Float subtotal 
    Float commissionAmount 
    Float taxAmount 
    Float refundedAmount 
    String failureCode "❓"
    String failureMessage "❓"
    Json metadata "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "BillingProfile" {
    String id "🗝️"
    String name 
    String description "❓"
    CommissionType commissionType 
    Float commissionValue 
    Float commissionMinimum "❓"
    Float commissionMaximum "❓"
    Boolean isCommissionExempt 
    Float taxPercent 
    Boolean isTaxExempt 
    Boolean isDefault 
    Boolean isActive 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Order" {
    String id "🗝️"
    String orderNumber 
    OrderStatus status 
    DateTime confirmedAt 
    DateTime inProgressAt "❓"
    DateTime pickedUpAt "❓"
    DateTime inTransitAt "❓"
    DateTime deliveredAt "❓"
    DateTime completedAt "❓"
    DateTime cancelledAt "❓"
    String deliveryPhotoUrl "❓"
    String deliverySignature "❓"
    String deliveryNotes "❓"
    String receiverName "❓"
    String deliveredToAddress "❓"
    String cancellationReason "❓"
    String cancelledBy "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "OrderStatusHistory" {
    String id "🗝️"
    OrderStatus fromStatus "❓"
    OrderStatus toStatus 
    String notes "❓"
    String changedBy "❓"
    Float latitude "❓"
    Float longitude "❓"
    DateTime createdAt 
    }
  

  "OrderLocation" {
    String id "🗝️"
    Float latitude 
    Float longitude 
    Float speed "❓"
    Float heading "❓"
    Float accuracy "❓"
    DateTime createdAt 
    }
  

  "BankAccount" {
    String id "🗝️"
    String bankName 
    String accountHolderName 
    BankAccountType accountType 
    String accountNumber 
    String accountNumberLast4 
    BankAccountStatus status 
    String verificationDocUrl "❓"
    DateTime verifiedAt "❓"
    String rejectionReason "❓"
    Boolean isDefault 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Settlement" {
    String id "🗝️"
    Float amount 
    SettlementStatus status 
    DateTime transferDate "❓"
    String transactionNumber "❓"
    String comment "❓"
    String screenshotUrl "❓"
    DateTime paidAt "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Review" {
    String id "🗝️"
    Int rating 
    String comment "❓"
    ReviewType type 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Incident" {
    String id "🗝️"
    String incidentNumber 
    IncidentType type 
    IncidentSeverity severity 
    IncidentStatus status 
    String description 
    String evidenceUrls 
    String internalNotes "❓"
    IncidentResolution resolution "❓"
    String resolutionNotes "❓"
    Float refundAmount "❓"
    UserAction userAction 
    DateTime resolvedAt "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Notification" {
    String id "🗝️"
    NotificationType type 
    String title 
    String message 
    Json data "❓"
    NotificationChannel channels 
    NotificationStatus status 
    DateTime sentAt "❓"
    DateTime readAt "❓"
    DateTime failedAt "❓"
    String error "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  
    "User" |o--|| "UserRole" : "enum:role"
    "User" }o--|o "BillingProfile" : "billingProfile"
    "User" |o--|o "DeletionReason" : "enum:deletionReason"
    "AccountDeletionAudit" }o--|| "User" : "user"
    "AccountDeletionAudit" |o--|o "DeletionReason" : "enum:reason"
    "TransporterProfile" |o--|| "TransporterStatus" : "enum:status"
    "TransporterProfile" |o--|| "User" : "user"
    "Address" }o--|| "User" : "user"
    "Address" }o--|| "State" : "state"
    "Address" }o--|| "Municipality" : "municipality"
    "Address" }o--|o "Zone" : "zone"
    "Vehicle" |o--|| "VehicleType" : "enum:vehicleType"
    "Vehicle" |o--|| "LoadType" : "enum:loadType"
    "Vehicle" |o--|| "VehicleStatus" : "enum:status"
    "Vehicle" }o--|| "User" : "user"
    "ValidationLog" |o--|| "ValidationEntityType" : "enum:entityType"
    "ValidationLog" |o--|o "RejectionCategory" : "enum:rejectionCategory"
    "ValidationLog" }o--|| "User" : "reviewer"
    "ValidationLog" }o--|| "User" : "transporter"
    "State" }o--|| "Country" : "country"
    "Municipality" }o--|| "State" : "state"
    "Zone" }o--|| "Municipality" : "municipality"
    "TransporterZonePreference" |o--|| "ZonePreference" : "enum:preference"
    "TransporterZonePreference" }o--|| "User" : "transporter"
    "TransporterZonePreference" }o--|| "Zone" : "zone"
    "DeliveryRequest" |o--|| "LoadType" : "enum:loadType"
    "DeliveryRequest" }o--|| "Address" : "pickupAddress"
    "DeliveryRequest" }o--|| "Address" : "deliveryAddress"
    "DeliveryRequest" |o--|| "DeliveryRequestStatus" : "enum:status"
    "DeliveryRequest" }o--|| "User" : "client"
    "DeliveryOffer" |o--|| "CommissionType" : "enum:commissionType"
    "DeliveryOffer" |o--|| "DeliveryOfferStatus" : "enum:status"
    "DeliveryOffer" }o--|| "DeliveryRequest" : "deliveryRequest"
    "DeliveryOffer" }o--|| "User" : "transporter"
    "DeliveryOffer" }o--|| "Vehicle" : "vehicle"
    "PaymentMethod" |o--|| "PaymentMethodType" : "enum:type"
    "PaymentMethod" |o--|| "CardBrand" : "enum:cardBrand"
    "PaymentMethod" }o--|| "User" : "user"
    "Transaction" |o--|| "TransactionType" : "enum:type"
    "Transaction" |o--|| "TransactionStatus" : "enum:status"
    "Transaction" }o--|| "User" : "user"
    "Transaction" }o--|o "PaymentMethod" : "paymentMethod"
    "Transaction" |o--|| "DeliveryOffer" : "deliveryOffer"
    "BillingProfile" |o--|| "CommissionType" : "enum:commissionType"
    "Order" |o--|| "OrderStatus" : "enum:status"
    "Order" |o--|| "DeliveryOffer" : "deliveryOffer"
    "Order" |o--|| "Transaction" : "transaction"
    "Order" }o--|| "User" : "client"
    "Order" }o--|| "User" : "transporter"
    "OrderStatusHistory" |o--|o "OrderStatus" : "enum:fromStatus"
    "OrderStatusHistory" |o--|| "OrderStatus" : "enum:toStatus"
    "OrderStatusHistory" }o--|| "Order" : "order"
    "OrderLocation" }o--|| "Order" : "order"
    "BankAccount" |o--|| "BankAccountType" : "enum:accountType"
    "BankAccount" |o--|| "BankAccountStatus" : "enum:status"
    "BankAccount" }o--|| "User" : "transporter"
    "Settlement" |o--|| "SettlementStatus" : "enum:status"
    "Settlement" |o--|| "Order" : "order"
    "Settlement" }o--|| "User" : "transporter"
    "Settlement" }o--|o "BankAccount" : "bankAccount"
    "Settlement" }o--|o "User" : "registeredByUser"
    "Review" |o--|| "ReviewType" : "enum:type"
    "Review" }o--|| "User" : "reviewer"
    "Review" }o--|| "User" : "reviewee"
    "Review" }o--|| "Order" : "order"
    "Incident" |o--|| "IncidentType" : "enum:type"
    "Incident" |o--|| "IncidentSeverity" : "enum:severity"
    "Incident" |o--|| "IncidentStatus" : "enum:status"
    "Incident" |o--|o "IncidentResolution" : "enum:resolution"
    "Incident" |o--|| "UserAction" : "enum:userAction"
    "Incident" }o--|| "User" : "reportedBy"
    "Incident" }o--|| "User" : "reportedAgainst"
    "Incident" }o--|| "Order" : "order"
    "Incident" }o--|o "User" : "assignedTo"
    "Notification" |o--|| "NotificationType" : "enum:type"
    "Notification" |o--}o "NotificationChannel" : "enum:channels"
    "Notification" |o--|| "NotificationStatus" : "enum:status"
    "Notification" }o--|| "User" : "user"
```
