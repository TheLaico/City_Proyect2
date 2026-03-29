// COSTOS DE CONSTRUCCIÓN
export const BUILDING_COSTS = Object.freeze({
  residential_house: 1000,
  residential_apartment: 3000,
  commercial_shop: 2000,
  commercial_mall: 8000,
  industrial_factory: 5000,
  industrial_farm: 3000,
  service_police: 4000,
  service_fire: 4000,
  service_hospital: 6000,
  utility_power_plant: 10000,
  utility_water_plant: 8000,
  park: 1500,
  road: 100,
});

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

// CONSUMO POR TURNO
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

// RADIOS DE INFLUENCIA
export const SERVICE_RADIUS = Object.freeze({
  service_police:   5,
  service_fire:     5,
  service_hospital: 7,
});

// RECURSOS INICIALES DE LA CIUDAD
export const INITIAL_RESOURCES = Object.freeze({
  money:       50000,
  electricity: 100,
  water:       100,
  food:        100,
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
  perMoneyDiv:   100,
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
  lowHappiness:        -400,
  perUnemployed:       -10,
});

// SISTEMA DE TURNOS
export const TURN_CONFIG = Object.freeze({
  defaultDurationSeconds: 10,
  autoSaveEveryNTurns:    1,
});

// PERSISTENCIA
export const STORAGE_KEYS = Object.freeze({
  save:    'city_builder_save',
  ranking: 'city_builder_ranking',
  debug:   'debug_mode',
});