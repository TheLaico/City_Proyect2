import { EventType } from '../types/EventType.js';

class BuildController {
  constructor(gameStore, eventBus, buildingService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.buildingService = buildingService;
  }

  init() {
    this.eventBus.subscribe(EventType.BUILD_REQUESTED, ({ x, y, buildingType }) => {
      this.buildingService.build(x, y, buildingType);
    });
    this.eventBus.subscribe(EventType.DEMOLISH_REQUESTED, ({ x, y }) => {
      this.buildingService.demolish(x, y);
    });
    // BUILD_TYPE_SELECTED: selección de tipo desde el menú o tecla R
    this.eventBus.subscribe(EventType.BUILD_TYPE_SELECTED, ({ buildingType }) => {
      this.gameStore.setState({ selectedBuildingType: buildingType, mode: 'build' });
      this.eventBus.emit(EventType.MODE_CHANGED, { mode: 'build' });
    });
  }
}

export default BuildController;