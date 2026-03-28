/**
 * Citizen — SRP: representa únicamente los datos de un ciudadano virtual.
 * No contiene lógica de negocio (esa pertenece a CitizenService).
 */
class Citizen {
  constructor({ id, homeId = null, jobId = null, happiness = 50 } = {}) {
    this.id        = id ?? (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    this.homeId    = homeId;
    this.jobId     = jobId;
    this.happiness = Math.max(0, Math.min(100, happiness));
  }

  get isHoused()   { return this.homeId !== null; }
  get isEmployed() { return this.jobId  !== null; }

  clampHappiness() {
    this.happiness = Math.max(0, Math.min(100, this.happiness));
  }

  toJSON() {
    return {
      id:        this.id,
      homeId:    this.homeId,
      jobId:     this.jobId,
      happiness: this.happiness
    };
  }

  static fromJSON(data) {
    return new Citizen({
      id:        data.id,
      homeId:    data.homeId    ?? null,
      jobId:     data.jobId     ?? null,
      happiness: data.happiness ?? 50
    });
  }
}

export default Citizen;