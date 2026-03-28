import { EventType } from '../types/EventType.js';
import CityAdapter from '../adapters/CityAdapter.js';
import BuildingAdapter from '../adapters/BuildingAdapter.js';
import Map from '../models/Map.js';

class SaveService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.saveKey = 'city_builder_save';
  }

  saveGame() {
    const state = this.gameStore.getState();
    if (!state.city || !state.map) {
      console.warn('[SaveService] No se puede guardar: city o map es null', { city: state.city, map: state.map });
      return;
    }
    const mapJSON = state.map.toJSON();
    console.log(`[SaveService] Guardando mapa ${state.map.width}x${state.map.height}, filas:`, mapJSON.length);
    const data = {
      city:      state.city.toJSON(),
      map:       mapJSON,
      buildings: state.buildings?.map(b => b.toJSON?.() ?? b) ?? [],
      roads:     state.roads?.map(r => r.toJSON?.() ?? r) ?? [],
      citizens:  state.citizens ?? [],
      resources: state.resources,
      turn:      state.turn,
      score:     state.score,
      savedAt:   new Date().toISOString()
    };
    localStorage.setItem(this.saveKey, JSON.stringify(data));
    console.log('[SaveService] Guardado OK en localStorage');
    this.eventBus.emit(EventType.SAVE_COMPLETED);
  }

  loadGame() {
    const raw = localStorage.getItem(this.saveKey);
    if (!raw) {
      this.eventBus.emit(EventType.SETUP_REQUESTED);
      return;
    }
    try {
      const data = JSON.parse(raw);
      const city = CityAdapter.fromJSON(data.city);
      let map = null;
      if (data.map && Array.isArray(data.map) && data.map.length > 0) {
        const height = data.map.length;
        const width = data.map[0]?.length ?? 20;
        map = Map.fromJSON(data.map, width, height);
      }
      const buildings = data.buildings?.map(BuildingAdapter.fromJSON) ?? [];
      const roads = data.roads ?? [];
      const citizens = data.citizens ?? [];
      const resources = data.resources ?? {};
      const turn = data.turn ?? 0;
      const score = data.score ?? 0;
      this.gameStore.setState({ city, map, buildings, roads, citizens, resources, turn, score });
      this.eventBus.emit(EventType.GAME_STARTED, { city });
    } catch (e) {
      console.error('Error cargando partida:', e);
      this.eventBus.emit(EventType.SETUP_REQUESTED);
    }
  }

  hasSavedGame() {
    return !!localStorage.getItem(this.saveKey);
  }

  deleteSave() {
    localStorage.removeItem(this.saveKey);
  }
}

export default SaveService;