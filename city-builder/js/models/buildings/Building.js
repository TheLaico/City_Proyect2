class Building {
  constructor({ id, type, x, y, buildingData }) {
    if (new.target === Building) {
      throw new Error('Building es una clase abstracta y no puede ser instanciada directamente.');
    }
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.cost = buildingData?.cost ?? 0;
    this.maintenanceCost = Math.round(this.cost * 0.0001);
    this.electricityConsumption = buildingData?.electricityConsumption ?? 0;
    this.waterConsumption = buildingData?.waterConsumption ?? 0;
    this.active = true;
  }

  getCost() {
    throw new Error('getCost() debe ser implementado por la subclase.');
  }

  getMaintenanceCost() {
    return this.maintenanceCost ?? 0;
  }

  getConsumption() {
    throw new Error('getConsumption() debe ser implementado por la subclase.');
  }

  getProduction() {
    throw new Error('getProduction() debe ser implementado por la subclase.');
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      subtype: this.subtype ?? null,
      x: this.x,
      y: this.y,
      cost: this.cost,
      maintenanceCost: this.maintenanceCost,
      electricityConsumption: this.electricityConsumption,
      waterConsumption: this.waterConsumption,
      active: this.active
    };
  }
}

export default Building;