/**
 * FarmNexus Application Controller
 * Complete multilingual support — every [data-i] element + all <select> options
 * + all JS-rendered cards update on language switch.
 */

import { DATASETS } from '../data/farmnexusDatasets.js';
import { FarmNexusOrchestrator } from '../agents/orchestrator.js';

const orchestrator = new FarmNexusOrchestrator(DATASETS);

const fmtCur = v => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = v => Math.round(Number(v)).toLocaleString('en-IN');
const $  = id => document.getElementById(id);

let LANG = 'en';
let CAT  = 'all';

/* ─── translation lookup ──────────────────────────────────────── */
function T(key) {
  const d = DATASETS.TRANSLATIONS[LANG] || DATASETS.TRANSLATIONS.en;
  return d[key] ?? (DATASETS.TRANSLATIONS.en[key] ?? '');
}
function TOpt(cat, key) {
  const d = DATASETS.TRANSLATIONS[LANG]?.options ?? DATASETS.TRANSLATIONS.en.options;
  return d[cat]?.[key] ?? DATASETS.TRANSLATIONS.en.options[cat]?.[key] ?? key;
}

/* ─── LANGUAGE SWITCHER — updates the WHOLE page ─────────────── */
export function setLanguage(lang) {
  LANG = lang;
  document.documentElement.lang = lang;

  // 1. All static text via data-i
  document.querySelectorAll('[data-i]').forEach(el => {
    const v = T(el.dataset.i);
    if (v) el.textContent = v;
  });

  // 2. <select> option text
  const opts = DATASETS.TRANSLATIONS[LANG]?.options ?? DATASETS.TRANSLATIONS.en.options;

  function translateSelect(selId, category) {
    const sel = $(selId); if (!sel) return;
    Array.from(sel.options).forEach(opt => {
      const lbl = opts[category]?.[opt.value];
      if (lbl) opt.textContent = lbl;
    });
  }

  ['intakeCrop','cCrop','bCrop'].forEach(id => translateSelect(id, 'crops'));
  ['intakeDistrict','pLoc'].forEach(id => translateSelect(id, 'districts'));
  ['intakeSeason','pSea'].forEach(id => translateSelect(id, 'seasons'));
  ['intakeWater','pWat'].forEach(id => translateSelect(id, 'water'));
  ['intakeSoil','pSoil'].forEach(id => translateSelect(id, 'soil'));
  translateSelect('bCat', 'buyerCats');

  // 3. Language button highlights
  ['en','hi','te'].forEach(k => {
    const btn = $('l-' + k);
    if (btn) btn.className = 'px-2 py-1 rounded ' + (k === lang ? 'bg-white text-ed' : 'text-slate-500');
  });

  // 4. Re-render all JS-generated sections
  updatePreSowing();
  calculateChannels();
  renderBuyerBoard();
  simulateGlut();
  runCropIntelligence();
}

/* ─── 1. CROP INTELLIGENCE ───────────────────────────────────── */
export async function runCropIntelligence(custom = null) {
  const cropKey   = $('intakeCrop')   ? $('intakeCrop').value        : 'tomato';
  const acreage   = $('intakeAcreage')? parseFloat($('intakeAcreage').value) || 1 : 1;
  const volumeKg  = $('intakeVolume') ? parseInt($('intakeVolume').value)   || 2000 : 2000;
  const districtId= $('intakeDistrict')? parseInt($('intakeDistrict').value) : 0;
  const season    = $('intakeSeason') ? $('intakeSeason').value       : 'rabi';
  const waterIndex= $('intakeWater')  ? parseInt($('intakeWater').value) : 0;
  const soilIndex = $('intakeSoil')   ? parseInt($('intakeSoil').value)  : 0;

  const payload = custom || { cropKey, acreage, volumeKg, districtId, season, waterIndex, soilIndex };

  // Stream box
  const box = $('agentStreamLog');
  if (box) {
    box.innerHTML = `
      <div class="flex items-center gap-2 text-xs font-bold text-sprout mb-2">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-sprout animate-ping"></span>
        <span>${T('intake.swarm.active')}</span>
      </div>
      <div id="streamSteps" class="space-y-1.5 font-mono text-[11px] text-slate-300"></div>`;
  }

  const result = await orchestrator.processCropIntelligence(payload);

  // Localized trace steps
  const cropLabel = TOpt('crops', cropKey) || cropKey.toUpperCase();
  const distLabel = TOpt('districts', String(districtId));
  const steps = {
    en: [
      { s: 'INTAKE',      m: `Received: ${cropLabel} · ${acreage} Acres · ${volumeKg} kg · ${distLabel}` },
      { s: 'AGRONOMY',    m: 'Evaluating soil compatibility, water source, baseline cultivation profit…' },
      { s: 'MARKET',      m: 'Querying APMC benchmarks, 7-day trend, district acreage saturation…' },
      { s: 'PROCUREMENT', m: 'Auditing APMC vs Factory vs D2C net deductions, matching buyer orders…' },
      { s: 'CIRCULAR',    m: 'Scanning bio-economy off-takers for peel, stalk & reject monetization…' },
      { s: 'SYNTHESIS',   m: 'Formulating unified Crop Wealth Playbook with conflict resolution…' }
    ],
    hi: [
      { s: 'इंटेक',       m: `प्राप्त: ${cropLabel} · ${acreage} एकड़ · ${volumeKg} किलो · ${distLabel}` },
      { s: 'कृषि',        m: 'मिट्टी, सिंचाई और आधारभूत लाभ की गणना जारी…' },
      { s: 'बाज़ार',      m: 'APMC मंडी भाव, 7-दिवसीय ट्रेंड और आपूर्ति जोखिम विश्लेषण…' },
      { s: 'खरीद',        m: 'मंडी vs फैक्ट्री vs D2C कटौती ऑडिट और खरीदार ऑर्डर मिलान…' },
      { s: 'सर्कुलर',    m: 'छिलके, डंठल और अवशेषों के 20 किमी दायरे में खरीदार खोज…' },
      { s: 'संश्लेषण',   m: 'एकीकृत फ़सल आय प्लेबुक तैयार हो रही है…' }
    ],
    te: [
      { s: 'ఇన్‌పుట్',   m: `అందాయి: ${cropLabel} · ${acreage} ఎకరాలు · ${volumeKg} కిలోలు · ${distLabel}` },
      { s: 'వ్యవసాయం',   m: 'నేల, నీటి వనరు మరియు లాభం లెక్కిస్తోంది…' },
      { s: 'మార్కెట్',   m: 'APMC ధరలు, 7 రోజుల అంచనా మరియు సరఫరా సాంద్రత…' },
      { s: 'సేకరణ',      m: 'మండీ vs ఫ్యాక్టరీ vs D2C రవాణా తగ్గింపులు మరియు ఆర్డర్ జతచేరిక…' },
      { s: 'సర్క్యులర్', m: 'తొక్కలు, పిప్పి వ్యర్థాల 20 కి.మీ పరిధిలో కొనుగోలుదారు శోధన…' },
      { s: 'సంశ్లేషణ',   m: 'సమీకృత పంట సంపద ప్రణాళిక రూపొందిస్తోంది…' }
    ]
  };

  const activeSteps = steps[LANG] || steps.en;
  const sc = $('streamSteps');
  if (sc) {
    sc.innerHTML = '';
    activeSteps.forEach(({ s, m }, i) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'flex items-start gap-2 py-0.5 border-b border-slate-800/60';
        el.innerHTML = `<span class="text-sprout font-bold">[${s}]</span> <span>${m}</span>`;
        sc.appendChild(el);
      }, i * 110);
    });
  }

  setTimeout(() => renderPlaybook(result, payload), activeSteps.length * 110 + 60);
}

/* ─── 2. RENDER PLAYBOOK ─────────────────────────────────────── */
function renderPlaybook(pb, input) {
  const { summary, agentReports } = pb;
  const { agronomy, marketEquilibrium, procurement, circular } = agentReports;
  const cropLbl = TOpt('crops', input.cropKey) || summary.cropName;

  $('pbCropName').textContent        = cropLbl;
  $('pbStackedTotal').textContent    = '₹' + fmtInt(summary.totalStackedIncome);
  $('pbMandiBaseline').textContent   = '₹' + fmtInt(summary.mandiBaselineTotal);
  $('pbUpliftCash').textContent      = '+₹' + fmtInt(summary.totalNetUplift);
  $('pbUpliftPct').textContent       = `+${summary.totalNetUpliftPct}% ${T('pb.vs.mandi')}`;

  // Strategic alert
  const alertEl = $('pbStrategicAlert');
  if (pb.strategicAlert) {
    const alertTxt = {
      en: `${agronomy.districtCompetitionAcreage}% of district acreage is sown to ${summary.cropName}. Pre-commit via FarmNexus factory orders to avoid a 15–25% price crash.`,
      hi: `ज़िले के ${agronomy.districtCompetitionAcreage}% रकबे में ${cropLbl} बोई गई है। 15-25% मूल्य गिरावट से बचने के लिए FarmNexus फैक्ट्री ऑर्डर में अग्रिम कोटा सुरक्षित करें।`,
      te: `జిల్లాలో ${agronomy.districtCompetitionAcreage}% సాగులో ${cropLbl} ఉంది. ధరల పతనాన్ని నివారించడానికి FarmNexus ఫ్యాక్టరీ ఆర్డర్‌లో ముందుగా కోటా బుక్ చేయండి.`
    };
    alertEl.classList.remove('hidden');
    alertEl.innerHTML = `
      <div class="p-3.5 rounded-xl bg-amber/15 border border-amber/40 text-soil text-xs">
        <b class="font-bold flex items-center gap-1.5">
          <svg class="w-4 h-4 text-amber" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          ${{ en:'High Regional Sowing Density', hi:'उच्च बुवाई घनत्व चेतावनी', te:'అధిక సాగు హెచ్చరిక' }[LANG]}
        </b>
        <p class="mt-1 text-slate-700">${alertTxt[LANG] || alertTxt.en}</p>
      </div>`;
  } else { alertEl.classList.add('hidden'); }

  // Agronomy card
  $('pbAgroScore').textContent   = `${agronomy.suitabilityScore}%`;
  const acreUnit = { en:'acre', hi:'एकड़', te:'ఎకరాకు' }[LANG];
  $('pbAgroProfit').textContent  = `₹${fmtInt(agronomy.netProfitPerAcre)}/${acreUnit}`;
  $('pbAgroGuidance').textContent = {
    hi: `${cropLbl} के लिए ${agronomy.suitabilityScore}% मिट्टी अनुकूलता। फ़सल चक्र ~${agronomy.growthCycleDays} दिन।`,
    te: `${cropLbl} కు ${agronomy.suitabilityScore}% నేల సరిపోలిక. పంట కాలం ~${agronomy.growthCycleDays} రోజులు.`,
    en: agronomy.agronomicGuidance
  }[LANG] || agronomy.agronomicGuidance;

  // Market card
  $('pbMandiBench').textContent = `₹${fmtCur(marketEquilibrium.currentMandiGrossRate)}/kg`;
  const gain = marketEquilibrium.priceGainPotential;
  $('pbTimingAdvice').textContent = gain > 0 ? {
    en: `HOLD HARVEST FOR 48 HOURS (+₹${fmtCur(gain)}/kg expected by Day 3)`,
    hi: `48 घंटे कटाई रोकें (+₹${fmtCur(gain)}/किलो वृद्धि अनुमानित, Day 3)`,
    te: `48 గంటలు కోత ఆపండి (+₹${fmtCur(gain)}/కిలో పెరుగుదల, Day 3)`,
  }[LANG] : {
    en: `HARVEST TODAY — Mandi at ₹${fmtCur(marketEquilibrium.currentMandiGrossRate)}/kg`,
    hi: `आज ही कटाई करें — मंडी भाव ₹${fmtCur(marketEquilibrium.currentMandiGrossRate)}/किलो`,
    te: `ఈరోజే కోత కోయండి — మండీ ₹${fmtCur(marketEquilibrium.currentMandiGrossRate)}/కిలో`,
  }[LANG];

  const glutLabel = { Low:{en:'Low',hi:'कम',te:'తక్కువ'}, Moderate:{en:'Moderate',hi:'मध्यम',te:'మధ్యస్థ'}, Stable:{en:'Stable',hi:'स्थिर',te:'స్థిర'} };
  $('pbGlutStatus').textContent = `${agronomy.districtCompetitionAcreage}% (${glutLabel[agronomy.glutRisk]?.[LANG] || agronomy.glutRisk})`;

  // Procurement card
  $('pbFactoryRate').textContent = `₹${fmtCur(procurement.channels.factory.trueNetPerKg)}/kg`;
  $('pbD2CRate').textContent     = `₹${fmtCur(procurement.channels.d2c.trueNetPerKg)}/kg`;
  const dv = procurement.splitStrategy.d2cShareKg, fv = procurement.splitStrategy.factoryShareKg;
  $('pbSplitDetail').textContent = {
    en: `Send ${fmtInt(dv)} kg (D2C @ ₹${fmtCur(procurement.channels.d2c.trueNetPerKg)}/kg) + ${fmtInt(fv)} kg (Factory @ ₹${fmtCur(procurement.channels.factory.trueNetPerKg)}/kg) for ₹${fmtInt(procurement.splitStrategy.extraIncomeVsMandi)} extra.`,
    hi: `${fmtInt(dv)} किलो D2C @ ₹${fmtCur(procurement.channels.d2c.trueNetPerKg)}/किलो + ${fmtInt(fv)} किलो फैक्ट्री @ ₹${fmtCur(procurement.channels.factory.trueNetPerKg)}/किलो → ₹${fmtInt(procurement.splitStrategy.extraIncomeVsMandi)} अतिरिक्त।`,
    te: `${fmtInt(dv)} కి D2C @ ₹${fmtCur(procurement.channels.d2c.trueNetPerKg)}/కి + ${fmtInt(fv)} కి ఫ్యాక్టరీ @ ₹${fmtCur(procurement.channels.factory.trueNetPerKg)}/కి → ₹${fmtInt(procurement.splitStrategy.extraIncomeVsMandi)} అదనం.`
  }[LANG];

  // Circular card
  $('pbCircularCash').textContent = `+₹${fmtInt(circular.totalCircularIncome)}`;
  if (circular.valorizationStreams.length > 0) {
    const s = circular.valorizationStreams[0];
    $('pbCircularBuyer').textContent = {
      en: `${s.residueName} → ${s.verifiedBuyer} (${s.hubDistance}) @ ₹${fmtCur(s.pricePerKg)}/kg`,
      hi: `${s.residueName} → ${s.verifiedBuyer} (${s.hubDistance}) दर ₹${fmtCur(s.pricePerKg)}/किलो`,
      te: `${s.residueName} → ${s.verifiedBuyer} (${s.hubDistance}) @ ₹${fmtCur(s.pricePerKg)}/కి`,
    }[LANG];
  } else {
    $('pbCircularBuyer').textContent = {
      en: 'Sub-grade produce routed to regional bio-feed suppliers.',
      hi: 'छंटे माल को स्थानीय पशु आहार उत्पादकों को भेजा जाता है।',
      te: 'వేరుచేసిన వ్యర్థాలను స్థానిక పశువుల దాణా యూనిట్లకు పంపబడుతుంది.'
    }[LANG];
  }
}

/* ─── 3. PRE-SOWING CROP RANKING ────────────────────────────── */
export function updatePreSowing() {
  const s    = $('pSea').value;
  const w    = +$('pWat').value;
  const loc  = +$('pLoc').value;
  const soil = +$('pSoil').value;
  const ranked = orchestrator.agronomyAgent.rankSeasonCrops(s, loc, w, soil);

  const rankLbl = {
    en: ['Rank #1','Rank #2','Rank #3'],
    hi: ['रैंक #1','रैंक #2','रैंक #3'],
    te: ['ర్యాంక్ #1','ర్యాంక్ #2','ర్యాంక్ #3']
  }[LANG] || ['Rank #1','Rank #2','Rank #3'];

  const F = {
    price: {en:'Projected price',hi:'अनुमानित भाव',te:'అంచనా ధర'},
    profit:{en:'Net profit/acre',hi:'शुद्ध लाभ/एकड़',te:'నికర లాభం/ఎకరా'},
    comp:  {en:'District competition',hi:'ज़िला प्रतिस्पर्धा',te:'జిల్లా సాగు పోటీ'},
    fit:   {en:'Agronomic fit',hi:'कृषि अनुकूलता',te:'నేల సరిపోలిక'},
    lock:  {en:'Lock Crop Plan & Activate Alerts',hi:'फ़सल योजना लॉक करें',te:'పంట ప్రణాళిక లాక్ చేయండి'},
    glut:  {Low:{en:'Low glut risk',hi:'कम मंदी जोखिम',te:'తక్కువ సరఫరా రిస్క్'},Moderate:{en:'Moderate glut risk',hi:'मध्यम मंदी जोखिम',te:'మధ్యస్థ సరఫరా రిస్క్'},Stable:{en:'Stable demand',hi:'स्थिर मांग',te:'స్థిరమైన డిమాండ్'}}
  };
  const L = k => F[k]?.[LANG] || F[k]?.en;

  $('plantCards').innerHTML = ranked.map(({ crop: c, suitabilityScore: sc, adjustedProfit: pr }, i) => `
    <div class="card p-6 ${i===0?'border-2 border-sprout':''} flex flex-col justify-between">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="px-2 py-1 rounded text-[10px] num font-bold uppercase ${i===0?'bg-sprout text-white':'bg-slate-800 text-white'}">${rankLbl[i]}</span>
          <span class="text-xs num font-bold text-sd bg-sl px-2 py-0.5 rounded">${F.glut[c.glutRisk]?.[LANG] || c.glutRisk}</span>
        </div>
        <h3 class="text-2xl font-extrabold text-ed">${c.name}</h3>
        <p class="text-xs text-slate-600">${c.note}</p>
        <div class="space-y-2 pt-2 border-t text-xs">
          <div class="flex justify-between"><span class="text-slate-500">${L('price')}</span><b class="num text-ed">₹${fmtCur(c.pricePerKg)}/kg</b></div>
          <div class="flex justify-between"><span class="text-slate-500">${L('profit')}</span><b class="num text-sd">₹${fmtInt(pr)}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">${L('comp')}</span><b class="num">${c.competitionAcreagePct}%</b></div>
          <div class="flex justify-between"><span class="text-slate-500">${L('fit')}</span><b class="num text-sd">${sc}%</b></div>
        </div>
      </div>
      <button onclick="window.farmnexusApp.lockCropPlan('${c.name}')" class="btn mt-5 w-full">${L('lock')}</button>
    </div>
  `).join('');
}

export function lockCropPlan(name) {
  $('lockMsg').textContent = {
    en:`✓ ${name} plan locked. WhatsApp alerts activated.`,
    hi:`✓ ${name} योजना लॉक। WhatsApp अलर्ट सक्रिय।`,
    te:`✓ ${name} ప్రణాళిక లాక్. WhatsApp అలర్ట్‌లు ప్రారంభం.`
  }[LANG];
}

/* ─── 4. 3-CHANNEL PRICES ────────────────────────────────────── */
export function calculateChannels() {
  const cropKey  = $('cCrop').value;
  const volumeKg = +$('cVol').value;
  $('vol').textContent = fmtInt(volumeKg) + ' kg';

  const pd = orchestrator.procurementAgent.evaluateChannels(cropKey, volumeKg);
  const md = orchestrator.marketAgent.evaluateMarketEquilibrium(cropKey);
  $('bench').textContent = '₹' + fmtCur(pd.channels.mandi.grossRate) + '/kg';

  const cm = pd.channels.mandi, cf = pd.channels.factory, cd = pd.channels.d2c;

  const LB = {
    netLabel: {en:'True net take-home',hi:'वास्तविक शुद्ध बचत',te:'నిజమైన నికర ఆదాయం'},
    // Channel 1
    c1t:{en:'Channel 1 · Mandi',hi:'चैनल 1 · मंडी',te:'ఛానల్ 1 · మండీ'},
    c1n:{en:'Gudimalkapur APMC Mandi',hi:'गुडीमलकापुर APMC मंडी',te:'గుడిమల్కాపూర్ APMC మండీ'},
    c1s:{en:'18 km · also Bowenpally',hi:'18 किमी · बोवेनपल्ली भी',te:'18 కి.మీ · బోయిన్‌పల్లి కూడా'},
    c1gross:{en:'Gross auction',hi:'सकल नीलामी',te:'స్థూల వేలం'},
    c1tr:{en:'Transport deduction',hi:'परिवहन कटौती',te:'రవాణా తగ్గింపు'},
    c1com:{en:'Commission & weighment',hi:'कमीशन और तौलाई',te:'కమీషన్ & తూకం'},
    c1btn:{en:'View Gate Passes',hi:'गेट पास देखें',te:'గేట్ పాస్‌లు చూడండి'},
    // Channel 2
    c2t:{en:'Channel 2 · Factory',hi:'चैनल 2 · फैक्ट्री',te:'ఛానల్ 2 · ఫ్యాక్టరీ'},
    c2n:{en:'Deccan Agro Processing',hi:'डेक्कन एग्रो प्रोसेसिंग',te:'డెక్కన్ ఆగ్రో ప్రాసెసింగ్'},
    c2s:{en:'Medchal Highway · zero middleman',hi:'मेचल हाईवे · शून्य बिचौलिया',te:'మేడ్చల్ హైవే · దళారులు లేరు'},
    c2rate:{en:'Contract rate',hi:'कॉन्ट्रैक्ट दर',te:'కాంట్రాక్ట్ రేటు'},
    c2tr:{en:'Direct logistics',hi:'सीधी ट्रक ढुलाई',te:'ప్రత్యక్ష రవాణా'},
    c2com:{en:'Commission',hi:'कमीशन',te:'కమీషన్'},
    c2btn:{en:'Book Factory Slot',hi:'फैक्ट्री स्लॉट बुक करें',te:'ఫ్యాక్టరీ స్లాట్ బుక్ చేయండి'},
    // Channel 3
    c3t:{en:'Channel 3 · D2C',hi:'चैनल 3 · सीधे उपभोक्ता',te:'ఛానల్ 3 · D2C'},
    c3n:{en:'Gated Community Societies',hi:'गेटेड सोसायटियां',te:'గేటెడ్ సొసైటీలు'},
    c3s:{en:'6 societies · 420+ pre-orders',hi:'6 सोसायटी · 420+ अग्रिम ऑर्डर',te:'6 సొసైటీలు · 420+ ప్రీ-ఆర్డర్లు'},
    c3rate:{en:'Group retail rate',hi:'समूह खुदरा दर',te:'గ్రూప్ రిటైల్ ధర'},
    c3tr:{en:'Crates & delivery',hi:'क्रेट्स और डिलीवरी',te:'క్రేట్లు & డెలివరీ'},
    c3btn:{en:'Match Buyer Groups',hi:'उपभोक्ता समूह से जोड़ें',te:'కొనుగోలు గ్రూపులు జతచేయండి'},
    highest:{en:'highest',hi:'उच्चतम',te:'అత్యధికం'}
  };
  const G = k => LB[k]?.[LANG] || LB[k]?.en;

  const row = (l, v, red) =>
    `<div class="flex justify-between ${red?'text-amber font-semibold':''}"><span>${l}</span><b class="num">${v}</b></div>`;

  const card = (title, name, sub, rows, net, border, tag, btnHtml) => `
    <div class="card p-6 ${tag?'border-2 '+border:''}">
      <div class="flex justify-between pb-3 border-b">
        <b class="num text-xs uppercase text-slate-500">${title}</b>
        ${tag?`<span class="px-2 rounded text-[10px] num font-bold bg-ed text-white">${tag}</span>`:''}
      </div>
      <h3 class="text-lg font-bold text-ed mt-3">${name}</h3>
      <p class="text-xs text-slate-500">${sub}</p>
      <div class="mt-4 space-y-1.5 text-xs border-y py-3">${rows}</div>
      <div class="mt-3">
        <span class="lbl">${G('netLabel')}</span>
        <div class="text-2xl font-extrabold num ${tag?'text-sd':''}">₹${fmtCur(net)}<span class="text-xs text-slate-500">/kg</span></div>
        <div class="text-xs num font-bold mt-1 ${tag?'text-sd':'text-slate-500'}">
          Total ₹${fmtInt(net*volumeKg)}${net>cm.trueNetPerKg?` (+₹${fmtInt((net-cm.trueNetPerKg)*volumeKg)})`:''}
        </div>
      </div>
      ${btnHtml}
    </div>`;

  $('chan').innerHTML =
    card(G('c1t'),G('c1n'),G('c1s'),
      row(G('c1gross'),'₹'+fmtCur(cm.grossRate))+row(G('c1tr'),'-₹'+fmtCur(cm.deductions.transport),true)+row(G('c1com'),'-₹'+fmtCur(cm.deductions.commission),true),
      cm.trueNetPerKg,'',null,`<button class="btn btn2 w-full mt-4">${G('c1btn')}</button>`) +
    card(G('c2t'),G('c2n'),G('c2s'),
      row(G('c2rate'),'₹'+fmtCur(cf.contractRate))+row(G('c2tr'),'-₹'+fmtCur(cf.deductions.logistics),true)+row(G('c2com'),'₹0.00'),
      cf.trueNetPerKg,'border-ed',`+${cf.upliftPct}%`,`<button class="btn w-full mt-4">${G('c2btn')}</button>`) +
    card(G('c3t'),G('c3n'),G('c3s'),
      row(G('c3rate'),'₹'+fmtCur(cd.retailRate))+row(G('c3tr'),'-₹'+fmtCur(cd.deductions.deliveryAndCrates),true)+row(G('c2com'),'₹0.00'),
      cd.trueNetPerKg,'border-sprout',`+${cd.upliftPct}% ${G('highest')}`,`<button class="btn w-full mt-4" style="background:#10B981">${G('c3btn')}</button>`);

  // Split recommendation
  const dv = Math.round(volumeKg*0.25), fv = volumeKg-dv;
  const gain = Math.round(dv*(cd.trueNetPerKg-cm.trueNetPerKg)+fv*(cf.trueNetPerKg-cm.trueNetPerKg));
  $('split').innerHTML = {
    en:`${fmtInt(fv)} kg → Factory + ${fmtInt(dv)} kg → D2C → <b>₹${fmtInt(gain)} extra</b> take-home vs Mandi.`,
    hi:`${fmtInt(fv)} किलो → फैक्ट्री + ${fmtInt(dv)} किलो → D2C → <b>₹${fmtInt(gain)} अतिरिक्त</b> मंडी से ज़्यादा।`,
    te:`${fmtInt(fv)} కి → ఫ్యాక్టరీ + ${fmtInt(dv)} కి → D2C → <b>₹${fmtInt(gain)} అదనపు</b> మండీ కంటే ఎక్కువ.`
  }[LANG];

  // Forecast chart
  const prices = md.sevenDayForecast.map(d => d.pricePerKg);
  const mx = Math.max(...prices), mn = Math.min(...prices)*0.85;
  $('chart').innerHTML = prices.map((p, i) => `
    <div class="flex flex-col items-center justify-end h-full">
      <span class="text-[10px] num text-slate-500">₹${fmtCur(p)}</span>
      <div class="w-full rounded-t-lg ${i===2?'bg-sprout':'bg-ed/70'}" style="height:${((p-mn)/(mx-mn))*85+8}%"></div>
    </div>`).join('');

  const diff = +(prices[2]-prices[0]).toFixed(2);
  $('verdict').textContent = {
    en:`HOLD 48H (+₹${fmtCur(diff)}/kg expected Day 3)`,
    hi:`48 घंटे रोकें (+₹${fmtCur(diff)}/किलो Day 3 तक)`,
    te:`48 గంటలు ఆపండి (+₹${fmtCur(diff)}/కి Day 3 నాటికి)`
  }[LANG];
}

/* ─── 5. BUYER DEMAND BOARD ──────────────────────────────────── */
export function renderBuyerBoard() {
  const CN = {
    en:{all:'All Buyers',factory:'Factories',supermarket:'Supermarkets',online:'Online / Q-Commerce'},
    hi:{all:'सभी खरीदार',factory:'फूड फैक्ट्री',supermarket:'सुपरमार्केट',online:'ऑनलाइन'},
    te:{all:'అన్ని కొనుగోలుదారులు',factory:'ఫ్యాక్టరీలు',supermarket:'సూపర్ మార్కెట్లు',online:'ఆన్‌లైన్'}
  }[LANG] || {all:'All',factory:'Factory',supermarket:'Supermarket',online:'Online'};

  $('cats').innerHTML = Object.entries(CN).map(([k,v]) =>
    `<button onclick="window.farmnexusApp.setBuyerCategory('${k}')" class="px-3 py-1.5 rounded-xl text-xs font-bold ${k===CAT?'bg-ed text-white':'bg-white border text-slate-700'}">${v}</button>`
  ).join('');

  const orders = DATASETS.BUYER_ORDERS.filter(o => CAT==='all' || o.category===CAT);
  const totalOpen = orders.reduce((a,o) => a+o.openQtyKg, 0);

  $('quota').textContent = {
    en:`${orders.length} active demands · ${fmtInt(totalOpen)} kg open`,
    hi:`${orders.length} सक्रिय मांगें · ${fmtInt(totalOpen)} किलो खुला`,
    te:`${orders.length} డిమాండ్లు · ${fmtInt(totalOpen)} కిలోల ఓపెన్`
  }[LANG];

  const commitLbl = {en:'Commit 2,000 kg',hi:'2,000 किलो बुक करें',te:'2,000 కి. లాక్ చేయండి'};
  const fullLbl   = {en:'Fully Subscribed',hi:'पूर्णतः बुक',te:'పూర్తిగా బుక్'};
  const gLbl      = {en:'guaranteed farmgate',hi:'गारंटीशुदा दर',te:'హామీ ధర'};
  const fLbl      = {en:'filled',hi:'बुक',te:'పూర్తి'};
  const oLbl      = {en:'open quota',hi:'खुला कोटा',te:'మిగిలిన కోటా'};

  $('pCards').innerHTML = orders.map(o => {
    const pct = Math.round((1 - o.openQtyKg/o.totalQtyKg)*100);
    return `
      <div class="card p-5">
        <div class="flex justify-between items-center">
          <span class="text-[10px] num font-bold bg-sl text-ed px-2 py-0.5 rounded uppercase">${o.category}</span>
          <span class="text-xs text-slate-500">${o.hub}</span>
        </div>
        <h3 class="text-lg font-bold text-ed mt-2">${o.org}</h3>
        <p class="text-xs text-slate-500">${TOpt('crops',o.crop)||o.cropName} · ${o.spec}</p>
        <div class="flex items-baseline gap-2 mt-3">
          <b class="num text-2xl text-sd">₹${fmtCur(o.pricePerKg)}/kg</b>
          <span class="text-xs text-slate-500">${gLbl[LANG]}</span>
        </div>
        <div class="mt-3 h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-sprout" style="width:${pct}%"></div>
        </div>
        <div class="flex justify-between text-[11px] num text-slate-500 mt-1">
          <span>${pct}% ${fLbl[LANG]}</span><span>${fmtInt(o.openQtyKg)} kg ${oLbl[LANG]}</span>
        </div>
        <button ${o.openQtyKg>0?'':'disabled'} onclick="window.farmnexusApp.commitSupply('${o.id}')"
          class="btn w-full mt-3 ${o.openQtyKg>0?'':'opacity-50 cursor-not-allowed'}">
          ${o.openQtyKg>0 ? commitLbl[LANG] : fullLbl[LANG]}
        </button>
      </div>`;
  }).join('');
}

export function setBuyerCategory(cat) { CAT = cat; renderBuyerBoard(); }

export function commitSupply(orderId) {
  const r = orchestrator.procurementAgent.commitOrderSupply(orderId, 2000);
  if (r.success) {
    renderBuyerBoard();
    alert({
      en:`✓ 2,000 kg committed to ${r.buyerName} @ ₹${r.guaranteedPrice}/kg`,
      hi:`✓ 2,000 किलो ${r.buyerName} को ₹${r.guaranteedPrice}/किलो पर बुक`,
      te:`✓ 2,000 కి ${r.buyerName} కు ₹${r.guaranteedPrice}/కి`
    }[LANG]);
  }
}

export function postBuyerOrder(e) {
  e.preventDefault();
  DATASETS.BUYER_ORDERS.unshift({
    id:'ord_'+Date.now(), org:$('bOrg').value, category:$('bCat').value,
    crop:$('bCrop').value, cropName:$('bCrop').options[$('bCrop').selectedIndex].text,
    pricePerKg:+$('bPrice').value, totalQtyKg:+$('bQty').value,
    openQtyKg:+$('bQty').value, spec:$('bSpec').value, hub:$('bHub').value, leadTimeDays:2
  });
  const msg = $('bMsg'); msg.classList.remove('hidden');
  msg.textContent = {
    en:`Order published! 42 farmers within 25 km notified @ ₹${fmtCur(+$('bPrice').value)}/kg.`,
    hi:`ऑर्डर प्रकाशित! 25 किमी में 42 किसानों को ₹${fmtCur(+$('bPrice').value)}/किलो की दर से सूचित किया।`,
    te:`ఆర్డర్ ప్రచురించబడింది! 25 కి.మీ లోని 42 రైతులకు ₹${fmtCur(+$('bPrice').value)}/కి. నోటిఫికేషన్ పంపబడింది.`
  }[LANG];
  e.target.reset(); renderBuyerBoard();
}

export function toggleRole(r) {
  $('fView').classList.toggle('hidden', r!=='f');
  $('bView').classList.toggle('hidden', r!=='b');
  $('tF').className = 'px-4 py-2.5 rounded-xl text-xs font-bold '+(r==='f'?'bg-ed text-white':'text-slate-600');
  $('tB').className = 'px-4 py-2.5 rounded-xl text-xs font-bold '+(r==='b'?'bg-ed text-white':'text-slate-600');
}

/* ─── 6. GLUT SIMULATOR ─────────────────────────────────────── */
export function simulateGlut() {
  const surge = +$('surge').value;
  $('sv').textContent = surge + '%';
  const sim = orchestrator.marketAgent.simulateGlutImpact(surge);

  $('simChart').innerHTML = sim.timelineCurve.map(pt => `
    <div class="flex-1 flex items-end gap-px h-full">
      <div class="flex-1 bg-red-400" style="height:${pt.mandiIndex}%"></div>
      <div class="flex-1 bg-sprout" style="height:${pt.farmnexusIndex}%"></div>
    </div>`).join('');

  $('simOut').textContent = {
    en:`30-day avg: Mandi index ${sim.avgMandiIndex} vs FarmNexus ${sim.avgFarmNexusIndex} (+${sim.indexProtectionAdvantage} pts protected via staggered routing).`,
    hi:`30-दिन औसत: मंडी सूचकांक ${sim.avgMandiIndex} बनाम FarmNexus ${sim.avgFarmNexusIndex} (+${sim.indexProtectionAdvantage} अंक सुरक्षित)।`,
    te:`30 రోజుల సగటు: మండీ సూచిక ${sim.avgMandiIndex} vs FarmNexus ${sim.avgFarmNexusIndex} (+${sim.indexProtectionAdvantage} పాయింట్లు రక్షించబడ్డాయి).`
  }[LANG];
}

/* ─── GLOBAL EXPORTS ─────────────────────────────────────────── */
window.farmnexusApp = {
  runCropIntelligence, updatePreSowing, lockCropPlan,
  calculateChannels, renderBuyerBoard, setBuyerCategory,
  commitSupply, postBuyerOrder, toggleRole, simulateGlut, setLanguage
};

window.addEventListener('DOMContentLoaded', () => setLanguage('en'));
