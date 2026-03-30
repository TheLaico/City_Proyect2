import { EventType } from '../types/EventType.js';

/**
 * GameOverScreen
 * Responsabilidad única: escuchar el evento GAME_OVER, recopilar el
 * snapshot de datos necesarios, persistirlo en sessionStorage y
 * redirigir a pages/game-over.html.
 *
 * No genera HTML, no toca el DOM, no conoce estilos.
 */
class GameOverScreen {
  constructor(gameStore, eventBus, rankingService, saveService) {
    this.gameStore          = gameStore;
    this.eventBus           = eventBus;
    this.rankingService     = rankingService;
    this.saveService        = saveService;

    this._triggered         = false;
    this._criticalResources = [];
  }

  init() {
    this.eventBus.subscribe(EventType.RESOURCE_CRITICAL, ({ resource }) => {
      if (!this._criticalResources.includes(resource)) {
        this._criticalResources.push(resource);
      }
    });

    this.eventBus.subscribe(EventType.GAME_OVER, () => this._handleGameOver());
  }

  // ── Orquestación ─────────────────────────────────────────────────────────

  _handleGameOver() {
    if (this._triggered) return;
    this._triggered = true;

    this.eventBus.emit(EventType.SAVE_REQUESTED);

    // Delay para que RankingService procese el SCORE_UPDATED final
    setTimeout(() => {
      const snapshot = this._buildSnapshot();
      this._persist(snapshot);
      window.location.href = 'pages/game-over.html';
    }, 150);
  }

  // ── Construcción del snapshot ─────────────────────────────────────────────

  _buildSnapshot() {
    const state     = this.gameStore.getState();
    const city      = state.city      ?? {};
    const citizens  = state.citizens  ?? [];
    const resources = state.resources ?? {};

    const population = citizens.length;
    const happiness  = population > 0
      ? Math.round(citizens.reduce((s, c) => s + (c.happiness || 0), 0) / population)
      : 0;

    const score  = this._resolveScore(city);
    const causes = this._criticalResources.length > 0
      ? this._criticalResources
      : Object.keys(resources).filter(r => (resources[r] ?? 0) < 0);

    return {
      cityName:  city.name      ?? '—',
      mayorName: city.mayorName ?? '—',
      turn:      state.turn     ?? 0,
      population,
      happiness,
      score,
      causes,
    };
  }

  _resolveScore(city) {
    try {
      const key   = `${city.name}::${city.mayorName}`;
      const entry = (this.rankingService.getAllEntries() ?? [])
        .find(e => `${e.cityName}::${e.mayor}` === key);
      return entry?.score ?? 0;
    } catch {
      return 0;
    }
  }

  // ── Persistencia del snapshot ─────────────────────────────────────────────

  _persist(snapshot) {
    sessionStorage.setItem('game_over_snapshot', JSON.stringify(snapshot));
  }
}

export default GameOverScreen;