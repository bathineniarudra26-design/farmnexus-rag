/**
 * Circular Agent
 * Specialized in Zero-Waste Residue Valorization & Multi-Income Stacking
 * Connected Datasets: DATASETS.RESIDUES, DATASETS.INCOME_STACKS
 */

export class CircularAgent {
  constructor(datasets) {
    this.datasets = datasets;
    this.agentName = "Circular Agent";
    this.role = "Zero-Waste Biomass Valorizer";
  }

  /**
   * Identifies by-product monetization opportunities for a specific crop and volume
   * @param {string} cropKey Crop identifier (e.g., 'sugarcane', 'tomato', 'paddy', 'chilli')
   * @param {number} volumeKg Total crop volume harvested
   * @param {number} acreage Land area in acres
   */
  evaluateCircularResidues(cropKey, volumeKg = 2000, acreage = 1) {
    const residueList = this.datasets.RESIDUES[cropKey] || [];
    const incomeStackModel = this.datasets.INCOME_STACKS[cropKey] || null;

    const valorizationStreams = residueList.map(r => {
      // Estimated residue weight based on harvest volume or acreage
      const estimatedResidueKg = Math.round(r.conversionFactorKgPerAcre * acreage);
      const grossIncome = Math.round(estimatedResidueKg * r.pricePerKg);

      return {
        residueName: r.residueName,
        pricePerKg: r.pricePerKg,
        use: r.use,
        verifiedBuyer: r.buyer,
        hubDistance: r.hub,
        estimatedResidueKg: estimatedResidueKg,
        unlockedIncome: grossIncome
      };
    });

    const totalCircularIncome = valorizationStreams.reduce((acc, curr) => acc + curr.unlockedIncome, 0);

    return {
      agent: this.agentName,
      status: "SUCCESS",
      cropKey: cropKey,
      acreage: acreage,
      valorizationStreams: valorizationStreams,
      totalCircularIncome: totalCircularIncome,
      incomeStackModel: incomeStackModel,
      solutions: valorizationStreams.length > 0 ? [
        `Zero-Waste Cashflow: Unlocked ₹${totalCircularIncome.toLocaleString('en-IN')} additional income from discarded residue streams.`,
        `Local Off-taker: Partnered with ${valorizationStreams[0].verifiedBuyer} (${valorizationStreams[0].hubDistance}).`,
        `Disposal Cost Elimination: Converts agro-waste burning liability into high-demand industrial bio-economy input.`
      ] : [
        `Standard sorting: Recommended routing of sub-grade produce to regional cattle feed suppliers.`
      ]
    };
  }
}
