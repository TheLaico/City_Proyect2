import GameStore from './store/GameStore.js';
import EventBus from './events/EventBus.js';
import ColombiaAPI from './api/ColombiaAPI.js';
import WeatherAPI from './api/WeatherAPI.js';
import NewsAPI from './api/NewsAPI.js';
import ResourceHistory from './history/ResourceHistory.js';
import GameController from './controllers/GameController.js';
import BuildController from './controllers/BuildController.js';
import InputController from './controllers/InputController.js';
import SetupController from './controllers/SetupController.js';
import MapRenderer from './ui/MapRenderer.js';
import ResourcePanel from './ui/ResourcePanel.js';
import BuildMenu from './ui/BuildMenu.js';
import NotificationManager from './ui/NotificationManager.js';
import CitizenPanel from './ui/CitizenPanel.js';
import ScorePanel from './ui/ScorePanel.js';
import WeatherWidget from './ui/WeatherWidget.js';
import NewsPanel from './ui/NewsPanel.js';
import ChartPanel from './ui/ChartPanel.js';
import RankingService from './services/RankingService.js';
import RankingModal from './ui/RankingModal.js';
import BuildingInfoModal from './ui/BuildingInfoModal.js';
import { EventType } from './types/EventType.js';

// 1. Singletons base
const gameStore = new GameStore();
const eventBus  = new EventBus();

// 2. APIs externas
const colombiaAPI = new ColombiaAPI();
const weatherAPI  = new WeatherAPI(''); // sin key → mock
const newsAPI     = new NewsAPI('');    // sin key → mock

// 3. Servicios de dominio
const resourceHistory = new ResourceHistory();

// 4. GameController
const gameController = new GameController(gameStore, eventBus, resourceHistory);
gameController.init();

// 5. Controladores de input
const buildController = new BuildController(gameStore, eventBus, gameController.buildingService);
buildController.init();

const inputController = new InputController(gameStore, eventBus);
inputController.init();

// 6. Setup (solo en index.html; condicionado a que exista #setup-container)
const setupController = new SetupController(gameStore, eventBus, colombiaAPI);
setupController.init();

// 7. UI principal (condicionada a que el juego esté activo)
const mapRenderer      = new MapRenderer(gameStore, eventBus);
const resourcePanel    = new ResourcePanel(gameStore, eventBus);
const buildMenu        = new BuildMenu(gameStore, eventBus);
const notifManager     = new NotificationManager(eventBus);
const citizenPanel     = new CitizenPanel(gameStore, eventBus);
const scorePanel       = new ScorePanel(gameStore, eventBus);
const weatherWidget    = new WeatherWidget(eventBus, weatherAPI);
const newsPanel        = new NewsPanel(eventBus, newsAPI);
const chartPanel       = new ChartPanel(gameStore, eventBus);
const rankingService   = new RankingService(gameStore, eventBus);
const rankingModal     = new RankingModal(gameStore, eventBus, rankingService);
const buildInfoModal   = new BuildingInfoModal(gameStore, eventBus);

// Inicializar UI
[
  mapRenderer, resourcePanel, buildMenu, notifManager, citizenPanel,
  scorePanel, chartPanel, rankingModal, buildInfoModal, rankingService
].forEach(m => m.init && m.init());

// 8. Detectar partida guardada
if (gameController.saveService.hasSavedGame()) {
  eventBus.emit(EventType.GAME_LOAD_REQUESTED);
} else {
  // Si estamos en index.html sin partida → redirigir a setup
  window.location.href = 'pages/setup.html';
}