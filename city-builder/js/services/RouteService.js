import { EventType } from '../types/EventType.js';

const BACKEND_URL = 'http://127.0.0.1:5000/api/calculate-route';

class RouteService {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
  }

  async calculateRoute(originX, originY, destX, destY) {
    if (originX === destX && originY === destY) {
      this.eventBus.emit(EventType.ROUTE_CALCULATED, { path: [] });
      return;
    }

    const map = this.gameStore.getState().map;
    const matrix = map.toRoutingMatrix();

    // El backend usa [row, col] = [y, x]
    const payload = {
      map: matrix,
      start: [originY, originX],
      end:   [destY,   destX]
    };

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        this.eventBus.emit(EventType.ROUTE_FAILED, {
          message: data.error ?? 'Error al calcular la ruta'
        });
        return;
      }

      // El backend devuelve [[row,col], ...] → convertir a [{x,y}, ...]
      const path = data.route.map(([row, col]) => ({ x: col, y: row }));
      this.eventBus.emit(EventType.ROUTE_CALCULATED, { path });

    } catch (_err) {
      // Backend no disponible → fallback al algoritmo local
      console.warn('[RouteService] Backend no disponible, usando Dijkstra local.');
      this.#localDijkstra(matrix, originX, originY, destX, destY);
    }
  }

  // Dijkstra local como fallback (mantiene compatibilidad offline)
  #localDijkstra(matrix, originX, originY, destX, destY) {
    const height = matrix.length;
    const width  = matrix[0].length;
    const directions = [[0,1],[0,-1],[1,0],[-1,0]];

    const dist = Array.from({ length: height }, () => Array(width).fill(Infinity));
    const prev = {};
    dist[originY][originX] = 0;

    // Min-heap simple
    const pq = [[0, originX, originY]];

    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [cost, x, y] = pq.shift();

      if (x === destX && y === destY) break;
      if (cost > dist[y][x]) continue;

      for (const [dy, dx] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const isEnd = nx === destX && ny === destY;
        if (matrix[ny][nx] !== 1 && !isEnd) continue;

        const newCost = cost + 1;
        if (newCost < dist[ny][nx]) {
          dist[ny][nx] = newCost;
          prev[`${nx},${ny}`] = { x, y };
          pq.push([newCost, nx, ny]);
        }
      }
    }

    const key = `${destX},${destY}`;
    if (!(key in prev)) {
      this.eventBus.emit(EventType.ROUTE_FAILED, {
        message: 'No hay ruta disponible entre estos edificios'
      });
      return;
    }

    const path = [];
    let cur = { x: destX, y: destY };
    while (cur) {
      path.unshift({ x: cur.x, y: cur.y });
      cur = prev[`${cur.x},${cur.y}`];
    }
    this.eventBus.emit(EventType.ROUTE_CALCULATED, { path });
  }
}

export default RouteService;
