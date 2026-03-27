class City {
  constructor({ name, mayorName, region, gridWidth, gridHeight }) {
    this.name = name;
    this.mayorName = mayorName;
    this.region = region; // { cityName, lat, lon }
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      mayorName: this.mayorName,
      region: this.region,
      gridWidth: this.gridWidth,
      gridHeight: this.gridHeight,
      createdAt: this.createdAt.toISOString()
    };
  }

  static fromJSON(data) {
    const city = new City({
      name: data.name,
      mayorName: data.mayorName,
      region: data.region,
      gridWidth: data.gridWidth,
      gridHeight: data.gridHeight
    });
    city.createdAt = new Date(data.createdAt);
    return city;
  }

  validate() {
    const errors = [];
    if (!this.name || typeof this.name !== 'string' || this.name.length > 50) {
      errors.push('El nombre de la ciudad es obligatorio y máximo 50 caracteres.');
    }
    if (!this.mayorName || typeof this.mayorName !== 'string') {
      errors.push('El nombre del alcalde es obligatorio.');
    }
    if (!this.region || typeof this.region !== 'object' || !this.region.cityName || typeof this.region.lat !== 'number' || typeof this.region.lon !== 'number') {
      errors.push('La región es obligatoria y debe tener cityName, lat y lon.');
    }
    if (typeof this.gridWidth !== 'number' || this.gridWidth < 15 || this.gridWidth > 30) {
      errors.push('El ancho del mapa debe estar entre 15 y 30.');
    }
    if (typeof this.gridHeight !== 'number' || this.gridHeight < 15 || this.gridHeight > 30) {
      errors.push('La altura del mapa debe estar entre 15 y 30.');
    }
    return { valid: errors.length === 0, errors };
  }
}

export default City;
