import RankingService from '../services/RankingService.js';
import GameStore from '../store/GameStore.js';
import EventBus from '../events/EventBus.js';
import SaveService from '../services/SaveService.js';

/**
 * GameOverPage
 * Controlador de pages/game-over.html.
 * Responsabilidad única: leer los datos del sessionStorage/localStorage
 * y volcarlos en los elementos del DOM que ya existen en el HTML.
 * No genera markup, no decide estilos, no orquesta eventos del juego.
 */

const CAUSE_LABELS = {
  money:       '💰 Sin dinero',
  electricity: '⚡ Sin electricidad',
  water:       '💧 Sin agua',
  food:        '🍞 Sin alimentos',
};

const MEDAL_CLASS = { 1: 'top1', 2: 'top2', 3: 'top3' };

// ── Helpers de relleno ────────────────────────────────────────────────────────

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setClass(id, cls) {
  document.getElementById(id)?.classList.add(cls);
}

// ── Leer datos persistidos ────────────────────────────────────────────────────

function loadSnapshot() {
  try {
    const raw = sessionStorage.getItem('game_over_snapshot');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Rellenar secciones ────────────────────────────────────────────────────────

function fillStats(snapshot) {
  if (!snapshot) return;

  setText('go-city-name',  snapshot.cityName  ?? '—');
  setText('go-mayor-name', snapshot.mayorName ?? '—');
  setText('go-turn',       snapshot.turn      ?? '—');
  setText('go-population', snapshot.population ?? '—');
  setText('go-happiness',  snapshot.happiness != null ? `${snapshot.happiness}%` : '—');
  setText('go-score',      snapshot.score != null ? snapshot.score.toLocaleString() : '—');

  if ((snapshot.happiness ?? 100) < 40) {
    setClass('go-happiness', 'danger');
  }
}

function fillCauses(snapshot) {
  const list = document.getElementById('go-causes');
  if (!list) return;

  const causes = snapshot?.causes ?? [];
  if (causes.length === 0) {
    list.innerHTML = '<li>Recursos agotados</li>';
    return;
  }

  list.innerHTML = causes
    .map(r => `<li>${CAUSE_LABELS[r] ?? r}</li>`)
    .join('');
}

function fillRanking(snapshot) {
  const tbody = document.getElementById('go-ranking-body');
  if (!tbody) return;

  const gameStore     = new GameStore();
  const eventBus      = new EventBus();
  const rankingService = new RankingService(gameStore, eventBus);
  const ranking        = rankingService.getRanking() ?? [];

  if (ranking.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted)">Sin entradas aún.</td></tr>';
    return;
  }

  const currentKey = snapshot
    ? `${snapshot.cityName}::${snapshot.mayorName}`
    : null;

  tbody.innerHTML = ranking.map((entry, i) => {
    const pos     = i + 1;
    const key     = `${entry.cityName}::${entry.mayor}`;
    const current = key === currentKey ? ' go-current' : '';
    const medal   = MEDAL_CLASS[pos] ?? '';
    const fecha   = entry.date
      ? new Date(entry.date).toLocaleDateString('es-CO')
      : '—';

    return `
      <tr class="${current}">
        <td><span class="go-rank-pos ${medal}">${pos}</span></td>
        <td>${entry.cityName ?? '—'}</td>
        <td>${entry.mayor    ?? '—'}</td>
        <td><b>${(entry.score ?? 0).toLocaleString()}</b></td>
        <td>${entry.population ?? 0}</td>
        <td>${entry.turns      ?? 0}</td>
        <td>${fecha}</td>
      </tr>
    `;
  }).join('');
}

function bindActions() {
  document.getElementById('go-btn-inicio')?.addEventListener('click', () => {
    const gameStore  = new GameStore();
    const eventBus   = new EventBus();
    const saveService = new SaveService(gameStore, eventBus);
    saveService.deleteSave();
    sessionStorage.removeItem('game_over_snapshot');
    window.location.href = 'setup.html';
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const snapshot = loadSnapshot();
fillStats(snapshot);
fillCauses(snapshot);
fillRanking(snapshot);
bindActions();