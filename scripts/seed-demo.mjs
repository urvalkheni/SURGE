import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'operator@surge.demo';
  const passwordHash = await bcrypt.hash('demo', 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      id: 'usr-surge-op-01',
      name: 'Om Mistry',
      email,
      passwordHash,
      role: 'Lead Operations Engineer',
    },
  });

  const existingPlant = await prisma.plant.findFirst({
    where: { ownerId: user.id },
  });

  if (!existingPlant) {
    await prisma.plant.create({
      data: {
        id: 'plt-ahmedabad-demo',
        ownerId: user.id,
        name: 'Ahmedabad Solar Plant',
        type: 'SOLAR',
        country: 'India',
        state: 'Gujarat',
        city: 'Ahmedabad',
        latitude: 23.0225,
        longitude: 72.5714,
        timezone: 'Asia/Kolkata',
        isDemo: true,
        configuration: {
          create: {
            acCapacityMw: 42.0,
            dcCapacityMw: 50.0,
            moduleTechnology: 'Monocrystalline PERC',
            moduleCount: 125000,
            inverterCount: 24,
            inverterCapacityMw: 1.75,
            panelTiltDeg: 23.0,
            panelAzimuthDeg: 0.0,
            trackingType: 'Fixed Tilt',
            performanceRatio: 0.82,
            tempCoefficientPct: -0.35,
            systemLossesPct: 14.0,
            inverterEfficiencyPct: 98.4,
            availabilityPct: 99.1,
            gridOperator: 'GETCO',
            gridVoltageKv: 220.0,
            interconnectCapacityMw: 50.0,
            gridNode: 'IN-GJ-CHOR-01',
            bessEnabled: true,
            bessPowerMw: 20.0,
            bessEnergyMwh: 40.0,
            bessSocPct: 68.0,
            rampLimitMwPerMin: 2.5,
            currency: 'INR',
            energyPricePerMwh: 3200.0,
          },
        },
      },
    });
  }

  console.log('✓ Demo Operator and Ahmedabad Demo Plant verified in database.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
