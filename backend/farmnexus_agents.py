"""
FarmNexus Autonomous Agent Core (Python Engine)
Zero-dependency, clean enterprise agentic implementation with typed schemas and data contracts.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
import math
import json
import time

# ==============================================================================
# DATASETS (SSOT)
# ==============================================================================

CROPS_DATASET = {
    "rabi": [
        {"cropKey": "chilli", "name": "Red Chilli (Teja)", "pricePerKg": 184.0, "baseProfitPerAcre": 142000, "competitionAcreagePct": 18, "glutRisk": "Low", "cycleDays": 120, "note": "Export & oleoresin contracts peak in ~110 days."},
        {"cropKey": "beans", "name": "French Beans / Okra", "pricePerKg": 38.0, "baseProfitPerAcre": 88000, "competitionAcreagePct": 32, "glutRisk": "Moderate", "cycleDays": 65, "note": "Urban supermarket gap opens in December."},
        {"cropKey": "maize", "name": "Pearl Millet / Hybrid Maize", "pricePerKg": 24.5, "baseProfitPerAcre": 64000, "competitionAcreagePct": 24, "glutRisk": "Stable", "cycleDays": 95, "note": "Medchal feed mills pre-locked tenders at MSP floor."}
    ],
    "kharif": [
        {"cropKey": "cotton", "name": "Cotton (Bt Hybrid)", "pricePerKg": 72.0, "baseProfitPerAcre": 96000, "competitionAcreagePct": 28, "glutRisk": "Moderate", "cycleDays": 150, "note": "Spinning mills forward-buying for Q4."},
        {"cropKey": "maize", "name": "Hybrid Maize", "pricePerKg": 23.0, "baseProfitPerAcre": 58000, "competitionAcreagePct": 22, "glutRisk": "Low", "cycleDays": 100, "note": "Starch processing units running at peak capacity."},
        {"cropKey": "tur", "name": "Pigeon Pea (Tur)", "pricePerKg": 98.0, "baseProfitPerAcre": 78000, "competitionAcreagePct": 15, "glutRisk": "Low", "cycleDays": 180, "note": "Pulse deficit keeps prices 20% above MSP."}
    ],
    "zaid": [
        {"cropKey": "melon", "name": "Watermelon / Muskmelon", "pricePerKg": 16.0, "baseProfitPerAcre": 84000, "competitionAcreagePct": 26, "glutRisk": "Moderate", "cycleDays": 75, "note": "Summer hydrational demand spike in cities."},
        {"cropKey": "gourd", "name": "Cucumber / Bottle Gourd", "pricePerKg": 22.0, "baseProfitPerAcre": 62000, "competitionAcreagePct": 20, "glutRisk": "Low", "cycleDays": 55, "note": "Quick 55-day cycle with steady supermarket contracts."},
        {"cropKey": "sunflower", "name": "Sunflower", "pricePerKg": 66.0, "baseProfitPerAcre": 54000, "competitionAcreagePct": 17, "glutRisk": "Low", "cycleDays": 90, "note": "Regional edible oil refineries short of seed inventory."}
    ]
}

CHANNEL_PRICES_DATASET = {
    "tomato": {"name": "Tomato", "mandiGross": 22.80, "mandiTr": 1.10, "mandiComm": 1.40, "factoryRate": 24.20, "factoryLogistics": 1.20, "d2cRate": 34.00, "d2cDelivery": 2.50, "hub": "Gudimalkapur APMC"},
    "sugarcane": {"name": "Sugarcane", "mandiGross": 3.40, "mandiTr": 0.35, "mandiComm": 0.20, "factoryRate": 3.70, "factoryLogistics": 0.30, "d2cRate": 4.60, "d2cDelivery": 0.50, "hub": "Nizamabad Yard"},
    "onion": {"name": "Onion", "mandiGross": 18.00, "mandiTr": 1.00, "mandiComm": 1.10, "factoryRate": 19.60, "factoryLogistics": 1.10, "d2cRate": 26.00, "d2cDelivery": 2.20, "hub": "Bowenpally APMC"},
    "paddy": {"name": "Paddy", "mandiGross": 22.50, "mandiTr": 1.20, "mandiComm": 1.00, "factoryRate": 24.20, "factoryLogistics": 1.30, "d2cRate": 27.50, "d2cDelivery": 1.80, "hub": "Warangal Market"},
    "chilli": {"name": "Red Chilli", "mandiGross": 184.00, "mandiTr": 3.00, "mandiComm": 6.00, "factoryRate": 196.00, "factoryLogistics": 3.00, "d2cRate": 215.00, "d2cDelivery": 6.00, "hub": "Guntur Mirchi Yard"}
}

BUYER_ORDERS_DATASET = [
    {"id": "ord_01", "org": "Deccan Agro Puree Factory", "cat": "factory", "crop": "tomato", "price": 23.80, "qty": 40000, "left": 26000, "spec": "Grade B, firm red", "hub": "Medchal · 25 km"},
    {"id": "ord_02", "org": "FreshMart Supermarkets", "cat": "supermarket", "crop": "tomato", "price": 29.50, "qty": 15000, "left": 9300, "spec": "Grade A, uniform 65mm+", "hub": "Secunderabad DC"},
    {"id": "ord_03", "org": "QuickBasket", "cat": "online", "crop": "banana", "price": 31.00, "qty": 20000, "left": 18000, "spec": "Robusta 7-8 in", "hub": "Kompally Dark Store"},
    {"id": "ord_04", "org": "AgroStarch Mills", "cat": "factory", "crop": "maize", "price": 24.20, "qty": 60000, "left": 50000, "spec": "Moisture <= 14%", "hub": "Nizamabad · 40 km"}
]

RESIDUE_DATASET = {
    "sugarcane": [{"name": "Sugarcane Bagasse", "priceKg": 3.80, "use": "Eco-tableware bowls", "buyer": "GreenPack Eco-Tableware", "hub": "Medchal 14km", "yieldPerAcreKg": 1105}],
    "tomato": [{"name": "Overripe Sorting Rejects", "priceKg": 6.50, "use": "Industrial paste & puree", "buyer": "Telangana Puree Unit", "hub": "Patancheru 18km", "yieldPerAcreKg": 1000}],
    "paddy": [{"name": "Paddy Straw & Husk", "priceKg": 2.90, "use": "Bio-pellets & mushroom beds", "buyer": "BioPower Green Energy", "hub": "Shadnagar 22km", "yieldPerAcreKg": 1450}],
    "chilli": [{"name": "Chilli Stalks & Seeds", "priceKg": 8.00, "use": "Oleoresin extraction", "buyer": "Deccan Natural Extracts", "hub": "Guntur Estate 12km", "yieldPerAcreKg": 525}]
}

# ==============================================================================
# SPECIALIST AGENT IMPLEMENTATIONS
# ==============================================================================

class AgronomyAgent:
    def __init__(self):
        self.role = "Agronomy Viability & Soil-Water Optimizer"

    def evaluate(self, crop_key: str, district_id: int, season: str, water_idx: int, soil_idx: int, acreage: float) -> Dict[str, Any]:
        season_crops = CROPS_DATASET.get(season, CROPS_DATASET["rabi"])
        matched_crop = next((c for c in season_crops if c["cropKey"] == crop_key), None)
        if not matched_crop:
            for s_list in CROPS_DATASET.values():
                for c in s_list:
                    if c["cropKey"] == crop_key:
                        matched_crop = c
                        break
                if matched_crop:
                    break
        if not matched_crop:
            channel_info = CHANNEL_PRICES_DATASET.get(crop_key, {"name": crop_key.capitalize(), "mandiGross": 24.0})
            matched_crop = {
                "cropKey": crop_key,
                "name": channel_info["name"],
                "pricePerKg": channel_info["mandiGross"],
                "baseProfitPerAcre": round(channel_info["mandiGross"] * 3500),
                "competitionAcreagePct": 22,
                "glutRisk": "Moderate",
                "cycleDays": 85,
                "note": f"Targeted procurement schedule for {channel_info['name']}."
            }
        rank_idx = season_crops.index(matched_crop) if matched_crop in season_crops else 0

        # Suitability calculation formula
        base_scores = [94, 89, 98]
        base = base_scores[rank_idx] if rank_idx < len(base_scores) else 90
        score = base + (water_idx * 3) - (water_idx * 3 if rank_idx == 2 else 0) + (((district_id + soil_idx) % 3) - 1)
        score = max(60, min(99, score))

        profit_per_acre = round(matched_crop["baseProfitPerAcre"] * (1 + 0.02 * district_id))
        total_profit = round(profit_per_acre * acreage)

        return {
            "agent": "AgronomyAgent",
            "cropName": matched_crop["name"],
            "cropKey": matched_crop["cropKey"],
            "suitabilityScore": score,
            "projectedPriceKg": matched_crop["pricePerKg"],
            "netProfitPerAcre": profit_per_acre,
            "totalProfit": total_profit,
            "competitionAcreagePct": matched_crop["competitionAcreagePct"],
            "glutRisk": matched_crop["glutRisk"],
            "agronomicGuidance": matched_crop["note"]
        }


class MarketEquilibriumAgent:
    def __init__(self):
        self.role = "APMC Price Benchmarking & Glut Shield Engine"

    def evaluate(self, crop_key: str, district_competition_pct: int) -> Dict[str, Any]:
        p = CHANNEL_PRICES_DATASET.get(crop_key, CHANNEL_PRICES_DATASET["tomato"])
        gross = p["mandiGross"]
        multipliers = [1.00, 1.05, 1.12, 1.08, 1.00, 0.96, 0.94]
        trend = [round(gross * m, 2) for m in multipliers]

        peak_price = trend[2]
        today_price = trend[0]
        gain = round(peak_price - today_price, 2)

        verdict = f"HOLD HARVEST FOR 48 HOURS (+₹{gain:.2f}/kg expected by Day 3)" if gain > 0 else "HARVEST TODAY"

        return {
            "agent": "MarketEquilibriumAgent",
            "benchmarkMandi": p["hub"],
            "currentMandiGross": gross,
            "sevenDayTrend": trend,
            "gainPotential": gain,
            "verdict": verdict,
            "competitionPct": district_competition_pct
        }


class ProcurementAgent:
    def __init__(self):
        self.role = "3-Channel Harvest & Demand Router"

    def evaluate(self, crop_key: str, volume_kg: float) -> Dict[str, Any]:
        p = CHANNEL_PRICES_DATASET.get(crop_key, CHANNEL_PRICES_DATASET["tomato"])
        mandi_net = round(p["mandiGross"] - p["mandiTr"] - p["mandiComm"], 2)
        factory_net = round(p["factoryRate"] - p["factoryLogistics"], 2)
        d2c_net = round(p["d2cRate"] - p["d2cDelivery"], 2)

        mandi_total = round(mandi_net * volume_kg)
        
        # 25% D2C + 75% Factory
        d2c_vol = round(volume_kg * 0.25)
        factory_vol = round(volume_kg - d2c_vol)

        split_total = round((d2c_vol * d2c_net) + (factory_vol * factory_net))
        extra_cash = split_total - mandi_total
        uplift_pct = round((extra_cash / mandi_total) * 100) if mandi_total > 0 else 0

        matching_orders = [o for o in BUYER_ORDERS_DATASET if o["crop"] == crop_key]

        return {
            "agent": "ProcurementAgent",
            "mandiNetPerKg": mandi_net,
            "factoryNetPerKg": factory_net,
            "d2cNetPerKg": d2c_net,
            "mandiTotalPayout": mandi_total,
            "splitTotalPayout": split_total,
            "extraCashVsMandi": extra_cash,
            "upliftPct": uplift_pct,
            "recommendation": f"Route {d2c_vol} kg to D2C Societies (@ ₹{d2c_net}/kg) and {factory_vol} kg to Factory (@ ₹{factory_net}/kg).",
            "matchingOrders": matching_orders
        }


class CircularAgent:
    def __init__(self):
        self.role = "Zero-Waste Biomass Valorizer"

    def evaluate(self, crop_key: str, acreage: float) -> Dict[str, Any]:
        residues = RESIDUE_DATASET.get(crop_key, [])
        streams = []
        total_income = 0

        for r in residues:
            kg = round(r["yieldPerAcreKg"] * acreage)
            cash = round(kg * r["priceKg"])
            total_income += cash
            streams.append({
                "name": r["name"],
                "buyer": r["buyer"],
                "hub": r["hub"],
                "priceKg": r["priceKg"],
                "estimatedKg": kg,
                "unlockedIncome": cash
            })

        return {
            "agent": "CircularAgent",
            "streams": streams,
            "totalCircularIncome": total_income
        }


# ==============================================================================
# ORCHESTRATOR
# ==============================================================================

class FarmNexusOrchestrator:
    def __init__(self):
        self.agronomy = AgronomyAgent()
        self.market = MarketEquilibriumAgent()
        self.procurement = ProcurementAgent()
        self.circular = CircularAgent()

    def process(self, intake: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        crop_key = intake.get("cropKey", "tomato")
        acreage = float(intake.get("acreage", 1.0))
        volume_kg = float(intake.get("volumeKg", 2000))
        district_id = int(intake.get("districtId", 0))
        season = intake.get("season", "rabi")
        water_idx = int(intake.get("waterIndex", 0))
        soil_idx = int(intake.get("soilIndex", 0))

        # Parallel specialist evaluations
        agro_res = self.agronomy.evaluate(crop_key, district_id, season, water_idx, soil_idx, acreage)
        market_res = self.market.evaluate(crop_key, agro_res["competitionAcreagePct"])
        proc_res = self.procurement.evaluate(crop_key, volume_kg)
        circ_res = self.circular.evaluate(crop_key, acreage)

        stacked_total = proc_res["splitTotalPayout"] + circ_res["totalCircularIncome"]
        mandi_total = proc_res["mandiTotalPayout"]
        total_uplift = stacked_total - mandi_total
        total_uplift_pct = round((total_uplift / mandi_total) * 100) if mandi_total > 0 else 0

        return {
            "status": "SUCCESS",
            "executionTimeMs": round((time.time() - t0) * 1000, 2),
            "crop": agro_res["cropName"],
            "summary": {
                "stackedTotalIncome": stacked_total,
                "mandiBaselineIncome": mandi_total,
                "totalUpliftCash": total_uplift,
                "totalUpliftPct": total_uplift_pct,
                "timingVerdict": market_res["verdict"],
                "suitabilityMatch": agro_res["suitabilityScore"]
            },
            "agronomy": agro_res,
            "marketEquilibrium": market_res,
            "procurement": proc_res,
            "circular": circ_res
        }
