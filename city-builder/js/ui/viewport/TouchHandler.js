/**
 * S – Single Responsibility: maneja exclusivamente eventos táctiles (pan + pinch).
 *
 * Emite eventos personalizados para que ViewportController los procese
 * sin acoplarse a la lógica táctil.
 */
export class TouchHandler {
  #el;
  #lastDist   = 0;
  #startTouch = null;
  #startPan   = null;
  #onPanStart;
  #onPanMove;
  #onPanEnd;
  #onPinch;

  /**
   * @param {HTMLElement} el
   * @param {{
   *   onPanStart: (currentPan:{x,y}) => void,
   *   onPanMove:  (delta:{x,y})      => void,
   *   onPanEnd:   ()                 => void,
   *   onPinch:    (ratio:number, focal:{x,y}) => void,
   * }} callbacks
   */
  constructor(el, { onPanStart, onPanMove, onPanEnd, onPinch }) {
    this.#el         = el;
    this.#onPanStart = onPanStart;
    this.#onPanMove  = onPanMove;
    this.#onPanEnd   = onPanEnd;
    this.#onPinch    = onPinch;
  }

  attach() {
    this.#el.addEventListener('touchstart', this.#handleStart, { passive: false });
    this.#el.addEventListener('touchmove',  this.#handleMove,  { passive: false });
    this.#el.addEventListener('touchend',   this.#handleEnd,   { passive: true  });
    this.#el.addEventListener('touchcancel',this.#handleEnd,   { passive: true  });
  }

  detach() {
    this.#el.removeEventListener('touchstart', this.#handleStart);
    this.#el.removeEventListener('touchmove',  this.#handleMove);
    this.#el.removeEventListener('touchend',   this.#handleEnd);
    this.#el.removeEventListener('touchcancel',this.#handleEnd);
  }

  #handleStart = (e) => {
    if (e.touches.length === 1) {
      this.#startTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.#onPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      this.#lastDist = this.#dist(e.touches);
    }
  };

  #handleMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && this.#startTouch) {
      this.#onPanMove({
        x: e.touches[0].clientX - this.#startTouch.x,
        y: e.touches[0].clientY - this.#startTouch.y,
      });
    } else if (e.touches.length === 2) {
      const d     = this.#dist(e.touches);
      const ratio = d / this.#lastDist;
      const focal = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      this.#lastDist = d;
      this.#onPinch(ratio, focal);
    }
  };

  #handleEnd = (e) => {
    if (e.touches.length < 1) {
      this.#startTouch = null;
      this.#onPanEnd();
    }
  };

  #dist([t0, t1]) {
    return Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
  }
}
