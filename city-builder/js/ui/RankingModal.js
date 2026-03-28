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
    this.btnOpen?.addEventListener('click', () => this.openModal());
    // Solo listeners de cierre aquí, los de reset/export van en openModal
    this.btnClose?.addEventListener('click', () => this.closeModal());
  }

  openModal() {
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
    let currentHtml = '';
    if (currentRank && currentRank > 10) {
      const allEntries = this.rankingService.getAllEntries() || [];
      const entry = allEntries.find(e => `${e.cityName}::${e.mayor}` === currentKey);
      if (entry) {
        currentHtml = `<div id="ranking-current-info" class="ranking-current-info"><b>Tu ciudad:</b> Posición ${currentRank} - ${entry.cityName} (${entry.mayor}) - ${entry.score} pts</div>`;
      }
    }
    this.modal.innerHTML = `
    <div class="modal__header">
      <h2>Ranking de Ciudades</h2>
      <button id="modal-close-ranking" class="modal__close">&times;</button>
    </div>
    <div class="modal__body">
      ${html}
      ${currentHtml}
    </div>
    <div class="modal__footer">
      <button id="btn-reset-ranking">Borrar ranking</button>
      <button id="btn-export-ranking">Exportar JSON</button>
    </div>
  `;
    this.modal.classList.remove('modal--hidden');
    // Re-asignar listeners tras reescribir el innerHTML
    this.modal.querySelector('#modal-close-ranking')?.addEventListener('click', () => this.closeModal());
    this.modal.querySelector('#btn-reset-ranking')?.addEventListener('click', () => {
      if (window.confirm('¿Seguro que deseas borrar el ranking?')) {
        this.rankingService.resetRanking();
        this.openModal();
      }
    });
    this.modal.querySelector('#btn-export-ranking')?.addEventListener('click', () => this.rankingService.exportRanking());
  }

  closeModal() {
    this.modal?.classList.add('modal--hidden');
  }
}

export default RankingModal;