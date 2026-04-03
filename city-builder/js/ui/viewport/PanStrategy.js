/**
 * S – Single Responsibility: define la interfaz de una estrategia de paneo.
 * I – Interface Segregation: interfaz mínima que los consumidores necesitan.
 *
 * Clase base abstracta para estrategias de arrastre (pan).
 */
export class PanStrategy {
  /** @param {MouseEvent} e @returns {boolean} */
  // eslint-disable-next-line no-unused-vars
  shouldActivate(e) { return false; }

  /** Cursor CSS mientras se arrastra */
  get activeCursor() { return 'grabbing'; }

  /** Cursor CSS cuando está lista pero no arrastrando */
  get idleCursor() { return 'grab'; }
}

/**
 * Paneo con botón central (rueda presionada) — siempre disponible.
 */
export class MiddleButtonPanStrategy extends PanStrategy {
  shouldActivate(e) { return e.button === 1; }
  get idleCursor()   { return 'default'; }
}

/**
 * Paneo con botón izquierdo — solo en modo 'view'.
 * Recibe un getter de modo para respetar el estado del juego.
 */
export class LeftButtonViewModePanStrategy extends PanStrategy {
  /** @param {() => string} getModeCallback */
  constructor(getModeCallback) {
    super();
    this._getMode = getModeCallback;
  }

  shouldActivate(e) {
    return e.button === 0 && this._getMode() === 'view';
  }
}

/**
 * Paneo con Ctrl + botón izquierdo — disponible en cualquier modo.
 */
export class CtrlDragPanStrategy extends PanStrategy {
  shouldActivate(e) { return e.button === 0 && e.ctrlKey; }
  get idleCursor()   { return 'default'; }
}
