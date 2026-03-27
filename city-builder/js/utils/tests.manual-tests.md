# Pruebas manuales City Builder

## TC-001: Construcción inválida por falta de vía
- **Estado:** mapa vacío, sin vías.
- **Acción:** intentar construir una casa en (5, 5).
- **Esperado:**
  - Evento `BUILD_FAILED` emitido con error "El edificio debe estar adyacente a una vía".
  - Notificación de error visible.
  - Mapa sin cambios.

## TC-002: Construcción inválida por fondos insuficientes
- **Estado:** dinero = $500, intentar construir Planta Eléctrica ($10,000).
- **Esperado:**
  - Evento `BUILD_FAILED` con error de fondos insuficientes.
  - Dinero sin cambios.

## TC-003: Recursos negativos (game over)
- **Estado:** 0 electricidad, edificios que consumen electricidad.
- **Acción:** avanzar un turno.
- **Esperado:**
  - Evento `RESOURCE_CRITICAL` emitido.
  - Luego evento `GAME_OVER`.
  - Turnos detenidos.
  - Notificación visible.

## TC-004: Carga de mapa con datos corruptos
- **Acción:** cargar archivo `.txt` con símbolo `X9` inválido en fila 3, col 5.
- **Esperado:**
  - `MapValidator` retorna `valid: false`.
  - Error "Símbolo inválido 'X9' en posición (3, 5)".
  - Mapa no se carga.

## TC-005: Demolición con ciudadanos afectados
- **Estado:** casa con 4 ciudadanos viviendo.
- **Acción:** demoler la casa.
- **Esperado:**
  - Reembolso de $500 (50% de $1,000).
  - 4 ciudadanos quedan sin hogar.
  - Felicidad de esos ciudadanos baja en 20 puntos.

## TC-006: Sin ruta disponible
- **Estado:** dos edificios sin vías conectadas entre sí.
- **Acción:** solicitar cálculo de ruta.
- **Esperado:**
  - Backend devuelve error.
  - Evento `ROUTE_FAILED` emitido.
  - Notificación "No hay ruta disponible entre estos edificios".
