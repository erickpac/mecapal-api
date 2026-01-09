import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    { name: 'Zona 1', code: 'Z01', lat: 14.6407, lng: -90.5133 },
    { name: 'Zona 2', code: 'Z02', lat: 14.6514, lng: -90.5097 },
    { name: 'Zona 3', code: 'Z03', lat: 14.6467, lng: -90.5275 },
    { name: 'Zona 4', code: 'Z04', lat: 14.6225, lng: -90.5228 },
    { name: 'Zona 5', code: 'Z05', lat: 14.6239, lng: -90.5042 },
    { name: 'Zona 6', code: 'Z06', lat: 14.6542, lng: -90.4928 },
    { name: 'Zona 7', code: 'Z07', lat: 14.635, lng: -90.5458 },
    { name: 'Zona 8', code: 'Z08', lat: 14.6131, lng: -90.5247 },
    { name: 'Zona 9', code: 'Z09', lat: 14.6089, lng: -90.5136 },
    { name: 'Zona 10', code: 'Z10', lat: 14.5953, lng: -90.5064 },
    { name: 'Zona 11', code: 'Z11', lat: 14.6136, lng: -90.5456 },
    { name: 'Zona 12', code: 'Z12', lat: 14.5833, lng: -90.5217 },
    { name: 'Zona 13', code: 'Z13', lat: 14.5889, lng: -90.5292 },
    { name: 'Zona 14', code: 'Z14', lat: 14.5847, lng: -90.4986 },
    { name: 'Zona 15', code: 'Z15', lat: 14.6033, lng: -90.4706 },
    { name: 'Zona 16', code: 'Z16', lat: 14.6167, lng: -90.4625 },
    { name: 'Zona 17', code: 'Z17', lat: 14.6375, lng: -90.4667 },
    { name: 'Zona 18', code: 'Z18', lat: 14.6667, lng: -90.4708 },
    { name: 'Zona 19', code: 'Z19', lat: 14.6292, lng: -90.5583 },
    { name: 'Zona 21', code: 'Z21', lat: 14.5542, lng: -90.5417 },
    { name: 'Zona 24', code: 'Z24', lat: 14.6833, lng: -90.4583 },
    { name: 'Zona 25', code: 'Z25', lat: 14.6917, lng: -90.4417 },
  ];

  for (const zone of zones) {
    const created = await prisma.zone.upsert({
      where: {
        municipalityId_code: {
          municipalityId: guatemalaCity.id,
          code: zone.code,
        },
      },
      update: {},
      create: {
        name: zone.name,
        code: zone.code,
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
  });
