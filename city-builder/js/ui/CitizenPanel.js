import { EventType } from '../types/EventType.js';

class CitizenPanel {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.container = document.getElementById('citizen-panel');
  }

  init() {
    this.eventBus.subscribe(EventType.CITIZENS_UPDATED, () => this.#render());
    this.eventBus.subscribe(EventType.TURN_ENDED, () => this.#render());
    this.#render();
  }

  #render() {
    if (!this.container) return;
    const citizens = this.gameStore.getState().citizens || [];
    const total        = citizens.length;
    const empleados    = citizens.filter(c => c.jobId).length;
    const desempleados = total - empleados;
    const sinHogar     = citizens.filter(c => !c.homeId).length;
    const felicidad    = total
      ? Math.round(citizens.reduce((a, c) => a + (c.happiness || 0), 0) / total)
      : 0;

    let color = '#fbbf24';
    if (felicidad < 40) color = '#ef4444';
    else if (felicidad > 80) color = '#22c55e';

    let adv = '';
    if (felicidad < 40) adv = '<span class="citizen-warning">⚠️ Felicidad muy baja</span>';
    else if (felicidad > 80) adv = '<span class="citizen-bonus">🎉 Bonificación de felicidad</span>';

    this.container.innerHTML = `
      <div class="citizen-header">
        <span class="citizen-population">👥 ${total}</span>
        ${adv}
      </div>
      <div class="citizen-happiness-bar-bg">
        <div class="citizen-happiness-bar" style="width:${felicidad}%;background:${color}"></div>
        <span class="citizen-happiness-label">${felicidad} / 100</span>
      </div>
      <div class="citizen-breakdown">
        <span>🧑‍💼 ${empleados} empleados</span> /
        <span>🧑‍🦱 ${desempleados} desempleados</span> /
        <span>🏚️ ${sinHogar} sin hogar</span>
      </div>
    `;
  }
}

export default CitizenPanel;