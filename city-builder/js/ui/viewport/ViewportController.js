import { ZoomController } from './ZoomController.js';
import { PanController }  from './PanController.js';
import { TouchHandler }   from './TouchHandler.js';
import {
  MiddleButtonPanStrategy,
  LeftButtonViewModePanStrategy,
  CtrlDragPanStrategy,
} from './PanStrategy.js';

/**
 * O – Open/Closed: estrategias de pan son inyectables sin modificar esta clase.
 * D – Dependency Inversion: orquesta abstracciones (ZoomController, PanController, TouchHandler).
 */
export class ViewportController {
  #viewport;
  #canvas;
  #pan  = { x: 0, y: 0 };

  #zoom;
  #panner;
  #touch;

  #touchPanOrigin = { x: 0, y: 0 };

  constructor(viewport, canvas, getMode = () => 'view') {
    this.#viewport = viewport;
    this.#canvas   = canvas;

    this.#zoom = new ZoomController({ min: 0.25, max: 4, initial: 1, step: 0.12 });

    this.#panner = new PanController([
      new LeftButtonViewModePanStrategy(getMode),
      new CtrlDragPanStrategy(),
      new MiddleButtonPanStrategy(),
    ]);

    this.#touch = new TouchHandler(viewport, {
      onPanStart: (_focal) => {
        this.#touchPanOrigin = { ...this.#pan };
      },
      onPanMove: (delta) => {
        this.#pan = {
          x: this.#touchPanOrigin.x + delta.x,
          y: this.#touchPanOrigin.y + delta.y,
        };
        this.#apply();
      },
      onPanEnd: () => {},
      onPinch: (ratio, focal) => {
        const rect = this.#viewport.getBoundingClientRect();
        const fp   = { x: focal.x - rect.left, y: focal.y - rect.top };
        const { newPan } = this.#zoom.applyPinch(ratio, fp, this.#pan);
        this.#pan = newPan;
        this.#apply();
      },
    });
  }

  centerMap() {
    const vw = this.#viewport.clientWidth;
    const vh = this.#viewport.clientHeight;
    const cw = this.#canvas.offsetWidth;
    const ch = this.#canvas.offsetHeight;

    const fitZoom = Math.min(vw / cw, vh / ch) * 0.85;
    const z = this.#zoom.set(fitZoom);

    this.#pan = {
      x: (vw - cw * z) / 2,
      y: (vh - ch * z) / 2,
    };
    this.#apply();
  }

  attachEvents() {
    // ── Zoom con rueda ──────────────────────────────────
    this.#viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.#viewport.getBoundingClientRect();
      const fp   = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const { newPan } = this.#zoom.applyWheel(e.deltaY, fp, this.#pan);
      this.#pan = newPan;
      this.#apply();
    }, { passive: false });

    // ── Pan con mouse ───────────────────────────────────
    this.#viewport.addEventListener('mousedown', (e) => {
      const started = this.#panner.tryStart(e, this.#pan);
      if (started) {
        e.preventDefault();
        this.#viewport.style.cursor = this.#panner.activeCursor;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.#panner.isDragging) return;
      const newPan = this.#panner.move(e);
      if (newPan) {
        this.#pan = newPan;
        this.#apply();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!this.#panner.isDragging) return;

      const wasRealDrag = !this.#panner.wasClick(e, 5);
      this.#panner.end();
      this.#updateCursor();

      if (wasRealDrag) {
        const block = (ev) => {
          ev.stopImmediatePropagation();
          ev.preventDefault();
          window.removeEventListener('click', block, true);
        };
        window.addEventListener('click', block, true);
        setTimeout(() => window.removeEventListener('click', block, true), 100);
      }
    });

    document.addEventListener('mode:changed', () => this.#updateCursor());

    // ── Tecla 0: recentrar ──────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (e.key === '0' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
        this.centerMap();
      }
    });

    // ── Touch ───────────────────────────────────────────
    this.#touch.attach();

    this.#updateCursor();
  }

  #apply() {
    const x = Math.round(this.#pan.x);
    const y = Math.round(this.#pan.y);
    this.#canvas.style.transform =
      `translate3d(${x}px, ${y}px, 0) scale(${this.#zoom.value})`;
  }

  #updateCursor() {
    if (!this.#panner.isDragging) {
      this.#viewport.style.cursor = '';
    }
  }
}