import { EventType } from '../types/EventType.js';

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

class SetupScreen {
  constructor(eventBus, colombiaAPI, mapLoaderService, hasSavedGame) {
    this.eventBus = eventBus;
    this.colombiaAPI = colombiaAPI;
    this.mapLoaderService = mapLoaderService;
    this.hasSavedGame = hasSavedGame;
    this.selectedRegion = null;
    this.previewMap = null;
  }

  init() {
    const regionSearch = document.getElementById('region-search');
    const regionResults = document.getElementById('region-results');
    const latDisplay = document.getElementById('lat-display');
    const lonDisplay = document.getElementById('lon-display');
    const btnLoadMap = document.getElementById('btn-load-map');
    const mapFileInput = document.getElementById('map-file-input');
    const mapPreview = document.getElementById('map-preview');
    const setupForm = document.getElementById('setup-form');
    const btnContinue = document.getElementById('btn-continue');
    const setupErrors = document.getElementById('setup-errors');

    // Búsqueda de ciudades
    regionSearch.addEventListener('input', debounce(async (e) => {
      const query = e.target.value.trim();
      regionResults.innerHTML = '';
      if (!query) return;
      const results = await this.colombiaAPI.searchCities(query);
      results.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name} (${city.department})`;
        li.tabIndex = 0;
        li.className = 'region-result-item';
        li.addEventListener('click', () => selectCity(city));
        li.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') selectCity(city);
        });
        regionResults.appendChild(li);
      });
    }, 300));

    const selectCity = (city) => {
      this.selectedRegion = {
        cityName: city.name,
        lat: city.latitude,
        lon: city.longitude
      };
      latDisplay.value = city.latitude;
      lonDisplay.value = city.longitude;
      regionResults.innerHTML = '';
      regionSearch.value = city.name;
    };

    // Carga de mapa desde archivo
    btnLoadMap.addEventListener('click', () => {
      mapFileInput.click();
    });
    mapFileInput.addEventListener('change', async (e) => {
      setupErrors.textContent = '';
      mapPreview.innerHTML = '';
      const file = e.target.files[0];
      if (!file) return;
      try {
        await this.mapLoaderService.loadFromFile(file);
        // El preview se mostrará al recibir GAME_STARTED
      } catch (err) {
        setupErrors.textContent = 'Error al cargar el mapa.';
      }
    });

    // Preview visual tras carga exitosa
    this.eventBus.subscribe(EventType.GAME_STARTED, ({ map }) => {
      if (!map) return;
      this.previewMap = map;
      mapPreview.innerHTML = '<pre>' + map.toString() + '</pre>';
    });

    // Mostrar errores de carga
    this.eventBus.subscribe(EventType.BUILD_FAILED, ({ errors }) => {
      setupErrors.textContent = Array.isArray(errors) ? errors.join('\n') : errors;
    });

    // Continuar partida guardada
    if (typeof this.hasSavedGame === 'function' && this.hasSavedGame()) {
      btnContinue.style.display = '';
      btnContinue.addEventListener('click', () => {
        this.eventBus.emit(EventType.GAME_LOAD_REQUESTED);
      });
    } else {
      btnContinue.style.display = 'none';
    }

    // Envío del formulario
    setupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      setupErrors.textContent = '';
      const cityName = document.getElementById('city-name').value.trim();
      const mayorName = document.getElementById('mayor-name').value.trim();
      const width = Number(document.getElementById('map-width').value);
      const height = Number(document.getElementById('map-height').value);
      const region = this.selectedRegion;
      if (!region || !region.lat || !region.lon) {
        setupErrors.textContent = 'Selecciona una ciudad/región válida.';
        return;
      }
      this.eventBus.emit('setup:submitted', {
        cityName,
        mayorName,
        width,
        height,
        region
      });
    });
  }
}

export default SetupScreen;