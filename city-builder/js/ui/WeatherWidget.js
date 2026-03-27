import { EventType } from '../types/EventType.js';

class WeatherWidget {
  #intervalId = null;
  #lastData = null;

  constructor(eventBus, weatherAPI) {
    this.eventBus = eventBus;
    this.weatherAPI = weatherAPI;
    this.container = document.getElementById('weather-widget');
  }

  async init(lat, lon) {
    if (!this.container) return;
    // Fetch inicial
    const data = await this.weatherAPI.getWeather(lat, lon);
    this.#lastData = data;
    this.#render(data);
    // Actualización periódica
    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#intervalId = setInterval(async () => {
      const newData = await this.weatherAPI.getWeather(lat, lon);
      this.#lastData = newData;
      this.#render(newData);
    }, 30 * 60 * 1000);
    // Suscripción a eventos externos
    this.eventBus.subscribe(EventType.WEATHER_UPDATED, ({ weather }) => {
      if (weather) {
        this.#lastData = weather;
        this.#render(weather);
      }
    });
  }

  #render(weatherData) {
    if (!this.container) return;
    if (!weatherData) {
      this.container.innerHTML = `<div class="weather-skeleton">Clima no disponible</div>`;
      return;
    }
    const iconUrl = `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`;
    this.container.innerHTML = `
      <div class="weather-main">
        <img src="${iconUrl}" alt="icono clima" class="weather-icon" loading="lazy">
        <span class="weather-temp">${weatherData.temperature}&deg;C</span>
      </div>
      <div class="weather-desc">${weatherData.description}</div>
      <div class="weather-details">
        <span title="Humedad"><i class="wi wi-humidity"></i> ${weatherData.humidity}%</span>
        <span title="Viento"><i class="wi wi-strong-wind"></i> ${weatherData.windSpeed} km/h</span>
      </div>
    `;
  }
}

export default WeatherWidget;
