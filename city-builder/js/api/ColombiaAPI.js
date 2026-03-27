class ColombiaAPI {
  #baseUrl = 'https://api-colombia.com/api/v1';
  #cache = null;

  async getCities() {
    if (this.#cache) return this.#cache;
    try {
      const res = await fetch(`${this.#baseUrl}/City`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      this.#cache = (data || []).map(ciudad => ({
        id: ciudad.id,
        name: ciudad.nombre || ciudad.name,
        latitude: parseFloat(ciudad.latitud || ciudad.latitude),
        longitude: parseFloat(ciudad.longitud || ciudad.longitude),
        department: ciudad.departamento || ciudad.department || ''
      })).filter(c => c.name && !isNaN(c.latitude) && !isNaN(c.longitude));
      return this.#cache;
    } catch (e) {
      // Fallback: principales ciudades
      this.#cache = [
        { id: 1, name: 'Bogotá', latitude: 4.711, longitude: -74.0721, department: 'Cundinamarca' },
        { id: 2, name: 'Medellín', latitude: 6.2442, longitude: -75.5812, department: 'Antioquia' },
        { id: 3, name: 'Cali', latitude: 3.4516, longitude: -76.532, department: 'Valle del Cauca' },
        { id: 4, name: 'Barranquilla', latitude: 10.9685, longitude: -74.7813, department: 'Atlántico' },
        { id: 5, name: 'Cartagena', latitude: 10.391, longitude: -75.4794, department: 'Bolívar' }
      ];
      return this.#cache;
    }
  }

  async searchCities(query) {
    const cities = await this.getCities();
    const q = query.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
  }

  async getCityByName(name) {
    const cities = await this.getCities();
    const n = name.toLowerCase();
    return cities.find(c => c.name.toLowerCase() === n) || null;
  }
}

export default ColombiaAPI;
