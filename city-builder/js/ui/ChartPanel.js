import { EventType } from '../types/EventType.js';

class ChartPanel {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.container = document.getElementById('chart-panel');
    this.canvas = null;
    this.ctx = null;
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="chart-metrics" id="chart-metrics">
        <div class="chart-metric"><span>💰</span><span id="metric-money">+0/s</span></div>
        <div class="chart-metric"><span>⚡</span><span id="metric-electricity">+0/s / -0/s</span></div>
        <div class="chart-metric"><span>💧</span><span id="metric-water">+0/s / -0/s</span></div>
        <div class="chart-metric"><span>🌾</span><span id="metric-food">+0/s / -0/s</span></div>
      </div>
      <canvas id="resource-chart" width="420" height="180"></canvas>
      <div class="chart-legend"></div>
      <div class="chart-message"></div>
    `;
    this.canvas = this.container.querySelector('#resource-chart');
    this.ctx = this.canvas.getContext('2d');
    this.legend = this.container.querySelector('.chart-legend');
    this.message = this.container.querySelector('.chart-message');
    this.metrics = this.container.querySelector('#chart-metrics');
    this.eventBus.subscribe(EventType.TURN_ENDED, () => this.#updateChart());
    this.eventBus.subscribe(EventType.RESOURCES_UPDATED, ({ summary }) => this.#updateMetrics(summary));
    this.#updateChart();
    this.#updateMetrics();
  }

  #updateChart() {
    const history = (this.gameStore.getState().resourceHistory?.getHistory?.() || []);
    if (history.length < 2) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.message.textContent = 'Juega más turnos para ver el historial';
      this.legend.innerHTML = '';
      return;
    }
    this.message.textContent = '';
    // Colores
    const colors = {
      money: getComputedStyle(document.documentElement).getPropertyValue('--color-money') || '#fbbf24',
      electricity: getComputedStyle(document.documentElement).getPropertyValue('--color-electricity') || '#60a5fa',
      water: getComputedStyle(document.documentElement).getPropertyValue('--color-water') || '#38bdf8',
      food: getComputedStyle(document.documentElement).getPropertyValue('--color-food') || '#a3e635',
    };
    // Leyenda
    this.legend.innerHTML = `
      <span style="color:${colors.money}">● Dinero</span>
      <span style="color:${colors.electricity}">● Electricidad</span>
      <span style="color:${colors.water}">● Agua</span>
      <span style="color:${colors.food}">● Alimentos</span>
    `;
    // Ejes
    const padding = 32;
    const w = this.canvas.width, h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.strokeStyle = '#bbb';
    this.ctx.lineWidth = 1;
    // Eje Y
    this.ctx.beginPath();
    this.ctx.moveTo(padding, padding);
    this.ctx.lineTo(padding, h - padding);
    this.ctx.lineTo(w - padding, h - padding);
    this.ctx.stroke();
    // Escalado
    const keys = ['money', 'electricity', 'water', 'food'];
    const maxY = Math.max(...history.flatMap(e => keys.map(k => e[k] ?? 0)), 10);
    const minY = Math.min(...history.flatMap(e => keys.map(k => e[k] ?? 0)), 0);
    const yRange = maxY - minY || 1;
    const xStep = (w - 2 * padding) / (history.length - 1);
    // Líneas
    keys.forEach(key => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = colors[key];
      this.ctx.lineWidth = 2;
      history.forEach((e, i) => {
        const x = padding + i * xStep;
        const y = h - padding - ((e[key] - minY) / yRange) * (h - 2 * padding);
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    });
    // Eje X: turnos
    this.ctx.fillStyle = '#888';
    this.ctx.font = '11px sans-serif';
    history.forEach((e, i) => {
      const x = padding + i * xStep;
      if (i % 2 === 0 || i === history.length - 1) {
        this.ctx.fillText('T' + e.turn, x - 8, h - padding + 14);
      }
    });
    // Eje Y: valores
    for (let i = 0; i <= 4; i++) {
      const yVal = minY + (yRange * (4 - i)) / 4;
      const y = padding + ((h - 2 * padding) * i) / 4;
      this.ctx.fillText(Math.round(yVal), 2, y + 4);
    }
  }

  #updateMetrics(summary) {
    if (!this.metrics) return;
    const state = this.gameStore.getState();
    const summaryData = summary || state.resourceSummary || null;
    if (!summaryData) return;

    const format = (value) => {
      if (value == null || Number.isNaN(value)) return '0';
      const rounded = Math.round(value * 10) / 10;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    };

    const moneyEl = this.metrics.querySelector('#metric-money');
    const elecEl = this.metrics.querySelector('#metric-electricity');
    const waterEl = this.metrics.querySelector('#metric-water');
    const foodEl = this.metrics.querySelector('#metric-food');

    if (moneyEl && summaryData.money) {
      moneyEl.textContent = `+${format(summaryData.money.productionPerSecond)}/s`;
    }
    if (elecEl && summaryData.electricity) {
      elecEl.textContent = `+${format(summaryData.electricity.productionPerSecond)}/s / -${format(summaryData.electricity.consumptionPerSecond)}/s`;
    }
    if (waterEl && summaryData.water) {
      waterEl.textContent = `+${format(summaryData.water.productionPerSecond)}/s / -${format(summaryData.water.consumptionPerSecond)}/s`;
    }
    if (foodEl && summaryData.food) {
      foodEl.textContent = `+${format(summaryData.food.productionPerSecond)}/s / -${format(summaryData.food.consumptionPerSecond)}/s`;
    }
  }
}

export default ChartPanel;
