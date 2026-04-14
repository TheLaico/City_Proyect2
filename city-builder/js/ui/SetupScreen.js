import { EventType } from '../types/EventType.js';

class SetupScreen {
  #selectedRegion = null;
  #cities = [];
  #cityByCapitalId = new Map();

  constructor(eventBus, colombiaAPI, mapLoaderService, hasSavedGame) {
    this.eventBus = eventBus;
    this.colombiaAPI = colombiaAPI;
    this.mapLoaderService = mapLoaderService;
    this.hasSavedGame = hasSavedGame;
  }

  init() {
    // 1. Búsqueda de ciudades colombianas (debounce 300ms)
    const regionSearch = document.getElementById('region-search');
    const regionSelect = document.getElementById('region-select');
    let debounceTimer = null;

    const doSearch = async (query) => {
      const results = await this.colombiaAPI.searchCities(query);
      this.#renderRegionResults(results);
    };

    const loadInitialCities = async () => {
      const cities = await this.colombiaAPI.getCities();
      this.#cities = cities;
      this.#cityByCapitalId = new Map(
        cities.filter((city) => city.capitalId != null).map((city) => [String(city.capitalId), city])
      );
      if (regionSelect) {
        regionSelect.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Selecciona una ciudad...';
        regionSelect.appendChild(placeholder);
        cities.forEach((city) => {
          const option = document.createElement('option');
          option.value = String(city.capitalId ?? city.id ?? city.name);
          option.textContent = `${city.name}${city.department ? ' — ' + city.department : ''}`;
          regionSelect.appendChild(option);
        });
      }
      await doSearch('');
    };

    // Mostrar ciudades al hacer foco (aunque el campo esté vacío)
    regionSearch?.addEventListener('focus', () => {
      doSearch(regionSearch.value);
    });

    regionSearch?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => doSearch(e.target.value), 300);
    });

    regionSelect?.addEventListener('change', async (e) => {
      const value = e.target.value;
      if (!value) return;
      const city = this.#cityByCapitalId.get(value)
        || this.#cities.find((c) => String(c.id) === value || c.name === value);
      if (city) await this.#applyCitySelection(city);
    });

    // 3. Carga de mapa desde archivo .txt
    document.getElementById('btn-load-map')?.addEventListener('click', () => {
      document.getElementById('map-file-input')?.click();
    });
    document.getElementById('map-file-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.mapLoaderService?.loadFromFile(file);

      // Mostrar preview simple en el div de preview
      const preview = document.getElementById('map-preview');
      if (preview) {
        preview.textContent = `✅ Mapa cargado: ${file.name}`;
        preview.style.color = 'green';
      }
    });

    // Escuchar confirmación de mapa cargado
    this.eventBus.subscribe('map:loaded', ({ map }) => {
      const preview = document.getElementById('map-preview');
      if (preview) {
        preview.textContent = `✅ Mapa listo: ${map.width}×${map.height} celdas`;
        preview.style.color = 'green';
      }
      // Actualizar inputs de tamaño para reflejar el mapa cargado
      const wInput = document.getElementById('map-width');
      const hInput = document.getElementById('map-height');
      if (wInput) wInput.value = map.width;
      if (hInput) hInput.value = map.height;
    });

    // 4. Listener del formulario de setup
    document.getElementById('setup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.#selectedRegion) {
        document.getElementById('setup-errors').textContent = 'Debes seleccionar una ciudad colombiana.';
        return;
      }
      let lat = this.#selectedRegion.lat;
      let lon = this.#selectedRegion.lon;
      if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
        lat = parseFloat(document.getElementById('lat-display')?.value);
        lon = parseFloat(document.getElementById('lon-display')?.value);
      }
      if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
        document.getElementById('setup-errors').textContent = 'Ingresa latitud y longitud validas.';
        return;
      }
      const width  = parseInt(document.getElementById('map-width').value,  10) || 20;
      const height = parseInt(document.getElementById('map-height').value, 10) || 20;
      const data = {
        cityName:        document.getElementById('city-name').value.trim(),
        mayorName:       document.getElementById('mayor-name').value.trim(),
        region:          { ...this.#selectedRegion, lat, lon },
        width,
        height,
        initElectricity: parseFloat(document.getElementById('init-electricity')?.value || '0'),
        initWater:       parseFloat(document.getElementById('init-water')?.value       || '0'),
        initFood:        parseFloat(document.getElementById('init-food')?.value        || '0'),
      };
      this.eventBus.emit('setup:submitted', data);
    });

    // 5. Mostrar botón continuar si hay partida guardada
    if (this.hasSavedGame?.()) {
      const btnContinue = document.getElementById('btn-continue');
      if (btnContinue) {
        btnContinue.style.display = 'block';
        btnContinue.addEventListener('click', () => {
          this.eventBus.emit(EventType.GAME_LOAD_REQUESTED);
        });
      }
    }

    // 6. Escuchar errores de carga de mapa
    this.eventBus.subscribe(EventType.BUILD_FAILED, ({ message }) => {
      const errDiv = document.getElementById('setup-errors');
      if (errDiv) errDiv.textContent = message || 'Error al cargar el mapa.';
    });

    loadInitialCities();
  }

  #renderRegionResults(cities) {
    const ul = document.getElementById('region-results');
    if (!ul) return;
    ul.innerHTML = '';
    if (!Array.isArray(cities) || cities.length === 0) return;
    cities.forEach(city => {
      const li = document.createElement('li');
      const coordsLabel = city.latitude && city.longitude
        ? `(${city.latitude}, ${city.longitude})`
        : '(coords)';
      const deptLabel = city.department ? ` — ${city.department}` : '';
      li.textContent = `${city.name}${deptLabel} ${coordsLabel}`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', async () => {
        await this.#applyCitySelection(city);
      });
      ul.appendChild(li);
    });
  }

  async #applyCitySelection(city) {
    // Seleccion inmediata para feedback visual
    this.#selectedRegion = { cityName: city.name, lat: city.latitude, lon: city.longitude, capitalId: city.capitalId };
    const searchInput = document.getElementById('region-search');
    if (searchInput) searchInput.value = city.name;
    const latDisplay = document.getElementById('lat-display');
    const lonDisplay = document.getElementById('lon-display');
    if (latDisplay) latDisplay.value = city.latitude ?? '...';
    if (lonDisplay) lonDisplay.value = city.longitude ?? '...';

    let lat = city.latitude;
    let lon = city.longitude;
    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      const coordsByName = await this.colombiaAPI.getCityCoordsByName(city.name);
      lat = coordsByName?.latitude ?? null;
      lon = coordsByName?.longitude ?? null;
    }

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      const coords = await this.colombiaAPI.getCityCoords(city.capitalId);
      lat = coords?.latitude ?? null;
      lon = coords?.longitude ?? null;
    }

    const latInput = document.getElementById('lat-display');
    const lonInput = document.getElementById('lon-display');

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      this.#selectedRegion = { cityName: city.name, lat: null, lon: null, capitalId: city.capitalId };
      if (latInput) {
        latInput.value = '';
        latInput.removeAttribute('readonly');
        latInput.placeholder = 'Ingresa latitud';
      }
      if (lonInput) {
        lonInput.value = '';
        lonInput.removeAttribute('readonly');
        lonInput.placeholder = 'Ingresa longitud';
      }
      document.getElementById('setup-errors').textContent = 'No se encontraron coordenadas. Ingresa latitud y longitud manualmente.';
      return;
    }

    this.#selectedRegion = { cityName: city.name, lat, lon, capitalId: city.capitalId };
    if (latInput) {
      latInput.value = lat;
      latInput.setAttribute('readonly', 'readonly');
    }
    if (lonInput) {
      lonInput.value = lon;
      lonInput.setAttribute('readonly', 'readonly');
    }
    const label = document.getElementById('region-selected-label');
    if (label) {
      label.textContent = `✅ ${city.name} (${lat}, ${lon})`;
      label.style.display = 'block';
    }
    const results = document.getElementById('region-results');
    if (results) results.innerHTML = '';
  }
}

export default SetupScreen;