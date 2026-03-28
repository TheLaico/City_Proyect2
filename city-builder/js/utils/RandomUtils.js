// Generación de valores aleatorios (ciudadanos por turno)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  getRandomInt
};