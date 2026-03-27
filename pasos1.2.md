# PROMPTS CITY BUILDER — LISTADO DEFINITIVO
> Proyecto: simulador urbano en HTML + CSS + JS puro (sin frameworks).  
> Restricción crítica: **cero `<style>` o `<script>` inline en HTML**. Cada archivo separado. Cada incumplimiento descuenta -0.5 décimas.  
> Principios: SOLID · EventBus como canal único · DI por constructor · sin `window.*` · sin números mágicos fuera de `constants.js`.

---

## ESTADO ACTUAL DEL PROYECTO

| Módulo | Estado | Notas |
|--------|--------|-------|
| `constants.js` | ✅ Completo | Solo 15 líneas — falta completar con todas las constantes |
| `GameStore.js` | ✅ Funcional | OK |
| `EventBus.js` | ✅ Funcional | OK |
| `BuildingType/ResourceType/EventType` | ✅ Completos | OK |
| `City.js` | ✅ Parcial | Falta `validate()` completo |
| `Building.js` (base) | ✅ Parcial | Falta lanzar error en métodos abstractos |
| Subclases de Building | ⚠️ Stub | Estructuras mínimas, faltan métodos completos |
| `Map.js` | ✅ Funcional | OK |
| `GridUtils.js` | ✅ Funcional | OK |
| `BuildingValidator.js` | ✅ Funcional | OK |
| `MapValidator.js` | ✅ Funcional | OK |
| `BuildingService.js` | ✅ Funcional | OK |
| `ResourceService.js` | ✅ Funcional | OK |
| `TurnService.js` | ✅ Funcional | OK |
| `CitizenService.js` | ✅ Funcional | OK |
| `ScoreService.js` | ✅ Funcional | OK |
| `GameController.js` | ✅ Funcional | OK |
| `BuildController.js` | ✅ Funcional | OK |
| `InputController.js` | ✅ Funcional | OK |
| `MapRenderer.js` | ✅ Funcional | OK |
| `ResourcePanel.js` | ✅ Funcional | OK |
| `BuildMenu.js` | ✅ Funcional | OK |
| `SetupController.js` | ✅ Parcial | Falta integración con ColombiaAPI |
| `SetupScreen.js` | ⚠️ Stub | Sin integración API Colombia, sin carga de mapa .txt |
| `SaveService.js` | ✅ Funcional | OK |
| `BuildingAdapter.js` | ❌ Vacío (1 línea) | Solo comentario |
| `CityAdapter.js` | ❌ Vacío (1 línea) | Solo comentario |
| `ApiAdapter.js` | ❌ Vacío (1 línea) | Solo comentario |
| `RouteService.js` | ❌ Vacío | Algoritmo Dijkstra pendiente |
| `ColombiaAPI.js` | ❌ Vacío | Integración pendiente |
| `WeatherAPI.js` | ❌ Vacío | Integración pendiente |
| `NewsAPI.js` | ❌ Vacío | Integración pendiente |
| `RankingService.js` | ❌ Vacío | Pendiente |
| `ChartPanel.js` | ❌ Vacío | Pendiente |
| `CitizenPanel.js` | ❌/⚠️ | Revisar |
| `index.html` | ❌ Vacío | El punto de entrada está en blanco |
| `pages/setup.html` | ❌ Vacío | Pendiente |
| `pages/ranking.html` | ❌ Vacío | Pendiente |
| CSS (todos) | ⚠️ Archivos existen | Contenido por revisar |

---

## ─── FASE 1 · ADAPTERS Y CONSTANTS (DESBLOQUEANTES) ───
> **Estos 3 prompts desbloquean todo el resto. Sin ellos, el sistema de guardado/carga y el factory de edificios están rotos.**

---

### PROMPT 1 — `js/config/constants.js` COMPLETO

**Archivo a modificar:** `city-builder/js/config/constants.js`

El archivo actual solo tiene `BUILDING_COSTS` con 15 líneas. Debes completarlo con **todas las constantes del dominio** en un único objeto estructurado por categoría. Sin números mágicos en ningún otro archivo.

**Constantes que deben existir:**

```js
// COSTOS DE CONSTRUCCIÓN
export const BUILDING_COSTS = Object.freeze({ ... }); // ya existe, mantener

// CAPACIDADES RESIDENCIALES
export const BUILDING_CAPACITY = Object.freeze({
  residential_house: 4,
  residential_apartment: 12,
});

// EMPLEOS POR TIPO
export const BUILDING_JOBS = Object.freeze({
  commercial_shop: 6,
  commercial_mall: 20,
  industrial_factory: 15,
  industrial_farm: 8,
});

// PRODUCCIÓN POR TURNO
export const BUILDING_PRODUCTION = Object.freeze({
  commercial_shop:      { money: 500,  food: 0,  electricity: 0,   water: 0 },
  commercial_mall:      { money: 2000, food: 0,  electricity: 0,   water: 0 },
  industrial_factory:   { money: 800,  food: 0,  electricity: 0,   water: 0 },
  industrial_farm:      { money: 0,    food: 50, electricity: 0,   water: 0 },
  utility_power_plant:  { money: 0,    food: 0,  electricity: 200, water: 0 },
  utility_water_plant:  { money: 0,    food: 0,  electricity: 0,   water: 150 },
});

// CONSUMO POR TURNO (electricity, water)
export const BUILDING_CONSUMPTION = Object.freeze({
  residential_house:       { electricity: 5,  water: 3  },
  residential_apartment:   { electricity: 15, water: 10 },
  commercial_shop:         { electricity: 8,  water: 0  },
  commercial_mall:         { electricity: 25, water: 0  },
  industrial_factory:      { electricity: 20, water: 15 },
  industrial_farm:         { electricity: 0,  water: 10 },
  service_police:          { electricity: 15, water: 0  },
  service_fire:            { electricity: 15, water: 0  },
  service_hospital:        { electricity: 20, water: 10 },
  utility_water_plant:     { electricity: 20, water: 0  },
  utility_power_plant:     { electricity: 0,  water: 0  },
  park:                    { electricity: 0,  water: 0  },
  road:                    { electricity: 0,  water: 0  },
});

// BONUS DE FELICIDAD
export const HAPPINESS_BONUS = Object.freeze({
  service_police:    10,
  service_fire:      10,
  service_hospital:  10,
  park:              5,
  has_home:          20,
  has_job:           15,
  no_home:          -20,
  no_job:           -15,
});

// RADIOS DE INFLUENCIA (en celdas, distancia Manhattan)
export const SERVICE_RADIUS = Object.freeze({
  service_police:   5,
  service_fire:     5,
  service_hospital: 7,
});

// RECURSOS INICIALES DE LA CIUDAD
export const INITIAL_RESOURCES = Object.freeze({
  money:       50000,
  electricity: 0,
  water:       0,
  food:        0,
});

// REGLAS DE POBLACIÓN
export const POPULATION_RULES = Object.freeze({
  minHappinessToGrow: 60,
  minGrowthPerTurn:   1,
  maxGrowthPerTurn:   3,
});

// FÓRMULA DE PUNTUACIÓN — multiplicadores
export const SCORE_MULTIPLIERS = Object.freeze({
  perCitizen:    10,
  perHappiness:  5,
  perMoneyDiv:   100,   // dinero dividido entre este valor
  perBuilding:   50,
  perElecBalance: 2,
  perWaterBalance: 2,
});

// BONIFICACIONES Y PENALIZACIONES
export const SCORE_BONUSES = Object.freeze({
  allEmployed:        500,
  happinessAbove80:   300,
  allResourcesPositive: 200,
  populationAbove1000: 1000,
});

export const SCORE_PENALTIES = Object.freeze({
  negativeMonney:     -500,
  negativeElectricity: -300,
  negativeWater:       -300,
  lowHappiness:        -400,  // felicidad < 40
  perUnemployed:       -10,
});

// SISTEMA DE TURNOS
export const TURN_CONFIG = Object.freeze({
  defaultDurationSeconds: 10,
  autoSaveEveryNTurns:    1,   // guardar en localStorage cada turno
});

// PERSISTENCIA
export const STORAGE_KEYS = Object.freeze({
  save:    'city_builder_save',
  ranking: 'city_builder_ranking',
  debug:   'debug_mode',
});
```

**Reglas:**
- Usar `Object.freeze()` en todos los objetos exportados.
- Todo debe ser `export const`, no `export default`.
- Ningún otro archivo del proyecto puede tener números mágicos de dominio hardcodeados.

---

### PROMPT 2 — `js/adapters/BuildingAdapter.js`

**Archivo a crear:** `city-builder/js/adapters/BuildingAdapter.js`

El archivo actual tiene solo 1 línea (un comentario). Este adaptador es crítico: sin él, el sistema de guardado/carga (`SaveService`) y la reconstrucción del mapa (`Map.fromJSON`) están completamente rotos.

**Responsabilidad:** Convertir objetos JSON planos (provenientes de `localStorage` o de archivos exportados) a instancias correctas de las subclases de `Building`.

**Método principal:**
```js
static fromJSON(data)
```
Recibe un objeto `data` con al menos `{ type, subtype, x, y, id, ... }` y devuelve la instancia correcta:

- `type === BuildingType.RESIDENTIAL_HOUSE` o `RESIDENTIAL_APARTMENT` → `new ResidentialBuilding({ id, subtype, x, y })` + restaurar `currentOccupants`.
- `type === BuildingType.COMMERCIAL_SHOP` o `COMMERCIAL_MALL` → `new CommercialBuilding({ ... })`.
- `type === BuildingType.INDUSTRIAL_FACTORY` o `INDUSTRIAL_FARM` → `new IndustrialBuilding({ ... })`.
- `type === BuildingType.SERVICE_POLICE` / `SERVICE_FIRE` / `SERVICE_HOSPITAL` → `new ServiceBuilding({ ... })`.
- `type === BuildingType.UTILITY_POWER_PLANT` / `UTILITY_WATER_PLANT` → `new UtilityBuilding({ ... })`.
- `type === BuildingType.PARK` → `new Park({ id, x, y })`.
- `type === BuildingType.ROAD` → `new Road({ id, x, y })`.
- Cualquier tipo desconocido → `console.warn` + retornar `null`.

**Importaciones necesarias:** todas las subclases de Building + `BuildingType`.

**Restricciones:**
- Solo métodos estáticos. No tiene estado interno.
- No emite eventos.
- Exportar como `export default BuildingAdapter`.

---

### PROMPT 3 — `js/adapters/CityAdapter.js`

**Archivo a crear:** `city-builder/js/adapters/CityAdapter.js`

Archivo actualmente con 1 línea (comentario). Convierte JSON plano a instancia de `City`.

**Método:**
```js
static fromJSON(data) → instancia de City
```
- Recibe el objeto guardado en `localStorage` y retorna `new City({ name, mayorName, region, gridWidth, gridHeight })`.
- Restaurar `createdAt` desde el string ISO guardado.

**Segundo método:**
```js
static toJSON(city) → objeto plano
```
- Serializa una instancia de `City` a objeto plano (delega a `city.toJSON()` si existe, o hace la serialización directamente).

**Importaciones:** solo `City.js`.  
**Exportar:** `export default CityAdapter`.

---

## ─── FASE 2 · HTML PRINCIPAL Y PÁGINAS ───
> **index.html está completamente vacío. Sin él, la aplicación no puede ejecutarse.**

---

### PROMPT 4 — `index.html` (página principal del juego)

**Archivo a crear:** `city-builder/index.html`

Crea la estructura HTML del punto de entrada principal del juego. **Restricción absoluta:** cero `<style>` o `<script>` inline — todo separado en archivos CSS y JS propios.

**Estructura de layout (3 columnas desktop, responsive):**

```
┌─────────────────────────────────────────────────────┐
│                    TOPBAR (#top-bar)                 │
│  [Nombre Ciudad] [Turno] [Score] [Guardar] [Ranking] │
└─────────────────────────────────────────────────────┘
┌──────────────┬────────────────────────┬─────────────┐
│ SIDEBAR IZQ  │     MAPA CENTRAL       │ SIDEBAR DER │
│ (#left-side) │     (#map-grid)        │(#right-side)│
│              │                        │             │
│ #resource-   │                        │#weather-    │
│  panel       │                        │ widget      │
│              │                        │             │
│ #build-menu  │                        │#news-panel  │
│              │                        │             │
│ #citizen-    │                        │#score-panel │
│  panel       │                        │             │
│              │                        │#chart-panel │
└──────────────┴────────────────────────┴─────────────┘
│              BOTTOM BAR (#bottom-bar)                 │
│  [Turno: X] [Modo actual] [ESC:cancelar] [Space:pausa]│
└──────────────────────────────────────────────────────┘
```

**IDs del DOM que deben existir (los módulos JS dependen de ellos):**
- `#top-bar`, `#turn-display`, `#score-display`, `#btn-save`, `#btn-ranking`, `#btn-export`
- `#left-sidebar`, `#resource-panel`, `#build-menu`
- `#map-container`, `#map-grid`
- `#right-sidebar`, `#weather-widget`, `#news-panel`, `#score-panel`, `#chart-panel`, `#citizen-panel`
- `#notifications-container`
- `#building-info-modal` (modal oculto con clase `modal--hidden`)
- `#ranking-modal` (modal oculto)
- `#bottom-bar`, `#mode-display`

**Contenedor de configuración de recursos (campos editables en cualquier momento):**
```html
<section id="resource-config">
  Duración de turno (s): <input type="number" id="turn-duration" value="10" min="1" max="60">
  Electricidad inicial: <input type="number" id="init-electricity" value="0">
  Agua inicial: <input type="number" id="init-water" value="0">
  Alimentos iniciales: <input type="number" id="init-food" value="0">
  Consumo agua/ciudadano: <input type="number" id="citizen-water" value="1">
  Consumo electricidad/ciudadano: <input type="number" id="citizen-elec" value="1">
  Consumo comida/ciudadano: <input type="number" id="citizen-food" value="1">
  Bonus policía: <input type="number" id="bonus-police" value="10">
  Bonus bomberos: <input type="number" id="bonus-fire" value="10">
  Bonus hospital: <input type="number" id="bonus-hospital" value="10">
</section>
```

**Links a CSS (en `<head>`):**
```html
<link rel="stylesheet" href="css/base/reset.css">
<link rel="stylesheet" href="css/base/variables.css">
<link rel="stylesheet" href="css/layout/grid-layout.css">
<link rel="stylesheet" href="css/layout/responsive.css">
<link rel="stylesheet" href="css/components/map.css">
<link rel="stylesheet" href="css/components/sidebar.css">
<link rel="stylesheet" href="css/components/resources.css">
<link rel="stylesheet" href="css/components/build-menu.css">
<link rel="stylesheet" href="css/components/modal.css">
<link rel="stylesheet" href="css/components/building-info-modal.css">
<link rel="stylesheet" href="css/components/notifications.css">
<link rel="stylesheet" href="css/components/weather-widget.css">
<link rel="stylesheet" href="css/components/news-panel.css">
<link rel="stylesheet" href="css/components/citizen-panel.css">
<link rel="stylesheet" href="css/components/score-panel.css">
<link rel="stylesheet" href="css/components/chart-panel.css">
<link rel="stylesheet" href="css/components/ranking-modal.css">
```

**Script al final del `<body>`:**
```html
<script type="module" src="js/main.js"></script>
```

**Restricciones absolutas:**
- Sin `<style>` ni `<script>` inline, en ninguna parte del archivo.
- El HTML debe ser semántico (usar `<header>`, `<main>`, `<aside>`, `<section>`, `<footer>`).
- Los modales deben empezar con clase `modal--hidden` y sin `display:none` inline.

---

### PROMPT 5 — `pages/setup.html` (pantalla de creación de ciudad)

**Archivo a crear:** `city-builder/pages/setup.html`

Pantalla de configuración inicial de la ciudad. Implementa los requisitos de HU-001 y HU-002.

**IDs del DOM requeridos por `SetupScreen.js` y `SetupController.js`:**
- `#setup-form`
- `#city-name` (input text, maxlength=50, required)
- `#mayor-name` (input text, maxlength=50, required)
- `#region-select` (select o input — para ciudad de Colombia; se llenará dinámicamente con la API)
- `#region-search` (input text para buscar ciudad colombiana)
- `#region-results` (lista desplegable de resultados de la API)
- `#lat-display`, `#lon-display` (campos readonly que muestran las coordenadas seleccionadas)
- `#map-width` (input number, min=15, max=30, value=20)
- `#map-height` (input number, min=15, max=30, value=20)
- `#btn-load-map` (botón para cargar mapa desde archivo .txt)
- `#map-file-input` (input type="file", accept=".txt", hidden)
- `#map-preview` (div donde se muestra preview del mapa cargado)
- `#setup-errors` (div para mostrar errores de validación)
- `#btn-create-city` (botón submit)
- `#btn-continue` (visible solo si hay partida guardada)

**CSS a incluir:**
```html
<link rel="stylesheet" href="../css/base/reset.css">
<link rel="stylesheet" href="../css/base/variables.css">
<link rel="stylesheet" href="../css/pages/setup.css">
<link rel="stylesheet" href="../css/components/notifications.css">
```

**Script al final del `<body>`:**
```html
<script type="module" src="../js/main.js"></script>
```

**Sin `<style>` ni `<script>` inline.**

---

### PROMPT 6 — `pages/ranking.html` (tabla de ranking)

**Archivo a crear:** `city-builder/pages/ranking.html`

Página independiente de ranking. Implementa HU-019.

**IDs del DOM:**
- `#ranking-table` — tabla con columnas: Pos | Ciudad | Alcalde | Puntuación | Población | Felicidad | Turnos | Fecha
- `#ranking-current` — fila destacada de la partida actual (si no está en top 10)
- `#btn-reset-ranking` — botón para borrar ranking (requiere confirmación)
- `#btn-export-ranking` — exportar ranking a JSON
- `#btn-back` — volver a la partida

**CSS:**
```html
<link rel="stylesheet" href="../css/base/reset.css">
<link rel="stylesheet" href="../css/base/variables.css">
<link rel="stylesheet" href="../css/pages/ranking.css">
<link rel="stylesheet" href="../css/components/ranking-modal.css">
```

**Script:**
```html
<script type="module" src="../js/pages/ranking-page.js"></script>
```

**Sin nada inline.**

---

## ─── FASE 3 · CSS BASE Y LAYOUT ───

---

### PROMPT 7 — `css/base/variables.css` + `css/base/reset.css`

**Archivos a crear/completar.**

**`reset.css`** — reset CSS moderno (box-sizing, margin 0, etc.). Sin nada especial del proyecto.

**`variables.css`** — define todas las variables CSS del juego:

```css
:root {
  /* Paleta de colores — temática urbana/estrategia */
  --color-bg:            #0f1923;   /* fondo principal oscuro */
  --color-surface:       #1a2635;   /* paneles */
  --color-surface-2:     #243447;   /* elementos secundarios */
  --color-border:        #2e4460;
  --color-text:          #c8d8e8;
  --color-text-muted:    #6b8299;
  --color-accent:        #4fc3f7;   /* azul ciudad */
  --color-success:       #66bb6a;
  --color-warning:       #ffa726;
  --color-danger:        #ef5350;
  --color-gold:          #ffd54f;

  /* Recursos */
  --color-money:         #66bb6a;
  --color-electricity:   #ffd54f;
  --color-water:         #4fc3f7;
  --color-food:          #a5d6a7;

  /* Edificios — colores por tipo */
  --color-building-residential: #81c784;
  --color-building-commercial:  #64b5f6;
  --color-building-industrial:  #ffb74d;
  --color-building-service:     #f48fb1;
  --color-building-utility:     #ce93d8;
  --color-building-park:        #a5d6a7;
  --color-road:                 #78909c;

  /* Tipografía */
  --font-ui:     'Rajdhani', sans-serif;       /* titulares y paneles */
  --font-body:   'Source Sans 3', sans-serif;  /* texto base */
  --font-mono:   'JetBrains Mono', monospace;  /* números, coordenadas */

  /* Tamaños */
  --sidebar-left-width:  260px;
  --sidebar-right-width: 300px;
  --topbar-height:       52px;
  --bottombar-height:    36px;
  --cell-size:           40px;  /* tamaño base de celda del mapa */
  --border-radius:       6px;
  --border-radius-lg:    12px;

  /* Transiciones */
  --transition-fast:  0.15s ease;
  --transition-med:   0.3s ease;
}
```

Incluir en `<head>` de todos los HTML las fuentes Google: `Rajdhani`, `Source Sans 3`, `JetBrains Mono`.

---

### PROMPT 8 — `css/layout/grid-layout.css` + `css/layout/responsive.css`

**Archivos a crear/completar.**

**`grid-layout.css`** — layout principal del juego en desktop (≥ 1024px):
- `#game-layout`: CSS Grid de 3 columnas: `var(--sidebar-left-width)` · `1fr` · `var(--sidebar-right-width)`. Con `#top-bar` encima y `#bottom-bar` abajo.
- `#map-container`: scroll bidireccional cuando el mapa es grande (overflow: auto, max-height: calc(100vh - topbar - bottombar)).
- `#map-grid`: CSS Grid dinámico (columnas se establecen desde JS con `style.gridTemplateColumns`).
- Sidebars: `overflow-y: auto`, scrollables individualmente.

**`responsive.css`** — breakpoints:

**Tablet (768px–1023px):**
- Layout 2 columnas: `#map-container` (flex: 1) + `#right-sidebar` (300px fijo).
- `#left-sidebar` se convierte en panel colapsable encima del mapa.
- `#build-menu` baja al bottom como drawer.

**Móvil (< 768px):**
- Layout de columna única: `#map-container` full width.
- `#left-sidebar` y `#right-sidebar` se ocultan y se acceden con botones flotantes `#btn-open-left`, `#btn-open-right`.
- `#map-grid`: celdas de al menos `--cell-size: 28px` para ser tapeables (min 44px área táctil).
- `#build-menu` como bottom-sheet deslizable.

---

### PROMPT 9 — CSS de componentes: mapa, sidebar, recursos

**Archivos a completar:**
- `css/components/map.css`
- `css/components/sidebar.css`
- `css/components/resources.css`

**`map.css`:**
- `.map-cell` — celda base: `width: var(--cell-size)`, `height: var(--cell-size)`, `border: 1px solid var(--color-border)`, `cursor: pointer`.
- `.map-cell:hover` — highlight con `box-shadow` azul.
- `.map-cell--empty` — fondo `#1a2820` (tierra vacía).
- `.map-cell--road` — fondo `var(--color-road)` con textura de puntos.
- `.map-cell--building-residential` — fondo `var(--color-building-residential)`.
- `.map-cell--building-commercial`, `--industrial`, `--service`, `--utility`, `--park` — sus colores de `variables.css`.
- `.map-cell--route` — animación de pulso amarillo (usada por `MapRenderer.highlightRoute`).
- `.map-cell--selected` — borde blanco punteado (origen/destino en modo ruta).
- Cursor personalizado en `body.mode-build`: `cursor: crosshair`.
- Cursor en `body.mode-demolish`: `cursor: not-allowed`.

**`sidebar.css`:**
- Paneles con `background: var(--color-surface)`, `border-right/left: 1px solid var(--color-border)`.
- Secciones internas con separadores `<hr>` estilizados.

**`resources.css`:**
- `#resource-panel` — grid 2×3 de tarjetas de recurso.
- `.resource-card` — ícono grande + valor + label.
- `.resource--ok` → color `var(--color-success)`.
- `.resource--warning` → color `var(--color-warning)`.
- `.resource--critical` → color `var(--color-danger)` + animación de parpadeo.

---

### PROMPT 10 — CSS de componentes: modales, notificaciones, menú construcción

**Archivos a completar:**
- `css/components/modal.css`
- `css/components/building-info-modal.css`
- `css/components/notifications.css`
- `css/components/build-menu.css`

**`modal.css`** — base reutilizable:
- `.modal-overlay` — `position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000;`
- `.modal` — centrado con `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`.
- `.modal--hidden` — `display: none !important`.
- Animación de entrada: `fadeIn + slideDown` 0.25s.
- `.modal__header`, `.modal__body`, `.modal__footer` — estructura interna.
- `.modal__close` — botón X en esquina superior derecha.

**`notifications.css`:**
- `#notifications-container` — `position: fixed; top: 1rem; right: 1rem; z-index: 2000; display: flex; flex-direction: column; gap: 0.5rem`.
- `.notification` — `min-width: 280px; max-width: 360px; padding: 0.75rem 1rem; border-radius: var(--border-radius); box-shadow`.
- `.notification--success` → borde izquierdo `var(--color-success)`.
- `.notification--error` → borde izquierdo `var(--color-danger)`.
- `.notification--warning` → borde izquierdo `var(--color-warning)`.
- `.notification--info` → borde izquierdo `var(--color-accent)`.
- Animación de entrada `slideInRight` y salida `slideOutRight`.

**`build-menu.css`:**
- Tabs por categoría: `.build-tab-header` con botones activos resaltados.
- `.build-item` — tarjeta con ícono, nombre, costo. Hover con borde de color del tipo.
- `.build-item--active` — borde grueso coloreado (seleccionado actualmente).
- `.build-item--disabled` — gris y sin `cursor: pointer` (sin fondos suficientes).

---

## ─── FASE 4 · APIS EXTERNAS ───

---

### PROMPT 11 — `js/api/ColombiaAPI.js`

**Archivo a completar:** `city-builder/js/api/ColombiaAPI.js` (actualmente vacío).

Integra la API pública `https://api-colombia.com/` para obtener ciudades de Colombia con sus coordenadas.

**Endpoint a usar:** `GET https://api-colombia.com/api/v1/City`

**Clase `ColombiaAPI`:**

```js
class ColombiaAPI {
  #baseUrl = 'https://api-colombia.com/api/v1';
  #cache = null;

  async getCities() → Promise<Array<{id, name, latitude, longitude, department}>>
  async searchCities(query) → filtra la lista cacheada por nombre (case-insensitive)
  async getCityByName(name) → objeto ciudad o null
}
```

**Implementación de `getCities()`:**
1. Si `#cache` existe, retornar `#cache` directamente.
2. Hacer `fetch` a `/api/v1/City`.
3. Parsear la respuesta y mapear a objetos: `{ id, name: ciudad.nombre || ciudad.name, latitude: parseFloat(ciudad.latitud || ciudad.latitude), longitude: parseFloat(ciudad.longitud || ciudad.longitude) }`.
4. Guardar en `#cache`.
5. Si el fetch falla, retornar array de ciudades de fallback hardcodeadas (Bogotá, Medellín, Cali, Barranquilla, Cartagena con sus coordenadas reales).

**Método `searchCities(query)`:**
- Llama a `getCities()` y filtra por `name.toLowerCase().includes(query.toLowerCase())`.
- Retorna máximo 8 resultados.

**Exportar:** `export default ColombiaAPI`.

---

### PROMPT 12 — `js/ui/SetupScreen.js` COMPLETO

**Archivo a reescribir:** `city-builder/js/ui/SetupScreen.js`

La versión actual es un stub sin integración con `ColombiaAPI` ni carga de mapas `.txt`. Reescribir completamente implementando HU-001 y HU-002.

**Constructor:** `constructor(eventBus, colombiaAPI, mapLoaderService)`

**Método `init()`:**

1. Agregar listener al campo `#region-search`:
   - Al escribir (debounce 300ms): llamar a `colombiaAPI.searchCities(query)` y renderizar resultados en `#region-results`.
   - Al seleccionar un resultado: guardar `{ cityName, lat, lon }` internamente y mostrar en `#lat-display` y `#lon-display`.

2. Agregar listener al botón `#btn-load-map`:
   - Hacer click programático en `#map-file-input`.

3. Agregar listener a `#map-file-input` (change):
   - Llamar a `mapLoaderService.loadFromFile(file)` para validar y previsualizar.
   - Suscribirse a `EventType.GAME_STARTED` para mostrar preview si la carga fue exitosa (para validación visual previa al juego).

4. Agregar listener al formulario `#setup-form` (submit):
   - Validar que se haya seleccionado región (lat/lon no sean 0).
   - Emitir el evento correcto: `'setup:submitted'` con `{ cityName, mayorName, region: { cityName, lat, lon }, width, height }`.

5. Verificar si hay partida guardada (llamar a un método `hasSavedGame()` inyectado o pasado como parámetro):
   - Si hay partida guardada: mostrar `#btn-continue` y su listener debe emitir `EventType.GAME_LOAD_REQUESTED`.

6. Escuchar `EventType.BUILD_FAILED` para mostrar errores de carga de mapa en `#setup-errors`.

**Restricción:** Sin HTML inline (el HTML ya está en `setup.html`). Solo manipular el DOM.

---

### PROMPT 13 — `js/api/WeatherAPI.js`

**Archivo a completar:** `city-builder/js/api/WeatherAPI.js` (actualmente vacío).

Integra OpenWeatherMap para obtener clima de la región de la ciudad.

**Clase `WeatherAPI`:**

```js
class WeatherAPI {
  #apiKey;
  #lastFetch = null;
  #cachedData = null;
  #cacheDurationMs = 30 * 60 * 1000; // 30 minutos

  constructor(apiKey) { this.#apiKey = apiKey; }

  async getWeather(lat, lon) → Promise<WeatherData | null>
}
```

**Endpoint:** `GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric&lang=es`

**`WeatherData` devuelto:**
```js
{
  temperature: number,      // °C
  condition: string,        // 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
  description: string,      // descripción en español
  humidity: number,         // %
  windSpeed: number,        // km/h
  icon: string,             // código del ícono de OpenWeatherMap
  cityName: string,
  fetchedAt: Date
}
```

**Mapeo de condiciones:** usar `weather[0].main`:
- `'Clear'` → `'sunny'`
- `'Clouds'` → `'cloudy'`
- `'Rain'` / `'Drizzle'` → `'rainy'`
- `'Thunderstorm'` → `'stormy'`
- `'Snow'` → `'snowy'`
- default → `'cloudy'`

**Cache:** si `#lastFetch` existe y ha pasado menos de 30 min, retornar `#cachedData` sin hacer fetch.

**Si el fetch falla** (sin API key, red caída, etc.): retornar datos mock de Medellín:
```js
{ temperature: 22, condition: 'sunny', description: 'Soleado', humidity: 65, windSpeed: 12, icon: '01d', cityName: 'Medellín' }
```

**Exportar:** `export default WeatherAPI`.

---

### PROMPT 14 — `js/ui/WeatherWidget.js` COMPLETO

**Archivo a completar:** `city-builder/js/ui/WeatherWidget.js` (actualmente vacío).

**Constructor:** `constructor(eventBus, weatherAPI)`

**Método `init(lat, lon)`:**
1. Hacer fetch inicial: `weatherAPI.getWeather(lat, lon)` → renderizar.
2. Configurar `setInterval` para actualizar cada 30 minutos.
3. Suscribirse a `EventType.WEATHER_UPDATED` para re-renderizar si otro módulo actualiza el clima.

**Método `#render(weatherData)`:**
- Actualizar el contenedor `#weather-widget` con:
  - Ícono del clima usando la URL de OpenWeatherMap: `https://openweathermap.org/img/wn/{icon}@2x.png` como `<img>`.
  - Temperatura en `°C`.
  - Descripción.
  - Fila de `humidity` y `windSpeed`.
- Si `weatherData` es null: mostrar skeleton loader o mensaje "Clima no disponible".

**CSS usará:** `css/components/weather-widget.css`.

---

### PROMPT 15 — `js/api/NewsAPI.js` + `js/ui/NewsPanel.js`

**Archivos a completar:** ambos actualmente vacíos.

**`js/api/NewsAPI.js`:**

```js
class NewsAPI {
  #apiKey;
  #cacheDurationMs = 30 * 60 * 1000;

  constructor(apiKey) { ... }

  async getNews(countryCode = 'co') → Promise<Article[]>
}
```

**Endpoint:** `GET https://newsapi.org/v2/top-headlines?country={countryCode}&pageSize=5&apiKey={key}`

**`Article` devuelto:**
```js
{ title: string, description: string, url: string, urlToImage: string | null, publishedAt: Date }
```

**Si el fetch falla** (API key inválida, CORS, etc.): retornar 3 noticias mock de Colombia.

**`js/ui/NewsPanel.js`:**

**Constructor:** `constructor(eventBus, newsAPI)`

**Método `init(countryCode)`:**
1. Fetch inicial de noticias.
2. `setInterval` cada 30 minutos.
3. Renderizar en `#news-panel`.

**Método `#render(articles)`:**
- Lista de hasta 5 artículos. Cada uno:
  - Imagen (si `urlToImage` existe) o placeholder.
  - Título (truncado a 80 chars).
  - Descripción (truncado a 120 chars).
  - Link `href=article.url target="_blank"`.
  - Timestamp relativo ("hace 2 horas").
- Si no hay noticias: mensaje "No hay noticias disponibles".

---

## ─── FASE 5 · SERVICIOS FALTANTES ───

---

### PROMPT 16 — `js/services/RouteService.js` (Dijkstra)

**Archivo a completar:** `city-builder/js/services/RouteService.js` (actualmente vacío).

Implementa el algoritmo de Dijkstra **en el frontend** (no hay backend real; el documento menciona un POST `/api/calculate-route` pero el proyecto es 100% frontend — se implementa localmente).

**Clase `RouteService`:**

**Constructor:** `constructor(gameStore, eventBus)`

**Método `calculateRoute(originX, originY, destX, destY)`:**

1. Obtener la `routingMatrix` del mapa: `gameStore.getState().map.toRoutingMatrix()` — matriz donde `1 = vía transitable`, `0 = no transitable`.
2. Implementar Dijkstra sobre el grid:
   - Cola de prioridad (usar min-heap o array + sort).
   - Nodos: `{ x, y, cost, path: [{x,y}] }`.
   - Solo se puede mover a celdas con valor `1` (vías).
   - Movimientos: 4 direcciones ortogonales.
3. Si se encuentra ruta: emitir `EventType.ROUTE_CALCULATED` con `{ path: [{x,y}, ...] }`.
4. Si no existe ruta: emitir `EventType.ROUTE_FAILED` con `{ message: 'No hay ruta disponible entre estos edificios' }`.

**Optimización:** si `originX === destX && originY === destY`, retornar path vacío inmediatamente.

**Importaciones:** `EventType`, `GridUtils` (para `getNeighbors`), `GameStore` (inyectado).

---

### PROMPT 17 — `js/services/RankingService.js`

**Archivo a completar:** `city-builder/js/services/RankingService.js` (actualmente vacío).

Gestiona el ranking local guardado en `localStorage`. Implementa HU-019.

**Clave de localStorage:** `STORAGE_KEYS.ranking` (de `constants.js`).

**Estructura del ranking:**
```js
{
  ranking: [
    {
      cityName: string,
      mayor: string,
      score: number,
      population: number,
      happiness: number,
      turns: number,
      date: string  // ISO
    }
  ]
}
```

**Constructor:** `constructor(gameStore, eventBus)`

**Suscripciones en `init()`:**
- `EventType.TURN_ENDED` → llamar a `#updateCurrentEntry()` para actualizar la entrada de la partida actual en el ranking.

**Métodos:**
- `getRanking()` → devuelve array ordenado por score descendente, top 10.
- `#updateCurrentEntry()` → crear o actualizar la entrada de la ciudad actual. Usar `cityName + mayorName` como clave de identificación.
- `resetRanking()` → borrar `localStorage.removeItem(STORAGE_KEYS.ranking)`.
- `exportRanking()` → descargar el ranking como JSON usando blob + `<a>` temporal.
- `getCurrentCityRank()` → número de posición de la ciudad actual en el ranking global (puede ser > 10).

---

## ─── FASE 6 · UI FALTANTE ───

---

### PROMPT 18 — `js/ui/CitizenPanel.js` COMPLETO

**Archivo a completar:** `city-builder/js/ui/CitizenPanel.js`.

**Constructor:** `constructor(gameStore, eventBus)`

**Suscripciones en `init()`:**
- `EventType.CITIZENS_UPDATED` → `#render(payload)`.
- `EventType.TURN_ENDED` → `#render()`.

**Método `#render()`:**
- Leer ciudadanos desde `gameStore.getState().citizens`.
- Calcular: total, empleados, desempleados, sin hogar, felicidad promedio.
- Actualizar en el contenedor `#citizen-panel`:
  - Barra de progreso de felicidad (0–100) con color dinámico.
  - Contador de población total.
  - Breakdown: `X empleados / Y desempleados / Z sin hogar`.
  - Si felicidad < 40: advertencia visual roja.
  - Si felicidad > 80: indicador verde de bonificación.

---

### PROMPT 19 — `js/ui/ChartPanel.js` (gráfica de histórico)

**Archivo a completar:** `city-builder/js/ui/ChartPanel.js` (actualmente vacío).

Muestra gráficas de evolución de recursos por turno. Implementa HU (implícita en el documento de dominio — histórico de recursos).

**Constructor:** `constructor(gameStore, eventBus)`

**Suscripciones en `init()`:**
- `EventType.TURN_ENDED` → `#updateChart()`.

**Implementación con Canvas 2D nativo** (sin librerías externas):
- Dibujar líneas de tendencia de los últimos 20 turnos para: dinero, electricidad, agua, alimentos.
- Cada línea con el color de `variables.css` correspondiente (`--color-money`, `--color-electricity`, etc.).
- Eje X = turnos, Eje Y = valores.
- Leyenda con colores.
- Si no hay datos suficientes (< 2 turnos): mostrar mensaje "Juega más turnos para ver el historial".

**`js/history/ResourceHistory.js`** — asegúrate de que este módulo exista y tenga:
- `addEntry(turn, resources)` → guarda snapshot de recursos en array circular de máx. 20 entradas.
- `getHistory()` → devuelve el array de snapshots.
- El `TurnService` debe llamar a `resourceHistory.addEntry()` en cada turno (revisar integración en `TurnService.js`).

---

### PROMPT 20 — `js/ui/BuildingInfoModal.js` COMPLETO

**Archivo a completar:** `city-builder/js/ui/BuildingInfoModal.js`.

**Constructor:** `constructor(gameStore, eventBus)`

**Suscripciones en `init()`:**
- `EventType.MAP_CELL_CLICKED` con modo `'view'` → si hay edificio en la celda, llamar a `#showModal(building)`.
- Clic en `#modal-close` o en `.modal-overlay` → `#hideModal()`.
- Clic en `#modal-btn-demolish` → emitir `EventType.DEMOLISH_REQUESTED` con `{ x, y }` y luego `#hideModal()`.

**Método `#showModal(building)`:**
Rellenar `#building-info-modal` con:
- Nombre/tipo del edificio (usar `BuildingType` para texto legible).
- Costo de construcción.
- Consumo por turno (electricidad, agua).
- Producción por turno (dinero, alimentos, etc.).
- Capacidad y ocupación actual (para residenciales: `X/Y habitantes`; para comerciales/industriales: `X/Y empleados`).
- Felicidad promedio de los habitantes (si residencial).
- Estado activo/inactivo.
- Botón "Demoler" con data-x y data-y del edificio.
- Mostrar el modal quitando clase `modal--hidden`.

---

### PROMPT 21 — `js/ui/ScorePanel.js` + `js/ui/RankingModal.js`

**Archivos a completar.**

**`ScorePanel.js`:**

**Constructor:** `constructor(gameStore, eventBus)`

Suscribirse a `EventType.SCORE_UPDATED` → actualizar `#score-panel` con:
- Puntuación total (grande, prominente).
- Desglose expandible (toggle): puntos por población, por felicidad, por edificios, por recursos, bonificaciones y penalizaciones.
- `#turn-display` en el topbar actualizado.

**`RankingModal.js`:**

**Constructor:** `constructor(gameStore, eventBus, rankingService)`

En `init()`:
- Listener en `#btn-ranking` del topbar → `#openModal()`.
- Listener en `#modal-close` del modal → `#closeModal()`.
- Listener en `#btn-reset-ranking` → `rankingService.resetRanking()` + confirmar con `window.confirm(...)`.
- Listener en `#btn-export-ranking` → `rankingService.exportRanking()`.

**Método `#openModal()`:**
- Obtener ranking de `rankingService.getRanking()`.
- Renderizar tabla en `#ranking-modal` con columnas: Pos, Ciudad, Alcalde, Puntuación, Población, Felicidad, Turnos, Fecha.
- Resaltar la fila de la ciudad actual con clase `.ranking-row--current`.
- Si la ciudad actual no está en top 10: agregar fila separada `#ranking-current` debajo con su posición.
- Quitar clase `modal--hidden`.

---

## ─── FASE 7 · INTEGRACIÓN Y WIRING ───

---

### PROMPT 22 — `js/main.js` ACTUALIZACIÓN COMPLETA

**Archivo a modificar:** `city-builder/js/main.js`

Actualizar el bootstrap para incluir todos los módulos que faltan. Secuencia de inicialización correcta y completa:

```js
// 1. Singletons base
const gameStore = new GameStore();
const eventBus  = new EventBus();

// 2. APIs externas (instanciar con API keys — pueden ser vacías por defecto)
const colombiaAPI = new ColombiaAPI();
const weatherAPI  = new WeatherAPI('');    // sin key → usará mock
const newsAPI     = new NewsAPI('');       // sin key → usará mock

// 3. Servicios de dominio
const resourceHistory = new ResourceHistory();

// 4. GameController (instancia todos los servicios internamente)
const gameController = new GameController(gameStore, eventBus, resourceHistory);
gameController.init();

// 5. Controladores de input
const buildController = new BuildController(gameStore, eventBus, gameController.buildingService);
buildController.init();

const inputController = new InputController(gameStore, eventBus);
inputController.init();

// 6. Setup (solo en index.html; condicionado a que exista #setup-container)
// En setup.html lo maneja SetupController directamente
const setupController = new SetupController(gameStore, eventBus, colombiaAPI);
setupController.init();

// 7. UI principal (condicionada a que el juego esté activo)
const mapRenderer      = new MapRenderer(gameStore, eventBus);
const resourcePanel    = new ResourcePanel(gameStore, eventBus);
const buildMenu        = new BuildMenu(gameStore, eventBus);
const notifManager     = new NotificationManager(eventBus);
const citizenPanel     = new CitizenPanel(gameStore, eventBus);
const scorePanel       = new ScorePanel(gameStore, eventBus);
const weatherWidget    = new WeatherWidget(eventBus, weatherAPI);
const newsPanel        = new NewsPanel(eventBus, newsAPI);
const chartPanel       = new ChartPanel(gameStore, eventBus);
const rankingService   = new RankingService(gameStore, eventBus);
const rankingModal     = new RankingModal(gameStore, eventBus, rankingService);
const buildInfoModal   = new BuildingInfoModal(gameStore, eventBus);

// Inicializar UI
[mapRenderer, resourcePanel, buildMenu, notifManager, citizenPanel,
 scorePanel, chartPanel, rankingModal, buildInfoModal, rankingService].forEach(m => m.init());

// 8. Detectar partida guardada
if (gameController.saveService.hasSavedGame()) {
  eventBus.emit(EventType.GAME_LOAD_REQUESTED);
} else {
  // Si estamos en index.html sin partida → redirigir a setup
  window.location.href = 'pages/setup.html';
}
```

**Importante:** `SetupController` debe gestionar la inicialización de `WeatherWidget` y `NewsPanel` con las coordenadas de la ciudad una vez que se emite `GAME_STARTED`, inyectando `lat` y `lon` de `gameStore.getState().city.region`.

---

### PROMPT 23 — `js/controllers/SetupController.js` ACTUALIZACIÓN

**Archivo a modificar:** `city-builder/js/controllers/SetupController.js`

El controlador actual existe pero no está completamente integrado con `ColombiaAPI` ni con `MapLoaderService`. Actualizar para:

1. Recibir en constructor: `(gameStore, eventBus, colombiaAPI, mapLoaderService, saveService)`.
2. Suscribirse a `'setup:submitted'` (emitido por `SetupScreen`):
   - Validar con `InputValidator`.
   - Crear instancia `City`.
   - Crear instancia `Map(width, height)`.
   - Inicializar recursos en `GameStore` con `INITIAL_RESOURCES` de `constants.js` **más** los valores de los campos configurables del formulario (`#init-electricity`, `#init-water`, `#init-food`).
   - Emitir `EventType.GAME_STARTED`.
   - Redirigir a `index.html` con `window.location.href = '../index.html'`.

3. Suscribirse a `EventType.GAME_STARTED` → si hay `city.region.lat` y `city.region.lon`, emitir evento para que `WeatherWidget` y `NewsPanel` se inicialicen con esas coordenadas.

4. Verificar partida existente en `init()` y exponer `hasSavedGame()` (delegando a `saveService`).

---

### PROMPT 24 — Campos configurables en tiempo de juego (HU-014 requisito de parametrización)

**Archivos a modificar:** `js/config/constants.js`, `js/services/ResourceService.js`, `js/services/CitizenService.js`, `js/controllers/InputController.js`.

El documento de dominio indica que varios valores deben ser configurables desde cajas de texto **en cualquier momento del juego**:
- Duración del turno (`#turn-duration`)
- Electricidad inicial (`#init-electricity`)
- Agua inicial (`#init-water`)
- Alimentos iniciales (`#init-food`)
- Consumo de agua/ciudadano (`#citizen-water`)
- Consumo de electricidad/ciudadano (`#citizen-elec`)
- Consumo de comida/ciudadano (`#citizen-food`)
- Bonus de felicidad por policía, bomberos, hospital (`#bonus-police`, `#bonus-fire`, `#bonus-hospital`)

**Implementar en `InputController.js`:**
- Agregar listeners `change` a cada uno de esos inputs.
- Al cambiar:
  - `#turn-duration` → emitir `EventType.TURN_DURATION_CHANGED` con `{ seconds }`. `TurnService` escucha y llama a `setTurnDuration(seconds)`.
  - Los demás → actualizar `gameStore` con los nuevos valores configurables: `gameStore.setState({ config: { citizenWaterConsumption, citizenElecConsumption, ... } })`.
- Agregar `EventType.TURN_DURATION_CHANGED` y `EventType.CONFIG_CHANGED` a `EventType.js`.

**En `ResourceService.js` y `CitizenService.js`:** leer los valores de consumo por ciudadano desde `gameStore.getState().config` en lugar de constantes fijas.

---

## ─── FASE 8 · CSS COMPONENTS RESTANTES ───

---

### PROMPT 25 — CSS de widgets: clima, noticias, ciudadanos, score, chart, ranking

**Archivos a completar:**
- `css/components/weather-widget.css`
- `css/components/news-panel.css`
- `css/components/citizen-panel.css`
- `css/components/score-panel.css`
- `css/components/chart-panel.css`
- `css/components/ranking-modal.css`

**`weather-widget.css`:**
- `.weather-widget` — fondo con gradiente según condición: soleado (naranja), lluvioso (azul), nublado (gris).
- Animación del ícono según condición: `spin-slow` para soleado, `bounce` para lluvia.
- Temperatura grande en `--font-mono`.

**`news-panel.css`:**
- `.news-article` — tarjeta con imagen a la izquierda (60px×60px), texto a la derecha.
- Altura máxima del panel con `overflow-y: auto`.
- Link subtitulado en gris claro.

**`citizen-panel.css`:**
- `.happiness-bar` — barra de progreso con gradiente de rojo a verde según valor.
- `.citizen-stat` — fila de estadísticas con íconos de emoji.

**`score-panel.css`:**
- Puntuación total en fuente grande (`--font-ui`, 2rem).
- `.score-breakdown` — tabla colapsable con `details/summary` o toggle JS.
- `.score-bonus` → verde, `.score-penalty` → rojo.

**`chart-panel.css`:**
- `#chart-canvas` — `width: 100%; height: 140px`.

**`ranking-modal.css`:**
- `.ranking-table` — tabla estilizada con hover effect por fila.
- `.ranking-row--current` — fondo `rgba(79,195,247,0.15)` con borde izquierdo azul.
- `.ranking-pos-1` → texto dorado.
- `.ranking-pos-2` → plata.
- `.ranking-pos-3` → bronce.

---

### PROMPT 26 — CSS páginas: `setup.css` + `ranking.css`

**Archivos a completar.**

**`css/pages/setup.css`:**
- Pantalla full-height con fondo `--color-bg`.
- Formulario centrado, max-width 600px, padding generoso.
- Campos de búsqueda de ciudad con dropdown de resultados (`.region-results-dropdown`).
- Preview del mapa cargado: grid pequeño en miniatura.
- Botones primarios en `--color-accent`.
- Errores de validación en `--color-danger`.

**`css/pages/ranking.css`:**
- Pantalla full-height.
- Header con título y botón volver.
- Tabla de ranking full-width.

---

## ─── FASE 9 · TESTING Y VERIFICACIÓN FINAL ───

---

### PROMPT 27 — Verificación de separación de archivos (regla crítica)

**Acción:** Revisar TODOS los archivos `.html` del proyecto y verificar que no exista ningún `<style>` ni `<script>` (inline o en `<body>`/`<head>` como bloque) en ninguno de ellos.

**Checklist a ejecutar:**
```
index.html        → ¿tiene <style>? NO. ¿tiene <script> sin src? NO.
pages/setup.html  → idem.
pages/ranking.html → idem.
```

Si se encuentra cualquier incumplimiento, moverlo al archivo CSS o JS correspondiente.

**Además verificar:**
- Que todos los `<link>` apunten a rutas relativas correctas (desde cada HTML).
- Que el `<script type="module">` apunte al `main.js` correcto.
- Que el `main.js` en `setup.html` sea diferente o condicional (el setup no necesita todos los módulos del juego).

---

### PROMPT 28 — Verificación de flujo completo end-to-end

Verificar que el flujo completo de la aplicación funciona sin errores en consola:

**Flujo 1 — Nueva ciudad:**
1. Abrir `pages/setup.html`.
2. Buscar "Medellín" en el campo de región → lista desplegable aparece → seleccionar → lat/lon se actualizan.
3. Ingresar nombre ciudad y alcalde.
4. Dar click en "Crear Ciudad" → redirige a `index.html`.
5. `index.html` carga: mapa vacío renderizado, recursos iniciales visibles, menú de construcción activo.

**Flujo 2 — Construir y jugar:**
1. Seleccionar "Vía" en el menú → clic en 3 celdas → vías aparecen en el mapa.
2. Seleccionar "Casa" → clic en celda adyacente a vía → casa aparece + dinero descontado.
3. Seleccionar "Planta Eléctrica" → construir → electricidad sube a 200/turno.
4. Esperar un turno → recursos se actualizan automáticamente.
5. Clic en la casa → modal de info aparece con detalles correctos.

**Flujo 3 — Guardar y cargar:**
1. Cerrar el tab y reabrir `index.html` → mensaje "¿Continuar partida?" → click "Continuar" → ciudad restaurada.

**Flujo 4 — Ruta:**
1. Construir dos edificios conectados por vías.
2. Activar modo ruta → click en edificio A (resaltado) → click en edificio B → ruta animada aparece.

**Documentar** en `js/utils/tests.manual-tests.md` cualquier bug encontrado y su solución.

---

### PROMPT 29 — Manejo de errores y edge cases críticos

Revisar y garantizar que estos casos límite estén correctamente manejados en el código existente:

**EC-001 — Electricidad llega a 0 durante un turno:**
- `ResourceService.calculateTurnResources()` detecta electricidad ≤ 0.
- Emite `EventType.RESOURCE_CRITICAL`.
- Emite `EventType.GAME_OVER`.
- `TurnService` para el interval.
- `NotificationManager` muestra modal prominente de game over.
- Verificar que no se pueda seguir construyendo tras game over.

**EC-002 — Cargar mapa .txt con dimensiones incorrectas:**
- `MapValidator.validate()` debe retornar error claro.
- `SetupScreen` muestra el error en `#setup-errors`.
- El formulario no se puede enviar hasta que se resuelva.

**EC-003 — Demoler edificio con ciudadanos:**
- Modal de confirmación: "¿Demoler [tipo]? Hay X ciudadanos que perderán su hogar."
- Tras confirmar: `CitizenService.evictFromBuilding()` se llama correctamente.
- Felicidad de ciudadanos afectados baja.

**EC-004 — Sin fondos para construir:**
- `BuildingValidator` retorna error con mensaje: "Fondos insuficientes. Necesitas $X, tienes $Y."
- La celda no cambia. Notificación de error.

**EC-005 — Calcular ruta sin vías:**
- `RouteService` ejecuta Dijkstra y no encuentra camino.
- Emite `ROUTE_FAILED`.
- `MapRenderer` limpia cualquier highlight anterior.
- `NotificationManager` muestra "No hay ruta disponible."

---

### PROMPT 30 — Últimos detalles de UX y accesibilidad

Implementar los detalles finales de UX del documento (HU-022, HU-023, HU-024):

**Atajos de teclado** (revisar `InputController.js`):
- `B` → abrir `#build-menu` / enfocar primer tab.
- `R` → activar modo construcción de vía (seleccionar Road en menú).
- `D` → activar modo demolición (cursor cambia).
- `Escape` → cancelar modo actual → volver a `'view'`, cursor normal.
- `Space` → pausar/reanudar turnos (toggle `TurnService.pause()`/`resume()`).
- `S` → emitir `EventType.SAVE_REQUESTED`.

**Indicador de modo activo:**
- `#mode-display` en `#bottom-bar` muestra: "Modo: Ver" / "Modo: Construir [tipo]" / "Modo: Demoler" / "Modo: Ruta".
- `body` recibe clase `mode-view`, `mode-build`, `mode-demolish`, `mode-route` para que el CSS cambie el cursor globalmente.

**Indicador de guardado:**
- Al emitir `EventType.SAVE_COMPLETED`: mostrar brevemente un ícono de disco en el topbar (clase `saving--active` por 1 segundo).

**Responsive — móvil:**
- Botones `#btn-open-left` y `#btn-open-right` flotantes aparecen en < 768px.
- Click → añaden clase `sidebar--open` al sidebar correspondiente.
- Click fuera → cierran el sidebar.

**Tooltips de edificios:**
- Al hacer hover sobre una celda ocupada en modo `'view'`: mostrar tooltip rápido con tipo y ocupación.
- Implementar con atributo `title` dinámico actualizado por `MapRenderer`.

---

## REGLAS GLOBALES (aplicar en TODOS los prompts)

1. **Separación absoluta:** cero `<style>` o `<script>` inline en HTML. Cada incumplimiento: -0.5 décimas.
2. **SRP estricto:** cada archivo tiene una única responsabilidad declarada.
3. **EventBus como único canal:** los módulos no se importan entre sí si pueden comunicarse por eventos.
4. **Sin variables globales:** todo por constructor (DI) o módulo ES6.
5. **Rutas de import relativas:** siempre desde la ubicación del archivo actual.
6. **Sin números mágicos:** todo en `constants.js`.
7. **OCP en edificios:** agregar un nuevo tipo de edificio = crear nueva subclase + actualizar `BuildingAdapter` + `constants.js`. Nunca tocar los demás servicios.
8. **Bajo acoplamiento:** ningún modelo importa UI. Ningún servicio importa controllers. La UI solo escucha eventos y lee `GameStore`.
9. **Exportaciones:** `export default` para clases, `export const` para constantes y funciones utilitarias.
10. **Error silencioso:** nunca lanzar excepciones no capturadas al usuario. Siempre `try/catch` + emitir `NOTIFICATION_SHOW` con error.