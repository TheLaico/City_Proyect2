import BuildingAdapter from '../adapters/BuildingAdapter.js';

class Map {
  #grid;
  constructor(width, height) {
    if (width < 15 || width > 30 || height < 15 || height > 30) {
      throw new RangeError('El tamaño del mapa debe estar entre 15 y 30.');
    }
    this.width = width;
    this.height = height;
    this.#grid = Array.from({ length: height }, () => Array(width).fill(null));
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getCell(x, y) {
    if (!this.isInBounds(x, y)) return null;
    return this.#grid[y][x];
  }

  setCell(x, y, content) {
    if (!this.isInBounds(x, y)) throw new RangeError('Coordenadas fuera de límites.');
    this.#grid[y][x] = content;
  }

  isEmpty(x, y) {
    return this.isInBounds(x, y) && this.#grid[y][x] === null;
  }

  toMatrix() {
    // Copia profunda
    return this.#grid.map(row => row.slice());
  }

  toRoutingMatrix() {
    return this.#grid.map(row => row.map(cell => (cell && cell.type === 'road') ? 1 : 0));
  }

  toJSON() {
    return this.#grid.map(row => row.map(cell => cell?.toJSON?.() ?? null));
  }

  static fromJSON(data, width, height) {
    const map = new Map(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellData = data[y][x];
        map.#grid[y][x] = cellData ? BuildingAdapter.fromJSON(cellData) : null;
      }
    }
    return map;
  }
}

export default Map;
