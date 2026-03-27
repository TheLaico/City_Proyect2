// Funciones del mapa (vecinos, posiciones, límites)
// Devuelve true si la celda está dentro de los límites
export function isInBounds(x, y, width, height) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

// Devuelve las 4 celdas ortogonales adyacentes dentro de los límites
export function getNeighbors(x, y, width, height) {
  const deltas = [
    { dx: 0, dy: -1 }, // arriba
    { dx: 0, dy: 1 },  // abajo
    { dx: -1, dy: 0 }, // izquierda
    { dx: 1, dy: 0 }   // derecha
  ];
  return deltas
    .map(({ dx, dy }) => ({ x: x + dx, y: y + dy }))
    .filter(({ x: nx, y: ny }) => isInBounds(nx, ny, width, height));
}

// Devuelve todas las celdas dentro del radio Manhattan
export function getCellsInRadius(cx, cy, radius, width, height) {
  const cells = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = cx + dx;
      const y = cy + dy;
      if (isInBounds(x, y, width, height) && manhattanDistance(cx, cy, x, y) <= radius) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

// Distancia Manhattan entre dos celdas
export function manhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Convierte coordenada 2D a índice 1D
export function coordinateToIndex(x, y, width) {
  return y * width + x;
}

// Convierte índice 1D a coordenada 2D
export function indexToCoordinate(index, width) {
  return { x: index % width, y: Math.floor(index / width) };
}