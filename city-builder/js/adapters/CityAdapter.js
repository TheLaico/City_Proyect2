// Convierte JSON a objetos City
// Convierte JSON a objetos City
import City from '../models/City.js';

class CityAdapter {
  static fromJSON(data) {
    if (!data) return null;
    const city = new City({
      name: data.name,
      mayorName: data.mayorName,
      region: data.region,
      gridWidth: data.gridWidth,
      gridHeight: data.gridHeight
    });
    if (data.createdAt) city.createdAt = new Date(data.createdAt);
    return city;
  }

  static toJSON(city) {
    if (typeof city.toJSON === 'function') {
      return city.toJSON();
    }
    // Fallback manual
    return {
      name: city.name,
      mayorName: city.mayorName,
      region: city.region,
      gridWidth: city.gridWidth,
      gridHeight: city.gridHeight,
      createdAt: city.createdAt instanceof Date ? city.createdAt.toISOString() : city.createdAt
    };
  }
}

export default CityAdapter;