import { EventType } from '../types/EventType.js';
import CityAdapter from '../adapters/CityAdapter.js';
import BuildingAdapter from '../adapters/BuildingAdapter.js';

class SaveService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.saveKey = 'city_builder_save';
  }

  saveGame() {
    const state = this.gameStore.getState();
    const data = {
      city: state.city?.toJSON?.() ?? null,
      map: state.map?.toJSON?.() ?? null,
      buildings: state.buildings?.map(b => b.toJSON()) ?? [],
      roads: state.roads?.map(r => r.toJSON?.() ?? r) ?? [],
      citizens: state.citizens ?? [],
      resources: state.resources,
      turn: state.turn,
      score: state.score,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(this.saveKey, JSON.stringify(data));
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
      const map = state.map?.constructor.fromJSON
        ? state.map.constructor.fromJSON(data.map, data.map[0]?.length, data.map.length)
        : null;
      const buildings = data.buildings?.map(BuildingAdapter.fromJSON) ?? [];
      const roads = data.roads ?? [];
      const citizens = data.citizens ?? [];
      const resources = data.resources ?? {};
      const turn = data.turn ?? 0;
      const score = data.score ?? 0;
      this.gameStore.setState({ city, map, buildings, roads, citizens, resources, turn, score });
      this.eventBus.emit(EventType.GAME_STARTED);
    } catch (e) {
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
