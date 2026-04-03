/**
 * S – Single Responsibility: gestiona únicamente el estado de arrastre (pan).
 * D – Dependency Inversion: depende de PanStrategy (abstracción), no de botones concretos.
 *
 * Detecta qué estrategia aplica en mousedown y maneja el estado del drag.
 */
export class PanController {
  #strategies;
  #active    = null;   // estrategia activa o null
  #startMouse = null;  // {x, y} del mousedown
  #startPan   = null;  // {x, y} del pan al inicio del drag

  /**
   * @param {import('./PanStrategy.js').PanStrategy[]} strategies
   */
  constructor(strategies) {
    this.#strategies = strategies;
  }

  /**
   * Intenta iniciar un drag con el evento dado.
   * @param {MouseEvent} e
   * @param {{ x: number, y: number }} currentPan
   * @returns {boolean} true si se inició un drag
   */
  tryStart(e, currentPan) {
    for (const s of this.#strategies) {
      if (s.shouldActivate(e)) {
        this.#active     = s;
        this.#startMouse = { x: e.clientX, y: e.clientY };
        this.#startPan   = { ...currentPan };
        return true;
      }
    }
    return false;
  }

  /**
   * Calcula la nueva posición del pan durante el drag.
   * @param {MouseEvent} e
   * @returns {{ x: number, y: number } | null}
   */
  move(e) {
    if (!this.#active) return null;
    return {
      x: this.#startPan.x + e.clientX - this.#startMouse.x,
      y: this.#startPan.y + e.clientY - this.#startMouse.y,
    };
  }

  /**
   * Finaliza el drag.
   */
  end() {
    this.#active = null;
    this.#startMouse = null;
    this.#startPan   = null;
  }

  get isDragging()    { return this.#active !== null; }
  get activeCursor()  { return this.#active?.activeCursor  ?? 'default'; }

  /**
   * Devuelve el cursor "idle" para el modo actual evaluando todas las estrategias.
   * Si alguna estrategia de LeftButton aplica en el modo actual, muestra 'grab'.
   * @param {MouseEvent | null} e - puede ser null; si es null retorna 'default'
   */
  getIdleCursor(e) {
    if (!e) return 'default';
    for (const s of this.#strategies) {
      // Una estrategia contribuye al cursor idle si su idleCursor no es 'default'
      // y al menos una condición que no sea el botón se cumple.
      if (s.idleCursor !== 'default') return s.idleCursor;
    }
    return 'default';
  }

  /**
   * Devuelve true si el movimiento fue lo suficientemente pequeño para
   * considerarse un click (no un drag real).
   *
   * @param {MouseEvent} upEvent
   * @param {number} threshold  píxeles
   */
  wasClick(upEvent, threshold = 5) {
    if (!this.#startMouse) return true;
    const dx = upEvent.clientX - this.#startMouse.x;
    const dy = upEvent.clientY - this.#startMouse.y;
    return Math.hypot(dx, dy) < threshold;
  }
}
