# Estado del Proyecto - Mecapal API

> Última actualización: 2 de Febrero, 2026

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Progreso General** | ~50% |
| **Módulos Completados** | 10/20 |
| **Fase Actual** | Fase 4 (Pagos y Flujo Cliente) |
| **Próxima Fase** | Fase 4 continúa (Order/Tracking) |

---

## Módulos del Sistema

### Completados

| Módulo | Descripción | Estado | Notas |
|--------|-------------|--------|-------|
| **Cognito/Auth** | Autenticación y autorización | ✅ 100% | JWT, roles, guards |
| **User** | Gestión de usuarios | ✅ 100% | Perfiles cliente/transportista |
| **Address** | Direcciones de usuarios | ✅ 100% | CRUD, coordenadas GPS |
| **Vehicle** | Vehículos de transportistas | ✅ 100% | Registro, fotos, documentos |
| **Upload** | Subida de archivos | ✅ 100% | AWS S3 |
| **Location** | Ubicaciones geográficas | ✅ 100% | País > Estado > Municipio > Zona |
| **Zone Preference** | Preferencias de zona | ✅ 100% | Preferred/Neutral/Excluded |
| **Delivery** | Solicitudes y ofertas | ✅ 100% | 12 use cases implementados |
| **Commission** | Perfiles de facturación | ✅ 100% | BillingProfile con comisiones/taxes |
| **Payment** | Integración Stripe | ✅ 100% | Métodos de pago, transacciones, Payment Intents |

### En Progreso

| Módulo | Descripción | Estado | Bloqueado Por |
|--------|-------------|--------|---------------|
| **Backoffice** | Panel administrativo | ⚠️ 40% | - |
| **Email** | Notificaciones por email | ⚠️ 30% | - |

### Pendientes

| ID | Módulo | Descripción | Prioridad | Bloqueado Por | Fase |
|----|--------|-------------|-----------|---------------|------|
| #5 | **Payment** | Integración Stripe | ✅ Completado | - | 3-4 |
| #6 | **Order/Tracking** | Órdenes y tracking | 🔴 Alta | - | 4 |
| #7 | **Bank Account** | Cuentas bancarias ACH | 🔴 Alta | - | 5 |
| #8 | **Settlement** | Liquidaciones/Earnings | 🔴 Alta | #6, #7 | 5-6 |
| #9 | **Matching Service** | Algoritmo de matching | 🟡 Media | - | 3 |
| #10 | **Rating** | Calificaciones | 🟡 Media | - | 7 |
| #11 | **Notifications** | Push, SMS, Email | 🟡 Media | - | 5-7 |
| #12 | **Compensation** | Compensaciones manuales | 🟡 Media | #6, #8 | 6 |
| #13 | **Incidents** | Gestión de incidentes | 🟢 Baja | - | 6 |
| #14 | **Reports** | Reportes y analytics | 🟢 Baja | - | 6 |
| #15 | **Offer Expiration** | Job de expiración | 🟡 Media | - | 3 |

---

## Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DEPENDENCIAS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │ #5 Payment       │     │ #7 Bank Account  │                  │
│  │    (Stripe)      │     │    (ACH)         │                  │
│  └────────┬─────────┘     └────────┬─────────┘                  │
│           │                        │                            │
│           ▼                        │                            │
│  ┌──────────────────┐              │                            │
│  │ #6 Order/        │◄─────────────┘                            │
│  │    Tracking      │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │ #8 Settlement/   │                                           │
│  │    Earnings      │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │ #12 Compensation │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  INDEPENDIENTES (pueden iniciarse en paralelo):                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ #9 Matching      │  │ #15 Offer        │  │ #11 Notific.   │ │
│  │    Service       │  │    Expiration    │  │                │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ #10 Rating       │  │ #13 Incidents    │  │ #14 Reports    │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Progreso por Fase

| Fase | Descripción | Horas Est. | Progreso | Detalles |
|------|-------------|------------|----------|----------|
| 1 | Infraestructura y Módulos Base | 95 hrs | ✅ 90% | AWS, Upload, Location, Address |
| 2 | Vehículos, Zonas y Config | 75 hrs | ✅ 95% | Vehicle, Zone Preference, Commission |
| 3 | Delivery y Ofertas | 75 hrs | ⚠️ 70% | Delivery completo. Falta: Payment, Matching, Expiration |
| 4 | Pagos y Flujo Cliente | 75 hrs | ❌ 10% | Falta: Payment, Order/Tracking |
| 5 | Flujo Transportista | 75 hrs | ❌ 5% | Falta: Bank Account, Settlement, Notifications |
| 6 | Panel Administrativo | 75 hrs | ❌ 15% | Falta: Compensation, Incidents, Reports |
| 7 | Calificaciones y Landing | 60 hrs | ❌ 0% | Falta: Rating, Notifications completas |
| 8 | QA y Deploy | 45 hrs | ⚠️ 30% | CI/CD configurado. Falta: tests, monitoring |

---

## Detalles de Tareas Pendientes

### #5 - Payment (Stripe)
**Prioridad:** 🔴 Alta | **Fase:** 3-4 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Configuración de Stripe (test mode inicialmente)
- [ ] Módulo de Payment con Clean Architecture
- [ ] Tokenización de tarjetas (Stripe Elements)
- [ ] Procesamiento de pagos al aceptar oferta
- [ ] Webhooks para confirmar pagos
- [ ] CRUD de métodos de pago del cliente
- [ ] Manejo de errores y reintentos

**Archivos a crear:**
```
src/modules/payment/
├── domain/
│   ├── entities/payment-method.entity.ts
│   ├── entities/transaction.entity.ts
│   ├── interfaces/payment.repository.ts
│   └── constants/injection-tokens.ts
├── application/
│   ├── use-cases/
│   │   ├── create-payment-intent.use-case.ts
│   │   ├── confirm-payment.use-case.ts
│   │   ├── add-payment-method.use-case.ts
│   │   ├── get-payment-methods.use-case.ts
│   │   └── delete-payment-method.use-case.ts
│   └── dtos/
├── infrastructure/
│   ├── controllers/payment.controller.ts
│   ├── repositories/payment.repository.ts
│   └── services/stripe.service.ts
└── payment.module.ts
```

---

### #6 - Order/Tracking
**Prioridad:** 🔴 Alta | **Fase:** 4 | **Bloqueado por:** #5 Payment

**Alcance:**
- [ ] Entidad Order (se crea al confirmar pago)
- [ ] Estados: CONFIRMED → IN_PROGRESS → PICKED_UP → IN_TRANSIT → DELIVERED → CLOSED
- [ ] Tracking de ubicación en tiempo real
- [ ] Historial de órdenes (cliente y transportista)
- [ ] Confirmación de entrega con foto/firma
- [ ] Webhooks/eventos para cambios de estado

---

### #7 - Bank Account (ACH)
**Prioridad:** 🔴 Alta | **Fase:** 5 | **Dependencias:** Ninguna

**Alcance:**
- [ ] CRUD de cuentas bancarias
- [ ] Encriptación AES-256 de datos sensibles
- [ ] Validación de titularidad
- [ ] Documento de verificación (void check)
- [ ] Marcar cuenta principal
- [ ] Solo mostrar últimos 4 dígitos

---

### #8 - Settlement/Earnings
**Prioridad:** 🔴 Alta | **Fase:** 5-6 | **Bloqueado por:** #6, #7

**Alcance:**
- [ ] Cálculo de earnings por orden completada
- [ ] Panel de ganancias para transportista
- [ ] Batch processing nocturno para transferencias ACH
- [ ] Estados: PENDING → PROCESSING → COMPLETED → FAILED
- [ ] Historial de pagos recibidos
- [ ] Reportes de liquidación

---

### #9 - Matching Service
**Prioridad:** 🟡 Media | **Fase:** 3 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Algoritmo de matching por:
  - Zonas preferidas del transportista
  - Tipo de vehículo compatible
  - Disponibilidad (toggle activo)
  - Rating mínimo configurable
- [ ] Cache con Redis para zonas
- [ ] Notificar transportistas elegibles al publicar solicitud

---

### #10 - Rating/Reviews
**Prioridad:** 🟡 Media | **Fase:** 7 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Rating general 1-5 estrellas
- [ ] Criterios: Puntualidad, Cuidado, Comunicación, Profesionalismo
- [ ] Comentarios opcionales (max 500 chars)
- [ ] Bidireccional: cliente ↔ transportista
- [ ] Cálculo de promedio en perfil

---

### #11 - Notifications
**Prioridad:** 🟡 Media | **Fase:** 5-7 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Push notifications (Firebase/Expo)
- [ ] Email transaccionales (AWS SES)
- [ ] SMS para eventos críticos (Twilio)
- [ ] Plantillas configurables
- [ ] Cola de notificaciones con retry
- [ ] Preferencias por usuario

**Eventos:**
- Registro completado
- Documentos aprobados/rechazados
- Nueva solicitud disponible
- Nueva oferta recibida
- Oferta aceptada
- Pago confirmado
- Pickup realizado
- Entrega completada
- Compensación procesada

---

### #12 - Compensation
**Prioridad:** 🟡 Media | **Fase:** 6 | **Bloqueado por:** #6, #8

**Alcance:**
- [ ] Pantalla admin: órdenes pendientes de compensar
- [ ] Formulario de registro manual:
  - Fecha de transferencia
  - Monto
  - Número de transacción
  - Comentario (opcional)
  - Screenshot (opcional)
- [ ] Registro automático de auditoría

---

### #13 - Incident Management
**Prioridad:** 🟢 Baja | **Fase:** 6 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Tipos: Retraso, Daño, Pérdida, Fraude
- [ ] Severidad: Baja, Media, Alta, Crítica
- [ ] Estados: Abierto, Investigando, Resuelto, Cerrado
- [ ] Asignación a admin
- [ ] Historial de acciones
- [ ] Resolución con reembolso opcional

---

### #14 - Reports/Analytics
**Prioridad:** 🟢 Baja | **Fase:** 6 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Dashboard KPIs: ingresos, comisiones, transacciones
- [ ] Gráficos de tendencias
- [ ] Top transportistas
- [ ] Exportación CSV/PDF
- [ ] Filtros avanzados

---

### #15 - Offer Expiration Job
**Prioridad:** 🟡 Media | **Fase:** 3 | **Dependencias:** Ninguna

**Alcance:**
- [ ] Job scheduler (@nestjs/schedule)
- [ ] Ejecutar cada minuto
- [ ] Expirar solicitudes y ofertas vencidas
- [ ] Notificar a usuarios afectados

---

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-02-02 | Creación del documento | Erick Pac |
| 2026-02-02 | Módulo Commission completado (BillingProfile) | - |
| 2026-02-02 | Módulo Delivery completado | - |
| 2026-02-02 | Módulo Payment completado (Stripe) | - |

---

## Referencias

- [Estimación del Proyecto](../requirements/docs/estimacion-proyecto-mecapal.md)
- [Reglas de Comisiones](../requirements/docs/bussiness-rules/client_tax_commission_rules.md)
- [Reglas de Compensación](../requirements/docs/bussiness-rules/client_compensation_rules.md)
- [Wireframes](../requirements/docs/forms-wireframes/wireframes-forms.md)
- [Diagramas de Secuencia](../requirements/docs/sequences/)
