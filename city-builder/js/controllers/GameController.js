import ResourceService from '../services/ResourceService.js';
import CitizenService from '../services/CitizenService.js';
import ScoreService from '../services/ScoreService.js';
import TurnService from '../services/TurnService.js';
import BuildingService from '../services/BuildingService.js';
import SaveService from '../services/SaveService.js';
import { EventType } from '../types/EventType.js';

class GameController {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  init() {
    this.resourceService = new ResourceService(this.gameStore, this.eventBus);
    this.citizenService = new CitizenService(this.gameStore, this.eventBus);
    this.scoreService = new ScoreService(this.gameStore, this.eventBus);
    this.turnService = new TurnService(
      this.gameStore,
      this.eventBus,
      this.resourceService,
      this.citizenService,
      this.scoreService
    );
    this.buildingService = new BuildingService(this.gameStore, this.eventBus, this.citizenService);
    this.saveService = new SaveService(this.gameStore, this.eventBus);

    this.eventBus.subscribe(EventType.GAME_LOAD_REQUESTED, () => {
      this.saveService.loadGame();
    });
    const startTurnsIfInGame = () => {
      if (!window.location.pathname.includes('setup.html')) {
        this.turnService.stop(); // evitar doble intervalo
        this.turnService.start();
      }
    };
    this.eventBus.subscribe(EventType.GAME_STARTED, startTurnsIfInGame);
    this.eventBus.subscribe(EventType.GAME_LOADED,  startTurnsIfInGame);

    // Guardar inmediatamente después de construir o demoler
    this.eventBus.subscribe(EventType.BUILD_SUCCESS, () => {
      this.saveService.saveGame();
    });
    this.eventBus.subscribe(EventType.DEMOLISH_SUCCESS, () => {
      this.saveService.saveGame();
    });
    this.eventBus.subscribe(EventType.SAVE_REQUESTED, () => {
      this.saveService.saveGame();
    });
    this.eventBus.subscribe(EventType.GAME_OVER, () => {
      this.turnService.stop();
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '¡Fin del juego! Has perdido.' });
    });
  }
}

export default GameController;