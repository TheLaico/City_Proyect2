class ColombiaAPI {
  #baseUrl = 'https://api-colombia.com/api/v1';
  #cache = null;
  #cityCoords = null;
  #cityCoordsByName = null;
  #maxResults = 50;

  #getFallbackCities() {
    return [
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
  }

  async getCities() {
    if (this.#cache) return this.#cache;
    try {
      const res = await fetch(`${this.#baseUrl}/Department`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const mapped = (data || []).map((dept) => {
        const capital = dept.cityCapital || {};
        const capitalName = capital.nombre || capital.name || '';
        return {
          id: dept.id,
          name: capitalName || dept.nombre || dept.name || '',
          latitude: null,
          longitude: null,
          capitalId: dept.cityCapitalId || capital.id || null,
          department: dept.nombre || dept.name || ''
        };
      }).filter(c => c.name && c.capitalId);

      const fallback = this.#getFallbackCities();
      const fallbackByName = new Map(fallback.map((c) => [c.name.toLowerCase(), c]));
      const withCoords = mapped.map((city) => {
        if (city.latitude == null || city.longitude == null) {
          const fallbackCity = fallbackByName.get(city.name.toLowerCase());
          if (fallbackCity) {
            return { ...city, latitude: fallbackCity.latitude, longitude: fallbackCity.longitude };
          }
        }
        return city;
      });

      if (withCoords.length === 0) throw new Error('Empty data');
      this.#cache = withCoords;
      return this.#cache;
    } catch (e) {
      console.warn('ColombiaAPI: usando fallback de ciudades.', e.message);
      this.#cache = this.#getFallbackCities();
      return this.#cache;
    }
  }

  async getCityById(cityId) {
    if (!cityId) return null;
    try {
      const res = await fetch(`${this.#baseUrl}/City/${cityId}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const latitude = parseFloat(data.latitud || data.latitude);
      const longitude = parseFloat(data.longitud || data.longitude);
      if (isNaN(latitude) || isNaN(longitude)) return null;
      return { latitude, longitude };
    } catch (e) {
      console.warn('ColombiaAPI: no se pudo cargar la ciudad.', e.message);
      return null;
    }
  }

  async getCityCoords(cityId) {
    if (!cityId) return null;
    if (!this.#cityCoords) {
      try {
        const res = await fetch(`${this.#baseUrl}/City`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        this.#cityCoords = new Map();
        this.#cityCoordsByName = new Map();
        (data || []).forEach((city) => {
          const latitude = parseFloat(city.latitud || city.latitude);
          const longitude = parseFloat(city.longitud || city.longitude);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            this.#cityCoords.set(city.id, { latitude, longitude });
            const name = (city.nombre || city.name || '').toLowerCase();
            if (name) this.#cityCoordsByName.set(name, { latitude, longitude });
          }
        });
      } catch (e) {
        console.warn('ColombiaAPI: no se pudo cargar listado de ciudades.', e.message);
        this.#cityCoords = new Map();
        this.#cityCoordsByName = new Map();
      }
    }

    const coords = this.#cityCoords.get(cityId);
    if (coords) return coords;
    return this.getCityById(cityId);
  }

  async getCityCoordsByName(name) {
    if (!name) return null;
    if (!this.#cityCoordsByName) {
      await this.getCityCoords(0);
    }
    return this.#cityCoordsByName.get(name.toLowerCase()) || null;
  }

  async searchCities(query) {
    const cities = await this.getCities();
    const q = (query || '').trim().toLowerCase();
    // Si no hay query, mostrar todas (máx 50)
    if (!q) return cities.slice(0, this.#maxResults);
    return cities.filter(c => {
      return c.name.toLowerCase().includes(q) || c.department.toLowerCase().includes(q);
    }).slice(0, this.#maxResults);
  }

  async getCityByName(name) {
    const cities = await this.getCities();
    const n = name.toLowerCase();
    return cities.find(c => c.name.toLowerCase() === n) || null;
  }
}

export default ColombiaAPI;