import Building from './Building.js';
import { BuildingType } from '../../types/BuildingType.js';
import { BUILDING_COSTS, BUILDING_CAPACITY, BUILDING_CONSUMPTION } from '../../config/constants.js';

class ResidentialBuilding extends Building {
  constructor({ id, subtype, x, y }) {
    const isApartment = subtype === 'apartment';
    const type = isApartment ? BuildingType.RESIDENTIAL_APARTMENT : BuildingType.RESIDENTIAL_HOUSE;
    const data = isApartment
      ? { cost: BUILDING_COSTS[BuildingType.RESIDENTIAL_APARTMENT], capacity: BUILDING_CAPACITY[BuildingType.RESIDENTIAL_APARTMENT], electricityConsumption: BUILDING_CONSUMPTION[BuildingType.RESIDENTIAL_APARTMENT].electricity, waterConsumption: BUILDING_CONSUMPTION[BuildingType.RESIDENTIAL_APARTMENT].water }
      : { cost: BUILDING_COSTS[BuildingType.RESIDENTIAL_HOUSE],     capacity: BUILDING_CAPACITY[BuildingType.RESIDENTIAL_HOUSE],     electricityConsumption: BUILDING_CONSUMPTION[BuildingType.RESIDENTIAL_HOUSE].electricity,     waterConsumption: BUILDING_CONSUMPTION[BuildingType.RESIDENTIAL_HOUSE].water     };
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