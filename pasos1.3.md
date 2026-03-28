# PROMPTS PENDIENTES — City Builder
> Basado en análisis del estado actual del proyecto (marzo 2026).
> Restricción crítica: **cero `<style>` o `<script>` inline en HTML**. Cada incumplimiento: -0.5 décimas.

---

## RESUMEN DE ESTADO ACTUAL

| Módulo | Estado real |
|--------|-------------|
| `constants.js` | ✅ Completo (129 líneas con todas las constantes) |
| `BuildingAdapter.js` | ✅ Completo |
| `CityAdapter.js` | ✅ Completo |
| `index.html` | ✅ Completo |
| `pages/setup.html` | ✅ Completo |
| `pages/ranking.html` | ⚠️ Tiene bug: `<tr id="ranking-current">` fuera de `<table>` |
| `ColombiaAPI.js` | ✅ Completo |
| `WeatherAPI.js` | ✅ Completo |
| `NewsAPI.js` | ✅ Completo |
| `RouteService.js` | ✅ Completo (Dijkstra implementado) |
| `RankingService.js` | ✅ Completo |
| `ChartPanel.js` | ✅ Completo |
| `WeatherWidget.js` | ✅ Completo |
| `NewsPanel.js` | ✅ Completo |
| `CitizenPanel.js` | ✅ Completo |
| `ScorePanel.js` | ✅ Completo |
| `RankingModal.js` | ⚠️ Bug: busca `.ranking-modal-content` que no existe en el modal HTML |
| `BuildingInfoModal.js` | ✅ Completo |
| `InputController.js` | ✅ Completo |
| `SetupController.js` | ✅ Completo |
| `main.js` | ⚠️ Falta inicializar `weatherWidget` y `newsPanel` con coordenadas tras `GAME_STARTED` |
| `SetupScreen.js` | ❌ **No existe** — archivo faltante |
| `js/models/Citizen.js` | ❌ **Vacío** (solo comentario) |
| `js/models/Resource.js` | ❌ **Vacío** |
| `js/models/Score.js` | ❌ **Vacío** |
| `js/history/ResourceHistory.js` | ❌ **Vacío** (solo comentario) |
| CSS (todos) | ⚠️ Existen pero deben ser revisados/completados |

---

## ─── BLOQUE A · MODELOS VACÍOS (CRÍTICOS) ───
> Sin estos modelos, `CitizenService`, `ScoreService` y `ChartPanel` están rotos.

---

### PROMPT A1 — `js/models/Citizen.js`

**Archivo a crear:** `city-builder/js/models/Citizen.js`

El archivo está completamente vacío. Es la entidad que representa a un habitante de la ciudad.

**Implementación completa:**

```js
class Citizen {
  constructor({ id, homeId = null, jobId = null, happiness = 50 } = {}) {
    this.id = id ?? (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    this.homeId = homeId;
    this.jobId = jobId;
    this.happiness = Math.min(100, Math.max(0, happiness));
  }

  get hasHome() { return this.homeId !== null; }
  get hasJob()  { return this.jobId  !== null; }

  clampHappiness() {
    this.happiness = Math.min(100, Math.max(0, this.happiness));
  }

  toJSON() {
    return { id: this.id, homeId: this.homeId, jobId: this.jobId, happiness: this.happiness };
  }

  static fromJSON(data) {
    return new Citizen(data);
  }
}

export default Citizen;
```

**Reglas:**
- `export default Citizen`.
- `happiness` siempre entre 0 y 100 (usar `clampHappiness()` tras modificarla).
- Sin importaciones externas.

---

### PROMPT A2 — `js/models/Resource.js`

**Archivo a crear:** `city-builder/js/models/Resource.js`

El archivo está completamente vacío. Encapsula el estado de un recurso individual (dinero, electricidad, agua, alimento).

**Implementación completa:**

```js
class Resource {
  constructor({ type, amount = 0 } = {}) {
    this.type   = type;
    this.amount = amount;
  }

  add(value)      { this.amount += value; }
  subtract(value) { this.amount -= value; }
  set(value)      { this.amount = value; }

  isNegative()    { return this.amount < 0; }
  isZero()        { return this.amount === 0; }

  toJSON() {
    return { type: this.type, amount: this.amount };
  }

  static fromJSON(data) {
    return new Resource(data);
  }
}

export default Resource;
```

**Reglas:**
- `export default Resource`.
- Sin importaciones externas.
- `amount` puede ser negativo (el juego termina si electricidad o agua llegan a negativo).

---

### PROMPT A3 — `js/models/Score.js`

**Archivo a crear:** `city-builder/js/models/Score.js`

El archivo está completamente vacío. Almacena la puntuación actual y su desglose por categorías.

**Implementación completa:**

```js
class Score {
  constructor({ current = 0, breakdown = {} } = {}) {
    this.current = current;
    this.breakdown = {
      population:  breakdown.population  ?? 0,
      happiness:   breakdown.happiness   ?? 0,
      buildings:   breakdown.buildings   ?? 0,
      resources:   breakdown.resources   ?? 0,
      bonuses:     breakdown.bonuses     ?? 0,
      penalties:   breakdown.penalties   ?? 0,
    };
  }

  update(newCurrent, newBreakdown) {
    this.current   = newCurrent;
    this.breakdown = { ...this.breakdown, ...newBreakdown };
  }

  toJSON() {
    return { current: this.current, breakdown: { ...this.breakdown } };
  }

  static fromJSON(data) {
    return new Score(data);
  }
}

export default Score;
```

**Reglas:**
- `export default Score`.
- Sin importaciones externas.
- El campo `breakdown` debe tener exactamente las 6 claves del constructor.

---

## ─── BLOQUE B · HISTORY (DESBLOQUEANTE PARA GRÁFICAS) ───

---

### PROMPT B1 — `js/history/ResourceHistory.js`

**Archivo a crear:** `city-builder/js/history/ResourceHistory.js`

El archivo tiene solo 1 línea de comentario. Sin él, `ChartPanel` no puede leer histórico (`gameStore.getState().resourceHistory?.getHistory()` retorna vacío).

**Implementación completa:**

```js
const MAX_HISTORY = 20;

class ResourceHistory {
  #entries = [];

  addEntry(turn, resources) {
    this.#entries.push({
      turn,
      money:       resources.money       ?? 0,
      electricity: resources.electricity ?? 0,
      water:       resources.water       ?? 0,
      food:        resources.food        ?? 0,
    });
    if (this.#entries.length > MAX_HISTORY) {
      this.#entries.shift();
    }
  }

  getHistory() {
    return [...this.#entries];
  }

  clear() {
    this.#entries = [];
  }

  toJSON() {
    return [...this.#entries];
  }

  static fromJSON(arr) {
    const rh = new ResourceHistory();
    if (Array.isArray(arr)) {
      arr.slice(-MAX_HISTORY).forEach(e => rh.#entries.push(e));
    }
    return rh;
  }
}

export default ResourceHistory;
```

**Integración requerida en `TurnService.js`:**

En el método `#executeTurn()`, después de llamar a `this.resourceService.calculateTurnResources()` y antes de emitir `TURN_ENDED`, agregar:

```js
const state = this.gameStore.getState();
if (state.resourceHistory) {
  state.resourceHistory.addEntry(state.turn, state.resources);
}
```

**Reglas:**
- `export default ResourceHistory`.
- Buffer circular de máximo 20 entradas.
- `fromJSON` debe ser capaz de reconstruir el historial al cargar partida guardada.

---

## ─── BLOQUE C · SETUP SCREEN (CRÍTICO PARA FLUJO INICIAL) ───

---

### PROMPT C1 — `js/ui/SetupScreen.js` (crear desde cero)

**Archivo a crear:** `city-builder/js/ui/SetupScreen.js`

El archivo no existe en el proyecto. Es el componente UI que maneja el formulario de creación de ciudad en `pages/setup.html`. Sin él, el setup no tiene lógica de búsqueda de ciudades ni carga de mapas `.txt`.

**Constructor:** `constructor(eventBus, colombiaAPI, mapLoaderService)`

**Método `init()`** — debe implementar:

**1. Búsqueda de ciudades colombianas (debounce 300ms):**
```js
const regionSearch = document.getElementById('region-search');
let debounceTimer = null;
regionSearch?.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const results = await this.colombiaAPI.searchCities(e.target.value);
    this.#renderRegionResults(results);
  }, 300);
});
```

**2. Método `#renderRegionResults(cities)`:**
- Limpiar y rellenar `#region-results` (`<ul>`) con `<li>` por cada ciudad.
- Al hacer click en un `<li>`: guardar `this.#selectedRegion = { cityName, lat, lon }` y actualizar `#lat-display` y `#lon-display`.
- Vaciar `#region-results` después de seleccionar.

**3. Carga de mapa desde archivo `.txt`:**
```js
document.getElementById('btn-load-map')?.addEventListener('click', () => {
  document.getElementById('map-file-input')?.click();
});
document.getElementById('map-file-input')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  this.mapLoaderService?.loadFromFile(file);
});
```

**4. Listener del formulario `#setup-form` (submit):**
```js
document.getElementById('setup-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!this.#selectedRegion) {
    document.getElementById('setup-errors').textContent = 'Debes seleccionar una ciudad colombiana.';
    return;
  }
  const data = {
    cityName:   document.getElementById('city-name').value.trim(),
    mayorName:  document.getElementById('mayor-name').value.trim(),
    region:     this.#selectedRegion,
    width:      parseInt(document.getElementById('map-width').value, 10),
    height:     parseInt(document.getElementById('map-height').value, 10),
    initElectricity: parseFloat(document.getElementById('init-electricity')?.value || '0'),
    initWater:       parseFloat(document.getElementById('init-water')?.value || '0'),
    initFood:        parseFloat(document.getElementById('init-food')?.value || '0'),
  };
  this.eventBus.emit('setup:submitted', data);
});
```

**5. Mostrar botón `#btn-continue` si hay partida guardada:**
```js
// hasSavedGame se inyecta como función en el constructor o como parámetro
if (this.hasSavedGame?.()) {
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) {
    btnContinue.style.display = 'block';
    btnContinue.addEventListener('click', () => {
      this.eventBus.emit(EventType.GAME_LOAD_REQUESTED);
    });
  }
}
```

**6. Escuchar errores de carga de mapa:**
```js
this.eventBus.subscribe(EventType.BUILD_FAILED, ({ message }) => {
  const errDiv = document.getElementById('setup-errors');
  if (errDiv) errDiv.textContent = message || 'Error al cargar el mapa.';
});
```

**Campo privado:** `#selectedRegion = null;`

**Exportar:** `export default SetupScreen`.

**Restricciones:**
- Sin HTML inline (manipular solo el DOM ya existente en `setup.html`).
- Sin `document.write`. Sin `innerHTML` salvo en `#region-results` y `#setup-errors`.
- Importar `EventType` desde `'../types/EventType.js'`.

---

## ─── BLOQUE D · BUGS Y CORRECCIONES ───

---

### PROMPT D1 — Bug en `pages/ranking.html`: `<tr>` fuera de `<table>`

**Archivo a modificar:** `city-builder/pages/ranking.html`

**Problema:** La línea `<tr id="ranking-current"></tr>` está fuera del elemento `<table>`, lo cual es HTML inválido y causa que el elemento sea ignorado por el navegador.

**Corrección:** Mover el `<tr id="ranking-current">` dentro de `<tbody>` de `#ranking-table`, después de la fila de encabezado. Si la ciudad actual no está en el top 10, se renderizará dinámicamente desde `RankingModal.js`. También agregar una sección separada fuera de la tabla para el caso "Tu ciudad":

```html
<!-- Reemplazar la línea <tr id="ranking-current"></tr> por: -->
<div id="ranking-current-info" class="ranking-current-info" style="display:none"></div>
```

Y actualizar `RankingModal.js` → método `#openModal()`: cambiar el selector de `ranking-current` para buscar `#ranking-current-info` (un `<div>`, no un `<tr>`), y usar `innerHTML` para renderizar la info de la ciudad actual si no está en top 10.

---

### PROMPT D2 — Bug en `RankingModal.js`: selector `.ranking-modal-content` inexistente

**Archivo a modificar:** `city-builder/js/ui/RankingModal.js`

**Problema:** En `#openModal()`, el código hace:
```js
this.modal.querySelector('.ranking-modal-content').innerHTML = html;
```
Pero `#ranking-modal` en `index.html` es solo `<div id="ranking-modal" class="modal modal--hidden"></div>` — no tiene `.ranking-modal-content` adentro. Esto lanza un `TypeError: Cannot set properties of null`.

**Corrección:** Reemplazar ese fragmento por:
```js
// Opción A: escribir directamente en el modal con estructura completa
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
this.modal.querySelector('#modal-close-ranking')?.addEventListener('click', () => this.#closeModal());
this.modal.querySelector('#btn-reset-ranking')?.addEventListener('click', () => {
  if (window.confirm('¿Seguro que deseas borrar el ranking?')) {
    this.rankingService.resetRanking();
    this.#openModal();
  }
});
this.modal.querySelector('#btn-export-ranking')?.addEventListener('click', () => this.rankingService.exportRanking());
```

También mover los listeners de `#btn-reset-ranking` y `#btn-export-ranking` del `init()` al `#openModal()` (ya que el innerHTML se reescribe en cada apertura).

---

### PROMPT D3 — `main.js`: inicialización de WeatherWidget y NewsPanel con coordenadas reales

**Archivo a modificar:** `city-builder/js/main.js`

**Problema:** `weatherWidget` y `newsPanel` se instancian pero **nunca se llama a su `.init()`** con coordenadas. El `SetupController` emite `'weather:init'` y `'news:init'` pero nadie los escucha en `main.js`.

**Corrección:** Después de la línea `gameController.init()`, agregar suscripciones que conecten esos eventos con los widgets:

```js
// Inicializar widgets de clima y noticias cuando el juego arranque con una ciudad
eventBus.subscribe('weather:init', ({ lat, lon }) => {
  weatherWidget.init(lat, lon);
});
eventBus.subscribe('news:init', ({ countryCode }) => {
  newsPanel.init(countryCode || 'co');
});

// Si cargamos una partida existente, recuperar coordenadas del store
eventBus.subscribe(EventType.GAME_LOADED, () => {
  const region = gameStore.getState()?.city?.region;
  if (region?.lat && region?.lon) {
    weatherWidget.init(region.lat, region.lon);
    newsPanel.init('co');
  }
});
```

**Ubicación exacta:** Insertar este bloque justo después de:
```js
[mapRenderer, resourcePanel, buildMenu, notifManager, citizenPanel,
 scorePanel, chartPanel, rankingModal, buildInfoModal, rankingService].forEach(m => m.init && m.init());
```

---

### PROMPT D4 — `main.js`: pasar `mapLoaderService` y `saveService` a `SetupController`

**Archivo a modificar:** `city-builder/js/main.js`

**Problema:** `SetupController` recibe `(gameStore, eventBus, colombiaAPI, mapLoaderService, saveService)` en su constructor, pero en `main.js` solo se instancia con 3 argumentos:
```js
const setupController = new SetupController(gameStore, eventBus, colombiaAPI);
```

Esto hace que `mapLoaderService` y `saveService` sean `undefined`, rompiendo la carga de mapas y el botón "Continuar partida".

**Corrección:**
```js
// Antes de instanciar SetupController, importar los servicios necesarios:
// En los imports al inicio de main.js agregar:
import MapLoaderService from './services/MapLoaderService.js';
import SaveService from './services/SaveService.js';

// Luego instanciar:
const mapLoaderService = new MapLoaderService(gameStore, eventBus);
const saveService = new SaveService(gameStore, eventBus);

// Pasar al SetupController:
const setupController = new SetupController(gameStore, eventBus, colombiaAPI, mapLoaderService, saveService);
```

**Nota:** También instanciar `SetupScreen` y conectarla con `SetupController`. Agregar después de instanciar `setupController`:
```js
import SetupScreen from './ui/SetupScreen.js';
// ...
const setupScreen = new SetupScreen(eventBus, colombiaAPI, mapLoaderService);
// Pasar hasSavedGame como función
setupScreen.hasSavedGame = () => saveService.hasSavedGame();
setupScreen.init();
```

Esto solo debe ejecutarse si estamos en `setup.html` (condicionado a que exista `#setup-form`):
```js
if (document.getElementById('setup-form')) {
  const setupScreen = new SetupScreen(eventBus, colombiaAPI, mapLoaderService);
  setupScreen.hasSavedGame = () => saveService.hasSavedGame();
  setupScreen.init();
}
```

---

## ─── BLOQUE E · CSS PENDIENTE ───

---

### PROMPT E1 — Completar todos los archivos CSS de componentes

Los archivos CSS existen pero tienen contenido mínimo o incompleto. Deben completarse para que la UI funcione visualmente.

**Archivos a completar (en orden de prioridad):**

#### `css/components/modal.css`
```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.modal {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  min-width: 340px; max-width: 90vw;
  max-height: 85vh; overflow-y: auto;
  z-index: 1001;
  animation: modalIn 0.25s ease;
}
.modal--hidden { display: none !important; }
.modal__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-ui); font-size: 1.1rem; font-weight: 700;
  color: var(--color-accent);
}
.modal__close {
  background: none; border: none; color: var(--color-text-muted);
  font-size: 1.4rem; cursor: pointer; line-height: 1;
}
.modal__close:hover { color: var(--color-danger); }
.modal__body { padding: 1rem 1.25rem; color: var(--color-text); }
.modal__footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex; gap: 0.5rem; justify-content: flex-end;
}
@keyframes modalIn {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
```

#### `css/components/notifications.css`
```css
#notifications-container {
  position: fixed; top: 1rem; right: 1rem;
  z-index: 2000;
  display: flex; flex-direction: column; gap: 0.5rem;
  pointer-events: none;
}
.notification {
  min-width: 280px; max-width: 360px;
  padding: 0.75rem 1rem;
  background: var(--color-surface-2);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  border-left: 4px solid var(--color-accent);
  color: var(--color-text); font-family: var(--font-body);
  pointer-events: all;
  animation: slideInRight 0.3s ease;
}
.notification--success { border-left-color: var(--color-success); }
.notification--error   { border-left-color: var(--color-danger); }
.notification--warning { border-left-color: var(--color-warning); }
.notification--info    { border-left-color: var(--color-accent); }
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

#### `css/components/weather-widget.css`
```css
#weather-widget {
  background: linear-gradient(135deg, var(--color-surface), var(--color-surface-2));
  border-radius: var(--border-radius);
  padding: 0.75rem;
  border: 1px solid var(--color-border);
}
.weather-main {
  display: flex; align-items: center; gap: 0.5rem;
}
.weather-icon { width: 48px; height: 48px; }
.weather-temp {
  font-family: var(--font-mono); font-size: 1.6rem;
  color: var(--color-electricity);
}
.weather-desc { font-size: 0.85rem; color: var(--color-text-muted); }
.weather-details {
  display: flex; gap: 1rem; font-size: 0.8rem;
  color: var(--color-text-muted); margin-top: 0.3rem;
}
.weather-skeleton { color: var(--color-text-muted); font-size: 0.85rem; }
```

#### `css/components/news-panel.css`
```css
#news-panel {
  max-height: 280px; overflow-y: auto;
}
.news-list { list-style: none; padding: 0; margin: 0; }
.news-item { border-bottom: 1px solid var(--color-border); }
.news-link {
  display: flex; gap: 0.5rem; padding: 0.5rem;
  text-decoration: none; color: var(--color-text);
}
.news-link:hover { background: var(--color-surface-2); }
.news-img {
  width: 60px; height: 60px; object-fit: cover;
  border-radius: 4px; flex-shrink: 0;
}
.news-content { flex: 1; min-width: 0; }
.news-title { font-size: 0.82rem; font-weight: 600; line-height: 1.3; }
.news-desc  { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }
.news-time  { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px; }
.news-empty { color: var(--color-text-muted); padding: 0.5rem; font-size: 0.85rem; }
```

#### `css/components/citizen-panel.css`
```css
#citizen-panel { padding: 0.5rem; }
.citizen-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.4rem;
}
.citizen-population { font-family: var(--font-ui); font-size: 1rem; font-weight: 700; }
.citizen-warning { color: var(--color-danger);  font-size: 0.8rem; }
.citizen-bonus   { color: var(--color-success); font-size: 0.8rem; }
.citizen-happiness-bar-bg {
  background: var(--color-surface-2);
  border-radius: 4px; height: 14px;
  position: relative; overflow: hidden; margin-bottom: 0.3rem;
}
.citizen-happiness-bar {
  height: 100%; border-radius: 4px;
  transition: width 0.4s ease, background 0.4s ease;
}
.citizen-happiness-label {
  position: absolute; right: 4px; top: 0;
  font-size: 0.7rem; color: var(--color-bg);
  line-height: 14px;
}
.citizen-breakdown { font-size: 0.75rem; color: var(--color-text-muted); }
```

#### `css/components/score-panel.css`
```css
#score-panel { padding: 0.5rem; }
.score-main {
  display: flex; align-items: center; justify-content: space-between;
}
.score-total {
  font-family: var(--font-ui); font-size: 2rem;
  font-weight: 700; color: var(--color-gold);
}
.score-toggle {
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; font-size: 0.9rem;
}
.score-breakdown { margin-top: 0.4rem; font-size: 0.8rem; }
.score-breakdown ul { list-style: none; padding: 0; margin: 0; }
.score-breakdown li { display: flex; justify-content: space-between; padding: 2px 0; }
.score-bonus   { color: var(--color-success); }
.score-penalty { color: var(--color-danger); }
```

#### `css/components/chart-panel.css`
```css
#chart-panel { padding: 0.5rem; }
#resource-chart { width: 100%; height: 140px; }
.chart-legend {
  display: flex; gap: 0.5rem; flex-wrap: wrap;
  font-size: 0.72rem; margin-top: 0.3rem;
}
.chart-message { color: var(--color-text-muted); font-size: 0.8rem; text-align: center; }
```

#### `css/components/ranking-modal.css`
```css
.ranking-table {
  width: 100%; border-collapse: collapse;
  font-size: 0.85rem;
}
.ranking-table th, .ranking-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}
.ranking-table th { color: var(--color-accent); font-family: var(--font-ui); }
.ranking-table tr:hover td { background: var(--color-surface-2); }
.ranking-row--current td { background: rgba(79,195,247,0.12); border-left: 3px solid var(--color-accent); }
.ranking-row:nth-child(1) td:first-child { color: var(--color-gold); font-weight: 700; }
.ranking-row:nth-child(2) td:first-child { color: #b0b0b0; font-weight: 700; }
.ranking-row:nth-child(3) td:first-child { color: #cd7f32; font-weight: 700; }
.ranking-current-info {
  margin-top: 0.75rem; padding: 0.5rem 0.75rem;
  background: rgba(79,195,247,0.1);
  border-left: 3px solid var(--color-accent);
  font-size: 0.85rem; color: var(--color-text);
}
```

---

### PROMPT E2 — CSS principal: layout, mapa, sidebar, recursos, build-menu

**Archivos a completar:**

#### `css/layout/grid-layout.css`
```css
#top-bar {
  height: var(--topbar-height); grid-area: topbar;
  display: flex; align-items: center; gap: 1rem;
  padding: 0 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-ui);
}
#top-bar #city-name { font-size: 1.1rem; font-weight: 700; color: var(--color-accent); flex: 1; }
#top-bar button {
  background: var(--color-surface-2); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--border-radius);
  padding: 0.3rem 0.8rem; cursor: pointer; font-family: var(--font-ui);
}
#top-bar button:hover { background: var(--color-accent); color: var(--color-bg); }
.main-layout {
  display: grid;
  grid-template-columns: var(--sidebar-left-width) 1fr var(--sidebar-right-width);
  height: calc(100vh - var(--topbar-height) - var(--bottombar-height));
  overflow: hidden;
}
#left-sidebar, #right-sidebar {
  background: var(--color-surface);
  overflow-y: auto; padding: 0.5rem;
}
#left-sidebar  { border-right: 1px solid var(--color-border); }
#right-sidebar { border-left:  1px solid var(--color-border); }
#map-container {
  overflow: auto; position: relative;
  background: var(--color-bg);
  display: flex; justify-content: center; align-items: flex-start;
  padding: 1rem;
}
#map-grid {
  display: grid;
  /* Las columnas se asignan por JS: style.gridTemplateColumns */
}
#bottom-bar {
  height: var(--bottombar-height);
  display: flex; align-items: center; gap: 1rem;
  padding: 0 1rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  font-size: 0.8rem; color: var(--color-text-muted); font-family: var(--font-mono);
}
#resource-config {
  padding: 0.5rem 1rem;
  background: var(--color-surface-2);
  border-top: 1px solid var(--color-border);
  display: flex; flex-wrap: wrap; gap: 0.75rem;
  font-size: 0.78rem; align-items: center;
}
#resource-config label { color: var(--color-text-muted); }
#resource-config input[type="number"] {
  width: 60px; background: var(--color-surface);
  border: 1px solid var(--color-border); color: var(--color-text);
  border-radius: 3px; padding: 2px 4px; font-family: var(--font-mono);
}
```

#### `css/components/map.css`
```css
.map-cell {
  width: var(--cell-size); height: var(--cell-size);
  border: 1px solid var(--color-border);
  cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  font-size: 0.6rem; user-select: none;
  transition: box-shadow var(--transition-fast);
  box-sizing: border-box;
}
.map-cell:hover { box-shadow: 0 0 0 2px var(--color-accent) inset; }
.map-cell--empty     { background: #1a2820; }
.map-cell--road      { background: var(--color-road); }
.map-cell--residential { background: var(--color-building-residential); }
.map-cell--commercial  { background: var(--color-building-commercial); }
.map-cell--industrial  { background: var(--color-building-industrial); }
.map-cell--service     { background: var(--color-building-service); }
.map-cell--utility     { background: var(--color-building-utility); }
.map-cell--park        { background: var(--color-building-park); }
.map-cell--route {
  background: var(--color-gold) !important;
  animation: routePulse 0.6s ease infinite alternate;
}
.map-cell--selected { outline: 2px dashed #fff; outline-offset: -2px; }
@keyframes routePulse {
  from { opacity: 0.6; } to { opacity: 1; }
}
body.mode-build    { cursor: crosshair; }
body.mode-demolish { cursor: not-allowed; }
body.mode-route    { cursor: cell; }
```

#### `css/components/resources.css`
```css
#resource-panel { padding: 0.5rem; }
.resource-panel-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.resource-card {
  background: var(--color-surface-2);
  border-radius: var(--border-radius);
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
}
.resource-card__label { font-size: 0.68rem; color: var(--color-text-muted); }
.resource-card__value { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; }
.resource--ok       .resource-card__value { color: var(--color-success); }
.resource--warning  .resource-card__value { color: var(--color-warning); }
.resource--critical .resource-card__value {
  color: var(--color-danger);
  animation: critBlink 0.8s step-end infinite;
}
@keyframes critBlink { 50% { opacity: 0.3; } }
```

#### `css/components/build-menu.css`
```css
#build-menu { padding: 0.5rem; }
.build-tabs { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.5rem; }
.build-tab-btn {
  background: var(--color-surface-2); color: var(--color-text-muted);
  border: 1px solid var(--color-border); border-radius: var(--border-radius);
  padding: 0.2rem 0.5rem; font-size: 0.75rem; cursor: pointer;
}
.build-tab-btn.active { background: var(--color-accent); color: var(--color-bg); border-color: var(--color-accent); }
.build-items { display: flex; flex-direction: column; gap: 0.3rem; }
.build-item {
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  border-radius: var(--border-radius); padding: 0.4rem 0.6rem;
  cursor: pointer; display: flex; justify-content: space-between; align-items: center;
}
.build-item:hover { border-color: var(--color-accent); }
.build-item--active { border-color: var(--color-accent); background: rgba(79,195,247,0.1); }
.build-item--disabled { opacity: 0.4; cursor: not-allowed; }
.build-item__name { font-size: 0.82rem; font-weight: 600; }
.build-item__cost { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-money); }
```

---

### PROMPT E3 — CSS de páginas setup y ranking

#### `css/pages/setup.css`
```css
body {
  min-height: 100vh; background: var(--color-bg); color: var(--color-text);
  font-family: var(--font-body); display: flex; align-items: center; justify-content: center;
}
main {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: 2rem; width: 100%; max-width: 580px; margin: 2rem auto;
}
h1 {
  font-family: var(--font-ui); font-size: 1.8rem; color: var(--color-accent);
  margin-bottom: 1.5rem; text-align: center;
}
#setup-form > div { margin-bottom: 1rem; }
label { display: block; font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 0.25rem; }
input[type="text"], input[type="number"], select {
  width: 100%; padding: 0.5rem 0.75rem; background: var(--color-surface-2);
  border: 1px solid var(--color-border); border-radius: var(--border-radius);
  color: var(--color-text); font-family: var(--font-body); font-size: 0.9rem;
}
input:focus, select:focus { outline: none; border-color: var(--color-accent); }
#region-results {
  position: absolute; z-index: 100; background: var(--color-surface-2);
  border: 1px solid var(--color-border); border-radius: var(--border-radius);
  max-height: 200px; overflow-y: auto; width: 100%; list-style: none; padding: 0; margin: 0;
}
#region-results li {
  padding: 0.4rem 0.75rem; cursor: pointer; font-size: 0.85rem;
}
#region-results li:hover { background: var(--color-accent); color: var(--color-bg); }
/* Contenedor del search con position relative para el dropdown */
#setup-form > div:nth-of-type(3) { position: relative; }
button[type="submit"], #btn-create-city {
  width: 100%; padding: 0.7rem;
  background: var(--color-accent); color: var(--color-bg);
  border: none; border-radius: var(--border-radius);
  font-family: var(--font-ui); font-size: 1rem; font-weight: 700; cursor: pointer;
  margin-top: 1rem;
}
button[type="submit"]:hover { opacity: 0.85; }
#btn-continue {
  width: 100%; padding: 0.6rem; margin-top: 0.75rem;
  background: var(--color-surface-2); color: var(--color-success);
  border: 1px solid var(--color-success); border-radius: var(--border-radius);
  font-family: var(--font-ui); font-size: 0.9rem; cursor: pointer;
}
#btn-load-map {
  background: var(--color-surface-2); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--border-radius);
  padding: 0.4rem 0.8rem; cursor: pointer;
}
#map-preview { margin-top: 0.5rem; }
#setup-errors { color: var(--color-danger); font-size: 0.82rem; min-height: 1.2rem; margin-top: 0.25rem; }
```

#### `css/pages/ranking.css`
```css
body {
  min-height: 100vh; background: var(--color-bg); color: var(--color-text);
  font-family: var(--font-body);
}
main { max-width: 900px; margin: 0 auto; padding: 2rem; }
h1 {
  font-family: var(--font-ui); font-size: 1.8rem; color: var(--color-accent);
  margin-bottom: 1.5rem;
}
#ranking-table {
  width: 100%; border-collapse: collapse;
  background: var(--color-surface);
  border-radius: var(--border-radius-lg); overflow: hidden;
}
#ranking-table th {
  background: var(--color-surface-2); padding: 0.75rem 1rem;
  font-family: var(--font-ui); color: var(--color-accent); text-align: left;
}
#ranking-table td { padding: 0.6rem 1rem; border-bottom: 1px solid var(--color-border); }
#ranking-table tr:hover td { background: var(--color-surface-2); }
.ranking-actions { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; }
.ranking-actions button {
  padding: 0.5rem 1.2rem; border-radius: var(--border-radius);
  font-family: var(--font-ui); cursor: pointer;
  border: 1px solid var(--color-border); background: var(--color-surface-2);
  color: var(--color-text);
}
.ranking-actions button:hover { background: var(--color-accent); color: var(--color-bg); border-color: var(--color-accent); }
```

---

## ─── BLOQUE F · WIRING FINAL ───

---

### PROMPT F1 — Conectar `ResourceHistory` al `GameStore` y a `TurnService`

**Archivos a modificar:** `city-builder/js/store/GameStore.js` y `city-builder/js/services/TurnService.js`

**Problema:** `ChartPanel` accede al historial con `gameStore.getState().resourceHistory?.getHistory()` — pero `resourceHistory` no está en el estado del store; se instancia en `main.js` pero nunca se inyecta al store.

**Corrección en `GameStore.js`:** El estado inicial debe incluir el campo `resourceHistory`:
```js
// En el estado inicial del store, agregar:
resourceHistory: null,  // se asignará en main.js tras instanciar ResourceHistory
```

**En `main.js`:** Después de `const resourceHistory = new ResourceHistory();`, asignarlo al store:
```js
gameStore.setState({ resourceHistory });
```

**En `TurnService.js`:** En `#executeTurn()`, después de `this.resourceService.calculateTurnResources()`, agregar:
```js
const state = this.gameStore.getState();
state.resourceHistory?.addEntry(state.turn, state.resources);
```

---

### PROMPT F2 — Verificación de separación HTML/CSS/JS (regla crítica -0.5)

**Acción de verificación:** Revisar todos los archivos `.html` del proyecto.

**Checklist:**
```
index.html        → ¿tiene <style>? NO. ¿tiene <script> sin src? NO. ✅
pages/setup.html  → idem. ✅
pages/ranking.html → idem — REVISAR: el atributo style="display:none" en #btn-continue
                     es inline style. Debe removerse y manejarse solo con CSS/JS.
```

**Corrección en `pages/setup.html`:** Quitar `style="display:none"` del botón `#btn-continue`:
```html
<!-- Cambiar -->
<button id="btn-continue" style="display:none">Continuar partida guardada</button>
<!-- Por -->
<button id="btn-continue" class="btn-continue--hidden">Continuar partida guardada</button>
```

**En `css/pages/setup.css` agregar:**
```css
.btn-continue--hidden { display: none; }
```

**En `SetupScreen.js`:** En lugar de `btnContinue.style.display = 'block'`, usar:
```js
btnContinue.classList.remove('btn-continue--hidden');
```

---

## ORDEN DE EJECUCIÓN RECOMENDADO

1. **A1, A2, A3** — Modelos vacíos (Citizen, Resource, Score). Son la base de todo.
2. **B1** — ResourceHistory. Desbloquea las gráficas.
3. **C1** — SetupScreen. Desbloquea el flujo de creación de ciudad.
4. **D1, D2, D3, D4** — Corrección de bugs. Críticos para que el juego corra.
5. **F1** — Wiring del historial en el store.
6. **E1, E2, E3** — CSS. Necesario para que la interfaz sea usable.
7. **F2** — Verificación final de separación de archivos.