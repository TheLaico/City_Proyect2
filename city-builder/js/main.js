import MapLoaderService from './services/MapLoaderService.js';
import SaveService from './services/SaveService.js';
import SetupScreen from './ui/SetupScreen.js';
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
import ExportService from './services/ExportService.js';
import ImportService from './services/ImportService.js';
import RankingModal from './ui/RankingModal.js';
import BuildingInfoModal from './ui/BuildingInfoModal.js';
import GameOverScreen from './ui/GameOverScreen.js';
import { EventType } from './types/EventType.js';
import ENV from './config/env.js';

// 1. Singletons base (deben inicializarse primero)
const gameStore = new GameStore();
const eventBus = new EventBus();

// 2. Servicios de carga y guardado (dependen de store y eventBus)
const mapLoaderService = new MapLoaderService(gameStore, eventBus);
const saveService = new SaveService(gameStore, eventBus);

// 3. APIs externas
const colombiaAPI = new ColombiaAPI();
const weatherAPI = new WeatherAPI(ENV.WEATHER_API_KEY);
const newsAPI = new NewsAPI({
  apiKey: ENV.NEWS_API_KEY,
  country: ENV.NEWS_COUNTRY,
  proxyUrl: ENV.NEWS_PROXY_URL,
});

// 4. Servicios de dominio
const resourceHistory = new ResourceHistory();

// 5. GameController
const gameController = new GameController(gameStore, eventBus, resourceHistory);
gameController.init();

// 6. Controladores de input
const buildController = new BuildController(gameStore, eventBus, gameController.buildingService);
buildController.init();

const inputController = new InputController(gameStore, eventBus);
inputController.init();

// 7. Setup (solo en index.html; condicionado a que exista #setup-container)
const setupController = new SetupController(gameStore, eventBus, colombiaAPI, mapLoaderService, saveService);
setupController.init();

if (document.getElementById('setup-form')) {
  const setupScreen = new SetupScreen(eventBus, colombiaAPI, mapLoaderService, () => saveService.hasSavedGame());
  setupScreen.init();
}

// 8. UI principal
const mapRenderer = new MapRenderer(gameStore, eventBus);
const resourcePanel = new ResourcePanel(gameStore, eventBus);
const buildMenu = new BuildMenu(gameStore, eventBus);
const notifManager = new NotificationManager(eventBus);
const citizenPanel = new CitizenPanel(gameStore, eventBus);
const scorePanel = new ScorePanel(gameStore, eventBus);
const weatherWidget = new WeatherWidget(
  eventBus,
  weatherAPI,
  document.getElementById('weather-widget'),
  document.getElementById('weather-template')
);
const newsPanel = new NewsPanel(eventBus, newsAPI);
const chartPanel = new ChartPanel(gameStore, eventBus);
const rankingService = new RankingService(gameStore, eventBus);
const exportService = new ExportService(gameStore, eventBus);
const importService = new ImportService(gameStore, eventBus, saveService);
importService.init();
const rankingModal = new RankingModal(gameStore, eventBus, rankingService);
const buildInfoModal = new BuildingInfoModal(gameStore, eventBus);
const gameOverScreen = new GameOverScreen(gameStore, eventBus, rankingService, saveService);

// Inicializar UI
[
  mapRenderer, resourcePanel, buildMenu, notifManager, citizenPanel,
  scorePanel, chartPanel, rankingModal, buildInfoModal, rankingService,
  gameOverScreen
].forEach(m => m.init && m.init());

// Inicializar widgets de clima y noticias cuando el juego arranque con una ciudad
eventBus.subscribe('weather:init', ({ lat, lon }) => {
  weatherWidget.init(lat, lon);
});
eventBus.subscribe('news:init', ({ country }) => {
  newsPanel.init(country || ENV.NEWS_COUNTRY || 'co');
});

eventBus.subscribe(EventType.GAME_LOADED, () => {
  const region = gameStore.getState()?.city?.region;
  if (region?.lat && region?.lon) {
    weatherWidget.init(region.lat, region.lon);
    newsPanel.init(ENV.NEWS_COUNTRY || 'co');
  }
});

// Botón nueva ciudad
document.getElementById('btn-new-city')?.addEventListener('click', () => {
  if (confirm('¿Crear una nueva ciudad? Se perderá la partida actual.')) {
    saveService.deleteSave();
    window.location.href = 'pages/setup.html';
  }
});

document.getElementById('btn-export')?.addEventListener('click', () => {
  eventBus.emit(EventType.EXPORT_REQUESTED);
});
document.getElementById('btn-import')?.addEventListener('click', () => {
  eventBus.emit('import:requested');
});
document.getElementById('btn-set-money')?.addEventListener('click', () => {
  const val = parseInt(document.getElementById('init-money')?.value, 10);
  if (isNaN(val)) return;
  gameStore.setState({ resources: { money: val } });
  eventBus.emit(EventType.RESOURCES_UPDATED, { resources: gameStore.getState().resources });
  eventBus.emit(EventType.NOTIFICATION_SHOW, { message: `💰 Dinero ajustado a $${val.toLocaleString()}` });
});
document.getElementById('btn-route')?.addEventListener('click', () => {
  eventBus.emit(EventType.MODE_CHANGED, { mode: 'route' });
  eventBus.emit(EventType.NOTIFICATION_SHOW, {
    message: '🗺️ Modo ruta: haz clic en el edificio ORIGEN'
  });
});

// Hacks modal (editor de recursos)
const hacksModal = document.getElementById('hacks-modal');
const modalOverlay = document.getElementById('modal-overlay');
const btnHacks = document.getElementById('btn-hacks');
const btnHacksClose = document.getElementById('hacks-close-btn');
const btnHacksCloseFooter = document.getElementById('hacks-close-footer');
const btnHacksApply = document.getElementById('hacks-apply');

const openHacks = () => {
  hacksModal?.classList.remove('modal--hidden');
  modalOverlay?.classList.remove('modal--hidden');
};

const closeHacks = () => {
  hacksModal?.classList.add('modal--hidden');
  modalOverlay?.classList.add('modal--hidden');
};

btnHacks?.addEventListener('click', openHacks);
btnHacksClose?.addEventListener('click', closeHacks);
btnHacksCloseFooter?.addEventListener('click', closeHacks);
modalOverlay?.addEventListener('click', closeHacks);
btnHacksApply?.addEventListener('click', () => {
  const readNumber = (id) => {
    const value = parseFloat(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : 0;
  };

  const money = readNumber('init-money');
  const resources = {
    money,
    electricity: readNumber('init-electricity'),
    water: readNumber('init-water'),
    food: readNumber('init-food'),
  };

  const config = {
    initElectricity: resources.electricity,
    initWater: resources.water,
    initFood: resources.food,
    citizenWaterConsumption: readNumber('citizen-water'),
    citizenElecConsumption: readNumber('citizen-elec'),
    citizenFoodConsumption: readNumber('citizen-food'),
    bonusPolice: readNumber('bonus-police'),
    bonusFire: readNumber('bonus-fire'),
    bonusHospital: readNumber('bonus-hospital'),
  };

  const turnSeconds = parseInt(document.getElementById('turn-duration')?.value, 10);
  if (!isNaN(turnSeconds) && turnSeconds > 0) {
    eventBus.emit(EventType.TURN_DURATION_CHANGED, { seconds: turnSeconds });
  }

  gameStore.setState({ config });
  const currentResources = gameStore.getState().resources || {};
  gameStore.setState({ resources: { ...currentResources, ...resources } });
  eventBus.emit(EventType.RESOURCES_UPDATED, { resources: gameStore.getState().resources });
  eventBus.emit(EventType.CONFIG_CHANGED, { config });
  eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '🛠️ Hacks aplicados' });
});

// Actualizar modo: clases del body, botón de ruta y cursor del viewport
eventBus.subscribe(EventType.MODE_CHANGED, ({ mode }) => {
  gameStore.setState({ mode });

  document.body.classList.remove('mode-view', 'mode-build', 'mode-demolish', 'mode-route');
  document.body.classList.add(`mode-${mode}`);

  document.dispatchEvent(new CustomEvent('mode:changed', { detail: { mode } }));

  const btnRoute = document.getElementById('btn-route');
  if (btnRoute) btnRoute.classList.toggle('active', mode === 'route');
});

// Notificar cuando no se encuentra ruta
eventBus.subscribe(EventType.ROUTE_FAILED, ({ message }) => {
  eventBus.emit(EventType.NOTIFICATION_SHOW, { message: `❌ ${message}` });
});

// 9. Detectar partida guardada
if (gameController.saveService.hasSavedGame()) {
  eventBus.emit(EventType.GAME_LOAD_REQUESTED);
} else if (!window.location.pathname.includes('setup.html')) {
  window.location.href = 'pages/setup.html';
}

// Sidebars: visibles por defecto y colapsables con menu hamburguesa
const leftSidebar = document.getElementById('left-sidebar');
const rightSidebar = document.getElementById('right-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const btnToggleSidebars = document.getElementById('btn-toggle-sidebars');
const desktopQuery = window.matchMedia('(min-width: 1024px)');

const openLeftSidebar = () => {
  if (!leftSidebar) return;
  leftSidebar.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.classList.add('visible');
};

const closeLeftSidebar = () => {
  if (!leftSidebar) return;
  leftSidebar.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
};

const openRightSidebar = () => {
  if (!rightSidebar) return;
  rightSidebar.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.classList.add('visible');
};

const closeRightSidebar = () => {
  if (!rightSidebar) return;
  rightSidebar.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
};

const syncSidebarState = () => {
  if (desktopQuery.matches) {
    document.body.classList.remove('left-collapsed');
    document.body.classList.remove('right-collapsed');
    if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
    if (leftSidebar) leftSidebar.classList.remove('open');
    if (rightSidebar) rightSidebar.classList.remove('open');
  } else {
    document.body.classList.remove('left-collapsed');
    document.body.classList.remove('right-collapsed');
    if (leftSidebar) leftSidebar.classList.add('open');
    if (rightSidebar) rightSidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
  }
};

syncSidebarState();
desktopQuery.addEventListener('change', syncSidebarState);

btnToggleSidebars?.addEventListener('click', () => {
  if (desktopQuery.matches) {
    document.body.classList.toggle('left-collapsed');
    document.body.classList.toggle('right-collapsed');
    return;
  }
  const leftOpen = leftSidebar ? leftSidebar.classList.toggle('open') : false;
  const rightOpen = rightSidebar ? rightSidebar.classList.toggle('open') : false;
  if (sidebarOverlay) sidebarOverlay.classList.toggle('visible', leftOpen || rightOpen);
});

sidebarOverlay?.addEventListener('click', () => {
  if (!desktopQuery.matches) {
    closeLeftSidebar();
    closeRightSidebar();
  }
});