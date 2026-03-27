import { EventType } from '../types/EventType.js';
import { BuildingType } from '../types/BuildingType.js';

class InputController {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.routeSelection = { origin: null };
  }

  init() {
    // Click en celdas del mapa
    const mapGrid = document.getElementById('map-grid');
    if (mapGrid) {
      mapGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('[data-x][data-y]');
        if (!cell) return;
        const x = parseInt(cell.getAttribute('data-x'), 10);
        const y = parseInt(cell.getAttribute('data-y'), 10);
        this.eventBus.emit(EventType.MAP_CELL_CLICKED, { x, y });
        const mode = this.gameStore.getState().mode;
        if (mode === 'build') {
          this.eventBus.emit(EventType.BUILD_REQUESTED, {
            x, y, buildingType: this.gameStore.getState().selectedBuildingType
          });
        } else if (mode === 'demolish') {
          this.eventBus.emit(EventType.DEMOLISH_REQUESTED, { x, y });
        } else if (mode === 'route') {
          if (!this.routeSelection.origin) {
            this.routeSelection.origin = { x, y };
          } else {
            this.eventBus.emit(EventType.ROUTE_CALCULATED, {
              from: this.routeSelection.origin, to: { x, y }
            });
            this.routeSelection.origin = null;
          }
        } else if (mode === 'view') {
          // Mostrar info del edificio si hay uno en la celda
          this.eventBus.emit(EventType.BUILDING_SELECTED, { x, y });
        }
      });
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      switch (e.key.toLowerCase()) {
        case 'b':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'build' });
          break;
        case 'r':
          this.eventBus.emit(EventType.BUILDING_SELECTED, { buildingType: BuildingType.ROAD });
          break;
        case 'd':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'demolish' });
          break;
        case 'escape':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'view' });
          break;
        case ' ':
          this.eventBus.emit('turn:toggle_pause');
          break;
        case 's':
          this.eventBus.emit(EventType.SAVE_REQUESTED);
          break;
      }
    });
  }
}

export default InputController;
