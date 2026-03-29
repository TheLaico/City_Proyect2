// Generación de valores aleatorios (ciudadanos por turno)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  randomInt
};