class Resource {
  constructor({ type, amount = 0 } = {}) {
    this.type   = type;
    this.amount = amount;
  }

  add(value)      { this.amount += value; }
  subtract(value) { this.amount -= value; }
  set(value)      { this.amount = value; }

  isNegative()    { return this.amount < 0; }
  isZero()        { return this.amount === 0; }

  toJSON() {
    return { type: this.type, amount: this.amount };
  }

  static fromJSON(data) {
    return new Resource(data);
  }
}

export default Resource;
