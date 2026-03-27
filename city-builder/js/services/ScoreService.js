import { EventType } from '../types/EventType.js';

class ScoreService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  calculateScore() {
    const state = this.gameStore.getState();
    const citizens = state.citizens || [];
    const population = citizens.length;
    const avgHappiness = population
      ? citizens.reduce((sum, c) => sum + (c.happiness || 0), 0) / population
      : 0;
    const money = state.resources.money;
    const electricity = state.resources.electricity;
    const water = state.resources.water;
    const food = state.resources.food;
    const buildings = state.buildings || [];
    const numBuildings = buildings.length;
    const employed = citizens.filter(c => c.jobId).length;
    const unemployed = population - employed;
    const balanceElectricity = electricity;
    const balanceWater = water;

    // Base score
    let score = (population * 10)
      + (avgHappiness * 5)
      + (money / 100)
      + (numBuildings * 50)
      + (balanceElectricity * 2)
      + (balanceWater * 2);

    const bonuses = [];
    const penalties = [];
    // Bonificaciones
    if (unemployed === 0 && population > 0) {
      score += 500;
      bonuses.push({ label: 'Todos empleados', value: 500 });
    }
    if (avgHappiness > 80) {
      score += 300;
      bonuses.push({ label: 'Felicidad > 80', value: 300 });
    }
    if (money > 0 && electricity > 0 && water > 0 && food > 0) {
      score += 200;
      bonuses.push({ label: 'Todos los recursos positivos', value: 200 });
    }
    if (population > 1000) {
      score += 1000;
      bonuses.push({ label: 'Población > 1,000', value: 1000 });
    }
    // Penalizaciones
    if (money < 0) {
      score -= 500;
      penalties.push({ label: 'Dinero negativo', value: -500 });
    }
    if (electricity < 0) {
      score -= 300;
      penalties.push({ label: 'Electricidad negativa', value: -300 });
    }
    if (water < 0) {
      score -= 300;
      penalties.push({ label: 'Agua negativa', value: -300 });
    }
    if (avgHappiness < 40) {
      score -= 400;
      penalties.push({ label: 'Felicidad < 40', value: -400 });
    }
    if (unemployed > 0) {
      score -= unemployed * 10;
      penalties.push({ label: 'Ciudadanos desempleados', value: -unemployed * 10 });
    }

    score = Math.round(score);
    this.gameStore.setState({ score });
    const breakdown = {
      base: {
        population: population * 10,
        avgHappiness: avgHappiness * 5,
        money: money / 100,
        numBuildings: numBuildings * 50,
        balanceElectricity: balanceElectricity * 2,
        balanceWater: balanceWater * 2
      },
      bonuses,
      penalties
    };
    this.eventBus.emit(EventType.SCORE_UPDATED, { score, breakdown });
  }
}

export default ScoreService;
