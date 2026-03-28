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

    const doSearch = async (query) => {
      const results = await this.colombiaAPI.searchCities(query);
      this.#renderRegionResults(results);
    };

    // Mostrar ciudades al hacer foco (aunque el campo esté vacío)
    regionSearch?.addEventListener('focus', () => {
      doSearch(regionSearch.value);
    });

    regionSearch?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => doSearch(e.target.value), 300);
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
      const width  = parseInt(document.getElementById('map-width').value,  10) || 20;
      const height = parseInt(document.getElementById('map-height').value, 10) || 20;
      const data = {
        cityName:        document.getElementById('city-name').value.trim(),
        mayorName:       document.getElementById('mayor-name').value.trim(),
        region:          this.#selectedRegion,
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
  }

  #renderRegionResults(cities) {
    const ul = document.getElementById('region-results');
    ul.innerHTML = '';
    if (!Array.isArray(cities) || cities.length === 0) return;
    cities.forEach(city => {
      const li = document.createElement('li');
      li.textContent = `${city.name} (${city.latitude}, ${city.longitude})`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        this.#selectedRegion = { cityName: city.name, lat: city.latitude, lon: city.longitude };
        document.getElementById('lat-display').value = city.latitude;
        document.getElementById('lon-display').value = city.longitude;
        // Mostrar ciudad seleccionada en el input de búsqueda
        const searchInput = document.getElementById('region-search');
        if (searchInput) searchInput.value = city.name;
        const label = document.getElementById('region-selected-label');
        if (label) { label.textContent = `✅ ${city.name} (${city.latitude}, ${city.longitude})`; label.style.display = 'block'; }
        ul.innerHTML = '';
      });
      ul.appendChild(li);
    });
  }
}

export default SetupScreen;