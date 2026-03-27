import { EventType } from '../types/EventType.js';
import * as GridUtils from '../utils/GridUtils.js';

class RouteService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  calculateRoute(originX, originY, destX, destY) {
    if (originX === destX && originY === destY) {
      this.eventBus.emit(EventType.ROUTE_CALCULATED, { path: [] });
      return;
    }
    const map = this.gameStore.getState().map;
    const matrix = map.toRoutingMatrix();
    const height = matrix.length;
    const width = matrix[0].length;
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    // Min-heap simulada con array + sort
    let queue = [{ x: originX, y: originY, cost: 0, path: [{ x: originX, y: originY }] }];
    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();
      const { x, y, cost, path } = current;
      if (visited[y][x]) continue;
      visited[y][x] = true;
      if (x === destX && y === destY) {
        this.eventBus.emit(EventType.ROUTE_CALCULATED, { path });
        return;
      }
      const neighbors = GridUtils.getNeighbors(x, y, width, height);
      for (const n of neighbors) {
        if (!visited[n.y][n.x] && matrix[n.y][n.x] === 1) {
          queue.push({
            x: n.x,
            y: n.y,
            cost: cost + 1,
            path: [...path, { x: n.x, y: n.y }]
          });
        }
      }
    }
    this.eventBus.emit(EventType.ROUTE_FAILED, { message: 'No hay ruta disponible entre estos edificios' });
  }
}

export default RouteService;
