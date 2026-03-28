import { EventType } from '../types/EventType.js';

class SetupScreen {
  #selectedRegion = null;

  constructor(eventBus, colombiaAPI, mapLoaderService, hasSavedGame) {
    this.eventBus = eventBus;
    this.colombiaAPI = colombiaAPI;
    this.mapLoaderService = mapLoaderService;
    this.hasSavedGame = hasSavedGame;
  }

  init() {
    // 1. Búsqueda de ciudades colombianas (debounce 300ms)
    const regionSearch = document.getElementById('region-search');
    let debounceTimer = null;
    regionSearch?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const results = await this.colombiaAPI.searchCities(e.target.value);
        this.#renderRegionResults(results);
      }, 300);
    });

    // 3. Carga de mapa desde archivo .txt
    document.getElementById('btn-load-map')?.addEventListener('click', () => {
      document.getElementById('map-file-input')?.click();
    });
    document.getElementById('map-file-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.mapLoaderService?.loadFromFile(file);
    });

    // 4. Listener del formulario de setup
    document.getElementById('setup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.#selectedRegion) {
        document.getElementById('setup-errors').textContent = 'Debes seleccionar una ciudad colombiana.';
        return;
      }
      const data = {
        cityName:   document.getElementById('city-name').value.trim(),
        mayorName:  document.getElementById('mayor-name').value.trim(),
        region:     this.#selectedRegion,
        width:      parseInt(document.getElementById('map-width').value, 10),
        height:     parseInt(document.getElementById('map-height').value, 10),
        initElectricity: parseFloat(document.getElementById('init-electricity')?.value || '0'),
        initWater:       parseFloat(document.getElementById('init-water')?.value || '0'),
        initFood:        parseFloat(document.getElementById('init-food')?.value || '0'),
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
  }

  #renderRegionResults(cities) {
    const ul = document.getElementById('region-results');
    ul.innerHTML = '';
    if (!Array.isArray(cities) || cities.length === 0) return;
    cities.forEach(city => {
      const li = document.createElement('li');
      li.textContent = `${city.cityName} (${city.lat}, ${city.lon})`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        this.#selectedRegion = { cityName: city.cityName, lat: city.lat, lon: city.lon };
        document.getElementById('lat-display').value = city.lat;
        document.getElementById('lon-display').value = city.lon;
        ul.innerHTML = '';
      });
      ul.appendChild(li);
    });
  }
}

export default SetupScreen;