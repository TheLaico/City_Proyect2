import { BUILDING_COSTS, BUILDING_CONSUMPTION, BUILDING_PRODUCTION, BUILDING_CAPACITY, BUILDING_JOBS } from '../config/constants.js';
import { BuildingType } from '../types/BuildingType.js';

const BUILDING_LABELS = Object.freeze({
  [BuildingType.RESIDENTIAL_HOUSE]:     'Casa Residencial',
  [BuildingType.RESIDENTIAL_APARTMENT]: 'Apartamento',
  [BuildingType.COMMERCIAL_SHOP]:       'Tienda Comercial',
  [BuildingType.COMMERCIAL_MALL]:       'Centro Comercial',
  [BuildingType.INDUSTRIAL_FACTORY]:    'Fábrica',
  [BuildingType.INDUSTRIAL_FARM]:       'Granja',
  [BuildingType.SERVICE_POLICE]:        'Comisaría',
  [BuildingType.SERVICE_FIRE]:          'Estación de Bomberos',
  [BuildingType.SERVICE_HOSPITAL]:      'Hospital',
  [BuildingType.UTILITY_POWER_PLANT]:   'Planta Eléctrica',
  [BuildingType.UTILITY_WATER_PLANT]:   'Planta de Agua',
  [BuildingType.PARK]:                  'Parque',
  [BuildingType.ROAD]:                  'Carretera',
});

const BUILDING_ICONS = Object.freeze({
  [BuildingType.RESIDENTIAL_HOUSE]:     '🏠',
  [BuildingType.RESIDENTIAL_APARTMENT]: '🏢',
  [BuildingType.COMMERCIAL_SHOP]:       '🏪',
  [BuildingType.COMMERCIAL_MALL]:       '🛍️',
  [BuildingType.INDUSTRIAL_FACTORY]:    '🏭',
  [BuildingType.INDUSTRIAL_FARM]:       '🌾',
  [BuildingType.SERVICE_POLICE]:        '🚔',
  [BuildingType.SERVICE_FIRE]:          '🚒',
  [BuildingType.SERVICE_HOSPITAL]:      '🏥',
  [BuildingType.UTILITY_POWER_PLANT]:   '⚡',
  [BuildingType.UTILITY_WATER_PLANT]:   '💧',
  [BuildingType.PARK]:                  '🌳',
  [BuildingType.ROAD]:                  '🛣️',
});

/**
 * BuildingInfoService — SRP: única responsabilidad de extraer
 * y estructurar los datos de un edificio para mostrarlos en UI.
 */
class BuildingInfoService {
  /**
   * Devuelve un objeto plano con toda la info necesaria para el modal.
   * @param {Building} building
   * @returns {Object}
   */
  getBuildingInfo(building) {
    const type = building.type;

    const label       = BUILDING_LABELS[type]           ?? type;
    const icon        = BUILDING_ICONS[type]            ?? '🏗️';
    const cost        = building.getCost?.()            ?? BUILDING_COSTS[type]       ?? 0;
    const maintenance = building.getMaintenanceCost?.() ?? 0;
    const consumption = building.getConsumption?.()     ?? BUILDING_CONSUMPTION[type] ?? {};
    const production  = building.getProduction?.()      ?? BUILDING_PRODUCTION[type]  ?? {};
    const active      = building.active !== false;

    const info = {
      label,
      icon,
      type,
      x: building.x,
      y: building.y,
      cost,
      maintenance,
      consumption: {
        electricity: consumption.electricity ?? 0,
        water:       consumption.water       ?? 0,
      },
      production: {
        money:       production.money       ?? 0,
        food:        production.food        ?? 0,
        electricity: production.electricity ?? 0,
        water:       production.water       ?? 0,
      },
      active,
      capacity:     null,
      jobs:         null,
      occupancy:    null,
      employees:    null,
      happinessAvg: null,
    };

    // Capacidad residencial y ocupación
    const capacity = BUILDING_CAPACITY[type] ?? building.capacity ?? null;
    if (capacity !== null) {
      info.capacity = capacity;
      const occupants = building.currentOccupants ?? [];
      info.occupancy  = occupants.length;
      if (occupants.length > 0) {
        const total = occupants.reduce((sum, c) => sum + (c.happiness ?? 0), 0);
        info.happinessAvg = Math.round(total / occupants.length);
      }
    }

    // Empleos
    const jobs = BUILDING_JOBS[type] ?? building.jobs ?? null;
    if (jobs !== null) {
      info.jobs      = jobs;
      info.employees = building.employees?.length ?? 0;
    }

    return info;
  }
}

export default BuildingInfoService;