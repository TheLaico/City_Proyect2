class WeatherAPI {
  #apiKey;
  #lastFetch = null;
  #cachedData = null;
  #cacheDurationMs = 30 * 60 * 1000;

  constructor(apiKey) {
    this.#apiKey = apiKey;
  }

  async getWeather(lat, lon) {
    const now = Date.now();
    if (
      this.#lastFetch &&
      this.#cachedData &&
      (now - this.#lastFetch < this.#cacheDurationMs)
    ) {
      return this.#cachedData;
    }
    if (!this.#apiKey || !lat || !lon) {
      return this.#mockWeather();
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.#apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const main = data.weather && data.weather[0] && data.weather[0].main;
      const condition = this.#mapCondition(main);
      const weatherData = {
        temperature: Math.round(data.main.temp),
        condition,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s a km/h
        icon: data.weather[0].icon,
        cityName: data.name,
        fetchedAt: new Date()
      };
      this.#lastFetch = now;
      this.#cachedData = weatherData;
      return weatherData;
    } catch (e) {
      return this.#mockWeather();
    }
  }

  #mapCondition(main) {
    switch (main) {
      case 'Clear': return 'sunny';
      case 'Clouds': return 'cloudy';
      case 'Rain':
      case 'Drizzle': return 'rainy';
      case 'Thunderstorm': return 'stormy';
      case 'Snow': return 'snowy';
      default: return 'cloudy';
    }
  }

  #mockWeather() {
    return {
      temperature: 22,
      condition: 'sunny',
      description: 'Soleado',
      humidity: 65,
      windSpeed: 12,
      icon: '01d',
      cityName: 'Medellín',
      fetchedAt: new Date()
    };
  }
}

export default WeatherAPI;
