import { EventType } from '../types/EventType.js';
import { ResourceType } from '../types/ResourceType.js';

class ResourceService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  calculateTurnResources() {
    const state = this.gameStore.getState();
    const buildings = state.buildings.filter(b => b.active !== false);
    let totalMoney = 0, totalElectricity = 0, totalWater = 0, totalFood = 0;
    let consumptionElectricity = 0, consumptionWater = 0;

    for (const b of buildings) {
      const prod = b.getProduction();
      totalMoney += prod.money || 0;
      totalElectricity += prod.electricity || 0;
      totalWater += prod.water || 0;
      totalFood += prod.food || 0;
      const cons = b.getConsumption();
      consumptionElectricity += cons.electricity || 0;
      consumptionWater += cons.water || 0;
    }

    // Balance y actualización de recursos
    this.gameStore.updateResource(ResourceType.MONEY, totalMoney);
    this.gameStore.updateResource(ResourceType.ELECTRICITY, totalElectricity - consumptionElectricity);
    this.gameStore.updateResource(ResourceType.WATER, totalWater - consumptionWater);
    this.gameStore.updateResource(ResourceType.FOOD, totalFood);

    // Verificar recursos críticos
    const resources = this.gameStore.getState().resources;
    if (resources.electricity <= 0) {
      this.eventBus.emit(EventType.RESOURCE_CRITICAL, { resource: ResourceType.ELECTRICITY });
      this.eventBus.emit(EventType.GAME_OVER);
    }
    if (resources.water <= 0) {
      this.eventBus.emit(EventType.RESOURCE_CRITICAL, { resource: ResourceType.WATER });
      this.eventBus.emit(EventType.GAME_OVER);
    }

    // Actualizar estado activo de edificios comerciales
    for (const b of state.buildings) {
      if (b.type && b.type.startsWith('commercial_')) {
        b.active = resources.electricity > 0;
      }
    }

    this.eventBus.emit(EventType.RESOURCES_UPDATED, { resources });
  }

  getResourceSummary() {
    const state = this.gameStore.getState();
    const buildings = state.buildings.filter(b => b.active !== false);
    let prod = { money: 0, electricity: 0, water: 0, food: 0 };
    let cons = { electricity: 0, water: 0 };
    for (const b of buildings) {
      const p = b.getProduction();
      prod.money += p.money || 0;
      prod.electricity += p.electricity || 0;
      prod.water += p.water || 0;
      prod.food += p.food || 0;
      const c = b.getConsumption();
      cons.electricity += c.electricity || 0;
      cons.water += c.water || 0;
    }
    const resources = state.resources;
    return {
      money: {
        current: resources.money,
        productionPerTurn: prod.money,
        consumptionPerTurn: 0,
        balance: prod.money
      },
      electricity: {
        current: resources.electricity,
        productionPerTurn: prod.electricity,
        consumptionPerTurn: cons.electricity,
        balance: prod.electricity - cons.electricity
      },
      water: {
        current: resources.water,
        productionPerTurn: prod.water,
        consumptionPerTurn: cons.water,
        balance: prod.water - cons.water
      },
      food: {
        current: resources.food,
        productionPerTurn: prod.food,
        consumptionPerTurn: 0,
        balance: prod.food
      }
    };
  }
}

export default ResourceService;
