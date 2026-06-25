// ─── Plantilla de configuración ──────────────────────────────────────────────
// Copia este archivo a env.js y rellena tus claves reales.
// env.js está en .gitignore y nunca se sube al repositorio.

const ENV = Object.freeze({
  // API de clima → https://openweathermap.org/api (plan gratuito)
  WEATHER_API_KEY: 'TU_CLAVE_OPENWEATHER',

  // API de noticias → https://newsapi.org (plan developer)
  NEWS_API_KEY: 'TU_CLAVE_NEWSAPI',

  // Código ISO-2 del país para noticias ('co' = Colombia)
  NEWS_COUNTRY: 'co',

  // Proxy propio para ocultar NEWS_API_KEY del cliente (déjalo vacío si no tienes).
  NEWS_PROXY_URL: '',

  // URL del backend Flask para cálculo de rutas.
  // Ej: 'https://tu-servidor.com/api/calculate-route'
  // Vacío = usa Dijkstra local (sin backend).
  ROUTE_API_URL: '',
});

export default ENV;
