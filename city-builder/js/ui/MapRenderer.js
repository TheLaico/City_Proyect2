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
  static #COLORS = {
    residential: '#81c784',
    commercial:  '#64b5f6',
    industrial:  '#ffb74d',
    service:     '#f48fb1',
    utility:     '#ce93d8',
    park:        '#a5d6a7',
    road:        '#8FA19A',
    empty:       '#5AD959',
  };

  static #meta = {
    [BuildingType.RESIDENTIAL_HOUSE]:     { code: 'R1', category: 'residential' },
    [BuildingType.RESIDENTIAL_APARTMENT]: { code: 'R2', category: 'residential' },
    [BuildingType.COMMERCIAL_SHOP]:       { code: 'C1', category: 'commercial'  },
    [BuildingType.COMMERCIAL_MALL]:       { code: 'C2', category: 'commercial'  },
    [BuildingType.INDUSTRIAL_FACTORY]:    { code: 'I1', category: 'industrial'  },
    [BuildingType.INDUSTRIAL_FARM]:       { code: 'I2', category: 'industrial'  },
    [BuildingType.SERVICE_POLICE]:        { code: 'S1', category: 'service'     },
    [BuildingType.SERVICE_FIRE]:          { code: 'S2', category: 'service'     },
    [BuildingType.SERVICE_HOSPITAL]:      { code: 'S3', category: 'service'     },
    [BuildingType.UTILITY_POWER_PLANT]:   { code: 'U1', category: 'utility'     },
    [BuildingType.UTILITY_WATER_PLANT]:   { code: 'U2', category: 'utility'     },
    [BuildingType.PARK]:                  { code: 'PK', category: 'park'        },
    road:                                 { code: '',   category: 'road'        },
  };

  static get(type) {
    const meta = this.#meta[type] ?? { code: '??', category: 'empty' };
    return { ...meta, color: this.#COLORS[meta.category] ?? this.#COLORS.empty };
  }

  static color(category) {
    return this.#COLORS[category] ?? this.#COLORS.empty;
  }
}


/** S: construye/actualiza el canvas de una celda isométrica */
class IsoCellRenderer {
  static #TW = 64;
  static #TH = 32;
  // Resolución interna alta para que el zoom CSS no pixele
  static #DPR = Math.min(window.devicePixelRatio ?? 1, 3);

  static create(x, y, content) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('iso-cell');
    wrapper.dataset.x = x;
    wrapper.dataset.y = y;

    const canvas = document.createElement('canvas');
    // Tamaño físico en px CSS (lo que ocupa en pantalla)
    canvas.style.width  = `${this.#TW}px`;
    canvas.style.height = `${this.#TH}px`;
    // Tamaño real del buffer — multiplicado por DPR para alta resolución
    canvas.width  = this.#TW  * this.#DPR;
    canvas.height = this.#TH * this.#DPR;
    canvas.classList.add('iso-canvas');
    wrapper.appendChild(canvas);

    this.#paint(canvas, content);
    return wrapper;
  }

  static update(el, content) {
    const canvas = el.querySelector('.iso-canvas');
    if (!canvas) return;
    this.#paint(canvas, content);

    // sync categoria en el wrapper para los estados de hover/route via CSS
    el.className = 'iso-cell';
    if (content) {
      const { category } = BuildingMetaProvider.get(content.type);
      el.classList.add(`iso-cell--${category}`);
    } else {
      el.classList.add('iso-cell--empty');
    }
  }

  static #paint(canvas, content) {
    const dpr = this.#DPR;
    // Coordenadas lógicas (sin DPR) — más fácil de leer
    const tw = this.#TW;
    const th = this.#TH;
    const ctx = canvas.getContext('2d');
    // Escalar el contexto una sola vez para que todo lo que dibujes
    // use coordenadas lógicas normales (64×32) pero se renderice
    // en la resolución real del buffer (tw*dpr × th*dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, tw, th);

    // Determinar color y código
    let fillColor = '#5AD959';
    let code = '';
    let category = 'empty';

    if (content) {
      const meta = BuildingMetaProvider.get(content.type);
      fillColor = meta.color;
      code      = meta.code;
      category  = meta.category;
    }

    // Dibujar rombo isométrico (diamond)
    ctx.beginPath();
    ctx.moveTo(tw / 2, 0);        // top
    ctx.lineTo(tw,     th / 2);   // right
    ctx.lineTo(tw / 2, th);       // bottom
    ctx.lineTo(0,      th / 2);   // left
    ctx.closePath();

    if (category === 'empty') {
      // ── Césped continuo sin bordes visibles ──────────
      // Color sólido idéntico en todas las celdas vacías.
      // Al no haber stroke ni variación de tono, los diamantes
      // adyacentes se fusionan visualmente en una sola superficie.
      ctx.fillStyle = '#5AD959';
      ctx.fill();
      // Sin stroke — los bordes desaparecen
    } else {
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Borde solo en celdas con edificio
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(tw / 2, 0);
      ctx.lineTo(tw,     th / 2);
      ctx.lineTo(tw / 2, th);
      ctx.lineTo(0,      th / 2);
      ctx.closePath();
      ctx.stroke();
    }

    // Etiqueta de código centrada en el rombo
    if (code) {
      ctx.font         = 'bold 7px "JetBrains Mono", monospace';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      // sombra de texto
      ctx.fillStyle    = 'rgba(0,0,0,0.75)';
      ctx.fillText(code, tw / 2 + 0.5, th / 2 + 0.5);

      ctx.fillStyle    = 'rgba(255,255,255,0.92)';
      ctx.fillText(code, tw / 2, th / 2);
    }

    // Guardar categoría en el dataset del canvas para highlight CSS
    canvas.dataset.category = category;
  }

  /** Re-pinta con brillo para hover/route — llamado externamente si hace falta */
  static repaintHighlighted(canvas, content, brightnessMultiplier = 1.4) {
    this.#paint(canvas, content);
    const ctx = canvas.getContext('2d');
    // Overlay semitransparente blanco para simular brightness
    ctx.fillStyle = `rgba(255,255,255,${(brightnessMultiplier - 1) * 0.35})`;
    const tw = this.#TW, th = this.#TH;
    ctx.beginPath();
    ctx.moveTo(tw / 2, 0);
    ctx.lineTo(tw,     th / 2);
    ctx.lineTo(tw / 2, th);
    ctx.lineTo(0,      th / 2);
    ctx.closePath();
    ctx.fill();
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