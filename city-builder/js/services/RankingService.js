import { STORAGE_KEYS } from '../config/constants.js';
import { EventType } from '../types/EventType.js';

class RankingService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus  = eventBus;
  }

  init() {
    // Al finalizar el turno actualizamos la entrada de la ciudad actual.
    // También escuchamos SCORE_UPDATED para guardar el breakdown detallado.
    this.eventBus.subscribe(EventType.SCORE_UPDATED, ({ score, breakdown }) => {
      this.#updateCurrentEntry(score, breakdown);
    });
  }

  // ── Lectura ──────────────────────────────────────────────────────────────

  getRanking() {
    return this.#getRaw().ranking
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  getAllEntries() {
    return this.#getRaw().ranking;
  }

  getCurrentCityRank() {
    const state = this.gameStore.getState();
    const { city } = state;
    if (!city) return null;
    const key    = `${city.name}::${city.mayorName}`;
    const sorted = this.#getRaw().ranking.slice().sort((a, b) => b.score - a.score);
    const idx    = sorted.findIndex(e => `${e.cityName}::${e.mayor}` === key);
    return idx === -1 ? null : idx + 1;
  }

  // ── Escritura ────────────────────────────────────────────────────────────

  resetRanking() {
    if (localStorage.getItem(STORAGE_KEYS.ranking)) {
      localStorage.removeItem(STORAGE_KEYS.ranking);
    }
  }

  exportRanking() {
    const data = this.#getRaw();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'city_ranking.json' });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  // ── Privados ─────────────────────────────────────────────────────────────

  #getRaw() {
    const raw = localStorage.getItem(STORAGE_KEYS.ranking);
    if (!raw) return { ranking: [] };
    try { return JSON.parse(raw); } catch { return { ranking: [] }; }
  }

  #saveRaw(data) {
    localStorage.setItem(STORAGE_KEYS.ranking, JSON.stringify(data));
  }

  #updateCurrentEntry(score, breakdown) {
    const state = this.gameStore.getState();
    const { city, turn, citizens } = state;
    if (!city) return;

    const key        = `${city.name}::${city.mayorName}`;
    const population = citizens?.length ?? 0;
    const happiness  = population > 0
      ? Math.round(citizens.reduce((s, c) => s + (c.happiness || 0), 0) / population)
      : 0;

    const data  = this.#getRaw();
    let   entry = data.ranking.find(e => `${e.cityName}::${e.mayor}` === key);

    if (!entry) {
      entry = {
        cityName:  city.name,
        mayor:     city.mayorName,
        score,
        population,
        happiness,
        turns:     turn,
        date:      new Date().toISOString(),
        breakdown: breakdown ?? null,
      };
      data.ranking.push(entry);
    } else {
      entry.score      = score;
      entry.population = population;
      entry.happiness  = happiness;
      entry.turns      = turn;
      entry.date       = new Date().toISOString();
      entry.breakdown  = breakdown ?? entry.breakdown ?? null;
    }

    this.#saveRaw(data);

    // Exponemos la clave de la ciudad actual para que ranking.html pueda
    // identificar cuál es la partida en curso sin acceso al GameStore.
    sessionStorage.setItem('current_city_key', key);
  }
}

export default RankingService;