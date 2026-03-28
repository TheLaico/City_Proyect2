import { EventType } from '../types/EventType.js';
import RandomUtils from '../utils/RandomUtils.js';

class CitizenService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  processTurn() {
    this.#tryGrowPopulation();
    this.#assignHousing();
    this.#assignEmployment();
    this.#updateHappinessAll();
    const citizens = this.gameStore.getState().citizens;
    const avgHappiness = citizens.length
      ? Math.round(citizens.reduce((sum, c) => sum + (c.happiness || 0), 0) / citizens.length)
      : 0;
    this.eventBus.emit(EventType.CITIZENS_UPDATED, { citizens, averageHappiness: avgHappiness });
  }

  #tryGrowPopulation() {
    const state = this.gameStore.getState();
    const residentials = state.buildings.filter(b => b.type && b.type.startsWith('residential_'));
    const availableCapacity = residentials.reduce((sum, b) => sum + (b.capacity - b.currentOccupants.length), 0);
    const citizens = state.citizens;
    const avgHappiness = citizens.length
      ? citizens.reduce((sum, c) => sum + (c.happiness || 0), 0) / citizens.length
      : 0;
    const jobs = state.buildings.filter(b => b.jobs).reduce((sum, b) => sum + b.jobs, 0);
    const employed = citizens.filter(c => c.jobId).length;
    const availableJobs = jobs - employed;
    if (availableCapacity > 0 && avgHappiness > 60 && availableJobs > 0) {
      const n = RandomUtils.randomInt(1, 3);
      for (let i = 0; i < n; i++) {
        const id = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now());
        state.citizens.push({ id, homeId: null, jobId: null, happiness: 50 });
      }
    }
  }

  #assignHousing() {
    const state = this.gameStore.getState();
    const homeless = state.citizens.filter(c => !c.homeId);
    const residentials = state.buildings.filter(b => b.type && b.type.startsWith('residential_'));
    for (const citizen of homeless) {
      for (const building of residentials) {
        if (building.currentOccupants.length < building.capacity) {
          building.currentOccupants.push(citizen.id);
          citizen.homeId = building.id;
          break;
        }
      }
    }
  }

  #assignEmployment() {
    const state = this.gameStore.getState();
    const unemployed = state.citizens.filter(c => !c.jobId);
    const employables = state.buildings.filter(b => b.jobs);
    for (const citizen of unemployed) {
      for (const building of employables) {
        if (!building.employees) building.employees = [];
        if (building.employees.length < building.jobs) {
          building.employees.push(citizen.id);
          citizen.jobId = building.id;
          break;
        }
      }
    }
  }

  #updateHappinessAll() {
    const state = this.gameStore.getState();
    for (const citizen of state.citizens) {
      citizen.happiness = this.#updateHappiness(citizen);
    }
  }

  #updateHappiness(citizen) {
    const state = this.gameStore.getState();
    const config = state.config || {};
    let happiness = 0;
    happiness += citizen.homeId ? 20 : -20;
    happiness += citizen.jobId ? 15 : -15;
    const police = state.buildings.filter(b => b.type === 'service_police').length;
    const fire = state.buildings.filter(b => b.type === 'service_fire').length;
    const hospital = state.buildings.filter(b => b.type === 'service_hospital').length;
    const parks = state.buildings.filter(b => b.type === 'park').length;
    happiness += police * (config.bonusPolice ?? 10);
    happiness += fire * (config.bonusFire ?? 10);
    happiness += hospital * (config.bonusHospital ?? 10);
    happiness += parks * 5;
    return Math.max(0, Math.min(100, happiness));
  }

  evictFromBuilding(buildingId) {
    const state = this.gameStore.getState();
    const affected = state.citizens.filter(c => c.homeId === buildingId);
    for (const citizen of affected) {
      citizen.homeId = null;
      citizen.happiness = this.#updateHappiness(citizen);
    }
  }
}

export default CitizenService;