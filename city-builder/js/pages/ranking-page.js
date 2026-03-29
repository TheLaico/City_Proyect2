import { STORAGE_KEYS } from '../config/constants.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllRaw() {
  const raw = localStorage.getItem(STORAGE_KEYS.ranking);
  if (!raw) return { ranking: [] };
  try { return JSON.parse(raw); } catch { return { ranking: [] }; }
}

function getSorted() {
  return getAllRaw().ranking
    .filter(e => e.cityName && e.mayor)
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function getTop10() {
  return getSorted().slice(0, 10);
}

function getCurrentCityKey() {
  return sessionStorage.getItem('current_city_key') ?? null;
}

// ─── Desglose ─────────────────────────────────────────────────────────────────
// Si la entrada tiene breakdown guardado, lo usa.
// Si no (entradas viejas), reconstruye una estimación con los campos disponibles.

function buildBreakdownHTML(entry) {
  let byPop, byHappy, byBuildings, byResources, bonuses, penalties, totalBonus, totalPenal;

  if (entry.breakdown) {
    const bd  = entry.breakdown;
    const base = bd.base ?? {};
    bonuses    = bd.bonuses   ?? [];
    penalties  = bd.penalties ?? [];
    byPop       = Math.round(base.population         ?? 0);
    byHappy     = Math.round(base.avgHappiness        ?? 0);
    byBuildings = Math.round(base.numBuildings         ?? 0);
    byResources = Math.round(
      (base.money              ?? 0) +
      (base.balanceElectricity ?? 0) +
      (base.balanceWater       ?? 0)
    );
  } else {
    // Reconstrucción estimada desde campos básicos
    byPop       = (entry.population ?? 0) * 10;
    byHappy     = Math.round((entry.happiness ?? 0) * 5);
    byBuildings = 0;
    byResources = 0;
    bonuses     = [];
    penalties   = [];
  }

  totalBonus = bonuses.reduce((s, b) => s + (b.value ?? 0), 0);
  totalPenal = penalties.reduce((s, p) => s + (p.value ?? 0), 0);

  const bonusRows = bonuses.length
    ? bonuses.map(b => '<li>' + b.label + ': <b>+' + b.value + '</b></li>').join('')
    : '<li>Ninguna</li>';

  const penalRows = penalties.length
    ? penalties.map(p => '<li>' + p.label + ': <b>' + p.value + '</b></li>').join('')
    : '<li>Ninguna</li>';

  const nota = entry.breakdown ? '' : '<p class="detail-note">* Datos parciales: esta entrada fue guardada antes de la versión actual.</p>';

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

// ─── Modal de detalle ─────────────────────────────────────────────────────────

function openDetailModal(entry) {
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
  closeBtn.addEventListener('click', function() { overlay.remove(); });

  header.appendChild(title);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'detail-modal__body';
  body.innerHTML = buildBreakdownHTML(entry);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

// ─── Tabla ────────────────────────────────────────────────────────────────────

function renderCurrentCityInfo(entry, position) {
  const el = document.getElementById('ranking-current-info');
  if (!el) return;
  if (!entry) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.textContent = 'Tu ciudad: posición ' + position
    + ' — ' + entry.cityName
    + ' (' + entry.mayor + ')'
    + ' — ' + (entry.score ?? 0) + ' pts';
}

function renderTable() {
  const tbody = document.querySelector('#ranking-table tbody');
  if (!tbody) return;

  const top10      = getTop10();
  const allSorted  = getSorted();
  const currentKey = getCurrentCityKey();

  if (top10.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="ranking-empty">No hay partidas registradas aún.</td></tr>';
    renderCurrentCityInfo(null, null);
    return;
  }

  tbody.innerHTML = '';

  top10.forEach(function(entry, i) {
    const key       = entry.cityName + '::' + entry.mayor;
    const isCurrent = key === currentKey;
    const fecha     = entry.date
      ? new Date(entry.date).toLocaleDateString('es-CO')
      : '—';

    const tr = document.createElement('tr');
    if (isCurrent) tr.classList.add('ranking-row--current');

    tr.innerHTML = '<td>' + (i + 1) + '</td>'
      + '<td>' + entry.cityName + '</td>'
      + '<td>' + entry.mayor + '</td>'
      + '<td>' + (entry.score ?? 0) + '</td>'
      + '<td>' + (entry.population ?? 0) + '</td>'
      + '<td>' + (entry.happiness ?? 0) + '%</td>'
      + '<td>' + (entry.turns ?? 0) + '</td>'
      + '<td>' + fecha + '</td>'
      + '<td></td>';

    const btn = document.createElement('button');
    btn.className   = 'btn-detail';
    btn.textContent = 'Ver detalle';
    btn.addEventListener('click', function() { openDetailModal(entry); });

    tr.querySelector('td:last-child').appendChild(btn);
    tbody.appendChild(tr);
  });

  const currentIndex = currentKey
    ? allSorted.findIndex(function(e) { return (e.cityName + '::' + e.mayor) === currentKey; })
    : -1;

  if (currentIndex >= 10) {
    renderCurrentCityInfo(allSorted[currentIndex], currentIndex + 1);
  } else {
    renderCurrentCityInfo(null, null);
  }
}

// ─── Botones ──────────────────────────────────────────────────────────────────

document.getElementById('btn-reset-ranking').addEventListener('click', function() {
  if (confirm('¿Seguro que deseas borrar el ranking? Esta acción no se puede deshacer.')) {
    localStorage.removeItem(STORAGE_KEYS.ranking);
    renderTable();
  }
});

document.getElementById('btn-export-ranking').addEventListener('click', function() {
  const raw  = localStorage.getItem(STORAGE_KEYS.ranking) ?? '{"ranking":[]}';
  const blob = new Blob([raw], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'city_ranking.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
});

document.getElementById('btn-back').addEventListener('click', function() {
  window.location.href = '../index.html';
});

// ─── Init ─────────────────────────────────────────────────────────────────────
renderTable();