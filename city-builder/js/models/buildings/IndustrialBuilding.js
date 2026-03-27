import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class IndustrialBuilding extends Building {
  constructor({ id, subtype, x, y }) {
    const data = subtype === 'factory'
      ? { cost: 5000, jobs: 15, production: 800, electricityConsumption: 20, waterConsumption: 15 }
      : { cost: 3000, jobs: 8, production: 50, electricityConsumption: 0, waterConsumption: 10 };
    super({ id, type: BuildingType.INDUSTRIAL_FACTORY, x, y, buildingData: data });
    this.subtype = subtype;
    this.jobs = data.jobs;
    this.production = data.production;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: this.electricityConsumption, water: this.waterConsumption }; }
  getProduction() {
    if (!this.active) return { money: 0, food: 0, electricity: 0, water: 0 };
    if (this.subtype === 'factory') {
      return { money: this.active ? this.production : this.production * 0.5, food: 0, electricity: 0, water: 0 };
    } else {
      return { money: 0, food: this.active ? this.production : this.production * 0.5, electricity: 0, water: 0 };
    }
  }
  toJSON() { return { ...super.toJSON(), subtype: this.subtype, jobs: this.jobs, production: this.production }; }
}

export default IndustrialBuilding;
