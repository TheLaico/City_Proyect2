import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class CommercialBuilding extends Building {
  constructor({ id, subtype, x, y }) {
    const data = subtype === 'mall'
      ? { cost: 8000, jobs: 20, production: 2000, electricityConsumption: 25 }
      : { cost: 2000, jobs: 6, production: 500, electricityConsumption: 8 };
    super({ id, type: BuildingType.COMMERCIAL_SHOP, x, y, buildingData: data });
    this.subtype = subtype;
    this.jobs = data.jobs;
    this.production = data.production;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: this.electricityConsumption, water: 0 }; }
  getProduction() {
    if (!this.active) return { money: 0, food: 0, electricity: 0, water: 0 };
    return { money: this.production, food: 0, electricity: 0, water: 0 };
  }
  toJSON() { return { ...super.toJSON(), subtype: this.subtype, jobs: this.jobs, production: this.production }; }
}

export default CommercialBuilding;
