// Valida si se puede construir (dinero, vía adyacente, celda libre)
import * as GridUtils from '../utils/GridUtils.js';
import { BuildingType } from '../types/BuildingType.js';
import { ResourceType } from '../types/ResourceType.js';
import { BUILDING_COSTS } from '../config/constants.js';

class BuildingValidator {
  validate(x, y, buildingType, gameStore) {
    const errors = [];
    const state = gameStore.getState();
    const map = state.map;
    const width = map.width;
    const height = map.height;

    // 1. Celda dentro de límites
    if (!map.isInBounds(x, y)) {
      errors.push('Posición fuera de los límites del mapa');
    } else {
      // 2. Celda vacía
      if (!this.isCellEmpty(x, y, gameStore)) {
        errors.push('La celda ya está ocupada');
      }
    }

    // 3. Presupuesto suficiente
    const cost = BUILDING_COSTS[buildingType] ?? 0;
    const money = gameStore.getResource(ResourceType.MONEY);
    if (!this.hasEnoughMoney(cost, gameStore)) {
      errors.push(`Fondos insuficientes. Necesitas $${cost}, tienes $${money}`);
    }

    // 4. Vía adyacente (excepto Road)
    if (buildingType !== BuildingType.ROAD) {
      if (!this.hasAdjacentRoad(x, y, gameStore)) {
        errors.push('El edificio debe estar adyacente a una vía');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  hasEnoughMoney(cost, gameStore) {
    return gameStore.getResource(ResourceType.MONEY) >= cost;
  }

  isCellEmpty(x, y, gameStore) {
    return gameStore.getState().map.isEmpty(x, y);
  }

  hasAdjacentRoad(x, y, gameStore) {
    const state = gameStore.getState();
    const map = state.map;
    const width = map.width;
    const height = map.height;
    const neighbors = GridUtils.getNeighbors(x, y, width, height);
    return neighbors.some(({ x: nx, y: ny }) => {
      const cell = map.getCell(nx, ny);
      return cell && cell.type === BuildingType.ROAD;
    });
  }
}

export default BuildingValidator;