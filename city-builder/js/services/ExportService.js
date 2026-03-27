import { EventType } from '../types/EventType.js';

class ExportService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.eventBus.subscribe(EventType.EXPORT_REQUESTED, () => this.#exportCity());
  }

  #exportCity() {
    const state = this.gameStore.getState();
    const city = state.city;
    const citizens = state.citizens || [];
    const avgHappiness = citizens.length
      ? Math.round(citizens.reduce((a, c) => a + (c.happiness || 0), 0) / citizens.length)
      : 0;
    const data = {
      cityName: city?.name ?? '',
      mayor: city?.mayorName ?? '',
      gridSize: { width: city?.gridWidth ?? 0, height: city?.gridHeight ?? 0 },
      coordinates: city?.region ? { lat: city.region.lat, lon: city.region.lon } : { lat: 0, lon: 0 },
      turn: state.turn,
      score: state.score,
      map: state.map?.toJSON?.() ?? [],
      buildings: state.buildings?.map(b => b.toJSON()) ?? [],
      roads: state.roads?.map(r => r.toJSON?.() ?? r) ?? [],
      resources: state.resources,
      citizens: citizens,
      population: citizens.length,
      happiness: avgHappiness
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const cityName = city?.name?.replace(/\s+/g, '_') || 'ciudad';
    const date = new Date().toISOString().slice(0, 10);
    const filename = `ciudad_${cityName}_${date}.json`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 100);
    this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
      message: 'Ciudad exportada exitosamente',
      type: 'success'
    });
  }
}

export default ExportService;
