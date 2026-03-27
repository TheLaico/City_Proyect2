import { EventType } from '../types/EventType.js';

class NotificationManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.container = null;
  }

  init() {
    this.container = document.getElementById('notifications-container');
    if (!this.container) return;
    this.eventBus.subscribe(EventType.NOTIFICATION_SHOW, (payload) => this.#showNotification(payload));
    this.eventBus.subscribe(EventType.BUILD_SUCCESS, ({ building }) => {
      this.#showNotification({
        message: `✅ ${building.type} construido`,
        type: 'success'
      });
    });
    this.eventBus.subscribe(EventType.BUILD_FAILED, ({ errors }) => {
      const msg = Array.isArray(errors) ? errors.join('\n') : errors;
      this.#showNotification({
        message: `❌ Error al construir:\n${msg}`,
        type: 'error',
        duration: 4000
      });
    });
    this.eventBus.subscribe(EventType.DEMOLISH_SUCCESS, ({ refund }) => {
      this.#showNotification({
        message: `🔨 Demolición completada. +$${refund}`,
        type: 'info'
      });
    });
    this.eventBus.subscribe(EventType.RESOURCE_CRITICAL, ({ resource }) => {
      this.#showNotification({
        message: `⚠️ ¡Recurso crítico! ${resource} en 0`,
        type: 'warning',
        duration: 5000
      });
    });
    this.eventBus.subscribe(EventType.GAME_OVER, () => {
      this.#showNotification({
        message: '💀 Fin del juego. Has perdido.',
        type: 'error',
        duration: 7000
      });
    });
  }

  #showNotification({ message, type = 'info', duration = 3000 }) {
    if (!this.container) return;
    const notif = document.createElement('div');
    notif.className = `notification notification--${type}`;
    notif.textContent = message;
    this.container.appendChild(notif);
    // Limitar a 3 notificaciones
    while (this.container.children.length > 3) {
      this.container.removeChild(this.container.firstChild);
    }
    setTimeout(() => {
      notif.classList.add('notification--hide');
      notif.addEventListener('transitionend', () => {
        notif.remove();
      }, { once: true });
    }, duration);
  }
}

export default NotificationManager;
