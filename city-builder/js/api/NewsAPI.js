class NewsAPI {
  #apiKey;
  #cacheDurationMs = 30 * 60 * 1000;
  #lastFetch = null;
  #cachedData = null;

  constructor(apiKey) {
    this.#apiKey = apiKey;
  }

  async getNews(countryCode = 'co') {
    const now = Date.now();
    if (
      this.#lastFetch &&
      this.#cachedData &&
      (now - this.#lastFetch < this.#cacheDurationMs)
    ) {
      return this.#cachedData;
    }
    if (!this.#apiKey) return this.#mockNews();
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&pageSize=5&apiKey=${this.#apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const articles = (data.articles || []).map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.urlToImage || null,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date()
      }));
      this.#lastFetch = now;
      this.#cachedData = articles;
      return articles;
    } catch (e) {
      return this.#mockNews();
    }
  }

  #mockNews() {
    return [
      {
        title: 'Colombia avanza en energías renovables',
        description: 'El país incrementa su capacidad de energía solar y eólica en 2026.',
        url: 'https://www.eltiempo.com/colombia/energias-renovables',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        title: 'Medellín inaugura nuevo sistema de transporte',
        description: 'La ciudad estrena una línea de metro ligero para mejorar la movilidad.',
        url: 'https://www.elcolombiano.com/medellin/metro-ligero',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        title: 'Cali celebra festival cultural internacional',
        description: 'Artistas de todo el mundo se reúnen en Cali para el festival anual.',
        url: 'https://www.semana.com/cultura/cali-festival',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];
  }
}

export default NewsAPI;
