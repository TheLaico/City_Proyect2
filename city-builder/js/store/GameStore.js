import { ResourceType } from '../types/ResourceType.js';

class GameStore {
  #state = {
    city: null,
    map: null,
    buildings: [],
    roads: [],
    citizens: [],
    resources: {
      money: 50000,
      electricity: 0,
      water: 0,
      food: 0
    },
    turn: 0,
    score: {
      current: 0,
      breakdown: {
        population: 0,
        happiness: 0,
        buildings: 0,
        resources: 0,
        bonuses: 0,
        penalties: 0
      }
    },
    selectedBuildingType: null,
    mode: 'view'
  };

  getState() {
    return { ...this.#state, resources: { ...this.#state.resources } };
  }

  setState(partialState) {
    if (partialState.resources) {
      this.#state.resources = { ...this.#state.resources, ...partialState.resources };
    }
    Object.assign(this.#state, { ...partialState, resources: this.#state.resources });
  }

  getResource(resourceType) {
    return this.#state.resources[resourceType] ?? null;
  }

  updateResource(resourceType, delta) {
    if (this.#state.resources.hasOwnProperty(resourceType)) {
      this.#state.resources[resourceType] += delta;
    }
  }

  resetState() {
    this.#state = {
      city: null,
      map: null,
      buildings: [],
      roads: [],
      citizens: [],
      resources: {
        money: 50000,
        electricity: 0,
        water: 0,
        food: 0
      },
      turn: 0,
      score: {
        current: 0,
        breakdown: {
          population: 0,
          happiness: 0,
          buildings: 0,
          resources: 0,
          bonuses: 0,
          penalties: 0
        }
      },
      selectedBuildingType: null,
      mode: 'view'
    };
  }
}

export default GameStore;