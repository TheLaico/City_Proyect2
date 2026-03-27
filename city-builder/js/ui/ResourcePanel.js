import { EventType } from '../types/EventType.js';

class ResourcePanel {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  init() {
    this.eventBus.subscribe(EventType.RESOURCES_UPDATED, ({ resources, summary }) => {
      this.#render(resources, summary);
    });
    this.eventBus.subscribe(EventType.TURN_ENDED, () => {
      const state = this.gameStore.getState();
      this.#render(state.resources);
    });
  }

  #render(resources, summary) {
    const state = this.gameStore.getState();
    const res = resources || state.resources;
    // Dinero
    const moneyEl = document.getElementById('resource-money');
    if (moneyEl) {
      moneyEl.textContent = `$${res.money}`;
      moneyEl.classList.remove('resource--ok', 'resource--warning', 'resource--critical');
      if (res.money < 1000) {
        moneyEl.classList.add('resource--critical');
      } else if (res.money < 5000) {
        moneyEl.classList.add('resource--warning');
      } else {
        moneyEl.classList.add('resource--ok');
      }
      if (summary && summary.money) {
        moneyEl.title = `Actual: $${summary.money.current}\nBalance: $${summary.money.balance}`;
      }
    }
    // Electricidad
    const elecEl = document.getElementById('resource-electricity');
    if (elecEl) {
      let prod = summary?.electricity?.productionPerTurn ?? '';
      let cons = summary?.electricity?.consumptionPerTurn ?? '';
      elecEl.textContent = prod && cons ? `${res.electricity} (${prod}/${cons})` : res.electricity;
      if (summary && summary.electricity) {
        elecEl.title = `Actual: ${summary.electricity.current}\nProducción: ${prod}\nConsumo: ${cons}\nBalance: ${summary.electricity.balance}`;
      }
    }
    // Agua
    const waterEl = document.getElementById('resource-water');
    if (waterEl) {
      let prod = summary?.water?.productionPerTurn ?? '';
      let cons = summary?.water?.consumptionPerTurn ?? '';
      waterEl.textContent = prod && cons ? `${res.water} (${prod}/${cons})` : res.water;
      if (summary && summary.water) {
        waterEl.title = `Actual: ${summary.water.current}\nProducción: ${prod}\nConsumo: ${cons}\nBalance: ${summary.water.balance}`;
      }
    }
    // Comida
    const foodEl = document.getElementById('resource-food');
    if (foodEl) {
      foodEl.textContent = res.food;
      if (summary && summary.food) {
        foodEl.title = `Actual: ${summary.food.current}\nProducción: ${summary.food.productionPerTurn}\nBalance: ${summary.food.balance}`;
      }
    }
    // Población
    const popEl = document.getElementById('resource-population');
    if (popEl) {
      popEl.textContent = state.citizens?.length ?? 0;
    }
    // Felicidad
    const happyEl = document.getElementById('resource-happiness');
    if (happyEl) {
      const citizens = state.citizens || [];
      const avg = citizens.length ? Math.round(citizens.reduce((a, c) => a + (c.happiness || 0), 0) / citizens.length) : 0;
      happyEl.textContent = avg;
    }
  }
}

export default ResourcePanel;
