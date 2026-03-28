import { EventType } from '../types/EventType.js';
import MapValidator from '../validators/MapValidator.js';
import Road from '../models/buildings/Road.js';
import ResidentialBuilding from '../models/buildings/ResidentialBuilding.js';
import CommercialBuilding from '../models/buildings/CommercialBuilding.js';
import IndustrialBuilding from '../models/buildings/IndustrialBuilding.js';
import ServiceBuilding from '../models/buildings/ServiceBuilding.js';
import UtilityBuilding from '../models/buildings/UtilityBuilding.js';
import Park from '../models/buildings/Park.js';
import Map from '../models/Map.js';

class MapLoaderService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  async loadFromFile(file) {
    const content = await this.#readFileAsync(file);
    const validation = new MapValidator().validate(content);
    if (!validation.valid) {
      this.eventBus.emit(EventType.BUILD_FAILED, { errors: validation.errors });
      return;
    }
    const grid = validation.grid;
    const height = grid.length;
    const width = grid[0].length;
    const map = new Map(width, height);
    const buildings = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const symbol = grid[y][x];
        let instance = null;
        switch (symbol) {
          case 'g': instance = null; break;
          case 'r': instance = new Road({ id: this.#uuid(), x, y }); break;
          case 'R1': instance = new ResidentialBuilding({ id: this.#uuid(), subtype: 'house', x, y }); break;
          case 'R2': instance = new ResidentialBuilding({ id: this.#uuid(), subtype: 'apartment', x, y }); break;
          case 'C1': instance = new CommercialBuilding({ id: this.#uuid(), subtype: 'shop', x, y }); break;
          case 'C2': instance = new CommercialBuilding({ id: this.#uuid(), subtype: 'mall', x, y }); break;
          case 'I1': instance = new IndustrialBuilding({ id: this.#uuid(), subtype: 'factory', x, y }); break;
          case 'I2': instance = new IndustrialBuilding({ id: this.#uuid(), subtype: 'farm', x, y }); break;
          case 'S1': instance = new ServiceBuilding({ id: this.#uuid(), subtype: 'police', x, y }); break;
          case 'S2': instance = new ServiceBuilding({ id: this.#uuid(), subtype: 'fire', x, y }); break;
          case 'S3': instance = new ServiceBuilding({ id: this.#uuid(), subtype: 'hospital', x, y }); break;
          case 'U1': instance = new UtilityBuilding({ id: this.#uuid(), subtype: 'power_plant', x, y }); break;
          case 'U2': instance = new UtilityBuilding({ id: this.#uuid(), subtype: 'water_plant', x, y }); break;
          case 'P1': instance = new Park({ id: this.#uuid(), x, y }); break;
        }
        map.setCell(x, y, instance);
        if (instance && symbol !== 'r') buildings.push(instance);
      }
    }
    this.gameStore.setState({ map, buildings });
    // Guardar en localStorage para que index.html pueda recuperar el mapa
    const state = this.gameStore.getState();
    if (state.city) {
      this.eventBus.emit(EventType.GAME_STARTED, { city: state.city });
    } else {
      // Si aún no hay ciudad (se carga el mapa desde setup antes de crear la ciudad),
      // solo actualizamos el estado — SetupController lo usará al hacer submit
      this.eventBus.emit('map:loaded', { map, buildings });
    }
  }

  #readFileAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  #uuid() {
    return crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now());
  }
}

export default MapLoaderService;