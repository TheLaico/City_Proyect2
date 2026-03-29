import { EventType } from '../types/EventType.js';
import { BuildingType } from '../types/BuildingType.js';
import RouteService from '../services/RouteService.js';

class InputController {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.routeSelection = { origin: null };
    this.routeService = new RouteService(gameStore, eventBus);
  }

  init() {
    const mapGrid = document.getElementById('map-grid');
    if (mapGrid) {

      // Click IZQUIERDO → build / demolish / route
      mapGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('[data-x][data-y]');
        if (!cell) return;
        const x = parseInt(cell.getAttribute('data-x'), 10);
        const y = parseInt(cell.getAttribute('data-y'), 10);
        this.eventBus.emit(EventType.MAP_CELL_CLICKED, { x, y });
        const mode = this.gameStore.getState().mode;
        if (mode === 'build') {
          this.eventBus.emit(EventType.BUILD_REQUESTED, {
            x, y, buildingType: this.gameStore.getState().selectedBuildingType
          });
        } else if (mode === 'demolish') {
          this.eventBus.emit(EventType.DEMOLISH_REQUESTED, { x, y });
        } else if (mode === 'route') {
          this.#handleRouteClick(x, y);
        }
      });

      // Click DERECHO → siempre muestra info del edificio, sin importar el modo
      mapGrid.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const cell = e.target.closest('[data-x][data-y]');
        if (!cell) return;
        const x = parseInt(cell.getAttribute('data-x'), 10);
        const y = parseInt(cell.getAttribute('data-y'), 10);
        this.eventBus.emit(EventType.BUILDING_INFO_REQUESTED, { x, y });
      });
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;

      // Evitar disparar atajos si el foco está en un input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'build' });
          this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '🏗️ Modo construcción — selecciona un edificio del menú' });
          break;
        case 'r':
          this.eventBus.emit(EventType.BUILD_TYPE_SELECTED, { buildingType: BuildingType.ROAD });
          this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '🛣️ Modo vías — haz clic en el mapa para construir' });
          break;
        case 'd':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'demolish' });
          this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '🗑️ Modo demolición — haz clic en un edificio' });
          break;
        case 'f':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'route' });
          this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '🗺️ Modo ruta — haz clic en el edificio ORIGEN' });
          break;
        case 'escape':
          this.routeSelection.origin = null;
          this.eventBus.emit(EventType.ROUTE_PENDING, { origin: null });
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'view' });
          this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '👁️ Modo vista' });
          break;
        case ' ':
          e.preventDefault(); // evita scroll de página
          this.eventBus.emit('turn:toggle_pause');
          break;
        case 's':
          this.eventBus.emit(EventType.SAVE_REQUESTED);
          this.eventBus.emit(EventType.NOTIFICATION_SHOW, { message: '💾 Guardando partida...' });
          break;
      }
    });

    // Listeners para inputs configurables
    const turnDurationInput = document.getElementById('turn-duration');
    if (turnDurationInput) {
      turnDurationInput.addEventListener('change', (e) => {
        const seconds = parseInt(e.target.value, 10);
        if (!isNaN(seconds) && seconds > 0) {
          this.eventBus.emit(EventType.TURN_DURATION_CHANGED, { seconds });
        }
      });
    }

    // Inputs de configuración general
    const configInputs = [
      { id: 'init-electricity', key: 'initElectricity' },
      { id: 'init-water', key: 'initWater' },
      { id: 'init-food', key: 'initFood' },
      { id: 'citizen-water', key: 'citizenWaterConsumption' },
      { id: 'citizen-elec', key: 'citizenElecConsumption' },
      { id: 'citizen-food', key: 'citizenFoodConsumption' },
      { id: 'bonus-police', key: 'bonusPolice' },
      { id: 'bonus-fire', key: 'bonusFire' },
      { id: 'bonus-hospital', key: 'bonusHospital' }
    ];
    configInputs.forEach(({ id, key }) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('change', () => {
          const config = {};
          configInputs.forEach(({ id, key }) => {
            const el = document.getElementById(id);
            if (el) config[key] = parseFloat(el.value) || 0;
          });
          this.gameStore.setState({ config });

          const resources = {};
          if (config.initElectricity !== undefined) resources.electricity = config.initElectricity;
          if (config.initWater !== undefined) resources.water = config.initWater;
          if (config.initFood !== undefined) resources.food = config.initFood;
          if (Object.keys(resources).length > 0) {
            this.gameStore.setState({ resources });
            this.eventBus.emit(EventType.RESOURCES_UPDATED, { resources: this.gameStore.getState().resources });
          }

          this.eventBus.emit(EventType.CONFIG_CHANGED, { config });
        });
      }
    });
  }

  #handleRouteClick(x, y) {
    const map = this.gameStore.getState().map;
    const cell = map?.getCell(x, y);

    const isBuilding = cell && cell.type !== BuildingType.ROAD;

    if (!isBuilding) {
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
        message: 'Selecciona un edificio (no una vía ni celda vacía)'
      });
      return;
    }

    if (!this.routeSelection.origin) {
      this.routeSelection.origin = { x, y };
      this.eventBus.emit(EventType.ROUTE_PENDING, { origin: { x, y } });
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
        message: `Origen: ${cell.type} (${x},${y}). Ahora selecciona el edificio destino.`
      });
    } else {
      const { x: ox, y: oy } = this.routeSelection.origin;
      this.routeSelection.origin = null;
      this.eventBus.emit(EventType.ROUTE_PENDING, { origin: null });
      this.routeService.calculateRoute(ox, oy, x, y);
    }
  }
}

export default InputController;