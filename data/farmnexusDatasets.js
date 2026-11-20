/**
 * FarmNexus Enterprise Datasets - Single Source of Truth (SSOT)
 * Connects directly to FarmNexus Autonomous Agents
 */

import { TRANSLATIONS } from './translations.js';

export const DATASETS = {
  // 1. Agronomy Dataset: Pre-sowing viability, profitability & competition
  CROPS: {
    rabi: [
      {
        id: 'chilli_teja',
        cropKey: 'chilli',
        name: 'Red Chilli (Teja)',
        pricePerKg: 184.0,
        unit: 'kg',
        baseProfitPerAcre: 142000,
        competitionAcreagePct: 18,
        glutRisk: 'Low',
        waterReq: 'Borewell',
        idealSoil: ['Red (Chalka)', 'Loamy Alluvial'],
        growthCycleDays: 120,
        note: 'Export & oleoresin contracts peak in ~110 days. Optimal soil aeration required.'
      },
      {
        id: 'french_beans_okra',
        cropKey: 'beans',
        name: 'French Beans / Okra',
        pricePerKg: 38.0,
        unit: 'kg',
        baseProfitPerAcre: 88000,
        competitionAcreagePct: 32,
        glutRisk: 'Moderate',
        waterReq: 'Canal / Drip',
        idealSoil: ['Loamy Alluvial', 'Black Cotton'],
        growthCycleDays: 65,
        note: 'Urban supermarket supply deficit opens in December. Staggered harvesting recommended.'
      },
      {
        id: 'pearl_millet_maize',
        cropKey: 'maize',
        name: 'Pearl Millet / Hybrid Maize',
        pricePerKg: 24.5,
        unit: 'kg',
        baseProfitPerAcre: 64000,
        competitionAcreagePct: 24,
        glutRisk: 'Stable',
        waterReq: 'Rainfed',
        idealSoil: ['Red (Chalka)', 'Black Cotton'],
        growthCycleDays: 95,
        note: 'Medchal poultry feed mills have pre-locked procurement tenders at MSP floor.'
      }
    ],
    kharif: [
      {
        id: 'cotton_bt',
        cropKey: 'cotton',
        name: 'Cotton (Bt Hybrid)',
        pricePerKg: 72.0,
        unit: 'kg',
        baseProfitPerAcre: 96000,
        competitionAcreagePct: 28,
        glutRisk: 'Moderate',
        waterReq: 'Borewell',
        idealSoil: ['Black Cotton'],
        growthCycleDays: 150,
        note: 'Coimbatore & Warangal spinning mills forward-buying for Q4 export demand.'
      },
      {
        id: 'hybrid_maize',
        cropKey: 'maize',
        name: 'Hybrid Maize',
        pricePerKg: 23.0,
        unit: 'kg',
        baseProfitPerAcre: 58000,
        competitionAcreagePct: 22,
        glutRisk: 'Low',
        waterReq: 'Rainfed',
        idealSoil: ['Red (Chalka)', 'Loamy Alluvial'],
        growthCycleDays: 100,
        note: 'Local starch processing units operating at high capacity utilization.'
      },
      {
        id: 'pigeon_pea_tur',
        cropKey: 'tur',
        name: 'Pigeon Pea (Tur)',
        pricePerKg: 98.0,
        unit: 'kg',
        baseProfitPerAcre: 78000,
        competitionAcreagePct: 15,
        glutRisk: 'Low',
        waterReq: 'Rainfed',
        idealSoil: ['Black Cotton', 'Loamy Alluvial'],
        growthCycleDays: 180,
        note: 'State pulse deficit keeps open market auction prices 20% above MSP.'
      }
    ],
    zaid: [
      {
        id: 'watermelon_muskmelon',
        cropKey: 'melon',
        name: 'Watermelon / Muskmelon',
        pricePerKg: 16.0,
        unit: 'kg',
        baseProfitPerAcre: 84000,
        competitionAcreagePct: 26,
        glutRisk: 'Moderate',
        waterReq: 'Canal / Drip',
        idealSoil: ['Loamy Alluvial', 'Red (Chalka)'],
        growthCycleDays: 75,
        note: 'Strong summer hydrational fruit demand spike in Hyderabad and Secunderabad urban corridors.'
      },
      {
        id: 'cucumber_gourd',
        cropKey: 'gourd',
        name: 'Cucumber / Bottle Gourd',
        pricePerKg: 22.0,
        unit: 'kg',
        baseProfitPerAcre: 62000,
        competitionAcreagePct: 20,
        glutRisk: 'Low',
        waterReq: 'Canal / Drip',
        idealSoil: ['Loamy Alluvial'],
        growthCycleDays: 55,
        note: 'Quick 55-day cash turnaround cycle with steady weekly supermarket demand.'
      },
      {
        id: 'sunflower',
        cropKey: 'sunflower',
        name: 'Sunflower',
        pricePerKg: 66.0,
        unit: 'kg',
        baseProfitPerAcre: 54000,
        competitionAcreagePct: 17,
        glutRisk: 'Low',
        waterReq: 'Borewell',
        idealSoil: ['Black Cotton'],
        growthCycleDays: 90,
        note: 'Regional edible oil refineries running short of domestic seed inventory.'
      }
    ]
  },

  // 2. Channel Pricing & Logistics Matrix (P)
  // [mandiGross, mandiTransport, mandiCommission, factoryContractRate, factoryLogistics, d2cRetailRate, d2cDelivery]
  CHANNEL_PRICES: {
    tomato: {
      name: 'Tomato',
      mandiGross: 22.80,
      mandiTransport: 1.10,
      mandiCommission: 1.40,
      factoryContractRate: 24.20,
      factoryLogistics: 1.20,
      d2cRetailRate: 34.00,
      d2cDelivery: 2.50,
      benchmarkHub: 'Gudimalkapur APMC Mandi'
    },
    sugarcane: {
      name: 'Sugarcane',
      mandiGross: 3.40,
      mandiTransport: 0.35,
      mandiCommission: 0.20,
      factoryContractRate: 3.70,
      factoryLogistics: 0.30,
      d2cRetailRate: 4.60,
      d2cDelivery: 0.50,
      benchmarkHub: 'Nizamabad APMC Yard'
    },
    onion: {
      name: 'Onion',
      mandiGross: 18.00,
      mandiTransport: 1.00,
      mandiCommission: 1.10,
      factoryContractRate: 19.60,
      factoryLogistics: 1.10,
      d2cRetailRate: 26.00,
      d2cDelivery: 2.20,
      benchmarkHub: 'Bowenpally APMC Market'
    },
    paddy: {
      name: 'Paddy (Sona Masoori)',
      mandiGross: 22.50,
      mandiTransport: 1.20,
      mandiCommission: 1.00,
      factoryContractRate: 24.20,
      factoryLogistics: 1.30,
      d2cRetailRate: 27.50,
      d2cDelivery: 1.80,
      benchmarkHub: 'Warangal Grain Market'
    },
    chilli: {
      name: 'Red Chilli (Dry)',
      mandiGross: 184.00,
      mandiTransport: 3.00,
      mandiCommission: 6.00,
      factoryContractRate: 196.00,
      factoryLogistics: 3.00,
      d2cRetailRate: 215.00,
      d2cDelivery: 6.00,
      benchmarkHub: 'Guntur Mirchi Yard'
    }
  },

  // 3. Buyer Demand Board (D)
  BUYER_ORDERS: [
    {
      id: 'ord_01',
      org: 'Deccan Agro Puree Factory',
      category: 'factory',
      crop: 'tomato',
      cropName: 'Tomato',
      pricePerKg: 23.80,
      totalQtyKg: 40000,
      openQtyKg: 26000,
      spec: 'Grade B, firm, ripe red; crate-packed',
      hub: 'Medchal Highway · 25 km',
      leadTimeDays: 2
    },
    {
      id: 'ord_02',
      org: 'FreshMart Supermarkets',
      category: 'supermarket',
      crop: 'tomato',
      cropName: 'Tomato',
      pricePerKg: 29.50,
      totalQtyKg: 15000,
      openQtyKg: 9300,
      spec: 'Grade A, uniform red, 65mm+, blemish-free',
      hub: 'Secunderabad DC · 12 km',
      leadTimeDays: 1
    },
    {
      id: 'ord_03',
      org: 'QuickBasket (Quick-Commerce)',
      category: 'online',
      crop: 'banana',
      cropName: 'Banana',
      pricePerKg: 31.00,
      totalQtyKg: 20000,
      openQtyKg: 18000,
      spec: 'Robusta, green-yellow transition, 7–8 inch',
      hub: 'Kompally Dark Store · 16 km',
      leadTimeDays: 1
    },
    {
      id: 'ord_04',
      org: 'AgroStarch Mills',
      category: 'factory',
      crop: 'maize',
      cropName: 'Maize',
      pricePerKg: 24.20,
      totalQtyKg: 60000,
      openQtyKg: 50000,
      spec: 'Moisture ≤ 14%, aflatoxin-free, clean grain',
      hub: 'Nizamabad · 40 km',
      leadTimeDays: 4
    },
    {
      id: 'ord_05',
      org: 'SpiceCraft Oleoresins',
      category: 'factory',
      crop: 'chilli',
      cropName: 'Red Chilli',
      pricePerKg: 198.00,
      totalQtyKg: 25000,
      openQtyKg: 14000,
      spec: 'Capsaicin > 0.4%, moisture < 10%, whole pods',
      hub: 'Guntur Bypass · 15 km',
      leadTimeDays: 3
    }
  ],

  // 4. Circular Zero-Waste Residue Catalog
  RESIDUES: {
    sugarcane: [
      {
        residueName: 'Sugarcane Bagasse',
        pricePerKg: 3.80,
        use: 'Eco-tableware bowls, meal trays & particle boards',
        buyer: 'GreenPack Eco-Tableware Plant',
        hub: 'Medchal · 14 km',
        conversionFactorKgPerAcre: 1105
      }
    ],
    tomato: [
      {
        residueName: 'Overripe & Sorting Rejects',
        pricePerKg: 6.50,
        use: 'Industrial paste, puree & ketchup mash units',
        buyer: 'Telangana Agro Puree Processing Unit',
        hub: 'Patancheru · 18 km',
        conversionFactorKgPerAcre: 1000
      }
    ],
    paddy: [
      {
        residueName: 'Paddy Straw & Husk',
        pricePerKg: 2.90,
        use: 'Compressed bio-fuel pellets & oyster mushroom beds',
        buyer: 'BioPower Green Energy Fuels',
        hub: 'Shadnagar · 22 km',
        conversionFactorKgPerAcre: 1450
      }
    ],
    chilli: [
      {
        residueName: 'Chilli Stalks, Seeds & Calyx',
        pricePerKg: 8.00,
        use: 'Secondary oleoresin chemical extraction',
        buyer: 'Deccan Natural Colors & Extracts',
        hub: 'Guntur Industrial Estate · 12 km',
        conversionFactorKgPerAcre: 525
      }
    ],
    maize: [
      {
        residueName: 'Corn Cobs & Husks',
        pricePerKg: 3.20,
        use: 'Furfural production & cattle feed enrichment blocks',
        buyer: 'Kisan BioFeed Processing Co.',
        hub: 'Bowenpally · 10 km',
        conversionFactorKgPerAcre: 900
      }
    ],
    cotton: [
      {
        residueName: 'Cotton Stalks & Bio-mulch',
        pricePerKg: 2.70,
        use: 'Hardboard manufacturing & soil conditioning biochar',
        buyer: 'AgroChar Ecoclean Systems',
        hub: 'Warangal Rural · 18 km',
        conversionFactorKgPerAcre: 1200
      }
    ]
  },

  // 5. One Crop, Many Incomes Stacking Models
  INCOME_STACKS: {
    sugarcane: {
      crop: 'Sugarcane (1 Acre Model)',
      streams: [
        { name: 'Primary: Cane to Sugar Mill', amount: 92000, sharePct: 83.1 },
        { name: 'Secondary: Direct Juice Vendors', amount: 14500, sharePct: 13.1 },
        { name: 'Circular: Bagasse Tableware Buyer', amount: 4200, sharePct: 3.8 }
      ],
      totalIncome: 110700,
      mandiBaselineIncome: 92000,
      upliftAmount: 18700,
      upliftPct: 20.3
    },
    tomato: {
      crop: 'Tomato (2,000 kg / 0.5 Acre Model)',
      streams: [
        { name: 'Primary: Deccan Agro Puree Factory (75%)', amount: 34500, sharePct: 62.2 },
        { name: 'Direct: Gated Community Pre-Orders (25%)', amount: 15750, sharePct: 28.4 },
        { name: 'Circular: Grade-C Rejects to Paste Plant', amount: 5200, sharePct: 9.4 }
      ],
      totalIncome: 55450,
      mandiBaselineIncome: 40600,
      upliftAmount: 14850,
      upliftPct: 36.6
    },
    chilli: {
      crop: 'Red Chilli (1 Acre Teja Model)',
      streams: [
        { name: 'Primary: Export & Spice Mill Delivery (80%)', amount: 156800, sharePct: 83.8 },
        { name: 'Direct: Premium D2C Whole Spice Pouches (15%)', amount: 25800, sharePct: 13.8 },
        { name: 'Circular: Stalks & Seeds to Oleoresin Lab (5%)', amount: 4400, sharePct: 2.4 }
      ],
      totalIncome: 187000,
      mandiBaselineIncome: 147200,
      upliftAmount: 39800,
      upliftPct: 27.0
    }
  },

  // 6. District Agrometeorological & Soil Telemetry Defaults
  DISTRICTS: [
    { id: 0, name: 'Secunderabad, TS', soilBase: 'Red (Chalka)', waterAccess: 'Borewell', mandiDistanceKm: 18 },
    { id: 1, name: 'Warangal, TS', soilBase: 'Black Cotton', waterAccess: 'Canal / Drip', mandiDistanceKm: 24 },
    { id: 2, name: 'Guntur, AP', soilBase: 'Loamy Alluvial', waterAccess: 'Canal / Drip', mandiDistanceKm: 14 },
    { id: 3, name: 'Nizamabad, TS', soilBase: 'Black Cotton', waterAccess: 'Borewell', mandiDistanceKm: 28 }
  ],

  // 7. 7-Day Forecast Multiplier Pattern & 30-Day Glut Coefficients
  FORECAST: {
    multipliers: [1.00, 1.05, 1.12, 1.08, 1.00, 0.96, 0.94], // Day 3 is the local price peak
    verdictRule: 'HOLD FOR 48 HOURS (+₹{diff}/kg expected, rain forecast and arrival choke)'
  },

  // 8. Multilingual Strings (T)
  TRANSLATIONS: TRANSLATIONS
};
