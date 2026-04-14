// ─────────────────────────────────────────────
//  NewsAPI.js  — Single Responsibility: solo fetch + caché de noticias
//  Principios SOLID aplicados:
//    S — Solo gestiona obtención y caché de noticias
//    O — Extensible: se puede subclasificar para otras fuentes
//    D — Recibe apiKey por constructor (inyección de dependencia)
// ─────────────────────────────────────────────

class NewsAPI {
  #apiKey;
  #cacheDurationMs = 30 * 60 * 1000;   // 30 min por país
  #cache = {};                           // { [countryCode]: { lastFetch, data } }

  static #BASE_URL  = 'https://newsapi.org/v2/everything';
  static #PAGE_SIZE = 5;

  constructor(apiKey) {
    this.#apiKey = apiKey;
  }

  // ── Interfaz pública ──────────────────────────────────────────────

  /**
   * Retorna las últimas noticias para el país indicado.
   * @param {string} countryCode  Código ISO-2 del país (ej. 'co', 'us')
   * @returns {Promise<Article[]>}
   */
  async getNews(countryCode = 'co') {
    if (this.#isCacheValid(countryCode)) {
      return this.#cache[countryCode].data;
    }

    if (!this.#apiKey) return this.#mockNews();

    try {
      const url  = this.#buildUrl(countryCode);
      const res  = await fetch(url);

      if (!res.ok) throw new Error(`NewsAPI ${res.status}: ${res.statusText}`);

      const data     = await res.json();
      const articles = this.#mapArticles(data.articles);

      this.#setCache(countryCode, articles);
      return articles;

    } catch (e) {
      console.warn(`[NewsAPI] Error para "${countryCode}":`, e.message);
      return this.#mockNews();
    }
  }

  /** Invalida el caché de un país (o todo si se omite). */
  clearCache(countryCode = null) {
    if (countryCode) delete this.#cache[countryCode];
    else this.#cache = {};
  }

  // ── Métodos privados ──────────────────────────────────────────────

  #buildUrl(countryCode) {
    const today = new Date().toISOString().split('T')[0];   // YYYY-MM-DD
    const params = new URLSearchParams({
      q:         countryCode,
      from:      today,
      sortBy:    'popularity',
      pageSize:  NewsAPI.#PAGE_SIZE,
      apiKey:    this.#apiKey,
    });
    return `${NewsAPI.#BASE_URL}?${params}`;
  }

  #isCacheValid(countryCode) {
    const entry = this.#cache[countryCode];
    return !!entry && (Date.now() - entry.lastFetch) < this.#cacheDurationMs;
  }

  #setCache(countryCode, data) {
    this.#cache[countryCode] = { lastFetch: Date.now(), data };
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