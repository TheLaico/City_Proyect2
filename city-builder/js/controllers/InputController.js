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
    // Sincronizar el store cada vez que cambia el modo (desde cualquier origen)
    this.eventBus.subscribe(EventType.MODE_CHANGED, ({ mode }) => {
      this.gameStore.setState({ mode });
      if (mode !== 'route') {
        this.routeSelection.origin = null;
      }
    });

    // Click en celdas del mapa
    const mapGrid = document.getElementById('map-grid');
    if (mapGrid) {
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
        } else if (mode === 'view') {
          // Mostrar info del edificio si hay uno en la celda
          this.eventBus.emit(EventType.BUILDING_SELECTED, { x, y });
        }
      });
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      switch (e.key.toLowerCase()) {
        case 'b':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'build' });
          break;
        case 'r':
          this.eventBus.emit(EventType.BUILD_TYPE_SELECTED, { buildingType: BuildingType.ROAD });
          break;
        case 'd':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'demolish' });
          break;
        case 'f':
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'route' });
          break;
        case 'escape':
          this.routeSelection.origin = null;
          this.eventBus.emit(EventType.ROUTE_PENDING, { origin: null });
          this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'view' });
          break;
        case ' ':
          this.eventBus.emit('turn:toggle_pause');
          break;
        case 's':
          this.eventBus.emit(EventType.SAVE_REQUESTED);
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
      { id: 'init-water',       key: 'initWater' },
      { id: 'init-food',        key: 'initFood' },
      { id: 'citizen-water',    key: 'citizenWaterConsumption' },
      { id: 'citizen-elec',     key: 'citizenElecConsumption' },
      { id: 'citizen-food',     key: 'citizenFoodConsumption' },
      { id: 'bonus-police',     key: 'bonusPolice' },
      { id: 'bonus-fire',       key: 'bonusFire' },
      { id: 'bonus-hospital',   key: 'bonusHospital' }
    ];
    configInputs.forEach(({ id, key }) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('change', () => {
          // Leer todos los valores actuales
          const config = {};
          configInputs.forEach(({ id, key }) => {
            const el = document.getElementById(id);
            if (el) config[key] = parseFloat(el.value) || 0;
          });
          this.gameStore.setState({ config });

          // Aplicar recursos iniciales directamente al store
          const resources = {};
          if (config.initElectricity > 0) resources.electricity = config.initElectricity;
          if (config.initWater > 0)       resources.water       = config.initWater;
          if (config.initFood > 0)        resources.food        = config.initFood;
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

    // Solo se pueden seleccionar edificios reales (no vías ni celdas vacías)
    const isBuilding = cell && cell.type !== BuildingType.ROAD;

    if (!isBuilding) {
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
        message: 'Selecciona un edificio (no una vía ni celda vacía)'
      });
      return;
    }

    if (!this.routeSelection.origin) {
      // Primer edificio seleccionado
      this.routeSelection.origin = { x, y };
      this.eventBus.emit(EventType.ROUTE_PENDING, { origin: { x, y } });
      this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
        message: `Origen: ${cell.type} (${x},${y}). Ahora selecciona el edificio destino.`
      });
    } else {
      // Segundo edificio → calcular ruta
      const { x: ox, y: oy } = this.routeSelection.origin;
      this.routeSelection.origin = null;
      this.eventBus.emit(EventType.ROUTE_PENDING, { origin: null }); // limpiar marcador
      this.routeService.calculateRoute(ox, oy, x, y);
    }
  }
}

export default InputController;