import { EventType } from '../types/EventType.js';
import WeatherRenderer from './WeatherRenderer.js';

class WeatherWidget {
  #intervalId = null;
  #renderer;
  #weatherAPI;
  #eventBus;
  #POLL_INTERVAL_MS = 30 * 60 * 1000;

  constructor(eventBus, weatherAPI, container, template) {
    this.#eventBus = eventBus;
    this.#weatherAPI = weatherAPI;
    this.#renderer = new WeatherRenderer(container, template);
  }

  async init(lat, lon) {
    await this.#fetchAndRender(lat, lon);
    this.#startPolling(lat, lon);
    this.#subscribeToEvents();
  }

  async #fetchAndRender(lat, lon) {
    const data = await this.#weatherAPI.getWeather(lat, lon);
    this.#renderer.render(data);
  }

  #startPolling(lat, lon) {
    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#intervalId = setInterval(
      () => this.#fetchAndRender(lat, lon),
      this.#POLL_INTERVAL_MS
    );
  }

  #subscribeToEvents() {
    this.#eventBus.subscribe(EventType.WEATHER_UPDATED, ({ weather }) => {
      if (weather) this.#renderer.render(weather);
    });
  }

  destroy() {
    if (this.#intervalId) clearInterval(this.#intervalId);
  }
}

export default WeatherWidget;