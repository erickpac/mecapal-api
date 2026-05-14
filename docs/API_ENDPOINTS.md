# Mekapal API - Documentación de Endpoints

> Última actualización: 14 de Mayo, 2026

## Información General

| Campo | Valor |
|-------|-------|
| **Base URL (Local)** | `http://localhost:3000` |
| **Base URL (Staging)** | `https://api-staging.mekapal.com` |
| **Base URL (Production)** | `https://api.mekapal.com` |
| **Autenticación** | Bearer Token (JWT de Cognito) |
| **Content-Type** | `application/json` |

### Headers Requeridos

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `CLIENT` | Cliente que solicita entregas |
| `TRANSPORTER` | Transportista que ofrece servicios |
| `ADMIN` | Administrador con acceso total |
| `BACKOFFICE` | Personal de backoffice |

---

## Tabla de Contenidos

1. [Auth](#1-auth)
2. [User](#2-user)
3. [Address](#3-address)
4. [Vehicle](#4-vehicle)
5. [Upload](#5-upload)
6. [Location](#6-location)
7. [Zone Preferences](#7-zone-preferences)
8. [Delivery - Client](#8-delivery---client)
9. [Delivery - Transporter](#9-delivery---transporter)
10. [Payment](#10-payment)
11. [Orders - Client](#11-orders---client)
12. [Orders - Transporter](#12-orders---transporter)
13. [Bank Account](#13-bank-account)
14. [Settlement](#14-settlement)
15. [Reviews](#15-reviews)
16. [Matching](#16-matching)
17. [Incidents](#17-incidents)
18. [Reports](#18-reports)
19. [Notifications](#19-notifications)
20. [Backoffice](#20-backoffice)
21. [Billing Profiles](#21-billing-profiles)

---

## 1. Auth

### POST /auth/sign-up
Registrar nuevo usuario.

**Auth:** No requerida

```json
// Request
{
  "email": "cliente@example.com",
  "password": "Password123!",
  "phone": "+50212345678",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CLIENT",
  "companyName": "Mi Empresa S.A.",
  "taxId": "12345678-9"
}
```

```json
// Response 201
{
  "userSub": "uuid-del-usuario",
  "message": "Verification code sent to email"
}
```

---

### POST /auth/confirm-sign-up
Confirmar registro con código de verificación.

**Auth:** No requerida

```json
// Request
{
  "email": "cliente@example.com",
  "confirmationCode": "123456"
}
```

```json
// Response 200
{
  "message": "Email confirmed successfully"
}
```

---

### POST /auth/sign-in
Iniciar sesión.

**Auth:** No requerida

```json
// Request
{
  "email": "cliente@example.com",
  "password": "Password123!"
}
```

```json
// Response 200
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJjdHkiOiJKV1QiLCJl...",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600
}
```

---

### POST /auth/refresh
Renovar tokens.

**Auth:** No requerida

```json
// Request
{
  "refreshToken": "eyJjdHkiOiJKV1QiLCJl..."
}
```

```json
// Response 200
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600
}
```

---

### POST /auth/forgot-password
Solicitar código para restablecer contraseña.

**Auth:** No requerida

```json
// Request
{
  "email": "cliente@example.com"
}
```

```json
// Response 200
{
  "message": "Password reset code sent"
}
```

---

### POST /auth/reset-password
Restablecer contraseña con código.

**Auth:** No requerida

```json
// Request
{
  "email": "cliente@example.com",
  "confirmationCode": "123456",
  "newPassword": "NewPassword123!"
}
```

```json
// Response 200
{
  "message": "Password reset successfully"
}
```

---

### POST /auth/change-password
Cambiar contraseña (usuario autenticado).

**Auth:** Bearer Token | **Roles:** Todos

```json
// Request
{
  "oldPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

```json
// Response 200
{
  "message": "Password changed successfully"
}
```

---

### POST /auth/sign-out
Cerrar sesión.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "message": "Signed out successfully"
}
```

---

### GET /auth/me
Obtener información del usuario autenticado.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "id": "uuid",
  "email": "cliente@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CLIENT"
}
```

---

## 2. User

### GET /user/me
Obtener perfil completo del usuario.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "id": "uuid",
  "email": "cliente@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+50212345678",
  "role": "CLIENT",
  "companyName": "Mi Empresa S.A.",
  "taxId": "12345678-9",
  "profilePhotoUrl": "https://s3.../photo.jpg",
  "averageRating": 4.8,
  "totalReviews": 15,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### PATCH /user
Actualizar perfil de usuario.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Request
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "phone": "+50287654321",
  "companyName": "Nueva Empresa S.A.",
  "profilePhotoUrl": "https://s3.../new-photo.jpg"
}
```

---

### POST /transporter/complete-profile
Completar perfil de transportista.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "dpiNumber": "1234567890101",
  "dpiFrontPhotoUrl": "https://s3.../dpi-front.jpg",
  "dpiBackPhotoUrl": "https://s3.../dpi-back.jpg",
  "licenseNumber": "A-1234567",
  "licensePhotoUrl": "https://s3.../license.jpg",
  "licenseExpiration": "2025-12-31",
  "selfiePhotoUrl": "https://s3.../selfie.jpg"
}
```

---

## 3. Address

### POST /address
Crear nueva dirección.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "alias": "Casa",
  "street": "5ta Avenida 10-25, Zona 1",
  "city": "Guatemala",
  "state": "Guatemala",
  "postalCode": "01001",
  "country": "Guatemala",
  "latitude": 14.6349,
  "longitude": -90.5069,
  "contactName": "María García",
  "contactPhone": "+50212345678",
  "isDefault": true
}
```

---

### GET /address
Listar direcciones del usuario.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Response 200
[
  {
    "id": "uuid",
    "alias": "Casa",
    "street": "5ta Avenida 10-25, Zona 1",
    "city": "Guatemala",
    "state": "Guatemala",
    "postalCode": "01001",
    "latitude": 14.6349,
    "longitude": -90.5069,
    "isDefault": true
  }
]
```

---

### GET /address/:id
Obtener dirección específica.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### PATCH /address/:id
Actualizar dirección.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "alias": "Oficina",
  "contactPhone": "+50298765432"
}
```

---

### DELETE /address/:id
Eliminar dirección.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### PATCH /address/:id/default
Marcar dirección como predeterminada.

**Auth:** Bearer Token | **Roles:** CLIENT

---

## 4. Vehicle

### POST /vehicle
Registrar nuevo vehículo.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "brand": "Toyota",
  "model": "Hilux",
  "year": 2022,
  "licensePlate": "P-123ABC",
  "vin": "1HGCM82633A123456",
  "color": "Blanco",
  "vehicleType": "PICKUP",
  "loadType": "GENERAL",
  "maxWeightKg": 1000,
  "maxVolumeM3": 3.5,
  "frontPhotoUrl": "https://s3.../front.jpg",
  "rearPhotoUrl": "https://s3.../rear.jpg",
  "sidePhotoUrl": "https://s3.../side.jpg",
  "interiorPhotoUrl": "https://s3.../interior.jpg",
  "registrationDocUrl": "https://s3.../registration.pdf",
  "insuranceDocUrl": "https://s3.../insurance.pdf",
  "insuranceExpiration": "2025-06-30"
}
```

**Tipos de Vehículo (vehicleType):**
- `MOTORCYCLE` - Motocicleta
- `SEDAN` - Sedán
- `SUV` - SUV
- `PICKUP` - Pickup
- `VAN` - Van
- `TRUCK_SMALL` - Camión pequeño
- `TRUCK_MEDIUM` - Camión mediano
- `TRUCK_LARGE` - Camión grande

**Tipos de Carga (loadType):**
- `GENERAL` - Carga general
- `FRAGILE` - Frágil
- `REFRIGERATED` - Refrigerado
- `HAZARDOUS` - Peligroso

---

### GET /vehicle
Listar vehículos del transportista.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### GET /vehicle/:id
Obtener vehículo específico.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### PATCH /vehicle/:id
Actualizar vehículo.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### DELETE /vehicle/:id
Eliminar vehículo.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

## 5. Upload

### POST /upload/presigned-url
Obtener URL pre-firmada para subir archivo a S3.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Request
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "folder": "vehicles"
}
```

```json
// Response 200
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/...",
  "fileUrl": "https://s3.amazonaws.com/bucket/vehicles/uuid-photo.jpg"
}
```

**Folders permitidos:**
- `profile-photos`
- `vehicles`
- `documents`
- `deliveries`
- `incidents`

---

## 6. Location

### Países

#### POST /locations/countries
Crear país.

**Auth:** Bearer Token | **Roles:** ADMIN

```json
// Request
{
  "name": "Guatemala",
  "code": "GT",
  "isActive": true
}
```

---

#### GET /locations/countries
Listar países.

**Auth:** Bearer Token | **Roles:** Todos

**Query params:** `?activeOnly=true`

---

#### PUT /locations/countries/:id
Actualizar país.

**Auth:** Bearer Token | **Roles:** ADMIN

---

#### PATCH /locations/countries/:id/toggle-status
Activar/desactivar país.

**Auth:** Bearer Token | **Roles:** ADMIN

---

### Estados/Departamentos

#### POST /locations/states
Crear estado.

**Auth:** Bearer Token | **Roles:** ADMIN

```json
// Request
{
  "name": "Guatemala",
  "code": "GUA",
  "countryId": "uuid",
  "isActive": true
}
```

---

#### GET /locations/states
Listar estados por país.

**Auth:** Bearer Token | **Roles:** Todos

**Query params:** `?countryId=uuid&activeOnly=true`

---

### Municipios

#### POST /locations/municipalities
Crear municipio.

**Auth:** Bearer Token | **Roles:** ADMIN

```json
// Request
{
  "name": "Guatemala",
  "code": "GUA",
  "stateId": "uuid",
  "isActive": true
}
```

---

#### GET /locations/municipalities
Listar municipios por estado.

**Auth:** Bearer Token | **Roles:** Todos

**Query params:** `?stateId=uuid&activeOnly=true`

---

### Zonas

#### POST /locations/zones
Crear zona.

**Auth:** Bearer Token | **Roles:** ADMIN

```json
// Request
{
  "name": "Zona 1 - Centro Histórico",
  "code": "Z01",
  "municipalityId": "uuid",
  "isActive": true
}
```

---

#### GET /locations/zones
Listar todas las zonas.

**Auth:** Bearer Token | **Roles:** Todos

**Query params:** `?search=zona&activeOnly=true`

---

#### GET /locations/zones/by-municipality
Listar zonas por municipio.

**Auth:** Bearer Token | **Roles:** Todos

**Query params:** `?municipalityId=uuid&activeOnly=true`

---

## 7. Zone Preferences

### POST /zone-preferences
Establecer preferencia de zona.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "zoneId": "uuid",
  "preference": "PREFERRED"
}
```

**Preferencias:**
- `PREFERRED` - Preferida (mayor prioridad en matching)
- `NEUTRAL` - Neutral
- `EXCLUDED` - Excluida (no recibe solicitudes)

---

### POST /zone-preferences/bulk
Establecer múltiples preferencias.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "preferences": [
    { "zoneId": "uuid-1", "preference": "PREFERRED" },
    { "zoneId": "uuid-2", "preference": "NEUTRAL" },
    { "zoneId": "uuid-3", "preference": "EXCLUDED" }
  ]
}
```

---

### GET /zone-preferences
Listar mis preferencias de zonas.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### DELETE /zone-preferences/:zoneId
Eliminar preferencia de zona.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

## 8. Delivery - Client

### POST /delivery/client/requests
Crear solicitud de entrega (borrador).

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "loadType": "GENERAL",
  "pickupAddressId": "uuid",
  "deliveryAddressId": "uuid",
  "calculatedDistanceKm": 15.5,
  "estimatedWeightKg": 25.5,
  "estimatedVolumeM3": 0.5,
  "packageDescription": "Cajas de documentos y archivos de oficina",
  "declaredValue": 5000.00,
  "isFragile": false,
  "requiresSignature": true,
  "specialInstructions": "Llamar antes de llegar",
  "pickupDate": "2024-02-15",
  "pickupTimeStart": "09:00",
  "pickupTimeEnd": "12:00",
  "deliveryDeadline": "2024-02-15T18:00:00Z",
  "offerWindowMinutes": 60
}
```

**offerWindowMinutes:** Tiempo que la solicitud estará abierta para ofertas
- `30` - 30 minutos
- `60` - 1 hora
- `120` - 2 horas
- `240` - 4 horas
- `1440` - 24 horas

---

### GET /delivery/client/requests
Listar mis solicitudes.

**Auth:** Bearer Token | **Roles:** CLIENT

**Query params:** `?status=PUBLISHED&limit=10&offset=0`

**Estados (status):**
- `DRAFT` - Borrador
- `PUBLISHED` - Publicada
- `OFFERS_RECEIVED` - Con ofertas
- `ACCEPTED` - Oferta aceptada
- `IN_PROGRESS` - En progreso
- `PICKED_UP` - Recogido
- `DELIVERED` - Entregado
- `CANCELLED` - Cancelada

---

### GET /delivery/client/requests/:id
Obtener detalle de solicitud.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### PATCH /delivery/client/requests/:id
Actualizar solicitud (solo en estado DRAFT).

**Auth:** Bearer Token | **Roles:** CLIENT

---

### POST /delivery/client/requests/:id/publish
Publicar solicitud (cambiar de DRAFT a PUBLISHED).

**Auth:** Bearer Token | **Roles:** CLIENT

---

### POST /delivery/client/requests/:id/cancel
Cancelar solicitud.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### GET /delivery/client/requests/:id/offers
Ver ofertas recibidas para una solicitud.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Response 200
[
  {
    "id": "uuid",
    "offeredPrice": 150.00,
    "estimatedTimeMinutes": 45,
    "estimatedPickupTime": "2024-02-15T10:00:00Z",
    "estimatedDeliveryTime": "2024-02-15T10:45:00Z",
    "notes": "Puedo recoger a las 10am",
    "platformFee": 22.50,
    "netEarnings": 127.50,
    "status": "PENDING",
    "transporter": {
      "id": "uuid",
      "firstName": "Carlos",
      "lastName": "López",
      "averageRating": 4.9,
      "totalReviews": 120
    },
    "vehicle": {
      "brand": "Toyota",
      "model": "Hilux",
      "vehicleType": "PICKUP"
    }
  }
]
```

---

### POST /delivery/client/requests/:requestId/offers/:offerId/accept
Aceptar una oferta.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Response 200
{
  "request": { /* DeliveryRequest actualizado */ },
  "offer": { /* DeliveryOffer aceptada */ },
  "message": "Offer accepted successfully"
}
```

---

## 9. Delivery - Transporter

### GET /delivery/transporter/requests
Ver solicitudes disponibles (PUBLISHED).

**Auth:** Bearer Token | **Roles:** TRANSPORTER

**Query params:** `?loadType=GENERAL&limit=10&offset=0`

---

### GET /delivery/transporter/requests/:id
Ver detalle de solicitud disponible.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### POST /delivery/transporter/requests/:id/offer
Crear oferta para una solicitud.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "vehicleId": "uuid",
  "offeredPrice": 150.00,
  "estimatedTimeMinutes": 45,
  "estimatedPickupTime": "2024-02-15T10:00:00Z",
  "estimatedDeliveryTime": "2024-02-15T10:45:00Z",
  "notes": "Tengo disponibilidad inmediata"
}
```

```json
// Response 201
{
  "id": "uuid",
  "offeredPrice": 150.00,
  "platformFeePercent": 15,
  "platformFee": 22.50,
  "netEarnings": 127.50,
  "estimatedTimeMinutes": 45,
  "status": "PENDING"
}
```

**Nota:** El precio mínimo es Q3.00. La plataforma cobra 15% de comisión.

---

### GET /delivery/transporter/offers
Listar mis ofertas.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

**Query params:** `?status=PENDING&limit=10&offset=0`

**Estados de oferta:**
- `PENDING` - Pendiente
- `ACCEPTED` - Aceptada
- `REJECTED` - Rechazada
- `EXPIRED` - Expirada
- `CANCELLED` - Cancelada

---

### POST /delivery/transporter/offers/:id/cancel
Cancelar mi oferta (solo si está PENDING).

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

## 10. Payment

### POST /payment/methods
Agregar método de pago (tarjeta).

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "stripePaymentMethodId": "pm_1234567890"
}
```

**Nota:** El `stripePaymentMethodId` se obtiene desde Stripe Elements en el frontend.

---

### GET /payment/methods
Listar métodos de pago.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Response 200
[
  {
    "id": "uuid",
    "stripePaymentMethodId": "pm_xxx",
    "brand": "visa",
    "last4": "4242",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "isDefault": true
  }
]
```

---

### DELETE /payment/methods/:id
Eliminar método de pago.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### POST /payment/methods/:id/default
Marcar como método predeterminado.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### POST /payment/intent
Crear intención de pago.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "deliveryOfferId": "uuid",
  "paymentMethodId": "uuid"
}
```

```json
// Response 200
{
  "clientSecret": "pi_xxx_secret_xxx",
  "transactionId": "uuid",
  "amount": 150.00,
  "currency": "GTQ"
}
```

---

### POST /payment/confirm
Confirmar pago.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "transactionId": "uuid",
  "stripePaymentIntentId": "pi_xxx"
}
```

```json
// Response 200
{
  "transaction": {
    "id": "uuid",
    "status": "SUCCEEDED",
    "amount": 150.00
  },
  "order": {
    "id": "uuid",
    "status": "CONFIRMED"
  }
}
```

---

### GET /payment/transactions
Listar transacciones.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### GET /payment/transactions/:id
Obtener transacción específica.

**Auth:** Bearer Token | **Roles:** CLIENT

---

## 11. Orders - Client

### GET /orders/client
Listar mis órdenes.

**Auth:** Bearer Token | **Roles:** CLIENT

**Query params:** `?status=IN_PROGRESS`

**Estados de orden:**
- `CONFIRMED` - Confirmada
- `IN_PROGRESS` - En progreso
- `PICKED_UP` - Recogido
- `IN_TRANSIT` - En tránsito
- `DELIVERED` - Entregado
- `COMPLETED` - Completada
- `CANCELLED` - Cancelada

---

### GET /orders/client/:id
Obtener detalle de orden.

**Auth:** Bearer Token | **Roles:** CLIENT

---

### GET /orders/client/:id/tracking
Obtener tracking de orden (ubicación actual).

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Response 200
{
  "order": {
    "id": "uuid",
    "status": "IN_TRANSIT"
  },
  "currentLocation": {
    "latitude": 14.6349,
    "longitude": -90.5069,
    "timestamp": "2024-02-15T10:30:00Z"
  },
  "statusHistory": [
    {
      "status": "CONFIRMED",
      "timestamp": "2024-02-15T09:00:00Z"
    },
    {
      "status": "PICKED_UP",
      "timestamp": "2024-02-15T10:15:00Z"
    }
  ]
}
```

---

### POST /orders/client/:id/cancel
Cancelar orden.

**Auth:** Bearer Token | **Roles:** CLIENT

```json
// Request
{
  "reason": "Ya no necesito el servicio"
}
```

---

## 12. Orders - Transporter

### GET /orders/transporter
Listar mis órdenes asignadas.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

**Query params:** `?status=IN_PROGRESS`

---

### GET /orders/transporter/active
Obtener orden activa actual.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### GET /orders/transporter/:id
Obtener detalle de orden.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### PATCH /orders/transporter/:id/status
Actualizar estado de orden.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "status": "PICKED_UP",
  "notes": "Paquete recogido sin problemas"
}
```

**Transiciones válidas:**
- `CONFIRMED` → `IN_PROGRESS`
- `IN_PROGRESS` → `PICKED_UP`
- `PICKED_UP` → `IN_TRANSIT`
- `IN_TRANSIT` → `DELIVERED`

---

### POST /orders/transporter/:id/location
Enviar actualización de ubicación.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "latitude": 14.6349,
  "longitude": -90.5069
}
```

---

### POST /orders/transporter/:id/deliver
Confirmar entrega.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "deliveryPhotoUrl": "https://s3.../delivery-proof.jpg",
  "signatureUrl": "https://s3.../signature.png",
  "recipientName": "María García",
  "notes": "Entregado en recepción"
}
```

---

### POST /orders/transporter/:id/cancel
Cancelar orden.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "reason": "Cliente no disponible después de múltiples intentos"
}
```

---

## 13. Bank Account

### POST /bank-accounts
Registrar cuenta bancaria.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Request
{
  "bankName": "Banco Industrial",
  "accountHolderName": "Carlos López Hernández",
  "accountType": "SAVINGS",
  "accountNumber": "1234567890",
  "verificationDocUrl": "https://s3.../void-check.jpg"
}
```

**Tipos de cuenta:**
- `CHECKING` - Monetaria
- `SAVINGS` - Ahorro

---

### GET /bank-accounts
Listar mis cuentas bancarias.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Response 200
[
  {
    "id": "uuid",
    "bankName": "Banco Industrial",
    "accountHolderName": "Carlos López Hernández",
    "accountType": "SAVINGS",
    "lastFourDigits": "7890",
    "status": "VERIFIED",
    "isDefault": true
  }
]
```

**Nota:** El número de cuenta completo está encriptado, solo se muestran los últimos 4 dígitos.

---

### GET /bank-accounts/default
Obtener cuenta predeterminada.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### GET /bank-accounts/verified
Listar cuentas verificadas.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### GET /bank-accounts/:id
Obtener cuenta específica.

**Auth:** Bearer Token | **Roles:** TRANSPORTER, ADMIN, BACKOFFICE

---

### PATCH /bank-accounts/:id
Actualizar cuenta.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### POST /bank-accounts/:id/set-default
Marcar como cuenta predeterminada.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### DELETE /bank-accounts/:id
Eliminar cuenta.

**Auth:** Bearer Token | **Roles:** TRANSPORTER

---

### POST /bank-accounts/:id/verify
Verificar cuenta bancaria (admin).

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Request
{
  "status": "VERIFIED",
  "notes": "Comprobante verificado correctamente"
}
```

**Estados:**
- `PENDING` - Pendiente de verificación
- `VERIFIED` - Verificada
- `REJECTED` - Rechazada

---

## 14. Settlement

### GET /settlements/my-earnings
Ver mis ganancias (transportista).

**Auth:** Bearer Token | **Roles:** TRANSPORTER

```json
// Response 200
{
  "totalEarnings": 5000.00,
  "pendingSettlement": 1500.00,
  "paidSettlements": 3500.00,
  "settlements": [
    {
      "id": "uuid",
      "amount": 1500.00,
      "status": "PENDING",
      "itemCount": 10,
      "periodStart": "2024-02-01",
      "periodEnd": "2024-02-15"
    }
  ]
}
```

---

### GET /settlements/pending
Ver liquidaciones pendientes (admin).

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

---

### GET /settlements
Listar todas las liquidaciones (admin).

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

**Query params:** `?status=PENDING&transporterId=uuid&startDate=2024-01-01&endDate=2024-01-31`

---

### GET /settlements/:id
Obtener liquidación específica.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE, TRANSPORTER

---

### POST /settlements/:id/pay
Registrar pago de liquidación (admin).

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Request
{
  "paymentMethod": "BANK_TRANSFER",
  "referenceNumber": "TRF-2024-001234",
  "notes": "Transferencia realizada el 15/02/2024"
}
```

---

## 15. Reviews

### POST /reviews
Crear reseña.

**Auth:** Bearer Token | **Roles:** CLIENT, TRANSPORTER

```json
// Request
{
  "orderId": "uuid",
  "rating": 5,
  "comment": "Excelente servicio, muy puntual y cuidadoso con el paquete"
}
```

**Nota:** Cada usuario puede dejar una reseña por orden. El cliente califica al transportista y viceversa.

---

### GET /reviews/received
Ver reseñas recibidas.

**Auth:** Bearer Token | **Roles:** CLIENT, TRANSPORTER

---

### GET /reviews/given
Ver reseñas que he dado.

**Auth:** Bearer Token | **Roles:** CLIENT, TRANSPORTER

---

### GET /reviews/order/:orderId
Ver reseñas de una orden.

**Auth:** Bearer Token | **Roles:** Todos

---

### GET /reviews/user/:userId/stats
Ver estadísticas de un usuario.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "averageRating": 4.8,
  "totalReviews": 120,
  "ratingDistribution": {
    "5": 95,
    "4": 20,
    "3": 3,
    "2": 1,
    "1": 1
  }
}
```

---

### GET /reviews/my-stats
Ver mis estadísticas.

**Auth:** Bearer Token | **Roles:** CLIENT, TRANSPORTER

---

## 16. Matching

### GET /matching/requests/:requestId/transporters
Encontrar transportistas disponibles para una solicitud.

**Auth:** Bearer Token | **Roles:** ADMIN, CLIENT

**Query params:** `?minRating=4&limit=10`

```json
// Response 200
{
  "count": 5,
  "transporters": [
    {
      "transporter": {
        "id": "uuid",
        "firstName": "Carlos",
        "lastName": "López",
        "phone": "+50212345678"
      },
      "vehicle": {
        "id": "uuid",
        "brand": "Toyota",
        "model": "Hilux",
        "year": 2022,
        "vehicleType": "PICKUP",
        "loadType": "GENERAL",
        "maxWeightKg": 1000,
        "maxVolumeM3": 3.5
      },
      "zonePreference": "PREFERRED",
      "matchScore": 150
    }
  ]
}
```

**matchScore:** Puntuación calculada basada en:
- Preferencia de zona (PREFERRED=100, NEUTRAL=50)
- Rating del transportista (bonus)

---

## 17. Incidents

### POST /incidents
Reportar incidente.

**Auth:** Bearer Token | **Roles:** CLIENT, TRANSPORTER

```json
// Request
{
  "type": "DAMAGE",
  "severity": "MEDIUM",
  "description": "El paquete llegó con daños visibles en la esquina inferior. Al abrir, encontré que algunos artículos estaban rotos.",
  "evidenceUrls": [
    "https://s3.../evidence-1.jpg",
    "https://s3.../evidence-2.jpg"
  ],
  "reportedAgainstId": "uuid-del-otro-usuario",
  "orderId": "uuid-de-la-orden"
}
```

**Tipos de incidente:**
- `DELAY` - Retraso
- `DAMAGE` - Daño
- `LOSS` - Pérdida
- `THEFT` - Robo
- `FRAUD` - Fraude
- `MISCONDUCT` - Mala conducta
- `OTHER` - Otro

**Severidad:**
- `LOW` - Baja
- `MEDIUM` - Media
- `HIGH` - Alta
- `CRITICAL` - Crítica

---

### GET /incidents
Listar incidentes (admin).

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

**Query params:** `?status=OPEN&severity=HIGH&type=DAMAGE`

---

### GET /incidents/stats
Obtener estadísticas de incidentes.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Response 200
{
  "total": 150,
  "byStatus": {
    "OPEN": 25,
    "INVESTIGATING": 10,
    "RESOLVED": 100,
    "CLOSED": 15
  },
  "bySeverity": {
    "CRITICAL": 5,
    "HIGH": 20,
    "MEDIUM": 75,
    "LOW": 50
  }
}
```

---

### GET /incidents/my-reports
Ver mis reportes de incidentes.

**Auth:** Bearer Token | **Roles:** CLIENT, TRANSPORTER

---

### GET /incidents/:id
Obtener detalle de incidente.

**Auth:** Bearer Token | **Roles:** Todos

---

### PATCH /incidents/:id
Actualizar incidente (admin).

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Request
{
  "status": "INVESTIGATING",
  "assignedToId": "uuid-del-admin",
  "internalNotes": "En proceso de investigación"
}
```

**Estados:**
- `OPEN` - Abierto
- `INVESTIGATING` - En investigación
- `RESOLVED` - Resuelto
- `CLOSED` - Cerrado

---

### POST /incidents/:id/resolve
Resolver incidente.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Request
{
  "resolution": "PARTIAL_REFUND",
  "resolutionNotes": "Se aplicó reembolso parcial del 50% debido a daños parciales",
  "refundAmount": 75.00,
  "userAction": "WARNING"
}
```

**Resoluciones:**
- `REFUND` - Reembolso total
- `PARTIAL_REFUND` - Reembolso parcial
- `REPLACEMENT` - Reemplazo
- `CREDIT` - Crédito
- `APOLOGY` - Disculpa
- `WARNING` - Advertencia al usuario
- `SUSPENSION` - Suspensión de usuario
- `BAN` - Baneo de usuario
- `NO_ACTION` - Sin acción

**Acciones de usuario:**
- `NONE` - Ninguna
- `WARNING` - Advertencia
- `SUSPENSION` - Suspensión
- `BAN` - Baneo permanente

---

## 18. Reports

### GET /reports/dashboard
Obtener reporte del dashboard.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

**Query params:** `?startDate=2024-01-01&endDate=2024-01-31`

```json
// Response 200
{
  "financialSummary": {
    "totalRevenue": 150000.00,
    "totalCommissions": 22500.00,
    "totalTaxes": 4500.00,
    "completedTransactions": 450,
    "pendingPayments": 5000.00,
    "pendingPaymentsCount": 15
  },
  "revenueByDay": [
    { "date": "2024-01-01", "revenue": 5000.00, "transactions": 15 },
    { "date": "2024-01-02", "revenue": 4500.00, "transactions": 12 }
  ],
  "revenueByLoadType": [
    { "loadType": "GENERAL", "revenue": 100000.00, "percentage": 66.67 },
    { "loadType": "FRAGILE", "revenue": 50000.00, "percentage": 33.33 }
  ],
  "topTransporters": [
    {
      "transporterId": "uuid",
      "transporterName": "Carlos López",
      "totalEarnings": 15000.00,
      "completedOrders": 45,
      "averageRating": 4.9
    }
  ],
  "orderStats": {
    "total": 500,
    "confirmed": 20,
    "inProgress": 30,
    "delivered": 400,
    "completed": 380,
    "cancelled": 50
  },
  "userStats": {
    "totalClients": 1200,
    "totalTransporters": 150,
    "activeTransporters": 120,
    "newClientsThisPeriod": 50,
    "newTransportersThisPeriod": 10
  }
}
```

---

### GET /reports/financial-summary
Obtener resumen financiero.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

**Query params:** `?startDate=2024-01-01&endDate=2024-01-31`

---

### GET /reports/dashboard/export
Exportar reporte en CSV.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

**Query params:** `?startDate=2024-01-01&endDate=2024-01-31`

**Response:** Archivo CSV descargable

---

## 19. Notifications

### GET /notifications
Listar mis notificaciones.

**Auth:** Bearer Token | **Roles:** Todos

**Query params:** `?type=NEW_OFFER_RECEIVED&status=PENDING&unreadOnly=true&limit=20&offset=0`

```json
// Response 200
[
  {
    "id": "uuid",
    "type": "NEW_OFFER_RECEIVED",
    "title": "Nueva oferta recibida",
    "message": "Has recibido una oferta de Q150.00 para tu solicitud",
    "data": {
      "deliveryRequestId": "uuid",
      "offerId": "uuid",
      "offeredPrice": 150.00
    },
    "status": "SENT",
    "readAt": null,
    "createdAt": "2024-02-15T10:30:00Z"
  }
]
```

**Tipos de notificación:**
- `NEW_DELIVERY_OPPORTUNITY` - Nueva oportunidad de entrega
- `NEW_OFFER_RECEIVED` - Nueva oferta recibida
- `OFFER_ACCEPTED` - Oferta aceptada
- `OFFER_REJECTED` - Oferta rechazada
- `OFFER_EXPIRED` - Oferta expirada
- `ORDER_CONFIRMED` - Orden confirmada
- `ORDER_PICKED_UP` - Paquete recogido
- `ORDER_IN_TRANSIT` - En tránsito
- `ORDER_DELIVERED` - Entregado
- `ORDER_COMPLETED` - Completada
- `ORDER_CANCELLED` - Cancelada
- `PAYMENT_RECEIVED` - Pago recibido
- `SETTLEMENT_PAID` - Liquidación pagada
- `INCIDENT_CREATED` - Incidente creado
- `INCIDENT_UPDATED` - Incidente actualizado
- `INCIDENT_RESOLVED` - Incidente resuelto
- `SYSTEM_ANNOUNCEMENT` - Anuncio del sistema
- `ACCOUNT_UPDATE` - Actualización de cuenta

---

### GET /notifications/unread-count
Obtener contador de no leídas.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "count": 5
}
```

---

### POST /notifications/:id/read
Marcar como leída.

**Auth:** Bearer Token | **Roles:** Todos

---

### POST /notifications/read-all
Marcar todas como leídas.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "count": 5
}
```

---

### DELETE /notifications/:id
Eliminar notificación.

**Auth:** Bearer Token | **Roles:** Todos

---

### DELETE /notifications
Eliminar todas las notificaciones.

**Auth:** Bearer Token | **Roles:** Todos

```json
// Response 200
{
  "count": 15
}
```

---

## 20. Backoffice

### GET /backoffice/validations
Listar validaciones pendientes.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

**Query params:** `?type=VEHICLE&limit=20&offset=0`

**Tipos:**
- `VEHICLE` - Vehículos
- `TRANSPORTER_PROFILE` - Perfiles de transportista

---

### GET /backoffice/validations/vehicle/:id
Ver detalle de vehículo para validación.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

---

### GET /backoffice/validations/profile/:id
Ver detalle de perfil para validación.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

---

### POST /backoffice/validations/vehicle/:id/approve
Aprobar vehículo.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Request
{
  "notes": "Documentación completa y verificada"
}
```

---

### POST /backoffice/validations/vehicle/:id/reject
Rechazar vehículo.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

```json
// Request
{
  "reason": "INVALID_DOCUMENTS",
  "notes": "La foto del seguro no es legible"
}
```

**Razones de rechazo:**
- `INVALID_DOCUMENTS` - Documentos inválidos
- `EXPIRED_DOCUMENTS` - Documentos expirados
- `POOR_IMAGE_QUALITY` - Calidad de imagen deficiente
- `INCOMPLETE_INFORMATION` - Información incompleta
- `SUSPICIOUS_ACTIVITY` - Actividad sospechosa
- `OTHER` - Otro

---

### POST /backoffice/validations/profile/:id/approve
Aprobar perfil de transportista.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

---

### POST /backoffice/validations/profile/:id/reject
Rechazar perfil de transportista.

**Auth:** Bearer Token | **Roles:** ADMIN, BACKOFFICE

---

## 21. Billing Profiles

### POST /admin/billing-profiles
Crear perfil de facturación.

**Auth:** No requerida (proteger en producción)

```json
// Request
{
  "name": "Perfil Estándar",
  "description": "Perfil de facturación para clientes regulares",
  "commissionPercent": 15.00,
  "taxPercent": 12.00,
  "isDefault": false,
  "isActive": true
}
```

---

### GET /admin/billing-profiles
Listar perfiles de facturación.

**Query params:** `?isActive=true`

---

### GET /admin/billing-profiles/:id
Obtener perfil específico.

---

### PATCH /admin/billing-profiles/:id
Actualizar perfil.

---

### DELETE /admin/billing-profiles/:id
Eliminar perfil.

---

### POST /admin/billing-profiles/clients/:clientId/assign
Asignar perfil a cliente.

```json
// Request
{
  "profileId": "uuid"
}
```

---

### DELETE /admin/billing-profiles/clients/:clientId/assign
Remover perfil de cliente.

---

## Manejo de Errores

### Contrato de respuesta de error

**Toda** respuesta de error de la API — de cualquier módulo, incluida la
validación de DTOs y los errores inesperados — usa el mismo formato:

```json
{
  "statusCode": 404,
  "error": "ADDRESS_NOT_FOUND",
  "message": "Address with ID abc-123 not found"
}
```

| Campo | Descripción |
|-------|-------------|
| `statusCode` | Código HTTP (400, 401, 403, 404, 409, 429, 500). |
| `error` | **Código de error estable, legible por máquina** en `SCREAMING_SNAKE_CASE`. Es el contrato: los clientes lo mapean a textos localizados (`errors.server.*`). |
| `message` | Texto humano para desarrolladores/logs. **Los clientes no lo muestran al usuario final.** |

Algunas respuestas incluyen campos contextuales adicionales junto a los
anteriores:

- `details.messages` — lista de mensajes por campo en errores de validación (`VALIDATION_ERROR`).
- `blockers` — obligaciones pendientes en `DELETION_BLOCKED`.
- `scheduledFor` — fecha programada en `DELETION_ALREADY_SCHEDULED`.
- `session` — sesión de Cognito en `NEW_PASSWORD_REQUIRED`.
- `failureCode` — código de rechazo del proveedor (Stripe) en `PAYMENT_FAILED`.

Ejemplo de error de validación (HTTP 400):

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "messages": ["email must be an email", "name should not be empty"]
}
```

### Catálogo de códigos de error (`error`)

El catálogo completo y autoritativo vive en
`src/common/exceptions/error-code.ts`.

**Genéricos / transversales**

| Código | HTTP | Cuándo |
|--------|------|--------|
| `VALIDATION_ERROR` | 400 | El body/params no pasaron la validación de class-validator. |
| `BAD_REQUEST` | 400 | Error 400 genérico sin código de dominio más específico. |
| `UNAUTHORIZED` | 401 | Falta de autenticación o token inválido (genérico). |
| `FORBIDDEN` | 403 | Autenticado pero sin permiso (genérico). |
| `NOT_FOUND` | 404 | Recurso no encontrado (genérico). |
| `CONFLICT` | 409 | Conflicto genérico sin código de dominio más específico. |
| `RATE_LIMITED` | 429 | Demasiadas solicitudes (throttling). |
| `INTERNAL_ERROR` | 500 | Error inesperado del servidor. No filtra detalles internos. |

**Auth / Cognito**

| Código | HTTP |
|--------|------|
| `INVALID_CREDENTIALS` | 401 |
| `INVALID_TOKEN` | 401 |
| `UNAUTHORIZED_ROLE` | 403 |
| `USER_NOT_FOUND` | 404 |
| `USER_ALREADY_EXISTS` | 409 |
| `USER_NOT_CONFIRMED` | 400 |
| `INVALID_CODE` | 400 |
| `EXPIRED_CODE` | 400 |
| `INVALID_PASSWORD` | 400 |
| `NEW_PASSWORD_REQUIRED` | 400 |

**Account (eliminación de cuenta)**

| Código | HTTP |
|--------|------|
| `DELETION_BLOCKED` | 409 |
| `DELETION_ALREADY_SCHEDULED` | 409 |
| `DELETION_NOT_SCHEDULED` | 404 |

**User**

| Código | HTTP |
|--------|------|
| `EMAIL_ALREADY_TAKEN` | 409 |

**Address**

| Código | HTTP |
|--------|------|
| `ADDRESS_NOT_FOUND` | 404 |
| `ADDRESS_IN_USE` | 409 |
| `ADDRESS_LIMIT_EXCEEDED` | 409 |

**Vehicle**

| Código | HTTP |
|--------|------|
| `VEHICLE_NOT_FOUND` | 404 |
| `VEHICLE_IN_USE` | 409 |
| `VEHICLE_LIMIT_EXCEEDED` | 409 |

**Delivery**

| Código | HTTP |
|--------|------|
| `DELIVERY_REQUEST_NOT_FOUND` | 404 |
| `DELIVERY_OFFER_NOT_FOUND` | 404 |
| `OFFER_WINDOW_EXPIRED` | 409 |
| `INVALID_REQUEST_STATUS` | 409 |
| `INVALID_OFFER_STATUS` | 409 |
| `DUPLICATE_OFFER` | 409 |

**Order**

| Código | HTTP |
|--------|------|
| `ORDER_NOT_FOUND` | 404 |
| `INVALID_ORDER_STATUS` | 400 |
| `INVALID_STATUS_TRANSITION` | 400 |

**Payment**

| Código | HTTP |
|--------|------|
| `PAYMENT_METHOD_NOT_FOUND` | 404 |
| `TRANSACTION_NOT_FOUND` | 404 |
| `PAYMENT_FAILED` | 400 |
| `INVALID_PAYMENT_METHOD` | 400 |

**Bank Account**

| Código | HTTP |
|--------|------|
| `BANK_ACCOUNT_NOT_FOUND` | 404 |
| `BANK_ACCOUNT_NOT_VERIFIED` | 400 |
| `DUPLICATE_BANK_ACCOUNT` | 409 |
| `BANK_ACCOUNT_HAS_SETTLEMENTS` | 409 |

**Settlement**

| Código | HTTP |
|--------|------|
| `SETTLEMENT_NOT_FOUND` | 404 |
| `SETTLEMENT_ALREADY_PAID` | 409 |
| `SETTLEMENT_ALREADY_EXISTS` | 409 |

**Review**

| Código | HTTP |
|--------|------|
| `REVIEW_NOT_FOUND` | 404 |
| `REVIEW_ALREADY_EXISTS` | 409 |
| `INVALID_REVIEW_TARGET` | 400 |
| `ORDER_NOT_COMPLETED` | 400 |

**Incident**

| Código | HTTP |
|--------|------|
| `INCIDENT_NOT_FOUND` | 404 |
| `INVALID_INCIDENT_STATUS` | 400 |

---

## Health Check

### GET /health
Verificar estado del servicio.

**Auth:** No requerida

```json
// Response 200
{
  "status": "ok"
}
```
