import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class Park extends Building {
  constructor({ id, x, y }) {
    super({ id, type: BuildingType.PARK, x, y, buildingData: { cost: 1500 } });
    this.happinessBonus = 5;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: 0, water: 0 }; }
  getProduction() { return { money: 0, food: 0, electricity: 0, water: 0 }; }
  toJSON() { return { ...super.toJSON(), happinessBonus: this.happinessBonus }; }
}

export default Park;
