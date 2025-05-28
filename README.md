# Mecapal API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Description

Mecapal API is the backend service powering the Mecapal App — a location-based directory that connects users with available truck drivers based on service type, routes, and vehicle availability. Built with NestJS, it provides secure authentication, profile management, route configuration, and real-time service tracking between users and transporters.

## Key Features

- **Unified Registration and Login**: Supports users and transporters with JWT-based authentication
- **Profile Management**: Transporters can manage vehicles, availability, and service routes
- **Geolocated Search**: Users search for transporters by origin, destination, and vehicle type
- **WhatsApp Integration**: Users contact transporters via WhatsApp with pre-filled messages
- **Service Confirmation**: Services tracked from selection to delivery with push notifications
- **Subscription System**: Monthly payment model for transporters with optional rewards for users

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Testing**: Jest
- **Package Manager**: pnpm

## Prerequisites

- Node.js (v22 or higher)
- pnpm
- PostgreSQL
- Docker (optional)

## Installation

```bash
# Clone the repository
$ git clone https://github.com/your-org/transportistas-api

# Navigate into the project
$ cd mecapal-api

# Install dependencies
$ pnpm install

# Copy environment variables
$ cp .env.example .env

# Generate Prisma Client
$ pnpm prisma generate

# Run database migrations
$ pnpm prisma migrate dev
```

## Running the Application

```bash
# Development mode
$ pnpm start:dev

# Production mode
$ pnpm start:prod

# Build the application
$ pnpm build
```

### Testing

```bash
# Unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# Test coverage
$ pnpm test:cov
```

## Docker Support

```bash
# Run the app with Docker
$ docker-compose --env-file env_file_path up -d
```

## Acknowledgments

- NestJS team for the backend framework
- Prisma for the ORM
- Expo team for powering the mobile client
- All contributors helping this project grow
