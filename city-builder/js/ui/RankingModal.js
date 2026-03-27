class RankingModal {
  constructor(gameStore, eventBus, rankingService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.rankingService = rankingService;
    this.modal = document.getElementById('ranking-modal');
    this.btnOpen = document.getElementById('btn-ranking');
    this.btnClose = document.getElementById('modal-close');
    this.btnReset = document.getElementById('btn-reset-ranking');
    this.btnExport = document.getElementById('btn-export-ranking');
    this.tbody = null;
  }

  init() {
    this.btnOpen?.addEventListener('click', () => this.#openModal());
    this.btnClose?.addEventListener('click', () => this.#closeModal());
    this.btnReset?.addEventListener('click', () => {
      if (window.confirm('¿Seguro que deseas borrar el ranking?')) {
        this.rankingService.resetRanking();
        this.#openModal();
      }
    });
    this.btnExport?.addEventListener('click', () => this.rankingService.exportRanking());
  }

  #openModal() {
    if (!this.modal) return;
    const ranking = this.rankingService.getRanking();
    const state = this.gameStore.getState();
    const city = state.city;
    const currentKey = city ? `${city.name}::${city.mayor}` : null;
    const currentRank = this.rankingService.getCurrentCityRank();

    let html = `<table class="ranking-table"><thead><tr><th>Pos</th><th>Ciudad</th><th>Alcalde</th><th>Puntuación</th><th>Población</th><th>Felicidad</th><th>Turnos</th><th>Fecha</th></tr></thead><tbody>`;
    ranking.forEach((entry, i) => {
      const key = `${entry.cityName}::${entry.mayor}`;
      html += `<tr class="ranking-row${key === currentKey ? ' ranking-row--current' : ''}"><td>${i + 1}</td><td>${entry.cityName}</td><td>${entry.mayor}</td><td>${entry.score}</td><td>${entry.population}</td><td>${entry.happiness}</td><td>${entry.turns}</td><td>${new Date(entry.date).toLocaleDateString()}</td></tr>`;
    });
    html += '</tbody></table>';
    // Si la ciudad actual no está en top 10 pero existe
    if (currentRank && currentRank > 10) {
      const allEntries = this.rankingService.getAllEntries() || [];
      const entry = allEntries.find(e => `${e.cityName}::${e.mayor}` === currentKey);
      if (entry) {
        html += `<div id="ranking-current"><b>Tu ciudad:</b> Posición ${currentRank} - ${entry.cityName} (${entry.mayor}) - ${entry.score} pts</div>`;
      }
    }
    this.modal.querySelector('.ranking-modal-content').innerHTML = html;
    this.modal.classList.remove('modal--hidden');
  }

  #closeModal() {
    this.modal?.classList.add('modal--hidden');
  }
}

export default RankingModal;