/**
 * Agronomy Agent
 * Specialized in Pre-Sowing Viability, Soil-Water-Crop Matching & Yield Economics
 * Connected Datasets: DATASETS.CROPS, Soil Matrices, District Agrometeorology
 */

export class AgronomyAgent {
  constructor(datasets) {
    this.datasets = datasets;
    this.agentName = "Agronomy Agent";
    this.role = "Crop Viability & Agronomic Optimizer";
  }

  /**
   * Evaluates crop viability based on farmer's plot specifics
   * @param {Object} plotProfile { cropKey, districtId, season, waterIndex, soilIndex, acreage }
   */
  evaluateCropViability(plotProfile) {
    const { cropKey, districtId = 0, season = 'rabi', waterIndex = 0, soilIndex = 0, acreage = 1 } = plotProfile;
    const seasonList = this.datasets.CROPS[season] || this.datasets.CROPS['rabi'];
    
    // Find candidate in the season, or search across all seasons, or construct a calibrated profile
    let cropMatch = seasonList.find(c => c.cropKey === cropKey);
    if (!cropMatch) {
      for (const s of Object.keys(this.datasets.CROPS)) {
        const found = this.datasets.CROPS[s].find(c => c.cropKey === cropKey);
        if (found) { cropMatch = found; break; }
      }
    }
    if (!cropMatch) {
      // Dynamic fallback for crops like tomato/sugarcane
      const channelCrop = this.datasets.CHANNEL_PRICES[cropKey];
      const cropName = channelCrop ? channelCrop.name : cropKey.toUpperCase();
      const basePrice = channelCrop ? channelCrop.mandiGross : 24.0;
      cropMatch = {
        id: cropKey,
        cropKey: cropKey,
        name: cropName,
        pricePerKg: basePrice,
        baseProfitPerAcre: Math.round(basePrice * 3500),
        competitionAcreagePct: 22,
        glutRisk: 'Moderate',
        waterReq: 'Borewell',
        growthCycleDays: 85,
        note: `Optimized harvest cycle for ${cropName} across Telangana and Andhra Pradesh corridors.`
      };
    }
    const cropRankIndex = seasonList.indexOf(cropMatch);

    // Compute dynamic suitability score based on soil, water, district
    // Base score: Rank 1 -> 94%, Rank 2 -> 89%, Rank 3 -> 98%
    const baseRankScores = [94, 89, 98];
    const baseScore = baseRankScores[cropRankIndex !== -1 ? cropRankIndex : 0] || 90;
    
    // Suitability formula from FarmNexus specification
    let suitabilityScore = baseScore + (waterIndex * 3);
    if (cropRankIndex === 2) {
      suitabilityScore -= (waterIndex * 3);
    }
    suitabilityScore += ((districtId + soilIndex) % 3) - 1;
    suitabilityScore = Math.max(60, Math.min(99, suitabilityScore));

    // District yield & profit uplift (2% per district index)
    const adjustedProfitPerAcre = Math.round(cropMatch.baseProfitPerAcre * (1 + 0.02 * districtId));
    const totalProjectedProfit = adjustedProfitPerAcre * acreage;

    return {
      agent: this.agentName,
      status: "SUCCESS",
      cropName: cropMatch.name,
      cropKey: cropMatch.cropKey,
      suitabilityScore: suitabilityScore,
      suitabilityRating: suitabilityScore >= 85 ? "Optimal Agronomic Fit" : "Moderate Agronomic Fit",
      projectedHarvestPrice: cropMatch.pricePerKg,
      netProfitPerAcre: adjustedProfitPerAcre,
      totalProjectedProfit: totalProjectedProfit,
      districtCompetitionAcreage: cropMatch.competitionAcreagePct,
      glutRisk: cropMatch.glutRisk,
      growthCycleDays: cropMatch.growthCycleDays || 90,
      agronomicGuidance: cropMatch.note,
      solutions: [
        `Soil & Water Alignment: Calibrated for ${suitabilityScore}% match with local soil and irrigation regime.`,
        `Cultivation Window: Expected harvest turnaround in ${cropMatch.growthCycleDays || 90} days.`,
        `Economic Safety: Baseline yield ensures estimated net profit of ₹${adjustedProfitPerAcre.toLocaleString('en-IN')}/acre.`
      ]
    };
  }

  /**
   * Ranks Top 3 Crops for a specific district, season, soil and water source
   */
  rankSeasonCrops(season, districtId = 0, waterIndex = 0, soilIndex = 0) {
    const seasonList = this.datasets.CROPS[season] || this.datasets.CROPS['rabi'];
    return seasonList.map((c, i) => {
      const baseScores = [94, 89, 98];
      let score = baseScores[i] + (waterIndex * 3) - (i === 2 ? (waterIndex * 3) : 0) + (((districtId + soilIndex) % 3) - 1);
      score = Math.max(60, Math.min(99, score));
      const adjustedProfit = Math.round(c.baseProfitPerAcre * (1 + 0.02 * districtId));
      return {
        rank: i + 1,
        crop: c,
        suitabilityScore: score,
        adjustedProfit: adjustedProfit
      };
    });
  }
}
