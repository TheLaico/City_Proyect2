class ColombiaAPI {
  #baseUrl = 'https://api-colombia.com/api/v1';
  #cache = null;

  async getCities() {
    if (this.#cache) return this.#cache;
    try {
      const res = await fetch(`${this.#baseUrl}/City`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const mapped = (data || []).map(ciudad => ({
        id: ciudad.id,
        name: ciudad.nombre || ciudad.name,
        latitude: parseFloat(ciudad.latitud || ciudad.latitude),
        longitude: parseFloat(ciudad.longitud || ciudad.longitude),
        department: ciudad.departamento || ciudad.department || ''
      })).filter(c => c.name && !isNaN(c.latitude) && !isNaN(c.longitude));

      if (mapped.length === 0) throw new Error('Empty data');
      this.#cache = mapped;
      return this.#cache;
    } catch (e) {
      console.warn('ColombiaAPI: usando fallback de ciudades.', e.message);
      this.#cache = [
        { id: 1,  name: 'Bogotá',          latitude: 4.7110,   longitude: -74.0721, department: 'Cundinamarca' },
        { id: 2,  name: 'Medellín',         latitude: 6.2442,   longitude: -75.5812, department: 'Antioquia' },
        { id: 3,  name: 'Cali',             latitude: 3.4516,   longitude: -76.5320, department: 'Valle del Cauca' },
        { id: 4,  name: 'Barranquilla',     latitude: 10.9685,  longitude: -74.7813, department: 'Atlántico' },
        { id: 5,  name: 'Cartagena',        latitude: 10.3910,  longitude: -75.4794, department: 'Bolívar' },
        { id: 6,  name: 'Bucaramanga',      latitude: 7.1254,   longitude: -73.1198, department: 'Santander' },
        { id: 7,  name: 'Pereira',          latitude: 4.8133,   longitude: -75.6961, department: 'Risaralda' },
        { id: 8,  name: 'Manizales',        latitude: 5.0703,   longitude: -75.5138, department: 'Caldas' },
        { id: 9,  name: 'Santa Marta',      latitude: 11.2408,  longitude: -74.2110, department: 'Magdalena' },
        { id: 10, name: 'Cúcuta',           latitude: 7.8939,   longitude: -72.5078, department: 'Norte de Santander' },
        { id: 11, name: 'Ibagué',           latitude: 4.4389,   longitude: -75.2322, department: 'Tolima' },
        { id: 12, name: 'Villavicencio',    latitude: 4.1420,   longitude: -73.6266, department: 'Meta' },
        { id: 13, name: 'Pasto',            latitude: 1.2136,   longitude: -77.2811, department: 'Nariño' },
        { id: 14, name: 'Montería',         latitude: 8.7575,   longitude: -75.8876, department: 'Córdoba' },
        { id: 15, name: 'Armenia',          latitude: 4.5339,   longitude: -75.6811, department: 'Quindío' },
        { id: 16, name: 'Neiva',            latitude: 2.9273,   longitude: -75.2820, department: 'Huila' },
        { id: 17, name: 'Sincelejo',        latitude: 9.3047,   longitude: -75.3978, department: 'Sucre' },
        { id: 18, name: 'Popayán',          latitude: 2.4448,   longitude: -76.6147, department: 'Cauca' },
        { id: 19, name: 'Valledupar',       latitude: 10.4779,  longitude: -73.2506, department: 'Cesar' },
        { id: 20, name: 'Tunja',            latitude: 5.5353,   longitude: -73.3678, department: 'Boyacá' }
      ];
      return this.#cache;
    }
  }

  async searchCities(query) {
    const cities = await this.getCities();
    const q = (query || '').trim().toLowerCase();
    // Si no hay query, mostrar todas (máx 8)
    if (!q) return cities.slice(0, 8);
    return cities.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
  }

  async getCityByName(name) {
    const cities = await this.getCities();
    const n = name.toLowerCase();
    return cities.find(c => c.name.toLowerCase() === n) || null;
  }
}

export default ColombiaAPI;