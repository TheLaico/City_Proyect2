import { EventType } from '../types/EventType.js';
import { BuildingType } from '../types/BuildingType.js';
import { ViewportController } from './viewport/ViewportController.js';
// ─── SOLID ────────────────────────────────────────
// S: cada clase una sola responsabilidad
// O: extensible sin modificar MapRenderer
// L: colaboradores intercambiables
// I: interfaces pequeñas
// D: MapRenderer depende de abstracciones
// ──────────────────────────────────────────────────


/** S: provee código corto y color por tipo de edificio */
class BuildingMetaProvider {
  static #meta = {
    [BuildingType.RESIDENTIAL_HOUSE]:      { code: 'R1', category: 'residential' },
    [BuildingType.RESIDENTIAL_APARTMENT]:  { code: 'R2', category: 'residential' },
    [BuildingType.COMMERCIAL_SHOP]:        { code: 'C1', category: 'commercial'  },
    [BuildingType.COMMERCIAL_MALL]:        { code: 'C2', category: 'commercial'  },
    [BuildingType.INDUSTRIAL_FACTORY]:     { code: 'I1', category: 'industrial'  },
    [BuildingType.INDUSTRIAL_FARM]:        { code: 'I2', category: 'industrial'  },
    [BuildingType.SERVICE_POLICE]:         { code: 'S1', category: 'service'     },
    [BuildingType.SERVICE_FIRE]:           { code: 'S2', category: 'service'     },
    [BuildingType.SERVICE_HOSPITAL]:       { code: 'S3', category: 'service'     },
    [BuildingType.UTILITY_POWER_PLANT]:    { code: 'U1', category: 'utility'     },
    [BuildingType.UTILITY_WATER_PLANT]:    { code: 'U2', category: 'utility'     },
    [BuildingType.PARK]:                   { code: 'PK', category: 'park'        },
    road:                                  { code: '',   category: 'road'        },
  };

  static get(type) {
    return this.#meta[type] ?? { code: '??', category: 'residential' };
  }
}


/** S: construye/actualiza el DOM de una celda isométrica plana */
class IsoCellRenderer {
  static create(x, y, content) {
    const el = document.createElement('div');
    el.classList.add('iso-cell');
    el.dataset.x = x;
    el.dataset.y = y;
    this.#populate(el, content);
    return el;
  }

  static update(el, content) {
    el.className = 'iso-cell';
    el.innerHTML = '';
    this.#populate(el, content);
  }

  static #populate(el, content) {
    const top = document.createElement('div');
    top.classList.add('iso-face--top');

    if (!content) {
      el.classList.add('iso-cell--empty');
    } else {
      const { code, category } = BuildingMetaProvider.get(content.type);
      el.classList.add(`iso-cell--${category}`);

      if (code) {
        const label = document.createElement('span');
        label.classList.add('iso-cell__label');
        label.textContent = code;
        el.appendChild(label);
      }
    }

    el.appendChild(top);
  }
}


/** S: gestiona highlight de rutas con cleanup */
class RouteHighlighter {
  #container;
  #timer = null;

  constructor(container) {
    this.#container = container;
  }

  highlight(path) {
    if (!Array.isArray(path)) return;
    path.forEach(({ x, y }) => this.#cell(x, y)?.classList.add('iso-cell--route'));
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      path.forEach(({ x, y }) => this.#cell(x, y)?.classList.remove('iso-cell--route'));
    }, 3000);
  }

  markOrigin(origin) {
    this.#container.querySelectorAll('.iso-cell--route-origin')
      .forEach(el => el.classList.remove('iso-cell--route-origin'));
    if (origin) this.#cell(origin.x, origin.y)?.classList.add('iso-cell--route-origin');
  }

  #cell(x, y) {
    return this.#container.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  }
}


/** S: calcula coordenadas isométricas */
class IsometricProjector {
  #tw; #th;

  constructor(tw = 64, th = 32) {
    this.#tw = tw;
    this.#th = th;
  }

  project(x, y, mapW, mapH) {
    const offsetX = (mapW + mapH) * this.#tw / 2 / 2 - this.#tw / 2;
    return {
      left: (x - y) * this.#tw / 2 + offsetX,
      top:  (x + y) * this.#th / 2,
    };
  }

  canvasSize(mapW, mapH) {
    return {
      width:  (mapW + mapH) * this.#tw / 2 + this.#tw,
      height: (mapW + mapH) * this.#th / 2 + this.#th,
    };
  }
}


/** D: orquesta eventos y delega a colaboradores */
class MapRenderer {
  #gameStore; #eventBus;
  #container  = null;
  #viewport   = null;
  #highlighter = null;
  #projector  = new IsometricProjector(64, 32);

  constructor(gameStore, eventBus) {
    this.#gameStore = gameStore;
    this.#eventBus  = eventBus;
  }

  init() {
    this.#container = document.getElementById('map-grid');
    this.#viewport  = document.getElementById('map-container');
    if (!this.#container || !this.#viewport) return;

    this.#container.classList.add('iso-grid');
    this.#viewport.style.overflow = 'hidden';
    this.#viewport.style.position = 'relative';
    this.#container.style.transformOrigin = '0 0';
    this.#container.style.willChange = 'transform';

    this.#highlighter = new RouteHighlighter(this.#container);
    const getMode = () => this.#gameStore.getState().mode ?? 'view';
    const vc = new ViewportController(this.#viewport, this.#container, getMode);
    vc.attachEvents();

    const render = () => { this.#renderFullMap(); vc.centerMap(); };

    this.#eventBus.subscribe(EventType.GAME_STARTED, render);
    this.#eventBus.subscribe(EventType.GAME_LOADED,  render);
    this.#eventBus.subscribe(EventType.BUILD_SUCCESS,    ({ building }) => this.#updateCell(building.x, building.y, building));
    this.#eventBus.subscribe(EventType.DEMOLISH_SUCCESS, ({ x, y })     => this.#updateCell(x, y, null));
    this.#eventBus.subscribe(EventType.ROUTE_CALCULATED, ({ path })      => this.#highlighter.highlight(path));
    this.#eventBus.subscribe(EventType.ROUTE_PENDING,    ({ origin })    => this.#highlighter.markOrigin(origin));

    const { map } = this.#gameStore.getState();
    if (map) render();
  }

  #renderFullMap() {
    const { map } = this.#gameStore.getState();
    if (!map || !this.#container) return;

    this.#container.innerHTML = '';
    const { width, height } = this.#projector.canvasSize(map.width, map.height);
    Object.assign(this.#container.style, {
      width: `${width}px`, height: `${height}px`, position: 'relative',
    });

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const cell = IsoCellRenderer.create(x, y, map.getCell(x, y));
        const pos  = this.#projector.project(x, y, map.width, map.height);
        cell.style.left   = `${pos.left}px`;
        cell.style.top    = `${pos.top}px`;
        cell.style.zIndex = x + y;
        this.#container.appendChild(cell);
      }
    }
  }

  #updateCell(x, y, content) {
    const el = this.#container?.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (el) IsoCellRenderer.update(el, content);
  }
}

export default MapRenderer;