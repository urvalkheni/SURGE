import { db } from '@/lib/db';
import { DEMO_PLANT, DEMO_PLANT_CONFIG, PlantRecord, PlantConfigurationRecord } from '@/lib/demo-plant';

export interface PlantWithConfig {
  plant: PlantRecord;
  configuration: PlantConfigurationRecord;
}

/**
 * Service to load and manage the active operational plant for an authenticated user.
 */
export async function getActivePlantForUser(userId?: string | null): Promise<PlantWithConfig> {
  if (!userId) {
    return {
      plant: DEMO_PLANT,
      configuration: DEMO_PLANT_CONFIG,
    };
  }

  try {
    // Prioritize active non-demo plant created by the operator
    const plant = await db.plant.findFirst({
      where: { ownerId: userId, isDemo: false },
      include: { configuration: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!plant || !plant.configuration) {
      const fallbackPlant = await db.plant.findFirst({
        where: { ownerId: userId },
        include: { configuration: true },
        orderBy: { createdAt: 'desc' },
      });

      if (fallbackPlant && fallbackPlant.configuration) {
        const { configuration, ...plantData } = fallbackPlant;
        return {
          plant: {
            ...plantData,
            isDemo: plantData.isDemo ?? false,
          },
          configuration: {
            ...configuration,
          },
        };
      }

      return {
        plant: {
          ...DEMO_PLANT,
          ownerId: userId,
        },
        configuration: DEMO_PLANT_CONFIG,
      };
    }

    const { configuration, ...plantData } = plant;

    return {
      plant: {
        ...plantData,
        isDemo: plantData.isDemo ?? false,
      },
      configuration: {
        ...configuration,
      },
    };
  } catch (error) {
    console.warn('Failed to retrieve user plant from database. Falling back to Demo Plant.', error);
    return {
      plant: DEMO_PLANT,
      configuration: DEMO_PLANT_CONFIG,
    };
  }
}

/**
 * Verify plant ownership to prevent IDOR attacks.
 */
export async function verifyPlantOwnership(plantId: string, userId: string): Promise<boolean> {
  if (plantId === DEMO_PLANT.id) return true;
  try {
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      select: { ownerId: true, isDemo: true },
    });
    if (!plant) return false;
    return plant.isDemo || plant.ownerId === userId;
  } catch {
    return false;
  }
}
