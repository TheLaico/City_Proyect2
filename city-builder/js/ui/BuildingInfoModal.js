import { EventType } from '../types/EventType.js';
import { BuildingType } from '../types/BuildingType.js';
import { BUILDING_COSTS, BUILDING_CONSUMPTION, BUILDING_PRODUCTION, BUILDING_CAPACITY, BUILDING_JOBS } from '../config/constants.js';

const BUILDING_LABELS = {
  [BuildingType.RESIDENTIAL_HOUSE]: 'Casa residencial',
  [BuildingType.RESIDENTIAL_APARTMENT]: 'Apartamento',
  [BuildingType.COMMERCIAL_SHOP]: 'Tienda comercial',
  [BuildingType.COMMERCIAL_MALL]: 'Centro comercial',
  [BuildingType.INDUSTRIAL_FACTORY]: 'Fábrica',
  [BuildingType.INDUSTRIAL_FARM]: 'Granja',
  [BuildingType.SERVICE_POLICE]: 'Comisaría',
  [BuildingType.SERVICE_FIRE]: 'Bomberos',
  [BuildingType.SERVICE_HOSPITAL]: 'Hospital',
  [BuildingType.UTILITY_POWER_PLANT]: 'Planta eléctrica',
  [BuildingType.UTILITY_WATER_PLANT]: 'Planta de agua',
  [BuildingType.PARK]: 'Parque',
  [BuildingType.ROAD]: 'Carretera',
};

class BuildingInfoModal {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.modal = document.getElementById('building-info-modal');
    this.overlay = document.querySelector('.modal-overlay');
  }

  init() {
    this.eventBus.subscribe(EventType.MAP_CELL_CLICKED, ({ x, y, mode }) => {
      if (mode !== 'view') return;
      const map = this.gameStore.getState().map;
      const building = map.getBuildingAt(x, y);
      if (building) this.#showModal(building);
    });
    document.getElementById('modal-close')?.addEventListener('click', () => this.#hideModal());
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.#hideModal();
    });
    this.modal?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-btn-demolish') {
        const bx = Number(e.target.dataset.x);
        const by = Number(e.target.dataset.y);
        this.eventBus.emit(EventType.DEMOLISH_REQUESTED, { x: bx, y: by });
        this.#hideModal();
      }
    });
  }

  #showModal(building) {
    if (!this.modal) return;
    const type = building.type;
    const label = BUILDING_LABELS[type] || type;
    const cost = BUILDING_COSTS[type] || building.getCost?.() || '-';
    const consumption = BUILDING_CONSUMPTION[type] || building.getConsumption?.() || {};
    const production = BUILDING_PRODUCTION[type] || building.getProduction?.() || {};
    let capacity = BUILDING_CAPACITY[type] || building.capacity || null;
    let jobs = BUILDING_JOBS[type] || building.jobs || null;
    let ocupacion = '';
    let felicidad = '';
    if (type === BuildingType.RESIDENTIAL_HOUSE || type === BuildingType.RESIDENTIAL_APARTMENT) {
      const occ = building.currentOccupants?.length || 0;
      ocupacion = `<div><b>Ocupación:</b> ${occ} / ${capacity} habitantes</div>`;
      if (occ > 0) {
        const avg = Math.round((building.currentOccupants.reduce((a, c) => a + (c.happiness || 0), 0)) / occ);
        felicidad = `<div><b>Felicidad promedio:</b> ${avg} / 100</div>`;
      }
    } else if (jobs) {
      ocupacion = `<div><b>Empleados:</b> ${building.currentEmployees?.length || 0} / ${jobs}</div>`;
    }
    const activo = building.active === false ? '<span class="building-inactive">Inactivo</span>' : '<span class="building-active">Activo</span>';
    this.modal.innerHTML = `
      <div class="modal__header">
        <span>${label}</span>
        <button id="modal-close" class="modal__close">&times;</button>
      </div>
      <div class="modal__body">
        <div><b>Costo construcción:</b> $${cost}</div>
        <div><b>Consumo/turno:</b> ⚡${consumption.electricity || 0} 💧${consumption.water || 0}</div>
        <div><b>Producción/turno:</b> 💵${production.money || 0} 🍞${production.food || 0} ⚡${production.electricity || 0} 💧${production.water || 0}</div>
        ${ocupacion}
        ${felicidad}
        <div><b>Estado:</b> ${activo}</div>
      </div>
      <div class="modal__footer">
        <button id="modal-btn-demolish" data-x="${building.x}" data-y="${building.y}">Demoler</button>
      </div>
    `;
    this.modal.classList.remove('modal--hidden');
    this.overlay?.classList.remove('modal--hidden');
  }

  #hideModal() {
    this.modal?.classList.add('modal--hidden');
    this.overlay?.classList.add('modal--hidden');
  }
}

export default BuildingInfoModal;
