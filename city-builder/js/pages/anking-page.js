import { STORAGE_KEYS } from '../config/constants.js';

function getRanking() {
  const raw = localStorage.getItem(STORAGE_KEYS.ranking);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return (data.ranking ?? [])
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function renderTable() {
  const tbody = document.querySelector('#ranking-table tbody');
  if (!tbody) return;
  const ranking = getRanking();

  if (ranking.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;opacity:0.6;">No hay partidas registradas aún.</td></tr>';
    return;
  }

  tbody.innerHTML = ranking.map((entry, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${entry.cityName ?? '—'}</td>
      <td>${entry.mayor ?? '—'}</td>
      <td>${entry.score ?? 0}</td>
      <td>${entry.population ?? 0}</td>
      <td>${entry.happiness ?? 0}</td>
      <td>${entry.turns ?? 0}</td>
      <td>${entry.date ? new Date(entry.date).toLocaleDateString() : '—'}</td>
    </tr>
  `).join('');
}

// Botones
document.getElementById('btn-reset-ranking')?.addEventListener('click', () => {
  if (confirm('¿Seguro que deseas borrar el ranking?')) {
    localStorage.removeItem(STORAGE_KEYS.ranking);
    renderTable();
  }
});

document.getElementById('btn-export-ranking')?.addEventListener('click', () => {
  const raw = localStorage.getItem(STORAGE_KEYS.ranking) ?? '{"ranking":[]}';
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'city_ranking.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
});

document.getElementById('btn-back')?.addEventListener('click', () => {
  window.location.href = '../index.html';
});

renderTable();