import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class Road extends Building {
  constructor({ id, x, y }) {
    super({ id, type: BuildingType.ROAD, x, y, buildingData: { cost: 100 } });
    this.isTransitable = true;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: 0, water: 0 }; }
  getProduction() { return { money: 0, food: 0, electricity: 0, water: 0 }; }
  toJSON() { return { ...super.toJSON(), isTransitable: this.isTransitable }; }
}

export default Road;
