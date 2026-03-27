import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class ServiceBuilding extends Building {
  constructor({ id, subtype, x, y }) {
    let data;
    if (subtype === 'hospital') {
      data = { cost: 6000, influenceRadius: 7, happinessBonus: 10, electricityConsumption: 20, waterConsumption: 10 };
    } else {
      data = { cost: 4000, influenceRadius: 5, happinessBonus: 10, electricityConsumption: 15, waterConsumption: 0 };
    }
    super({ id, type: BuildingType.SERVICE_POLICE, x, y, buildingData: data });
    this.subtype = subtype;
    this.influenceRadius = data.influenceRadius;
    this.happinessBonus = data.happinessBonus;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: this.electricityConsumption, water: this.waterConsumption }; }
  getProduction() { return { money: 0, food: 0, electricity: 0, water: 0 }; }
  toJSON() { return { ...super.toJSON(), subtype: this.subtype, influenceRadius: this.influenceRadius, happinessBonus: this.happinessBonus }; }
}

export default ServiceBuilding;
