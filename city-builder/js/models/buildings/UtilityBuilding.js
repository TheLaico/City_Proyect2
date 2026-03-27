import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class UtilityBuilding extends Building {
  constructor({ id, subtype, x, y }) {
    let data;
    if (subtype === 'power_plant') {
      data = { cost: 10000, production: 200, electricityConsumption: 0, waterConsumption: 0 };
    } else {
      data = { cost: 8000, production: 150, electricityConsumption: 20, waterConsumption: 0 };
    }
    super({ id, type: BuildingType.UTILITY_POWER_PLANT, x, y, buildingData: data });
    this.subtype = subtype;
    this.production = data.production;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: this.electricityConsumption, water: this.waterConsumption }; }
  getProduction() {
    if (this.subtype === 'power_plant') {
      return { money: 0, food: 0, electricity: this.production, water: 0 };
    } else {
      return { money: 0, food: 0, electricity: 0, water: this.production };
    }
  }
  toJSON() { return { ...super.toJSON(), subtype: this.subtype, production: this.production }; }
}

export default UtilityBuilding;
