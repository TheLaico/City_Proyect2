import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';

class ResidentialBuilding extends Building {
  constructor({ id, subtype, x, y }) {
    const isApartment = subtype === 'apartment';
    const type = isApartment ? BuildingType.RESIDENTIAL_APARTMENT : BuildingType.RESIDENTIAL_HOUSE;
    const data = isApartment
      ? { cost: 15000, capacity: 12, electricityConsumption: 15, waterConsumption: 10 }
      : { cost: 5000,  capacity: 4,  electricityConsumption: 5,  waterConsumption: 3  };
    super({ id, type, x, y, buildingData: data });
    this.subtype = subtype;
    this.capacity = data.capacity;
    this.currentOccupants = [];
    this.happinessBonus = 0;
  }
  getCost() { return this.cost; }
  getConsumption() { return { electricity: this.electricityConsumption, water: this.waterConsumption }; }
  getProduction() { return { money: 0, food: 0, electricity: 0, water: 0 }; }
  hasAvailableCapacity() { return this.currentOccupants.length < this.capacity; }
  toJSON() { return { ...super.toJSON(), subtype: this.subtype, capacity: this.capacity, currentOccupants: this.currentOccupants, happinessBonus: this.happinessBonus }; }
}

export default ResidentialBuilding;