class Logger {
  static #isDebug() {
    return localStorage.getItem('debug_mode') === 'true';
  }

  static #format(module, message) {
    const turn = window?.gameStore?.getState?.().turn;
    const turnStr = typeof turn === 'number' ? `[TURN-${turn}]` : '';
    return `${turnStr}[${module}] ${message}`;
  }

  static debug(module, message, data) {
    if (Logger.#isDebug()) {
      const msg = Logger.#format(module, message);
      if (data !== undefined) {
        console.debug(msg, data);
      } else {
        console.debug(msg);
      }
    }
  }

  static info(module, message, data) {
    const msg = Logger.#format(module, message);
    if (data !== undefined) {
      console.info(msg, data);
    } else {
      console.info(msg);
    }
  }

  static warn(module, message, data) {
    const msg = Logger.#format(module, message);
    if (data !== undefined) {
      console.warn(msg, data);
    } else {
      console.warn(msg);
    }
  }

  static error(module, message, data) {
    const msg = Logger.#format(module, message);
    if (data !== undefined) {
      console.error(msg, data);
    } else {
      console.error(msg);
    }
  }
}

export default Logger;
