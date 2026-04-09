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

      const conditionKey = data.weather?.[0]?.main ?? 'Clouds';
      const weatherData = {
        // Kelvin → Celsius: restar 273.15 y redondear
        temperature: Math.round(data.main.temp - 273.15),
        condition: this.#mapConditionKey(conditionKey),
        conditionLabel: this.#mapConditionLabel(conditionKey),
        humidity: data.main.humidity,
        // m/s → km/h: multiplicar por 3.6 y redondear
        windSpeed: Math.round(data.wind.speed * 3.6),
        icon: data.weather[0].icon,
        cityName: data.name,
        fetchedAt: new Date(),
      };

      this.#lastFetch = now;
      this.#cachedData = weatherData;
      return weatherData;
    } catch (e) {
      return this.#mockWeather();
    }
  }

  // Clave CSS para estilos del widget
  #mapConditionKey(main) {
    switch (main) {
      case 'Clear':        return 'sunny';
      case 'Clouds':       return 'cloudy';
      case 'Rain':
      case 'Drizzle':      return 'rainy';
      case 'Thunderstorm': return 'stormy';
      case 'Snow':         return 'snowy';
      default:             return 'cloudy';
    }
  }

  // Etiqueta en español para mostrar al usuario
  #mapConditionLabel(main) {
    switch (main) {
      case 'Clear':        return 'Soleado';
      case 'Clouds':       return 'Nublado';
      case 'Rain':         return 'Lluvioso';
      case 'Drizzle':      return 'Llovizna';
      case 'Thunderstorm': return 'Tormenta';
      case 'Snow':         return 'Nevado';
      default:             return 'Nublado';
    }
  }

  #mockWeather() {
    return {
      temperature: 22,
      condition: 'sunny',
      conditionLabel: 'Soleado',
      humidity: 65,
      windSpeed: 12,
      icon: '01d',
      cityName: 'Medellín',
      fetchedAt: new Date(),
    };
  }
}

export default WeatherAPI;