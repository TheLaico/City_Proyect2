import { EventType } from '../types/EventType.js';
import { BuildingType } from '../types/BuildingType.js';

class MapRenderer {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.mapGrid = null;
    this.routeTimeout = null;
  }

  init() {
    this.mapGrid = document.getElementById('map-grid');
    if (!this.mapGrid) return;

    this.eventBus.subscribe(EventType.GAME_STARTED, () => this.#renderFullMap());
    this.eventBus.subscribe(EventType.GAME_LOADED,  () => this.#renderFullMap());

    this.eventBus.subscribe(EventType.BUILD_SUCCESS, ({ building }) => {
      this.#updateCell(building.x, building.y, building);
    });
    this.eventBus.subscribe(EventType.DEMOLISH_SUCCESS, ({ x, y }) => {
      this.#updateCell(x, y, null);
    });
    this.eventBus.subscribe(EventType.ROUTE_CALCULATED, ({ path }) => {
      this.#highlightRoute(path);
    });

    // Render inmediato si el mapa ya está cargado en el store (ej: recarga de página)
    const state = this.gameStore.getState();
    if (state.map) {
      this.#renderFullMap();
    }
  }

  #renderFullMap() {
    const state = this.gameStore.getState();
    const map = state.map;

    if (!map || !this.mapGrid) {
      console.warn('[MapRenderer] No hay mapa en el store o #map-grid no existe', { map, grid: this.mapGrid });
      return;
    }

    console.log(`[MapRenderer] Renderizando mapa ${map.width}x${map.height}`);
    this.mapGrid.innerHTML = '';
    this.mapGrid.style.gridTemplateColumns = `repeat(${map.width}, var(--cell-size))`;
    this.mapGrid.style.width = `${map.width * 40}px`;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const cell = map.getCell(x, y);
        const div = document.createElement('div');
        div.classList.add('map-cell');
        div.setAttribute('data-x', x);
        div.setAttribute('data-y', y);
        if (!cell) {
          div.classList.add('map-cell--empty');
        } else if (cell.type === BuildingType.ROAD) {
          div.classList.add('map-cell--road');
          div.textContent = '🛣️';
          div.title = 'Vía';
        } else {
          div.classList.add('map-cell--building');
          div.textContent = this.#getIconForType(cell.type);
          div.title = cell.type;
        }
        this.mapGrid.appendChild(div);
      }
    }
  }

  #updateCell(x, y, content) {
    if (!this.mapGrid) return;
    const cellDiv = this.mapGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cellDiv) return;
    cellDiv.className = 'map-cell';
    if (!content) {
      cellDiv.classList.add('map-cell--empty');
      cellDiv.textContent = '';
      cellDiv.title = '';
    } else if (content.type === BuildingType.ROAD) {
      cellDiv.classList.add('map-cell--road');
      cellDiv.textContent = '🛣️';
      cellDiv.title = 'Vía';
    } else {
      cellDiv.classList.add('map-cell--building');
      cellDiv.textContent = this.#getIconForType(content.type);
      cellDiv.title = content.type;
    }
  }

  #highlightRoute(path) {
    if (!this.mapGrid || !Array.isArray(path)) return;
    path.forEach(({ x, y }) => {
      const cellDiv = this.mapGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (cellDiv) cellDiv.classList.add('map-cell--route');
    });
    clearTimeout(this.routeTimeout);
    this.routeTimeout = setTimeout(() => {
      path.forEach(({ x, y }) => {
        const cellDiv = this.mapGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (cellDiv) cellDiv.classList.remove('map-cell--route');
      });
    }, 3000);
  }

  #getIconForType(type) {
    // Puedes personalizar los íconos/emoji por tipo aquí
    switch (type) {
      case BuildingType.RESIDENTIAL_HOUSE: return '🏠';
      case BuildingType.RESIDENTIAL_APARTMENT: return '🏢';
      case BuildingType.COMMERCIAL_SHOP: return '🏪';
      case BuildingType.COMMERCIAL_MALL: return '🏬';
      case BuildingType.INDUSTRIAL_FACTORY: return '🏭';
      case BuildingType.INDUSTRIAL_FARM: return '🌾';
      case BuildingType.SERVICE_POLICE: return '🚓';
      case BuildingType.SERVICE_FIRE: return '🚒';
      case BuildingType.SERVICE_HOSPITAL: return '🏥';
      case BuildingType.UTILITY_POWER_PLANT: return '⚡';
      case BuildingType.UTILITY_WATER_PLANT: return '💧';
      case BuildingType.PARK: return '🌳';
      default: return '🏢';
    }
  }
}

export default MapRenderer;