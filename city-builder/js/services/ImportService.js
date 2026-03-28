import { EventType } from '../types/EventType.js';
import CityAdapter from '../adapters/CityAdapter.js';
import Map from '../models/Map.js';

class ImportService {
  constructor(gameStore, eventBus, saveService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.saveService = saveService;
  }

  init() {
    this.eventBus.subscribe('import:requested', () => this.#openFilePicker());
  }

  #openFilePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.#readAndLoad(file);
    });
    input.click();
  }

  #readAndLoad(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.#restoreFromData(data);
      } catch (err) {
        this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
          message: 'Error al leer el archivo JSON: formato inválido.',
          type: 'error'
        });
        console.error('[ImportService]', err);
      }
    };
    reader.onerror = () => {
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
        message: 'No se pudo leer el archivo.',
        type: 'error'
      });
    };
    reader.readAsText(file);
  }

  #restoreFromData(data) {
    // Soporta tanto el formato de exportCity como el formato de saveGame
    const cityRaw = data.city ?? {
      name:       data.cityName,
      mayorName:  data.mayor,
      region:     data.coordinates ? { lat: data.coordinates.lat, lon: data.coordinates.lon } : null,
      gridWidth:  data.gridSize?.width  ?? 20,
      gridHeight: data.gridSize?.height ?? 20
    };

    const city = CityAdapter.fromJSON(cityRaw);
    if (!city) {
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
        message: 'El archivo no contiene datos de ciudad válidos.',
        type: 'error'
      });
      return;
    }

    let map = null;
    if (data.map && Array.isArray(data.map) && data.map.length > 0) {
      const height = data.map.length;
      const width  = data.map[0]?.length ?? 20;
      map = Map.fromJSON(data.map, width, height);
    }

    // Derivar buildings y roads desde el grid (fuente de verdad)
    const buildings = [];
    const roads     = [];
    if (map) {
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const cell = map.getCell(x, y);
          if (!cell) continue;
          if (cell.type === 'road') roads.push(cell);
          else buildings.push(cell);
        }
      }
    }

    const citizens  = data.citizens  ?? [];
    const resources = data.resources ?? { money: 50000, electricity: 0, water: 0, food: 0 };
    const turn      = data.turn  ?? 0;
    const score     = data.score ?? 0;

    this.gameStore.setState({ city, map, buildings, roads, citizens, resources, turn, score });

    // Persistir para que al recargar se mantenga
    this.saveService.saveGame();

    this.eventBus.emit(EventType.GAME_LOADED, { city });
    this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
      message: `Ciudad "${city.name}" importada correctamente.`,
      type: 'success'
    });
  }
}

export default ImportService;