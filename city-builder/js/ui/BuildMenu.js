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
    tabs.className = 'build-tab-header';
    const panels = document.createElement('div');
    panels.className = 'build-menu-panels';
    MENU_CATEGORIES.forEach((cat, i) => {
      const tab = document.createElement('button');
      tab.textContent = cat.label;
      tab.dataset.tab = i;
      if (i === 0) tab.classList.add('active');
      tab.addEventListener('click', () => {
        container.querySelectorAll('.build-tab-header button').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelectorAll('.build-items-grid').forEach((p, j) => {
          p.style.display = j === i ? '' : 'none';
        });
      });
      tabs.appendChild(tab);
      // Panel
      const panel = document.createElement('div');
      panel.className = 'build-items-grid';
      if (i !== 0) panel.style.display = 'none';
      cat.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'build-item';
        btn.dataset.cost = item.cost;
        btn.innerHTML = `
          <span class="build-item__icon">${item.icon}</span>
          <span class="build-item__name">${item.name}</span>
          <span class="build-item__cost">$${item.cost}</span>
        `;
        btn.addEventListener('click', () => {
          if (btn.classList.contains('build-item--disabled')) return;
          this.activeType = item.type;
          this.eventBus.emit(EventType.BUILD_TYPE_SELECTED, { buildingType: item.type });
          container.querySelectorAll('.build-item').forEach(b => b.classList.remove('build-item--active'));
          btn.classList.add('build-item--active');
        });
        btn.dataset.type = item.type;
        panel.appendChild(btn);
      });
      panels.appendChild(panel);
    });
    container.appendChild(tabs);
    container.appendChild(panels);

    const updateAffordability = () => {
      const money = this.gameStore.getState().resources?.money ?? 0;
      container.querySelectorAll('.build-item').forEach(btn => {
        const cost = parseInt(btn.dataset.cost, 10) || 0;
        const disabled = money < cost;
        btn.classList.toggle('build-item--disabled', disabled);
        btn.disabled = disabled;
      });
    };

    updateAffordability();
    this.eventBus.subscribe(EventType.RESOURCES_UPDATED, updateAffordability);

    // Resaltar ítem activo al cambiar modo
    this.eventBus.subscribe(EventType.MODE_CHANGED, ({ mode }) => {
      container.querySelectorAll('.build-item').forEach(btn => {
        btn.classList.toggle('build-item--active', btn.dataset.type === this.gameStore.getState().selectedBuildingType && mode === 'build');
      });
    });
  }
}

export default BuildMenu;