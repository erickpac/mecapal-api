import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding location data...');

  // Create Guatemala
  const guatemala = await prisma.country.upsert({
    where: { code: 'GT' },
    update: {},
    create: {
      name: 'Guatemala',
      code: 'GT',
      isActive: true,
    },
  });
  console.log(`Created country: ${guatemala.name}`);

  // Create Guatemala Department
  const guatemalaDept = await prisma.state.upsert({
    where: {
      countryId_code: {
        countryId: guatemala.id,
        code: 'GUA',
      },
    },
    update: {},
    create: {
      name: 'Guatemala',
      code: 'GUA',
      countryId: guatemala.id,
      isActive: true,
    },
  });
  console.log(`Created state: ${guatemalaDept.name}`);

  // Create Guatemala City Municipality
  const guatemalaCity = await prisma.municipality.upsert({
    where: {
      stateId_code: {
        stateId: guatemalaDept.id,
        code: 'GC',
      },
    },
    update: {},
    create: {
      name: 'Ciudad de Guatemala',
      code: 'GC',
      stateId: guatemalaDept.id,
      isActive: true,
    },
  });
  console.log(`Created municipality: ${guatemalaCity.name}`);

  // Create Zones for Guatemala City
  const zones = [
    { name: 'Zona 1', postalCode: '01001', lat: 14.6407, lng: -90.5133 },
    { name: 'Zona 2', postalCode: '01002', lat: 14.6514, lng: -90.5097 },
    { name: 'Zona 3', postalCode: '01003', lat: 14.6467, lng: -90.5275 },
    { name: 'Zona 4', postalCode: '01004', lat: 14.6225, lng: -90.5228 },
    { name: 'Zona 5', postalCode: '01005', lat: 14.6239, lng: -90.5042 },
    { name: 'Zona 6', postalCode: '01006', lat: 14.6542, lng: -90.4928 },
    { name: 'Zona 7', postalCode: '01007', lat: 14.635, lng: -90.5458 },
    { name: 'Zona 8', postalCode: '01008', lat: 14.6131, lng: -90.5247 },
    { name: 'Zona 9', postalCode: '01009', lat: 14.6089, lng: -90.5136 },
    { name: 'Zona 10', postalCode: '01010', lat: 14.5953, lng: -90.5064 },
    { name: 'Zona 11', postalCode: '01011', lat: 14.6136, lng: -90.5456 },
    { name: 'Zona 12', postalCode: '01012', lat: 14.5833, lng: -90.5217 },
    { name: 'Zona 13', postalCode: '01013', lat: 14.5889, lng: -90.5292 },
    { name: 'Zona 14', postalCode: '01014', lat: 14.5847, lng: -90.4986 },
    { name: 'Zona 15', postalCode: '01015', lat: 14.6033, lng: -90.4706 },
    { name: 'Zona 16', postalCode: '01016', lat: 14.6167, lng: -90.4625 },
    { name: 'Zona 17', postalCode: '01017', lat: 14.6375, lng: -90.4667 },
    { name: 'Zona 18', postalCode: '01018', lat: 14.6667, lng: -90.4708 },
    { name: 'Zona 19', postalCode: '01019', lat: 14.6292, lng: -90.5583 },
    { name: 'Zona 21', postalCode: '01021', lat: 14.5542, lng: -90.5417 },
    { name: 'Zona 24', postalCode: '01024', lat: 14.6833, lng: -90.4583 },
    { name: 'Zona 25', postalCode: '01025', lat: 14.6917, lng: -90.4417 },
  ];

  for (const zone of zones) {
    const created = await prisma.zone.upsert({
      where: {
        municipalityId_postalCode: {
          municipalityId: guatemalaCity.id,
          postalCode: zone.postalCode,
        },
      },
      update: {},
      create: {
        name: zone.name,
        postalCode: zone.postalCode,
        municipalityId: guatemalaCity.id,
        latitude: zone.lat,
        longitude: zone.lng,
        isActive: true,
      },
    });
    console.log(`Created zone: ${created.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
