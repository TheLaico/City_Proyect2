import { EventType } from '../types/EventType.js';
import BuildingInfoService from '../services/BuildingInfoService.js';
import BuildingInfoRenderer from './BuildingInfoRenderer.js';

/**
 * BuildingInfoModal — SRP: gestiona únicamente el ciclo de vida
 * del modal (mostrar, ocultar, escuchar eventos, attachar listeners).
 */
class BuildingInfoModal {
  #modal;
  #overlay;
  #infoService;
  #renderer;

  constructor(gameStore, eventBus) {
    this.gameStore    = gameStore;
    this.eventBus     = eventBus;
    this.#infoService = new BuildingInfoService();
    this.#renderer    = new BuildingInfoRenderer();
  }

  init() {
    this.#modal   = document.getElementById('building-info-modal');
    this.#overlay = document.getElementById('modal-overlay');

    this.eventBus.subscribe(EventType.BUILDING_INFO_REQUESTED, ({ x, y }) => {
      const map      = this.gameStore.getState().map;
      const building = map?.getCell(x, y);
      if (building) {
        const info = this.#infoService.getBuildingInfo(building);
        this.#modal.innerHTML = this.#renderer.render(info);
        this.#attachListeners(info);
        this.#show();
      }
    });

    this.eventBus.subscribe(EventType.DEMOLISH_SUCCESS, () => this.#hide());
    this.#overlay?.addEventListener('click', () => this.#hide());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.#hide();
    });
  }

  #attachListeners(info) {
    this.#modal.querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.#hide());

    this.#modal.querySelector('#modal-btn-demolish')
      ?.addEventListener('click', () => {
        this.eventBus.emit(EventType.DEMOLISH_REQUESTED, { x: info.x, y: info.y });
      });
  }

  #show() {
    this.#modal?.classList.remove('modal--hidden');
    this.#overlay?.classList.remove('modal--hidden');
  }

  #hide() {
    this.#modal?.classList.add('modal--hidden');
    this.#overlay?.classList.add('modal--hidden');
  }
}

export default BuildingInfoModal;
