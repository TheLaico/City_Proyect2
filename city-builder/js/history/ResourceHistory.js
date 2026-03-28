// Guarda histórico de recursos por turnos (para gráficas)
const MAX_HISTORY = 20;

class ResourceHistory {
  #entries = [];

  addEntry(turn, resources) {
    this.#entries.push({
      turn,
      money:       resources.money       ?? 0,
      electricity: resources.electricity ?? 0,
      water:       resources.water       ?? 0,
      food:        resources.food        ?? 0,
    });
    if (this.#entries.length > MAX_HISTORY) {
      this.#entries.shift();
    }
  }

  getHistory() {
    return [...this.#entries];
  }

  clear() {
    this.#entries = [];
  }

  toJSON() {
    return [...this.#entries];
  }

  static fromJSON(arr) {
    const rh = new ResourceHistory();
    if (Array.isArray(arr)) {
      arr.slice(-MAX_HISTORY).forEach(e => rh.#entries.push(e));
    }
    return rh;
  }
}

export default ResourceHistory;