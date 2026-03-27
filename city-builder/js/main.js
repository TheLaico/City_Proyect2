import GameStore from './store/GameStore.js';
import EventBus from './events/EventBus.js';
import GameController from './controllers/GameController.js';
import BuildController from './controllers/BuildController.js';
import InputController from './controllers/InputController.js';
import MapRenderer from './ui/MapRenderer.js';
import ResourcePanel from './ui/ResourcePanel.js';
import BuildMenu from './ui/BuildMenu.js';
import NotificationManager from './ui/NotificationManager.js';
import SetupScreen from './ui/SetupScreen.js';
import SetupController from './controllers/SetupController.js';
import { EventType } from './types/EventType.js';

// 1. Instancias singleton
const gameStore = new GameStore();
const eventBus = new EventBus();

// 2. Controllers y servicios principales
const gameController = new GameController(gameStore, eventBus);
gameController.init();

const buildController = new BuildController(gameStore, eventBus, gameController.buildingService);
buildController.init();

const inputController = new InputController(gameStore, eventBus);
inputController.init();

// 3. UI (después de controllers/servicios)
const mapRenderer = new MapRenderer(gameStore, eventBus);
mapRenderer.init();

const resourcePanel = new ResourcePanel(gameStore, eventBus);
resourcePanel.init();

const buildMenu = new BuildMenu(gameStore, eventBus);
buildMenu.init();

const notificationManager = new NotificationManager(eventBus);
notificationManager.init();

const setupScreen = new SetupScreen(gameStore, eventBus);
setupScreen.init();

const setupController = new SetupController(gameStore, eventBus);
setupController.init();

// 4. Detectar partida guardada y emitir evento correspondiente
if (localStorage.getItem('city_builder_save')) {
  eventBus.emit(EventType.GAME_LOAD_REQUESTED);
} else {
  eventBus.emit(EventType.SETUP_REQUESTED);
}

export { gameStore, eventBus };