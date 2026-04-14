import { EventType } from '../types/EventType.js';
import { STORAGE_KEYS } from '../config/constants.js';

class ScorePanel {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.container = document.getElementById('score-panel');
    this.turnDisplay = document.getElementById('turn-display');
    this.expanded = false;
  }

  init() {
    this.eventBus.subscribe(EventType.SCORE_UPDATED, () => this.#render());
    this.#render();
  }

  #render() {
    if (!this.container) return;
    const state = this.gameStore.getState();
    const scoreState = state.score;
    let score = 0;
    let breakdown = {};

    if (scoreState && typeof scoreState === 'object') {
      score = scoreState.current ?? 0;
      breakdown = scoreState.breakdown ?? {};
    } else if (typeof scoreState === 'number') {
      score = scoreState;
    }

    if (score === 0) {
      const ranked = this.#getRankingScore(state);
      if (ranked) {
        score = ranked.score;
        breakdown = ranked.breakdown ?? breakdown;
      }
    }
    const turn = state.turn ?? 1;
    if (this.turnDisplay) this.turnDisplay.textContent = `Turno ${turn}`;
    this.container.innerHTML = `
      <div class="score-main">
        <span class="score-total">${score}</span>
        <button class="score-toggle" id="score-toggle">${this.expanded ? '▲' : '▼'}</button>
      </div>
      <div class="score-breakdown" style="display:${this.expanded ? 'block' : 'none'}">
        <ul>
          <li>Población: <b>+${breakdown.population ?? 0}</b></li>
          <li>Felicidad: <b>+${breakdown.happiness ?? 0}</b></li>
          <li>Edificios: <b>+${breakdown.buildings ?? 0}</b></li>
          <li>Recursos: <b>+${breakdown.resources ?? 0}</b></li>
          <li>Bonificaciones: <b>+${breakdown.bonuses ?? 0}</b></li>
          <li>Penalizaciones: <b>${breakdown.penalties ?? 0}</b></li>
        </ul>
      </div>
    `;
    this.container.querySelector('#score-toggle')?.addEventListener('click', () => {
      this.expanded = !this.expanded;
      this.#render();
    });
  }

  #getRankingScore(state) {
    const city = state.city;
    if (!city) return null;
    const raw = localStorage.getItem(STORAGE_KEYS.ranking);
    if (!raw) return null;
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
    const ranking = data?.ranking ?? [];
    const key = `${city.name}::${city.mayorName}`;
    const entry = ranking.find((e) => `${e.cityName}::${e.mayor}` === key);
    if (!entry) return null;
    return {
      score: entry.score ?? 0,
      breakdown: this.#normalizeBreakdown(entry.breakdown)
    };
  }

  #normalizeBreakdown(breakdown) {
    if (!breakdown || typeof breakdown !== 'object') return {};
    if (breakdown.population != null) return breakdown;

    const base = breakdown.base ?? {};
    const bonuses = Array.isArray(breakdown.bonuses) ? breakdown.bonuses : [];
    const penalties = Array.isArray(breakdown.penalties) ? breakdown.penalties : [];

    return {
      population: Math.round(base.population ?? 0),
      happiness: Math.round(base.avgHappiness ?? 0),
      buildings: Math.round(base.numBuildings ?? 0),
      resources: Math.round((base.money ?? 0) + (base.balanceElectricity ?? 0) + (base.balanceWater ?? 0)),
      bonuses: bonuses.reduce((sum, b) => sum + (b.value || 0), 0),
      penalties: penalties.reduce((sum, p) => sum + (p.value || 0), 0)
    };
  }
}

export default ScorePanel;
