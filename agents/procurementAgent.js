/**
 * Procurement Agent
 * Specialized in 3-Channel Take-Home Economics, Direct Buyer Matching & Harvest Split Routing
 * Connected Datasets: DATASETS.CHANNEL_PRICES (P[1..6]), DATASETS.BUYER_ORDERS (D)
 */

export class ProcurementAgent {
  constructor(datasets) {
    this.datasets = datasets;
    this.agentName = "Procurement Agent";
    this.role = "3-Channel Harvest & Demand Router";
  }

  /**
   * Computes true net earnings per kg and total payout across Mandi, Factory, and D2C
   * @param {string} cropKey Crop identifier
   * @param {number} volumeKg Total harvest volume in kilograms
   */
  evaluateChannels(cropKey, volumeKg = 2000) {
    const c = this.datasets.CHANNEL_PRICES[cropKey] || this.datasets.CHANNEL_PRICES['tomato'];

    // Net take-home formulas
    // Mandi: Gross - Transport - Commission
    const mandiNet = +(c.mandiGross - c.mandiTransport - c.mandiCommission).toFixed(2);
    // Factory: Contract Rate - Logistics (Zero Commission)
    const factoryNet = +(c.factoryContractRate - c.factoryLogistics).toFixed(2);
    // D2C: Direct Retail - Delivery/Packaging (Zero Commission)
    const d2cNet = +(c.d2cRetailRate - c.d2cDelivery).toFixed(2);

    const mandiTotalPayout = Math.round(mandiNet * volumeKg);
    const factoryTotalPayout = Math.round(factoryNet * volumeKg);
    const d2cTotalPayout = Math.round(d2cNet * volumeKg);

    const factoryUpliftPct = Math.round(((factoryNet / mandiNet) - 1) * 100);
    const d2cUpliftPct = Math.round(((d2cNet / mandiNet) - 1) * 100);

    // AI Split Strategy: 25% Premium D2C + 75% Direct Factory
    const d2cVolume = Math.round(volumeKg * 0.25);
    const factoryVolume = volumeKg - d2cVolume;
    
    const splitTotalPayout = Math.round((d2cVolume * d2cNet) + (factoryVolume * factoryNet));
    const extraIncomeVsMandi = splitTotalPayout - mandiTotalPayout;
    const splitUpliftPct = Math.round((extraIncomeVsMandi / mandiTotalPayout) * 100);

    // Match live buyer orders from dataset D
    const matchingBuyerOrders = this.datasets.BUYER_ORDERS.filter(o => 
      o.crop.toLowerCase() === cropKey.toLowerCase()
    );

    return {
      agent: this.agentName,
      status: "SUCCESS",
      cropKey: cropKey,
      cropName: c.name,
      volumeKg: volumeKg,
      channels: {
        mandi: {
          channelName: "Gudimalkapur APMC Mandi",
          grossRate: c.mandiGross,
          deductions: {
            transport: c.mandiTransport,
            commission: c.mandiCommission
          },
          trueNetPerKg: mandiNet,
          totalTakeHome: mandiTotalPayout,
          upliftPct: 0
        },
        factory: {
          channelName: "Direct-to-Factory (Deccan Agro / Processing Unit)",
          contractRate: c.factoryContractRate,
          deductions: {
            logistics: c.factoryLogistics,
            commission: 0
          },
          trueNetPerKg: factoryNet,
          totalTakeHome: factoryTotalPayout,
          upliftPct: factoryUpliftPct,
          extraCashVsMandi: factoryTotalPayout - mandiTotalPayout
        },
        d2c: {
          channelName: "Direct-to-Consumer (Gated Communities & Societies)",
          retailRate: c.d2cRetailRate,
          deductions: {
            deliveryAndCrates: c.d2cDelivery,
            commission: 0
          },
          trueNetPerKg: d2cNet,
          totalTakeHome: d2cTotalPayout,
          upliftPct: d2cUpliftPct,
          extraCashVsMandi: d2cTotalPayout - mandiTotalPayout
        }
      },
      splitStrategy: {
        d2cShareKg: d2cVolume,
        d2cSharePct: 25,
        factoryShareKg: factoryVolume,
        factorySharePct: 75,
        blendedNetPerKg: +(splitTotalPayout / volumeKg).toFixed(2),
        totalPayout: splitTotalPayout,
        extraIncomeVsMandi: extraIncomeVsMandi,
        splitUpliftPct: splitUpliftPct,
        recommendation: `Allocate ${d2cVolume.toLocaleString('en-IN')} kg (premium crates) to Gated Communities at ₹${d2cNet}/kg net, and route ${factoryVolume.toLocaleString('en-IN')} kg to Factory at ₹${factoryNet}/kg net to generate ₹${extraIncomeVsMandi.toLocaleString('en-IN')} extra take-home pay.`
      },
      availableBuyerContracts: matchingBuyerOrders,
      solutions: [
        `Net Price Gain: D2C provides +${d2cUpliftPct}% (₹${d2cNet}/kg) and Factory provides +${factoryUpliftPct}% (₹${factoryNet}/kg) over Mandi auction.`,
        `Split Harvest Execution: Generating ₹${extraIncomeVsMandi.toLocaleString('en-IN')} extra net income across 2 channels with zero middlemen commission.`,
        `Pre-committed Demand: ${matchingBuyerOrders.length} verified corporate buyers active for this commodity.`
      ]
    };
  }

  /**
   * Commit supply against an open order in dataset D
   */
  commitOrderSupply(orderId, commitQtyKg = 2000) {
    const order = this.datasets.BUYER_ORDERS.find(o => o.id === orderId);
    if (!order) return { success: false, error: "Order not found" };

    const actualCommitted = Math.min(order.openQtyKg, commitQtyKg);
    order.openQtyKg -= actualCommitted;

    return {
      success: true,
      orderId: order.id,
      buyerName: order.org,
      crop: order.cropName,
      guaranteedPrice: order.pricePerKg,
      committedVolumeKg: actualCommitted,
      remainingOpenQuotaKg: order.openQtyKg,
      totalCommittedValue: actualCommitted * order.pricePerKg,
      logisticsHub: order.hub,
      status: "CONFIRMED_PENDING_DISPATCH"
    };
  }
}
