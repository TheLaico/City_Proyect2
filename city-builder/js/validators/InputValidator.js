// Valida datos del usuario (nombre, tamaño del mapa, etc)
class InputValidator {
  validateSetupData(data) {
    const errors = [];
    // cityName
    if (!data.cityName || typeof data.cityName !== 'string') {
      errors.push('El nombre de la ciudad es obligatorio.');
    } else if (data.cityName.length < 3) {
      errors.push('El nombre de la ciudad debe tener al menos 3 caracteres.');
    } else if (data.cityName.length > 50) {
      errors.push('El nombre de la ciudad no puede superar los 50 caracteres.');
    }
    // mayorName
    if (!data.mayorName || typeof data.mayorName !== 'string') {
      errors.push('El nombre del alcalde es obligatorio.');
    } else if (data.mayorName.length < 3) {
      errors.push('El nombre del alcalde debe tener al menos 3 caracteres.');
    }
    // width y height
    if (typeof data.width !== 'number' || isNaN(data.width)) {
      errors.push('El ancho del mapa debe ser un número.');
    } else if (data.width < 15 || data.width > 30) {
      errors.push('El ancho del mapa debe estar entre 15 y 30.');
    }
    if (typeof data.height !== 'number' || isNaN(data.height)) {
      errors.push('La altura del mapa debe ser un número.');
    } else if (data.height < 15 || data.height > 30) {
      errors.push('La altura del mapa debe estar entre 15 y 30.');
    }
    // region
    if (!data.region || typeof data.region !== 'object') {
      errors.push('La región es obligatoria.');
    } else {
      if (typeof data.region.lat !== 'number' || typeof data.region.lon !== 'number') {
        errors.push('La región debe tener latitud y longitud válidas.');
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default InputValidator;