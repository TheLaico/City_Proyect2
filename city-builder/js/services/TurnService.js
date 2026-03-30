import { EventType } from '../types/EventType.js';

class TurnService {
  #intervalId = null;
  #turnDurationMs = 10000;
  #paused = false;

  constructor(gameStore, eventBus, resourceService, citizenService, scoreService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.resourceService = resourceService;
    this.citizenService = citizenService;
    this.scoreService = scoreService;
    this.eventBus.subscribe(EventType.TURN_DURATION_CHANGED, ({ seconds }) => {
      this.setTurnDuration(seconds);
    });
  }

  start(turnDurationSeconds = 10) {
    this.setTurnDuration(turnDurationSeconds);
    this.stop();
    this.#paused = false;
    this.#intervalId = setInterval(() => this.#executeTurn(), this.#turnDurationMs);
    this.eventBus.emit(EventType.TURN_STARTED, { turn: this.gameStore.getState().turn });
  }

  stop() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  pause() {
    this.#paused = true;
  }

  resume() {
    this.#paused = false;
  }

  setTurnDuration(seconds) {
    this.#turnDurationMs = seconds * 1000;
    if (this.#intervalId) {
      this.stop();
      this.start(seconds);
    }
  }

  #executeTurn() {
    if (this.#paused) return;
    // No ejecutar si no hay juego activo
    const state = this.gameStore.getState();
    if (!state.city || !state.map) return;

    this.gameStore.setState({ turn: state.turn + 1 });
    const turn = this.gameStore.getState().turn;
    this.eventBus.emit(EventType.TURN_STARTED, { turn });
    this.resourceService.calculateTurnResources();
    this.citizenService.processTurn();
    this.scoreService.calculateScore();
    this.eventBus.emit(EventType.TURN_ENDED, { turn });
    this.eventBus.emit(EventType.SAVE_REQUESTED);
  }
}

export default TurnService;