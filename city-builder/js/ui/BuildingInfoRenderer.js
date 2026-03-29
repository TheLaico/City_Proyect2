/**
 * BuildingInfoRenderer — SRP: única responsabilidad de
 * convertir un objeto BuildingInfo en markup HTML.
 */
class BuildingInfoRenderer {
  render(info) {
    return `
      <div class="modal__header">
        <span class="building-info-modal__icon">${info.icon}</span>
        <span class="building-info-modal__title">${info.label}</span>
        <span class="building-info-modal__status ${info.active ? 'building-active' : 'building-inactive'}">
          ${info.active ? 'Activo' : 'Inactivo'}
        </span>
        <button class="modal__close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal__body">
        <div class="building-info-modal__stats">
          ${this.#renderCosts(info)}
          ${this.#renderConsumption(info)}
          ${this.#renderProduction(info)}
          ${this.#renderCapacity(info)}
          ${this.#renderJobs(info)}
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn-demolish" id="modal-btn-demolish"
                data-x="${info.x}" data-y="${info.y}">
          🗑️ Demoler
        </button>
      </div>
    `;
  }

  #renderCosts(info) {
    return `
      <div class="building-info-modal__stat-group">
        <h4>💰 Costos</h4>
        <div class="building-info-modal__stat">
          <span class="stat-label">Costo construcción</span>
          <span class="stat-value">$${info.cost.toLocaleString()}</span>
        </div>
        <div class="building-info-modal__stat">
          <span class="stat-label">Mantenimiento/turno</span>
          <span class="stat-value">$${info.maintenance.toLocaleString()}</span>
        </div>
      </div>`;
  }

  #renderConsumption(info) {
    return `
      <div class="building-info-modal__stat-group">
        <h4>📥 Consumo/turno</h4>
        <div class="building-info-modal__stat">
          <span class="stat-label">⚡ Electricidad</span>
          <span class="stat-value">${info.consumption.electricity}</span>
        </div>
        <div class="building-info-modal__stat">
          <span class="stat-label">💧 Agua</span>
          <span class="stat-value">${info.consumption.water}</span>
        </div>
      </div>`;
  }

  #renderProduction(info) {
    return `
      <div class="building-info-modal__stat-group">
        <h4>📤 Producción/turno</h4>
        <div class="building-info-modal__stat">
          <span class="stat-label">💵 Dinero</span>
          <span class="stat-value">$${info.production.money.toLocaleString()}</span>
        </div>
        <div class="building-info-modal__stat">
          <span class="stat-label">🍞 Alimentos</span>
          <span class="stat-value">${info.production.food}</span>
        </div>
        <div class="building-info-modal__stat">
          <span class="stat-label">⚡ Electricidad</span>
          <span class="stat-value">${info.production.electricity}</span>
        </div>
        <div class="building-info-modal__stat">
          <span class="stat-label">💧 Agua</span>
          <span class="stat-value">${info.production.water}</span>
        </div>
      </div>`;
  }

  #renderCapacity(info) {
    if (info.capacity === null) return '';
    return `
      <div class="building-info-modal__stat-group">
        <h4>👥 Vivienda</h4>
        <div class="building-info-modal__stat">
          <span class="stat-label">Ocupación</span>
          <span class="stat-value">${info.occupancy} / ${info.capacity} hab.</span>
        </div>
        ${info.happinessAvg !== null ? `
        <div class="building-info-modal__stat">
          <span class="stat-label">😊 Felicidad media</span>
          <span class="stat-value">${info.happinessAvg} / 100</span>
        </div>` : ''}
      </div>`;
  }

  #renderJobs(info) {
    if (info.jobs === null) return '';
    return `
      <div class="building-info-modal__stat-group">
        <h4>💼 Empleo</h4>
        <div class="building-info-modal__stat">
          <span class="stat-label">Empleados</span>
          <span class="stat-value">${info.employees} / ${info.jobs}</span>
        </div>
      </div>`;
  }
}

export default BuildingInfoRenderer;
