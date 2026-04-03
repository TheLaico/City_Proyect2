/**
 * S – Single Responsibility: gestiona únicamente el zoom del viewport.
 * O – Open/Closed: se puede extender sin modificar (min/max configurables).
 */
export class ZoomController {
  #zoom;
  #minZoom;
  #maxZoom;
  #step;

  /**
   * @param {{ min?: number, max?: number, initial?: number, step?: number }} opts
   */
  constructor({ min = 0.25, max = 4, initial = 1, step = 0.1 } = {}) {
    this.#minZoom = min;
    this.#maxZoom = max;
    this.#zoom    = initial;
    this.#step    = step;
  }

  get value() { return this.#zoom; }

  /**
   * Aplica zoom centrado en un punto del viewport.
   * Devuelve el delta de traslación necesario para mantener el punto fijo.
   *
   * @param {number} delta   - deltaY del evento wheel (negativo = acercar)
   * @param {{ x: number, y: number }} focalPoint - coordenadas en el viewport
   * @param {{ x: number, y: number }} currentPan - traslación actual
   * @returns {{ newPan: {x:number,y:number}, newZoom: number }}
   */
  applyWheel(delta, focalPoint, currentPan) {
    const factor = delta < 0 ? (1 + this.#step) : (1 - this.#step);
    const newZoom = Math.min(this.#maxZoom, Math.max(this.#minZoom, this.#zoom * factor));
    const ratio   = newZoom / this.#zoom;
    this.#zoom = newZoom;

    return {
      newZoom,
      newPan: {
        x: focalPoint.x - (focalPoint.x - currentPan.x) * ratio,
        y: focalPoint.y - (focalPoint.y - currentPan.y) * ratio,
      },
    };
  }

  /**
   * Aplica zoom con pinch (touch). Internamente igual a applyWheel
   * pero recibe la razón directamente en vez de deltaY.
   */
  applyPinch(ratio, focalPoint, currentPan) {
    const newZoom = Math.min(this.#maxZoom, Math.max(this.#minZoom, this.#zoom * ratio));
    const r       = newZoom / this.#zoom;
    this.#zoom = newZoom;

    return {
      newZoom,
      newPan: {
        x: focalPoint.x - (focalPoint.x - currentPan.x) * r,
        y: focalPoint.y - (focalPoint.y - currentPan.y) * r,
      },
    };
  }

  /**
   * Fuerza un valor de zoom (sin focal point, útil para centerMap).
   */
  set(value) {
    this.#zoom = Math.min(this.#maxZoom, Math.max(this.#minZoom, value));
    return this.#zoom;
  }

  clamp(value) {
    return Math.min(this.#maxZoom, Math.max(this.#minZoom, value));
  }
}
