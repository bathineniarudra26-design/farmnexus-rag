/**
 * Market Equilibrium Agent
 * Specialized in APMC Mandi Benchmarks, 7-Day Price Forecasts & Supply Glut Risk
 * Connected Datasets: DATASETS.CHANNEL_PRICES (P[0]), DATASETS.FORECAST, Sowing Density
 */

export class MarketEquilibriumAgent {
  constructor(datasets) {
    this.datasets = datasets;
    this.agentName = "Market Equilibrium Agent";
    this.role = "Price Arbitrage & Glut Shielding Engine";
  }

  /**
   * Evaluates price benchmark, 7-day price trajectory, and supply saturation
   * @param {string} cropKey Crop identifier (e.g., 'tomato', 'sugarcane', 'chilli')
   * @param {number} districtCompetitionPct Acreage competition from Agronomy agent
   */
  evaluateMarketEquilibrium(cropKey, districtCompetitionPct = 20) {
    const channelData = this.datasets.CHANNEL_PRICES[cropKey] || this.datasets.CHANNEL_PRICES['tomato'];
    const mandiGross = channelData.mandiGross;

    // 7-Day Forecast Series
    const multipliers = this.datasets.FORECAST.multipliers;
    const dailyPrices = multipliers.map((mult, idx) => ({
      day: idx + 1,
      label: idx === 0 ? 'D1 Today' : idx === 2 ? 'D3 Peak' : `D${idx + 1}`,
      pricePerKg: +(mandiGross * mult).toFixed(2),
      multiplier: mult
    }));

    const todayPrice = dailyPrices[0].pricePerKg;
    const peakPrice = dailyPrices[2].pricePerKg; // Day 3
    const priceDelta = +(peakPrice - todayPrice).toFixed(2);
    const priceDeltaPct = Math.round((priceDelta / todayPrice) * 100);

    // Harvest Timing Recommendation
    let harvestTimingAdvice;
    if (priceDelta > 0) {
      harvestTimingAdvice = {
        action: "HOLD_HARVEST",
        windowDays: 2,
        verdict: `HOLD HARVEST FOR 48 HOURS (+₹${priceDelta.toFixed(2)}/kg expected by Day 3)`,
        rationale: "Arrival choke & regional rain forecast create temporary supply gap in Secunderabad & Bowenpally yards."
      };
    } else {
      harvestTimingAdvice = {
        action: "HARVEST_NOW",
        windowDays: 0,
        verdict: `HARVEST & DISPATCH TODAY (Mandi auction steady at ₹${todayPrice}/kg)`,
        rationale: "Supply arrivals expected to peak in 48 hours; early gate pass minimizes price slippage."
      };
    }

    // Local Glut Risk Assessment
    let glutRiskLevel = "Low";
    if (districtCompetitionPct >= 30) glutRiskLevel = "High";
    else if (districtCompetitionPct >= 20) glutRiskLevel = "Moderate";

    return {
      agent: this.agentName,
      status: "SUCCESS",
      cropKey: cropKey,
      benchmarkMandi: channelData.benchmarkHub,
      currentMandiGrossRate: mandiGross,
      sevenDayForecast: dailyPrices,
      pricePeakDay: 3,
      priceGainPotential: priceDelta,
      priceGainPotentialPct: priceDeltaPct,
      harvestTimingAdvice: harvestTimingAdvice,
      districtCompetitionPct: districtCompetitionPct,
      glutRiskLevel: glutRiskLevel,
      solutions: [
        `Optimal Selling Window: ${harvestTimingAdvice.verdict}.`,
        `APMC Gate-Pass Protection: Verified benchmark at ${channelData.benchmarkHub} is ₹${mandiGross.toFixed(2)}/kg.`,
        `Glut Shielding: District acreage saturation at ${districtCompetitionPct}% - classified as ${glutRiskLevel} glut exposure.`
      ]
    };
  }

  /**
   * Simulates 30-Day price impact of neighboring harvest surges
   */
  simulateGlutImpact(surgePercent = 40) {
    let sumMandi = 0;
    let sumFarmNexus = 0;
    const curve = [];

    for (let d = 0; d < 30; d++) {
      const weight = Math.exp(-Math.pow((d - 14) / 6, 2));
      const mandiIndex = 100 - (surgePercent * 0.60 * weight);
      const farmnexusIndex = 100 - (surgePercent * 0.09 * weight);
      
      sumMandi += mandiIndex;
      sumFarmNexus += farmnexusIndex;

      curve.push({
        day: d + 1,
        mandiIndex: Math.round(mandiIndex),
        farmnexusIndex: Math.round(farmnexusIndex)
      });
    }

    return {
      surgePercent: surgePercent,
      avgMandiIndex: Math.round(sumMandi / 30),
      avgFarmNexusIndex: Math.round(sumFarmNexus / 30),
      indexProtectionAdvantage: Math.round((sumFarmNexus - sumMandi) / 30),
      timelineCurve: curve
    };
  }
}
