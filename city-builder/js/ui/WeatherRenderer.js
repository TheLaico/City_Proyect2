class WeatherRenderer {
  #container;
  #template;

  constructor(container, template) {
    this.#container = container;
    this.#template = template;
  }

  render(data) {
    if (!this.#container || !this.#template) return;

    this.#container.innerHTML = '';
    this.#container.className = 'weather-widget';

    if (!data) {
      this.#container.classList.add('unavailable');
      this.#container.textContent = 'Clima no disponible';
      return;
    }

    const node = this.#template.content.cloneNode(true);

    node.querySelector('.weather-icon').src =
      `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    node.querySelector('.weather-icon').alt = data.conditionLabel;
    node.querySelector('.weather-temp').textContent = `${data.temperature}°C`;
    node.querySelector('.weather-condition').textContent = data.conditionLabel;
    node.querySelector('[data-field="humidity"]').textContent = `${data.humidity}%`;
    node.querySelector('[data-field="windSpeed"]').textContent = `${data.windSpeed} km/h`;

    this.#container.classList.add(data.condition);
    this.#container.appendChild(node);
  }
}

export default WeatherRenderer;