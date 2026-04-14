import { EventType } from '../types/EventType.js';

class ResourcePanel {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  init() {
    this.#buildHTML();
    this.eventBus.subscribe(EventType.RESOURCES_UPDATED, ({ resources, summary }) => {
      this.#render(resources, summary);
    });
    this.eventBus.subscribe(EventType.TURN_ENDED, () => {
      const state = this.gameStore.getState();
      this.#render(state.resources);
    });
    this.eventBus.subscribe(EventType.GAME_STARTED, () => {
      const state = this.gameStore.getState();
      this.#render(state.resources);
    });
    this.eventBus.subscribe(EventType.GAME_LOADED, () => {
      const state = this.gameStore.getState();
      this.#render(state.resources);
    });
  }

  #buildHTML() {
    const panel = document.getElementById('resource-panel');
    if (!panel) return;
    panel.innerHTML = `
      <h3 class="resource-panel__title">📊 Recursos</h3>
      <div class="resource-panel__grid">
        <div class="resource-card" title="Dinero disponible">
          <span class="resource-icon">💰</span>
          <span class="resource-value" id="resource-money">$0</span>
          <span class="resource-label">Dinero</span>
        </div>
        <div class="resource-card" title="Electricidad (producción/consumo por turno)">
          <span class="resource-icon">⚡</span>
          <span class="resource-value" id="resource-electricity">0</span>
          <span class="resource-label">Electricidad</span>
        </div>
        <div class="resource-card" title="Agua (producción/consumo por turno)">
          <span class="resource-icon">💧</span>
          <span class="resource-value" id="resource-water">0</span>
          <span class="resource-label">Agua</span>
        </div>
        <div class="resource-card" title="Alimentos acumulados">
          <span class="resource-icon">🌾</span>
          <span class="resource-value" id="resource-food">0</span>
          <span class="resource-label">Alimentos</span>
        </div>
        <div class="resource-card" title="Total de ciudadanos">
          <span class="resource-icon">👥</span>
          <span class="resource-value" id="resource-population">0</span>
          <span class="resource-label">Población</span>
        </div>
        <div class="resource-card" title="Felicidad promedio (0-100)">
          <span class="resource-icon">😊</span>
          <span class="resource-value" id="resource-happiness">0</span>
          <span class="resource-label">Felicidad</span>
        </div>
      </div>
    `;
  }

  #render(resources, summary) {
    const state = this.gameStore.getState();
    const res = resources || state.resources;
    if (!res) return;

    // Dinero
    const moneyEl = document.getElementById('resource-money');
    if (moneyEl) {
      moneyEl.textContent = '$' + (res.money?.toLocaleString() ?? 0);
      moneyEl.classList.remove('resource--ok', 'resource--warning', 'resource--critical');
      if (res.money < 1000) moneyEl.classList.add('resource--critical');
      else if (res.money < 5000) moneyEl.classList.add('resource--warning');
      else moneyEl.classList.add('resource--ok');
      if (summary?.money) {
        moneyEl.title = 'Actual: $' + summary.money.current + '\nBalance: $' + summary.money.balance;
      }
    }

    // Electricidad
    const elecEl = document.getElementById('resource-electricity');
    if (elecEl) {
      elecEl.textContent = res.electricity ?? 0;
    }

    // Agua
    const waterEl = document.getElementById('resource-water');
    if (waterEl) {
      waterEl.textContent = res.water ?? 0;
    }

    // Comida
    const foodEl = document.getElementById('resource-food');
    if (foodEl) foodEl.textContent = res.food ?? 0;

    // Población
    const popEl = document.getElementById('resource-population');
    if (popEl) popEl.textContent = state.citizens?.length ?? 0;

    // Felicidad
    const happyEl = document.getElementById('resource-happiness');
    if (happyEl) {
      const citizens = state.citizens || [];
      const avg = citizens.length
        ? Math.round(citizens.reduce((a, c) => a + (c.happiness || 0), 0) / citizens.length)
        : 0;
      happyEl.textContent = avg + '%';
      happyEl.classList.remove('resource--ok', 'resource--warning', 'resource--critical');
      if (avg >= 70) happyEl.classList.add('resource--ok');
      else if (avg >= 40) happyEl.classList.add('resource--warning');
      else happyEl.classList.add('resource--critical');
    }
  }
}

export default ResourcePanel;