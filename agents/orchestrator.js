/**
 * Central Orchestrator Agent
 * Master Coordinator, Intent Classifier, Cross-Agent Conflict Resolver & Farmer Playbook Synthesizer
 * Connected Datasets: All Datasets, Translations (T), Session Memory Blackboard
 */

import { AgronomyAgent } from './agronomyAgent.js';
import { MarketEquilibriumAgent } from './marketEquilibriumAgent.js';
import { ProcurementAgent } from './procurementAgent.js';
import { CircularAgent } from './circularAgent.js';

export class FarmNexusOrchestrator {
  constructor(datasets) {
    this.datasets = datasets;
    this.agronomyAgent = new AgronomyAgent(datasets);
    this.marketAgent = new MarketEquilibriumAgent(datasets);
    this.procurementAgent = new ProcurementAgent(datasets);
    this.circularAgent = new CircularAgent(datasets);
    
    this.sessionHistory = [];
  }

  /**
   * Main entry point when a farmer submits their crop details
   * @param {Object} farmerInput { cropKey, acreage, volumeKg, districtId, season, waterIndex, soilIndex, language }
   */
  async processCropIntelligence(farmerInput) {
    const {
      cropKey = 'tomato',
      acreage = 1,
      volumeKg = 2000,
      districtId = 0,
      season = 'rabi',
      waterIndex = 0,
      soilIndex = 0,
      language = 'en'
    } = farmerInput;

    const startTime = performance.now();
    const traceLogs = [];

    traceLogs.push({ step: "INTENT_INGESTION", message: `Farmer intake received for ${cropKey.toUpperCase()} · ${acreage} Acres · ${volumeKg} kg · District ${districtId}` });

    // Step 1: Agronomy Assessment
    traceLogs.push({ step: "AGRONOMY_AGENT_DISPATCH", message: "Evaluating soil compatibility, water source index, and baseline cultivation profit..." });
    const agronomyResult = this.agronomyAgent.evaluateCropViability({
      cropKey,
      districtId,
      season,
      waterIndex,
      soilIndex,
      acreage
    });

    // Step 2: Market Equilibrium Assessment
    traceLogs.push({ step: "MARKET_AGENT_DISPATCH", message: "Querying APMC mandi auction benchmarks, 7-day trend multipliers, and district acreage saturation..." });
    const marketResult = this.marketAgent.evaluateMarketEquilibrium(cropKey, agronomyResult.districtCompetitionAcreage);

    // Step 3: Procurement & 3-Channel Split Routing
    traceLogs.push({ step: "PROCUREMENT_AGENT_DISPATCH", message: "Auditing APMC vs Direct Factory vs D2C logistics net deductions and matching buyer demand orders..." });
    const procurementResult = this.procurementAgent.evaluateChannels(cropKey, volumeKg);

    // Step 4: Circular Valorization
    traceLogs.push({ step: "CIRCULAR_AGENT_DISPATCH", message: "Scanning regional bio-economy off-takers for peel, stalk, bagasse, and sorting reject monetization..." });
    const circularResult = this.circularAgent.evaluateCircularResidues(cropKey, volumeKg, acreage);

    // Step 5: Synthesis & Conflict Resolution
    traceLogs.push({ step: "ORCHESTRATOR_SYNTHESIS", message: "Reconciling agronomic yield with glut exposure and formulating the unified Crop Wealth Playbook..." });
    
    // Cross-agent synthesis:
    // Calculate total stacked earnings across crop harvest split + circular by-products
    const totalHarvestNet = procurementResult.splitStrategy.totalPayout;
    const totalCircularCash = circularResult.totalCircularIncome;
    const totalStackedIncome = totalHarvestNet + totalCircularCash;
    const mandiBaselineTotal = procurementResult.channels.mandi.totalTakeHome;
    const totalNetUplift = totalStackedIncome - mandiBaselineTotal;
    const totalNetUpliftPct = Math.round((totalNetUplift / (mandiBaselineTotal || 1)) * 100);

    // Conflict Guardrail: If competition is High but farmer intends to harvest during glut
    let strategicAlert = null;
    if (agronomyResult.glutRisk === 'Moderate' || agronomyResult.districtCompetitionAcreage > 25) {
      strategicAlert = {
        severity: "WARNING",
        title: "High Regional Sowing Density Detected",
        message: `${agronomyResult.districtCompetitionAcreage}% of district acreage is sown to ${agronomyResult.cropName}. Bypassing traditional Mandi auctions through FarmNexus pre-committed factory orders is critical to avoid a 15–25% price crash.`
      };
    }

    const playbook = {
      timestamp: new Date().toISOString(),
      executionDurationMs: +(performance.now() - startTime).toFixed(1),
      farmerInput,
      traceLogs,
      summary: {
        cropName: agronomyResult.cropName,
        totalStackedIncome: totalStackedIncome,
        mandiBaselineTotal: mandiBaselineTotal,
        totalNetUplift: totalNetUplift,
        totalNetUpliftPct: totalNetUpliftPct,
        suitabilityScore: agronomyResult.suitabilityScore,
        timingAction: marketResult.harvestTimingAdvice.verdict
      },
      strategicAlert,
      agentReports: {
        agronomy: agronomyResult,
        marketEquilibrium: marketResult,
        procurement: procurementResult,
        circular: circularResult
      },
      recommendedActions: [
        {
          id: 'action_timing',
          priority: 'CRITICAL',
          title: 'Timing Optimization',
          actionText: marketResult.harvestTimingAdvice.verdict,
          buttonText: 'Lock 48-Hour Harvest Alert'
        },
        {
          id: 'action_split',
          priority: 'HIGH',
          title: 'Execute Harvest Split',
          actionText: procurementResult.splitStrategy.recommendation,
          buttonText: 'Execute Split Logistics'
        },
        {
          id: 'action_circular',
          priority: 'MEDIUM',
          title: 'Monetize By-Products',
          actionText: circularResult.solutions[0],
          buttonText: 'Confirm Residue Buyer Dispatch'
        }
      ]
    };

    this.sessionHistory.push(playbook);
    return playbook;
  }
}
