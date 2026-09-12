import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid operator session required.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: User identifier not resolved from session.' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload provided.' },
        { status: 400 }
      );
    }

    const {
      name,
      type = 'SOLAR',
      country = 'India',
      state = 'Gujarat',
      city = 'Ahmedabad',
      latitude = 23.0225,
      longitude = 72.5714,
      timezone = 'Asia/Kolkata',
      acCapacityMw = 42.0,
      dcCapacityMw = 50.0,
      moduleTechnology = 'Monocrystalline PERC',
      moduleCount = 125000,
      inverterCount = 24,
      inverterCapacityMw = 1.75,
      panelTiltDeg = 23.0,
      panelAzimuthDeg = 0.0,
      trackingType = 'Fixed Tilt',
      performanceRatio = 0.82,
      tempCoefficientPct = -0.35,
      systemLossesPct = 14.0,
      inverterEfficiencyPct = 98.4,
      availabilityPct = 99.1,
      gridOperator = 'GETCO',
      gridVoltageKv = 220.0,
      interconnectCapacityMw = 50.0,
      gridNode = 'IN-GJ-CHOR-01',
      bessEnabled = true,
      bessPowerMw = 20.0,
      bessEnergyMwh = 40.0,
      bessSocPct = 68.0,
      rampLimitMwPerMin = 2.5,
      currency = 'INR',
      energyPricePerMwh = 3200.0,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Plant name is required.' }, { status: 400 });
    }

    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);
    if (
      isNaN(parsedLat) ||
      isNaN(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      return NextResponse.json(
        { error: 'Valid geographic coordinates (-90 to 90 lat, -180 to 180 long) are required.' },
        { status: 400 }
      );
    }

    // Ensure the operator user record exists in the database
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user && session.user.email) {
      user = await db.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      user = await db.user.create({
        data: {
          id: userId,
          email: session.user.email || 'operator@renewableiq.internal',
          name: session.user.name || 'Plant Operator',
          role: (session.user as { role?: string }).role || 'Lead Operations Engineer',
        },
      });
    }

    // Create Plant and its Configuration in Prisma
    const newPlant = await db.plant.create({
      data: {
        ownerId: user.id,
        name: name.trim(),
        type,
        country: String(country).trim(),
        state: String(state).trim(),
        city: String(city).trim(),
        latitude: parsedLat,
        longitude: parsedLng,
        timezone: String(timezone).trim(),
        isDemo: false,
        configuration: {
          create: {
            acCapacityMw: Number(acCapacityMw) || 42.0,
            dcCapacityMw: Number(dcCapacityMw) || 50.0,
            moduleTechnology: String(moduleTechnology),
            moduleCount: Math.round(Number(moduleCount)) || 125000,
            inverterCount: Math.round(Number(inverterCount)) || 24,
            inverterCapacityMw: Number(inverterCapacityMw) || 1.75,
            panelTiltDeg: Number(panelTiltDeg) ?? 23.0,
            panelAzimuthDeg: Number(panelAzimuthDeg) ?? 0.0,
            trackingType: String(trackingType),
            performanceRatio: Number(performanceRatio) || 0.82,
            tempCoefficientPct: Number(tempCoefficientPct) || -0.35,
            systemLossesPct: Number(systemLossesPct) || 14.0,
            inverterEfficiencyPct: Number(inverterEfficiencyPct) || 98.4,
            availabilityPct: Number(availabilityPct) || 99.1,
            gridOperator: String(gridOperator),
            gridVoltageKv: Number(gridVoltageKv) || 220.0,
            interconnectCapacityMw: Number(interconnectCapacityMw) || 50.0,
            gridNode: String(gridNode),
            bessEnabled: Boolean(bessEnabled),
            bessPowerMw: Number(bessPowerMw) || 20.0,
            bessEnergyMwh: Number(bessEnergyMwh) || 40.0,
            bessSocPct: Number(bessSocPct) || 68.0,
            rampLimitMwPerMin: Number(rampLimitMwPerMin) || 2.5,
            currency: String(currency),
            energyPricePerMwh: Number(energyPricePerMwh) || 3200.0,
          },
        },
      },
      include: {
        configuration: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        plant: newPlant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Plant onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to onboard plant. Please verify parameters and try again.' },
      { status: 500 }
    );
  }
}
