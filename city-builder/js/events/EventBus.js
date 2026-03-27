// Sistema de eventos para comunicar módulos sin acoplarlos (ej: "cambio_turno")
class EventBus {
  #listeners = new Map();

  subscribe(eventType, callback) {
    if (!this.#listeners.has(eventType)) {
      this.#listeners.set(eventType, new Set());
    }
    this.#listeners.get(eventType).add(callback);
    // Cleanup function
    return () => this.unsubscribe(eventType, callback);
  }

  unsubscribe(eventType, callback) {
    const set = this.#listeners.get(eventType);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.#listeners.delete(eventType);
      }
    }
  }

  emit(eventType, payload) {
    const set = this.#listeners.get(eventType);
    if (set) {
      for (const cb of set) {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[EventBus] Error in callback for event '${eventType}':`, err);
        }
      }
    }
  }

  clear(eventType) {
    this.#listeners.delete(eventType);
  }

  clearAll() {
    this.#listeners.clear();
  }
}

export default EventBus;