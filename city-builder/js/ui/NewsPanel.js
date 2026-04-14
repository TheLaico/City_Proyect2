class NewsPanel {
  #intervalId = null;
  #lastArticles = null;

  constructor(eventBus, newsAPI) {
    this.eventBus = eventBus;
    this.newsAPI = newsAPI;
    this.container = document.getElementById('news-panel');
  }

  async init(country = 'co') {
    if (!this.container) return;
    const articles = await this.newsAPI.getNews(country);
    this.#lastArticles = articles;
    this.#render(articles);
    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#intervalId = setInterval(async () => {
      const newArticles = await this.newsAPI.getNews(country);
      this.#lastArticles = newArticles;
      this.#render(newArticles);
    }, 30 * 60 * 1000);
  }

  #render(articles) {
    if (!this.container) return;
    if (!articles || articles.length === 0) {
      this.container.innerHTML = '<div class="news-empty">No hay noticias disponibles</div>';
      return;
    }
    this.container.innerHTML = '<ul class="news-list"></ul>';
    const ul = this.container.querySelector('.news-list');
    articles.slice(0, 5).forEach(article => {
      const li = document.createElement('li');
      li.className = 'news-item';
      const imgSrc = article.urlToImage || 'https://placehold.co/80x80?text=News';
      const title = this.#truncate(article.title, 80);
      const desc = this.#truncate(article.description, 120);
      const time = this.#relativeTime(article.publishedAt);
      li.innerHTML = `
        <a href="${article.url}" target="_blank" rel="noopener" class="news-link">
          <img src="${imgSrc}" alt="imagen noticia" class="news-img" loading="lazy">
          <div class="news-content">
            <div class="news-title">${title}</div>
            <div class="news-desc">${desc}</div>
            <div class="news-time">${time}</div>
          </div>
        </a>
      `;
      ul.appendChild(li);
    });
  }

  #truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  }

  #relativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'hace unos segundos';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`;
    return `hace ${Math.floor(diff / 86400)} días`;
  }
}

export default NewsPanel;
