// Convierte datos a instancias de edificios correctos
import { BuildingType } from '../types/BuildingType.js';
import ResidentialBuilding from '../models/buildings/ResidentialBuilding.js';
import CommercialBuilding from '../models/buildings/CommercialBuilding.js';
import IndustrialBuilding from '../models/buildings/IndustrialBuilding.js';
import ServiceBuilding from '../models/buildings/ServiceBuilding.js';
import UtilityBuilding from '../models/buildings/UtilityBuilding.js';
import Park from '../models/buildings/Park.js';
import Road from '../models/buildings/Road.js';

class BuildingAdapter {
  static fromJSON(data) {
    if (!data || !data.type) return null;
    const { type, subtype, x, y, id } = data;
    switch (type) {
      case BuildingType.RESIDENTIAL_HOUSE:
      case BuildingType.RESIDENTIAL_APARTMENT: {
        const instance = new ResidentialBuilding({ id, subtype, x, y });
        if (Array.isArray(data.currentOccupants)) instance.currentOccupants = [...data.currentOccupants];
        if (typeof data.happinessBonus === 'number') instance.happinessBonus = data.happinessBonus;
        return instance;
      }
      case BuildingType.COMMERCIAL_SHOP:
      case BuildingType.COMMERCIAL_MALL:
        return new CommercialBuilding({ id, subtype, x, y });
      case BuildingType.INDUSTRIAL_FACTORY:
      case BuildingType.INDUSTRIAL_FARM:
        return new IndustrialBuilding({ id, subtype, x, y });
      case BuildingType.SERVICE_POLICE:
      case BuildingType.SERVICE_FIRE:
      case BuildingType.SERVICE_HOSPITAL:
        return new ServiceBuilding({ id, subtype, x, y });
      case BuildingType.UTILITY_POWER_PLANT:
      case BuildingType.UTILITY_WATER_PLANT:
        return new UtilityBuilding({ id, subtype, x, y });
      case BuildingType.PARK:
        return new Park({ id, x, y });
      case BuildingType.ROAD:
        return new Road({ id, x, y });
      default:
        console.warn('Tipo de edificio desconocido en BuildingAdapter.fromJSON:', type, data);
        return null;
    }
  }
}

export default BuildingAdapter;