import { EventType } from '../types/EventType.js';

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
    const score = state.score?.current ?? 0;
    const breakdown = state.score?.breakdown ?? {};
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
}

export default ScorePanel;
