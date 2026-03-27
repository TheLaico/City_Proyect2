import { EventType } from '../types/EventType.js';
import { BuildingType } from '../types/BuildingType.js';
import { BUILDING_COSTS } from '../config/constants.js';

const MENU_CATEGORIES = [
  {
    label: 'Vías',
    items: [
      { type: BuildingType.ROAD, name: 'Vía', icon: '🛣️', cost: BUILDING_COSTS[BuildingType.ROAD] }
    ]
  },
  {
    label: 'Residencial',
    items: [
      { type: BuildingType.RESIDENTIAL_HOUSE, name: 'Casa', icon: '🏠', cost: BUILDING_COSTS[BuildingType.RESIDENTIAL_HOUSE] },
      { type: BuildingType.RESIDENTIAL_APARTMENT, name: 'Apartamento', icon: '🏢', cost: BUILDING_COSTS[BuildingType.RESIDENTIAL_APARTMENT] }
    ]
  },
  {
    label: 'Comercial',
    items: [
      { type: BuildingType.COMMERCIAL_SHOP, name: 'Tienda', icon: '🏪', cost: BUILDING_COSTS[BuildingType.COMMERCIAL_SHOP] },
      { type: BuildingType.COMMERCIAL_MALL, name: 'Centro Comercial', icon: '🏬', cost: BUILDING_COSTS[BuildingType.COMMERCIAL_MALL] }
    ]
  },
  {
    label: 'Industrial',
    items: [
      { type: BuildingType.INDUSTRIAL_FACTORY, name: 'Fábrica', icon: '🏭', cost: BUILDING_COSTS[BuildingType.INDUSTRIAL_FACTORY] },
      { type: BuildingType.INDUSTRIAL_FARM, name: 'Granja', icon: '🌾', cost: BUILDING_COSTS[BuildingType.INDUSTRIAL_FARM] }
    ]
  },
  {
    label: 'Servicios',
    items: [
      { type: BuildingType.SERVICE_POLICE, name: 'Est. Policía', icon: '🚓', cost: BUILDING_COSTS[BuildingType.SERVICE_POLICE] },
      { type: BuildingType.SERVICE_FIRE, name: 'Est. Bomberos', icon: '🚒', cost: BUILDING_COSTS[BuildingType.SERVICE_FIRE] },
      { type: BuildingType.SERVICE_HOSPITAL, name: 'Hospital', icon: '🏥', cost: BUILDING_COSTS[BuildingType.SERVICE_HOSPITAL] }
    ]
  },
  {
    label: 'Utilidades',
    items: [
      { type: BuildingType.UTILITY_POWER_PLANT, name: 'Planta Eléctrica', icon: '⚡', cost: BUILDING_COSTS[BuildingType.UTILITY_POWER_PLANT] },
      { type: BuildingType.UTILITY_WATER_PLANT, name: 'Planta de Agua', icon: '💧', cost: BUILDING_COSTS[BuildingType.UTILITY_WATER_PLANT] }
    ]
  },
  {
    label: 'Parques',
    items: [
      { type: BuildingType.PARK, name: 'Parque', icon: '🌳', cost: BUILDING_COSTS[BuildingType.PARK] }
    ]
  }
];

class BuildMenu {
  constructor(gameStore, eventBus) {
    this.gameStore = gameStore;
    this.eventBus = eventBus;
    this.activeType = null;
  }

  init() {
    const container = document.getElementById('build-menu');
    if (!container) return;
    container.innerHTML = '';
    const tabs = document.createElement('div');
    tabs.className = 'build-menu-tabs';
    const panels = document.createElement('div');
    panels.className = 'build-menu-panels';
    MENU_CATEGORIES.forEach((cat, i) => {
      const tab = document.createElement('button');
      tab.className = 'build-menu-tab';
      tab.textContent = cat.label;
      tab.dataset.tab = i;
      if (i === 0) tab.classList.add('active');
      tab.addEventListener('click', () => {
        container.querySelectorAll('.build-menu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelectorAll('.build-menu-panel').forEach((p, j) => {
          p.style.display = j === i ? '' : 'none';
        });
      });
      tabs.appendChild(tab);
      // Panel
      const panel = document.createElement('div');
      panel.className = 'build-menu-panel';
      if (i !== 0) panel.style.display = 'none';
      cat.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'build-menu-item';
        btn.innerHTML = `<span class="icon">${item.icon}</span> <span class="name">${item.name}</span> <span class="cost">$${item.cost}</span>`;
        btn.addEventListener('click', () => {
          this.activeType = item.type;
          this.eventBus.emit(EventType.BUILDING_SELECTED, { buildingType: item.type });
          container.querySelectorAll('.build-menu-item').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
        btn.dataset.type = item.type;
        panel.appendChild(btn);
      });
      panels.appendChild(panel);
    });
    container.appendChild(tabs);
    container.appendChild(panels);
    // Resaltar ítem activo al cambiar modo
    this.eventBus.subscribe(EventType.MODE_CHANGED, ({ mode }) => {
      container.querySelectorAll('.build-menu-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === this.gameStore.getState().selectedBuildingType && mode === 'build');
      });
    });
  }
}

export default BuildMenu;
