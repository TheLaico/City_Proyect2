class RankingModal {
  constructor(gameStore, eventBus, rankingService) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.rankingService = rankingService;
    this.modal = document.getElementById('ranking-modal');
    this.btnOpen = document.getElementById('btn-ranking');
    this.btnClose = document.getElementById('modal-close');
  }

  init() {
    this.btnOpen?.addEventListener('click', () => this.openModal());
    this.btnClose?.addEventListener('click', () => this.closeModal());
  }

  // ─── Desglose ────────────────────────────────────────────────────────────

  #buildBreakdownHTML(entry) {
    let byPop, byHappy, byBuildings, byResources, bonuses, penalties;

    if (entry.breakdown) {
      const base = entry.breakdown.base ?? {};
      bonuses    = entry.breakdown.bonuses   ?? [];
      penalties  = entry.breakdown.penalties ?? [];
      byPop       = Math.round(base.population         ?? 0);
      byHappy     = Math.round(base.avgHappiness        ?? 0);
      byBuildings = Math.round(base.numBuildings         ?? 0);
      byResources = Math.round(
        (base.money              ?? 0) +
        (base.balanceElectricity ?? 0) +
        (base.balanceWater       ?? 0)
      );
    } else {
      byPop       = (entry.population ?? 0) * 10;
      byHappy     = Math.round((entry.happiness ?? 0) * 5);
      byBuildings = 0;
      byResources = 0;
      bonuses     = [];
      penalties   = [];
    }

    const totalBonus = bonuses.reduce((s, b) => s + (b.value ?? 0), 0);
    const totalPenal = penalties.reduce((s, p) => s + (p.value ?? 0), 0);

    const bonusRows = bonuses.length
      ? bonuses.map(b => '<li>' + b.label + ': <b>+' + b.value + '</b></li>').join('')
      : '<li>Ninguna</li>';

    const penalRows = penalties.length
      ? penalties.map(p => '<li>' + p.label + ': <b>' + p.value + '</b></li>').join('')
      : '<li>Ninguna</li>';

    const nota = entry.breakdown ? '' : '<p class="detail-note">* Datos parciales: entrada guardada antes de la versión actual.</p>';

    return nota
      + '<table class="detail-table"><tbody>'
      + '<tr><td>Puntos por población</td><td><b>' + byPop + '</b></td></tr>'
      + '<tr><td>Puntos por felicidad</td><td><b>' + byHappy + '</b></td></tr>'
      + '<tr><td>Puntos por edificios</td><td><b>' + byBuildings + '</b></td></tr>'
      + '<tr><td>Puntos por recursos</td><td><b>' + byResources + '</b></td></tr>'
      + '</tbody></table>'
      + '<p class="detail-section-label">Bonificaciones (+' + totalBonus + ')</p>'
      + '<ul class="detail-list">' + bonusRows + '</ul>'
      + '<p class="detail-section-label">Penalizaciones (' + totalPenal + ')</p>'
      + '<ul class="detail-list">' + penalRows + '</ul>'
      + '<hr class="detail-hr">'
      + '<p class="detail-total">Total: <b>' + (entry.score ?? 0) + ' pts</b></p>';
  }

  #openDetailModal(entry) {
    const existing = document.getElementById('detail-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id        = 'detail-overlay';
    overlay.className = 'detail-overlay';

    const modal = document.createElement('div');
    modal.className = 'detail-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const header = document.createElement('div');
    header.className = 'detail-modal__header';

    const title = document.createElement('h2');
    title.textContent = 'Detalle: ' + (entry.cityName ?? '');

    const closeBtn = document.createElement('button');
    closeBtn.className   = 'detail-modal__close';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.addEventListener('click', () => overlay.remove());

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'detail-modal__body';
    body.innerHTML = this.#buildBreakdownHTML(entry);

    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  // ─── Modal principal ──────────────────────────────────────────────────────

  openModal() {
    if (!this.modal) return;

    const ranking    = this.rankingService.getRanking();
    const state      = this.gameStore.getState();
    const city       = state.city;
    const currentKey = city ? `${city.name}::${city.mayorName}` : null;
    const currentRank = this.rankingService.getCurrentCityRank();

    // Filas de la tabla
    let rowsHTML = '';
    ranking.forEach((entry, i) => {
      const key       = `${entry.cityName}::${entry.mayor}`;
      const isCurrent = key === currentKey ? ' ranking-row--current' : '';
      const fecha     = entry.date ? new Date(entry.date).toLocaleDateString('es-CO') : '—';
      rowsHTML += '<tr class="ranking-row' + isCurrent + '">'
        + '<td>' + (i + 1) + '</td>'
        + '<td>' + (entry.cityName ?? '—') + '</td>'
        + '<td>' + (entry.mayor ?? '—') + '</td>'
        + '<td>' + (entry.score ?? 0) + '</td>'
        + '<td>' + (entry.population ?? 0) + '</td>'
        + '<td>' + (entry.happiness ?? 0) + '%</td>'
        + '<td>' + (entry.turns ?? 0) + '</td>'
        + '<td>' + fecha + '</td>'
        + '<td><button class="btn-detail" data-key="' + key + '">Ver detalle</button></td>'
        + '</tr>';
    });

    // Ciudad actual fuera del top 10
    let currentHtml = '';
    if (currentRank && currentRank > 10) {
      const allEntries = this.rankingService.getAllEntries() || [];
      const entry = allEntries.find(e => `${e.cityName}::${e.mayor}` === currentKey);
      if (entry) {
        currentHtml = '<div class="ranking-current-info">'
          + '<b>Tu ciudad:</b> Posición ' + currentRank
          + ' — ' + entry.cityName + ' (' + entry.mayor + ')'
          + ' — ' + (entry.score ?? 0) + ' pts'
          + '</div>';
      }
    }

    this.modal.innerHTML = ''
      + '<div class="modal__header">'
      +   '<h2>Ranking de Ciudades</h2>'
      +   '<button id="modal-close-ranking" class="modal__close">&times;</button>'
      + '</div>'
      + '<div class="modal__body">'
      +   '<table class="ranking-table">'
      +     '<thead><tr>'
      +       '<th>Pos</th><th>Ciudad</th><th>Alcalde</th>'
      +       '<th>Puntuación</th><th>Población</th><th>Felicidad</th>'
      +       '<th>Turnos</th><th>Fecha</th><th>Detalle</th>'
      +     '</tr></thead>'
      +     '<tbody>' + rowsHTML + '</tbody>'
      +   '</table>'
      +   currentHtml
      + '</div>'
      + '<div class="modal__footer">'
      +   '<button id="btn-reset-ranking">Borrar ranking</button>'
      +   '<button id="btn-export-ranking">Exportar JSON</button>'
      + '</div>';

    this.modal.classList.remove('modal--hidden');

    // Listeners
    this.modal.querySelector('#modal-close-ranking')
      ?.addEventListener('click', () => this.closeModal());

    this.modal.querySelector('#btn-reset-ranking')
      ?.addEventListener('click', () => {
        if (window.confirm('¿Seguro que deseas borrar el ranking?')) {
          this.rankingService.resetRanking();
          this.openModal();
        }
      });

    this.modal.querySelector('#btn-export-ranking')
      ?.addEventListener('click', () => this.rankingService.exportRanking());

    // Botones "Ver detalle"
    this.modal.querySelectorAll('.btn-detail').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key   = btn.dataset.key;
        const entry = this.rankingService.getAllEntries()
          .find(e => `${e.cityName}::${e.mayor}` === key);
        if (entry) this.#openDetailModal(entry);
      });
    });
  }

  closeModal() {
    this.modal?.classList.add('modal--hidden');
  }
}

export default RankingModal;