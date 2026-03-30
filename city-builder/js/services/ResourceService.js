import { EventType } from '../types/EventType.js';
import { ResourceType } from '../types/ResourceType.js';

class ResourceService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  calculateTurnResources() {
    const state = this.gameStore.getState();
    const config = state.config || {};
    const buildings = state.buildings.filter(b => b.active !== false);
    let totalMoney = 0, totalElectricity = 0, totalWater = 0, totalFood = 0;
    let consumptionElectricity = 0, consumptionWater = 0, consumptionFood = 0;

    let totalMaintenance = 0;
    for (const b of buildings) {
      const prod = b.getProduction();
      totalMoney += prod.money || 0;
      totalMaintenance += b.getMaintenanceCost?.() ?? 0;
      totalElectricity += prod.electricity || 0;
      totalWater += prod.water || 0;
      totalFood += prod.food || 0;
      const cons = b.getConsumption();
      consumptionElectricity += cons.electricity || 0;
      consumptionWater += cons.water || 0;
    }

    // Consumo por ciudadano (dinámico)
    const citizens = state.citizens || [];
    consumptionWater += (config.citizenWaterConsumption || 1) * citizens.length;
    consumptionElectricity += (config.citizenElecConsumption || 1) * citizens.length;
    consumptionFood += (config.citizenFoodConsumption || 1) * citizens.length;

    // Balance y actualización de recursos
    this.gameStore.updateResource(ResourceType.MONEY, totalMoney - totalMaintenance);
    this.gameStore.updateResource(ResourceType.ELECTRICITY, totalElectricity - consumptionElectricity);
    this.gameStore.updateResource(ResourceType.WATER, totalWater - consumptionWater);
    this.gameStore.updateResource(ResourceType.FOOD, totalFood - consumptionFood);

    // Verificar recursos críticos — leer estado actualizado del store
    const resources = this.gameStore.getState().resources;

    const critical = [];
    if (resources.money       < 0) critical.push({ resource: ResourceType.MONEY,       message: '💰 Sin dinero'       });
    if (resources.electricity < 0) critical.push({ resource: ResourceType.ELECTRICITY, message: '⚡ Sin electricidad' });
    if (resources.water       < 0) critical.push({ resource: ResourceType.WATER,       message: '💧 Sin agua'         });
    if (resources.food        < 0) critical.push({ resource: ResourceType.FOOD,        message: '🍞 Sin alimentos'    });

    if (critical.length > 0) {
      const msg = critical.map(c => c.message).join(', ') + ' — ¡Game Over!';
      for (const c of critical) {
        this.eventBus.emit(EventType.RESOURCE_CRITICAL, { resource: c.resource });
      }
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: msg, type: 'error' });
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
    const config = state.config || {};
    const buildings = state.buildings.filter(b => b.active !== false);
    let prod = { money: 0, electricity: 0, water: 0, food: 0 };
    let cons = { electricity: 0, water: 0, food: 0 };
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
    const citizens = state.citizens || [];
    cons.water += (config.citizenWaterConsumption || 1) * citizens.length;
    cons.electricity += (config.citizenElecConsumption || 1) * citizens.length;
    cons.food += (config.citizenFoodConsumption || 1) * citizens.length;

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
        consumptionPerTurn: cons.food,
        balance: prod.food - cons.food
      }
    };
  }
}

export default ResourceService;