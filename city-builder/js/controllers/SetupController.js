import InputValidator from '../validators/InputValidator.js';
import City from '../models/City.js';
import Map from '../models/Map.js';
import { EventType } from '../types/EventType.js';
import { INITIAL_RESOURCES } from '../config/constants.js';

class SetupController {
  constructor(gameStore, eventBus, colombiaAPI, mapLoaderService, saveService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.colombiaAPI = colombiaAPI;
    this.mapLoaderService = mapLoaderService;
    this.saveService = saveService;
    this.validator = new InputValidator();
  }

  init() {
    this.eventBus.subscribe('setup:submitted', (data) => {
      const validation = this.validator.validateSetupData(data);
      if (!validation.valid) {
        this.eventBus.emit(EventType.NOTIFICATION_SHOW, {
          message: validation.errors.join('\n'),
          type: 'error'
        });
        return;
      }
      // Crear ciudad y mapa
      const width  = parseInt(data.width,  10) || 20;
      const height = parseInt(data.height, 10) || 20;
      const city = new City({
        name: data.cityName,
        mayorName: data.mayorName,
        region: data.region,
        gridWidth: width,
        gridHeight: height
      });

      // Usar mapa ya cargado desde archivo si existe, si no crear uno vacío
      const existingState = this.gameStore.getState();
      const map = (existingState.map && existingState.map.width === width && existingState.map.height === height)
        ? existingState.map
        : new Map(width, height);
      // Recursos iniciales (pueden venir de campos del form)
      const resources = {
        ...INITIAL_RESOURCES,
        electricity: data.initElectricity ?? INITIAL_RESOURCES.electricity,
        water: data.initWater ?? INITIAL_RESOURCES.water,
        food: data.initFood ?? INITIAL_RESOURCES.food
      };
      this.gameStore.setState({
        city,
        map,
        buildings: existingState.map ? (existingState.buildings || []) : [],
        roads: [],
        citizens: [],
        resources,
        turn: 0,
        score: 0,
        selectedBuildingType: null,
        mode: 'view'
      });
      this.eventBus.emit(EventType.GAME_STARTED, { city });
      // Guardar en localStorage antes de redirigir para que index.html pueda recuperar el estado
      this.saveService.saveGame();
      window.location.href = '../index.html';
    });

    // Al iniciar el juego, notificar a WeatherWidget y NewsPanel si hay coordenadas
    this.eventBus.subscribe(EventType.GAME_STARTED, (payload) => {
      const city = payload?.city ?? this.gameStore.getState()?.city;
      if (city?.region?.lat && city?.region?.lon) {
        this.eventBus.emit('weather:init', { lat: city.region.lat, lon: city.region.lon });
        this.eventBus.emit('news:init', { countryCode: 'co' });
      }
    });
  }

  hasSavedGame() {
    return this.saveService?.hasSavedGame?.() ?? false;
  }
}

export default SetupController;