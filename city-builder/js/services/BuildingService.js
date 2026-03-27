import BuildingValidator from '../validators/BuildingValidator.js';
import { EventType } from '../types/EventType.js';
import { ResourceType } from '../types/ResourceType.js';
import { BuildingType } from '../types/BuildingType.js';
import ResidentialBuilding from '../models/buildings/ResidentialBuilding.js';
import CommercialBuilding from '../models/buildings/CommercialBuilding.js';
import IndustrialBuilding from '../models/buildings/IndustrialBuilding.js';
import ServiceBuilding from '../models/buildings/ServiceBuilding.js';
import UtilityBuilding from '../models/buildings/UtilityBuilding.js';
import Park from '../models/buildings/Park.js';
import Road from '../models/buildings/Road.js';

class BuildingService {
  constructor(gameStore, eventBus, citizenService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.citizenService = citizenService; // Puede ser null si no se usa
    this.validator = new BuildingValidator();
  }

  build(x, y, buildingType, subtype) {
    const validation = this.validator.validate(x, y, buildingType, this.gameStore);
    if (!validation.valid) {
      this.eventBus.emit(EventType.BUILD_FAILED, { errors: validation.errors });
      return false;
    }
    const building = this._createBuilding({ x, y, buildingType, subtype });
    this.gameStore.getState().buildings.push(building);
    this.gameStore.getState().map.setCell(x, y, building);
    this.gameStore.updateResource(ResourceType.MONEY, -building.getCost());
    this.eventBus.emit(EventType.BUILD_SUCCESS, { building });
    this.eventBus.emit(EventType.RESOURCES_UPDATED, { resources: this.gameStore.getState().resources });
    return true;
  }

  demolish(x, y) {
    const map = this.gameStore.getState().map;
    const cell = map.getCell(x, y);
    if (!cell) {
      this.eventBus.emit(EventType.BUILD_FAILED, { errors: ['No hay nada que demoler en esta celda'] });
      return;
    }
    const refund = Math.floor(cell.getCost() * 0.5);
    this.gameStore.updateResource(ResourceType.MONEY, refund);
    if (cell.type === BuildingType.RESIDENTIAL_HOUSE || cell.type === BuildingType.RESIDENTIAL_APARTMENT) {
      if (this.citizenService) {
        this.citizenService.evictFromBuilding(cell.id);
      }
    }
    const buildings = this.gameStore.getState().buildings;
    const idx = buildings.findIndex(b => b.id === cell.id);
    if (idx !== -1) buildings.splice(idx, 1);
    map.setCell(x, y, null);
    this.eventBus.emit(EventType.DEMOLISH_SUCCESS, { refund, buildingType: cell.type });
  }

  _createBuilding({ x, y, buildingType, subtype }) {
    const id = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now());
    switch (buildingType) {
      case BuildingType.RESIDENTIAL_HOUSE:
      case BuildingType.RESIDENTIAL_APARTMENT:
        return new ResidentialBuilding({ id, subtype, x, y });
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
        throw new Error('Tipo de edificio desconocido: ' + buildingType);
    }
  }
}

export default BuildingService;
