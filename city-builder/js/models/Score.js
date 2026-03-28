class Score {
  constructor({ current = 0, breakdown = {} } = {}) {
    this.current = current;
    this.breakdown = {
      population:  breakdown.population  ?? 0,
      happiness:   breakdown.happiness   ?? 0,
      buildings:   breakdown.buildings   ?? 0,
      resources:   breakdown.resources   ?? 0,
      bonuses:     breakdown.bonuses     ?? 0,
      penalties:   breakdown.penalties   ?? 0,
    };
  }

  update(newCurrent, newBreakdown) {
    this.current   = newCurrent;
    this.breakdown = { ...this.breakdown, ...newBreakdown };
  }

  toJSON() {
    return { current: this.current, breakdown: { ...this.breakdown } };
  }

  static fromJSON(data) {
    return new Score(data);
  }
}

export default Score;
