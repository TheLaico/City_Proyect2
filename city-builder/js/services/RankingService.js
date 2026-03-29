import { STORAGE_KEYS } from '../config/constants.js';
import { EventType } from '../types/EventType.js';

class RankingService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  init() {
    this.eventBus.subscribe(EventType.TURN_ENDED, () => this.#updateCurrentEntry());
  }

  getRanking() {
    const data = this.#getRaw();
    return data.ranking
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  #getRaw() {
    const raw = localStorage.getItem(STORAGE_KEYS.ranking);
    if (!raw) return { ranking: [] };
    try {
      return JSON.parse(raw);
    } catch {
      return { ranking: [] };
    }
  }

  #saveRaw(data) {
    localStorage.setItem(STORAGE_KEYS.ranking, JSON.stringify(data));
  }

  #updateCurrentEntry() {
    const state = this.gameStore.getState();
    const { city, score, turn, citizens } = state;
    if (!city) return;
    const key = `${city.name}::${city.mayorName}`;
    const population = citizens?.length ?? 0;
    const happiness = population > 0
      ? Math.round(citizens.reduce((sum, c) => sum + (c.happiness || 0), 0) / population)
      : 0;
    const data = this.#getRaw();
    let entry = data.ranking.find(e => `${e.cityName}::${e.mayor}` === key);
    if (!entry) {
      entry = {
        cityName: city.name,
        mayor: city.mayorName,
        score,
        population,
        happiness,
        turns: turn,
        date: new Date().toISOString()
      };
      data.ranking.push(entry);
    } else {
      entry.score = score;
      entry.population = population;
      entry.happiness = happiness;
      entry.turns = turn;
      entry.date = new Date().toISOString();
    }
    this.#saveRaw(data);
  }

  resetRanking() {
    localStorage.removeItem(STORAGE_KEYS.ranking);
  }

  exportRanking() {
    const data = this.#getRaw();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'city_ranking.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  getCurrentCityRank() {
    const state = this.gameStore.getState();
    const { city } = state;
    if (!city) return null;
    const key = `${city.name}::${city.mayorName}`;
    const data = this.#getRaw();
    const sorted = data.ranking.slice().sort((a, b) => b.score - a.score);
    const idx = sorted.findIndex(e => `${e.cityName}::${e.mayor}` === key);
    return idx === -1 ? null : idx + 1;
  }

  getAllEntries() {
    return this.#getRaw().ranking;
  }
}

export default RankingService;