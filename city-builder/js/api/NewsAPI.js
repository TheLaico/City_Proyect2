// ─────────────────────────────────────────────
//  NewsAPI.js  — Single Responsibility: solo fetch + caché de noticias
//  Principios SOLID aplicados:
//    S — Solo gestiona obtención y caché de noticias
//    O — Extensible: se puede subclasificar para otras fuentes
//    D — Recibe apiKey por constructor (inyección de dependencia)
// ─────────────────────────────────────────────

class NewsAPI {
  #apiKey;
  #country;
  #proxyUrl;
  #cacheDurationMs = 30 * 60 * 1000;   // 30 min por pais
  #cache = {};                           // { [country]: { lastFetch, data } }

  static #BASE_URL  = 'https://newsapi.org/v2/top-headlines';
  static #PAGE_SIZE = 5;

  constructor({ apiKey, country = 'co', proxyUrl = '' } = {}) {
    this.#apiKey = apiKey;
    this.#country = country;
    this.#proxyUrl = proxyUrl;
  }

  // ── Interfaz pública ──────────────────────────────────────────────

  /**
   * Retorna las últimas noticias para el país indicado.
  * @param {string} country  Código ISO-2 del pais (ej. 'co', 'us')
   * @returns {Promise<Article[]>}
   */
  async getNews(country = this.#country) {
    if (this.#isCacheValid(country)) {
      return this.#cache[country].data;
    }

    if (!this.#apiKey) return this.#mockNews();

    try {
      const url  = this.#buildUrl(country);
      const res  = await fetch(url);

      if (!res.ok) throw new Error(`NewsAPI ${res.status}: ${res.statusText}`);

      const data     = await res.json();
      const articles = this.#mapArticles(data.articles);

      this.#setCache(country, articles);
      return articles;

    } catch (e) {
      console.warn(`[NewsAPI] Error para "${country}":`, e.message);
      return this.#mockNews();
    }
  }

  /** Invalida el caché de un país (o todo si se omite). */
  clearCache(country = null) {
    if (country) delete this.#cache[country];
    else this.#cache = {};
  }

  // ── Métodos privados ──────────────────────────────────────────────

  #buildUrl(country) {
    if (this.#proxyUrl) {
      const params = new URLSearchParams({ country });
      return `${this.#proxyUrl}?${params}`;
    }
    const params = new URLSearchParams({
      country:   country,
      pageSize:  NewsAPI.#PAGE_SIZE,
      apiKey:    this.#apiKey,
    });
    return `${NewsAPI.#BASE_URL}?${params}`;
  }

  #isCacheValid(country) {
    const entry = this.#cache[country];
    return !!entry && (Date.now() - entry.lastFetch) < this.#cacheDurationMs;
  }

  #setCache(country, data) {
    this.#cache[country] = { lastFetch: Date.now(), data };
  }

  /**
   * Normaliza los artículos crudos de la API al formato interno.
   * @param {object[]} raw
   * @returns {Article[]}
   */
  #mapArticles(raw = []) {
    return raw.map(a => ({
      title:       a.title       || 'Sin título',
      description: a.description || '',
      url:         a.url,
      urlToImage:  a.urlToImage  || null,
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    }));
  }

  #mockNews() {
    return [
      {
        title:       'Colombia avanza en energías renovables',
        description: 'El país incrementa su capacidad de energía solar y eólica en 2026.',
        url:         'https://www.eltiempo.com/colombia/energias-renovables',
        urlToImage:  null,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        title:       'Medellín inaugura nuevo sistema de transporte',
        description: 'La ciudad estrena una línea de metro ligero para mejorar la movilidad.',
        url:         'https://www.elcolombiano.com/medellin/metro-ligero',
        urlToImage:  null,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        title:       'Cali celebra festival cultural internacional',
        description: 'Artistas de todo el mundo se reúnen en Cali para el festival anual.',
        url:         'https://www.semana.com/cultura/cali-festival',
        urlToImage:  null,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];
  }
}

export default NewsAPI;