export const EventType = Object.freeze({
  // Ciclo de juego
  GAME_LOAD_REQUESTED: 'game:load_requested',
  GAME_LOADED: 'game:loaded',
  SETUP_REQUESTED: 'game:setup_requested',
  GAME_STARTED: 'game:started',
  GAME_OVER: 'game:over',

  // Turnos
  TURN_STARTED: 'turn:started',
  TURN_ENDED: 'turn:ended',
  TURN_DURATION_CHANGED: 'turn:duration_changed',
  CONFIG_CHANGED: 'config:changed',

  // Recursos
  RESOURCES_UPDATED: 'resources:updated',
  RESOURCE_CRITICAL: 'resources:critical',

  // Edificios
  BUILD_REQUESTED: 'build:requested',
  BUILD_SUCCESS: 'build:success',
  BUILD_FAILED: 'build:failed',
  DEMOLISH_REQUESTED: 'demolish:requested',
  DEMOLISH_SUCCESS: 'demolish:success',
  BUILDING_INFO_REQUESTED: 'building:info_requested',

  // Ciudadanos
  CITIZENS_UPDATED: 'citizens:updated',

  // Puntuación
  SCORE_UPDATED: 'score:updated',

  // UI
  NOTIFICATION_SHOW: 'ui:notification_show',
  BUILDING_SELECTED: 'ui:building_selected',
  BUILD_TYPE_SELECTED: 'ui:build_type_selected',
  MODE_CHANGED: 'ui:mode_changed',
  MAP_CELL_CLICKED: 'ui:map_cell_clicked',

  // Persistencia
  SAVE_REQUESTED: 'save:requested',
  SAVE_COMPLETED: 'save:completed',
  EXPORT_REQUESTED: 'export:requested',

  // APIs externas
  WEATHER_UPDATED: 'api:weather_updated',
  NEWS_UPDATED: 'api:news_updated',
  ROUTE_CALCULATED: 'api:route_calculated',
  ROUTE_FAILED: 'api:route_failed',
  ROUTE_PENDING: 'api:route_pending',
  ROUTE_MODE_CHANGED: 'api:route_mode_changed'
});
