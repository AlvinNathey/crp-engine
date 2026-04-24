import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const KENYA_RFR = 0.1457;
const VOL_SCALE = 0.16;

const KP = {
  steel: 132000, cement: 780, diesel: 188.12, freight: 82,
  kes_usd: 129.45, timber: 41000, labour: 625,
  pharma: 14500, med_equip: 2750, oxygen: 820, consumables: 175,
  fertiliser: 6900, pesticides: 1750, seeds: 430, maize: 4350, irr_kwh: 19.88,
  brent: 84.2, kplc: 19.88,
  bandwidth: 175, talent: 185000,
  avtur: 1.09, tyres: 29500,
  build_cost: 47000, mortgage: 16.8,
  cbk_rate: 13.0, nse20: 1847,
  chlorine: 285, pipes: 1380,
};

const KNBS_CPI = [
  {month:"May-24",overall:6.1,construction:7.2,health:8.1,food:4.9,transport:5.2,housing:6.8,energy:7.8,manufacturing:6.5,services:5.8,education:6.2,utilities:7.0},
  {month:"Jun-24",overall:4.6,construction:6.1,health:7.4,food:3.8,transport:4.8,housing:5.9,energy:6.5,manufacturing:5.4,services:4.7,education:5.1,utilities:6.0},
  {month:"Jul-24",overall:4.3,construction:5.8,health:7.0,food:3.5,transport:4.1,housing:5.6,energy:6.2,manufacturing:5.1,services:4.4,education:4.8,utilities:5.7},
  {month:"Aug-24",overall:4.4,construction:6.0,health:7.1,food:3.6,transport:4.3,housing:5.7,energy:6.4,manufacturing:5.2,services:4.5,education:4.9,utilities:5.8},
  {month:"Sep-24",overall:3.6,construction:5.2,health:6.5,food:2.9,transport:3.7,housing:5.1,energy:5.7,manufacturing:4.4,services:3.7,education:4.1,utilities:5.1},
  {month:"Oct-24",overall:2.7,construction:4.3,health:5.9,food:2.2,transport:3.0,housing:4.4,energy:4.8,manufacturing:3.5,services:2.9,education:3.2,utilities:4.3},
  {month:"Nov-24",overall:2.8,construction:4.4,health:6.0,food:2.3,transport:3.1,housing:4.3,energy:4.9,manufacturing:3.6,services:3.0,education:3.3,utilities:4.4},
  {month:"Dec-24",overall:3.0,construction:4.7,health:6.3,food:2.5,transport:3.3,housing:4.5,energy:5.2,manufacturing:3.8,services:3.2,education:3.5,utilities:4.7},
  {month:"Jan-25",overall:3.3,construction:5.1,health:6.7,food:2.7,transport:3.6,housing:4.8,energy:5.6,manufacturing:4.1,services:3.5,education:3.8,utilities:5.0},
  {month:"Feb-25",overall:3.5,construction:5.4,health:6.9,food:2.9,transport:3.8,housing:5.0,energy:5.9,manufacturing:4.3,services:3.7,education:4.0,utilities:5.3},
  {month:"Mar-25",overall:3.6,construction:5.6,health:7.1,food:3.0,transport:4.0,housing:5.1,energy:6.1,manufacturing:4.5,services:3.8,education:4.2,utilities:5.5},
  {month:"Apr-25",overall:3.8,construction:5.9,health:7.3,food:3.2,transport:4.2,housing:5.3,energy:6.4,manufacturing:4.7,services:4.0,education:4.4,utilities:5.7},
  {month:"May-25",overall:4.1,construction:6.3,health:7.6,food:3.4,transport:4.5,housing:5.6,energy:6.8,manufacturing:5.0,services:4.3,education:4.7,utilities:6.1},
  {month:"Jun-25",overall:4.3,construction:6.5,health:7.8,food:3.6,transport:4.7,housing:5.8,energy:7.0,manufacturing:5.2,services:4.5,education:4.9,utilities:6.3},
  {month:"Jul-25",overall:4.5,construction:6.8,health:8.0,food:3.8,transport:4.9,housing:6.0,energy:7.3,manufacturing:5.4,services:4.7,education:5.1,utilities:6.5},
  {month:"Aug-25",overall:4.7,construction:7.0,health:8.2,food:4.0,transport:5.1,housing:6.2,energy:7.5,manufacturing:5.6,services:4.9,education:5.3,utilities:6.7},
  {month:"Sep-25",overall:4.9,construction:7.2,health:8.4,food:4.2,transport:5.3,housing:6.4,energy:7.7,manufacturing:5.8,services:5.1,education:5.5,utilities:6.9},
  {month:"Oct-25",overall:5.1,construction:7.5,health:8.6,food:4.4,transport:5.5,housing:6.6,energy:8.0,manufacturing:6.0,services:5.3,education:5.7,utilities:7.2},
  {month:"Nov-25",overall:5.3,construction:7.7,health:8.8,food:4.6,transport:5.7,housing:6.8,energy:8.2,manufacturing:6.2,services:5.5,education:5.9,utilities:7.4},
  {month:"Dec-25",overall:5.5,construction:7.9,health:9.0,food:4.8,transport:5.9,housing:7.0,energy:8.4,manufacturing:6.4,services:5.7,education:6.1,utilities:7.6},
  {month:"Jan-26",overall:5.6,construction:8.1,health:9.2,food:4.9,transport:6.0,housing:7.1,energy:8.6,manufacturing:6.5,services:5.8,education:6.2,utilities:7.8},
  {month:"Feb-26",overall:5.7,construction:8.2,health:9.3,food:5.0,transport:6.1,housing:7.2,energy:8.7,manufacturing:6.6,services:5.9,education:6.3,utilities:7.9},
  {month:"Mar-26",overall:5.8,construction:8.4,health:9.4,food:5.1,transport:6.2,housing:7.3,energy:8.9,manufacturing:6.7,services:6.0,education:6.4,utilities:8.0},
  {month:"Apr-26",overall:5.9,construction:8.5,health:9.5,food:5.2,transport:6.3,housing:7.4,energy:9.0,manufacturing:6.8,services:6.1,education:6.5,utilities:8.2},
];

const SECTORS = {
  construction:{label:"Construction & Infrastructure",icon:"🏗️",color:"#34d399",description:"Civil works, roads, buildings, water & sanitation",inflationKey:"construction",sharpeBase:0.42,authority:"KNBS/KEBS/EPRA/KFS/AQSK",commodities:{steel:{label:"Steel",unit:"KES/ton",freq:5,source:"KEBS/Steel&Tube",color:"#60a5fa",price:KP.steel,corr:true},cement:{label:"Cement",unit:"KES/bag",freq:7,source:"KNBS CPI",color:"#34d399",price:KP.cement,corr:false},fuel:{label:"Diesel",unit:"KES/L",freq:14,source:"EPRA",color:"#f59e0b",price:KP.diesel,corr:true},freight:{label:"Freight",unit:"KES/km/t",freq:10,source:"KNBS Transport",color:"#a78bfa",price:KP.freight,corr:false},fx:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#f87171",price:KP.kes_usd,corr:true},timber:{label:"Timber",unit:"KES/m³",freq:14,source:"KFS",color:"#86efac",price:KP.timber,corr:false},labour:{label:"Labour (NMW)",unit:"KES/day",freq:30,source:"MLSS",color:"#fde68a",price:KP.labour,corr:false}},corr:{steel_fx:0.45,fuel_fx:0.38,freight_fuel:0.72,steel_fuel:0.31,cement_fuel:0.25,cement_freight:0.41,timber_freight:0.35},weights:{steel:25,cement:20,fuel:20,freight:10,fx:10,timber:8,labour:7}},
  health:{label:"Health & Pharmaceutical",icon:"🏥",color:"#f87171",description:"Drugs, medical supplies, equipment, hospital services",inflationKey:"health",sharpeBase:0.29,authority:"KEMSA/MOH/BOC Kenya/CBK",commodities:{pharma:{label:"Pharma APIs",unit:"KES/kg",freq:7,source:"KEMSA",color:"#f87171",price:KP.pharma,corr:true},med_equip:{label:"Medical Equipment",unit:"USD(CIF)",freq:14,source:"KEMSA",color:"#fca5a5",price:KP.med_equip,corr:true},oxygen:{label:"Medical Oxygen",unit:"KES/m³",freq:14,source:"BOC Kenya",color:"#bfdbfe",price:KP.oxygen,corr:false},consumables:{label:"Consumables/PPE",unit:"KES/unit",freq:7,source:"KEMSA",color:"#fde68a",price:KP.consumables,corr:false},cold_chain:{label:"Cold-Chain Logistics",unit:"KES/km",freq:10,source:"Derived/ERC",color:"#a78bfa",price:320,corr:true},fx_usd:{label:"KES/USD (imports)",unit:"KES/USD",freq:1,source:"CBK",color:"#f59e0b",price:KP.kes_usd,corr:true},fuel_gen:{label:"Diesel (generators)",unit:"KES/L",freq:14,source:"EPRA",color:"#86efac",price:KP.diesel,corr:true},labour_clin:{label:"Clinical Labour",unit:"KES/mo",freq:30,source:"MOH/SRC",color:"#c4b5fd",price:87500,corr:false}},corr:{pharma_fx_usd:0.78,med_equip_fx_usd:0.82,cold_chain_fuel_gen:0.65,pharma_med_equip:0.55},weights:{pharma:25,med_equip:20,oxygen:8,consumables:12,cold_chain:10,fx_usd:15,fuel_gen:5,labour_clin:5}},
  agriculture:{label:"Agriculture & Food Systems",icon:"🌾",color:"#fbbf24",description:"Crop inputs, livestock, irrigation, processing",inflationKey:"food",sharpeBase:0.61,authority:"NCPB/KEPHIS/PCPB/KPLC",commodities:{fertiliser:{label:"Fertiliser (DAP)",unit:"KES/50kg",freq:14,source:"NCPB",color:"#fbbf24",price:KP.fertiliser,corr:true},pesticides:{label:"Pesticides",unit:"KES/L",freq:14,source:"PCPB",color:"#fde68a",price:KP.pesticides,corr:true},seeds:{label:"Certified Seeds",unit:"KES/kg",freq:30,source:"KEPHIS",color:"#86efac",price:KP.seeds,corr:false},irrigation:{label:"Irrigation Power",unit:"KES/kWh",freq:30,source:"KPLC",color:"#60a5fa",price:KP.irr_kwh,corr:false},maize:{label:"Maize (farmgate)",unit:"KES/90kg",freq:14,source:"NCPB",color:"#f59e0b",price:KP.maize,corr:false},fuel_agri:{label:"Diesel (machinery)",unit:"KES/L",freq:14,source:"EPRA",color:"#f87171",price:KP.diesel,corr:true},fx_in:{label:"KES/USD (imports)",unit:"KES/USD",freq:1,source:"CBK",color:"#a78bfa",price:KP.kes_usd,corr:true}},corr:{fertiliser_fx_in:0.68,pesticides_fx_in:0.61,fuel_agri_maize:0.42,fertiliser_pesticides:0.55},weights:{fertiliser:25,pesticides:15,seeds:10,irrigation:10,maize:15,fuel_agri:15,fx_in:10}},
  energy:{label:"Energy & Power",icon:"⚡",color:"#fde68a",description:"Electricity generation, petroleum, renewables",inflationKey:"energy",sharpeBase:0.21,authority:"EPRA/KPLC/KETRACO/ICE Brent",commodities:{crude:{label:"Crude Oil (Brent)",unit:"USD/bbl",freq:1,source:"ICE Brent",color:"#f59e0b",price:KP.brent,corr:true},coal:{label:"Thermal Coal",unit:"USD/ton",freq:7,source:"Global",color:"#94a3b8",price:138,corr:true},lng:{label:"LNG",unit:"USD/MMBtu",freq:7,source:"Global",color:"#bfdbfe",price:11.4,corr:true},electricity:{label:"KPLC Tariff",unit:"KES/kWh",freq:30,source:"KPLC/EPRA",color:"#fde68a",price:KP.kplc,corr:false},solar:{label:"Solar Panels",unit:"USD/Wp",freq:30,source:"REA/IRENA",color:"#86efac",price:0.27,corr:true},fx_en:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#f87171",price:KP.kes_usd,corr:true}},corr:{crude_electricity:0.58,lng_electricity:0.44,crude_fx_en:0.35,crude_lng:0.72},weights:{crude:30,coal:10,lng:10,electricity:25,solar:10,fx_en:15}},
  manufacturing:{label:"Manufacturing & Industry",icon:"🏭",color:"#a78bfa",description:"Light & heavy manufacturing, textiles, processing",inflationKey:"manufacturing",sharpeBase:0.54,authority:"KAM/KEBS/KPLC/MLSS/FKE",commodities:{steel_m:{label:"Steel (rolled)",unit:"KES/ton",freq:5,source:"KEBS",color:"#60a5fa",price:134000,corr:true},plastics:{label:"Plastics (resin)",unit:"USD/ton",freq:7,source:"Global",color:"#f87171",price:1480,corr:true},elec_m:{label:"Industrial Power",unit:"KES/kWh",freq:30,source:"KPLC",color:"#fde68a",price:KP.kplc,corr:false},labour_m:{label:"Factory Labour",unit:"KES/day",freq:30,source:"FKE/MLSS",color:"#86efac",price:KP.labour,corr:false},packaging:{label:"Packaging",unit:"KES/unit",freq:14,source:"KAM",color:"#fbbf24",price:48,corr:false},fx_m:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#f59e0b",price:KP.kes_usd,corr:true}},corr:{steel_m_fx_m:0.45,plastics_fx_m:0.62,elec_m_labour_m:0.22,plastics_steel_m:0.38},weights:{steel_m:20,plastics:15,elec_m:20,labour_m:20,packaging:10,fx_m:15}},
  ict:{label:"ICT & Digital Services",icon:"💻",color:"#60a5fa",description:"Telecoms, data centres, software, fintech",inflationKey:"services",sharpeBase:0.87,authority:"CA-Kenya/TCA/TEAMS/BrighterMonday",commodities:{bandwidth:{label:"Intl. Bandwidth",unit:"USD/Mbps/mo",freq:30,source:"TCA/TEAMS",color:"#60a5fa",price:KP.bandwidth,corr:true},cloud:{label:"Cloud Infra",unit:"USD/mo",freq:30,source:"AWS/Azure/GCP",color:"#bfdbfe",price:4100,corr:true},devices:{label:"ICT Devices",unit:"USD/unit",freq:14,source:"KEBS Import",color:"#a78bfa",price:840,corr:true},elec_ict:{label:"DC Power",unit:"KES/kWh",freq:30,source:"KPLC",color:"#fde68a",price:KP.kplc,corr:false},fx_ict:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#f87171",price:KP.kes_usd,corr:true},talent:{label:"Tech Talent",unit:"KES/mo",freq:30,source:"BrighterMonday",color:"#86efac",price:KP.talent,corr:false}},corr:{bandwidth_fx_ict:0.71,cloud_fx_ict:0.68,devices_fx_ict:0.75,bandwidth_cloud:0.52},weights:{bandwidth:15,cloud:20,devices:20,elec_ict:15,fx_ict:20,talent:10}},
  transport:{label:"Transport & Logistics",icon:"🚛",color:"#fb923c",description:"Road, rail, aviation, maritime, cold chain",inflationKey:"transport",sharpeBase:0.37,authority:"KENHA/KCAA/NTSA/EPRA/IATA",commodities:{fuel_tr:{label:"Diesel (fleet)",unit:"KES/L",freq:14,source:"EPRA",color:"#fb923c",price:KP.diesel,corr:true},tyres:{label:"Tyres (truck)",unit:"KES/unit",freq:30,source:"NTSA",color:"#fbbf24",price:KP.tyres,corr:true},parts:{label:"Spare Parts",unit:"KES/set",freq:14,source:"KRA Import",color:"#f87171",price:46500,corr:true},tolls:{label:"Road Tolls",unit:"KES/km",freq:30,source:"KENHA",color:"#86efac",price:4.5,corr:false},avtur:{label:"Avtur (Jet Fuel)",unit:"USD/L",freq:7,source:"KCAA/IATA",color:"#bfdbfe",price:KP.avtur,corr:true},fx_tr:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#a78bfa",price:KP.kes_usd,corr:true}},corr:{fuel_tr_avtur:0.84,parts_fx_tr:0.65,tyres_fuel_tr:0.38,parts_tyres:0.52},weights:{fuel_tr:30,tyres:15,parts:20,tolls:5,avtur:15,fx_tr:15}},
  education:{label:"Education & Training",icon:"📚",color:"#38bdf8",description:"Schools, universities, vocational training, EdTech",inflationKey:"education",sharpeBase:0.70,authority:"KICD/TSC/SRC/KLB/KPLC",commodities:{textbooks:{label:"Textbooks",unit:"KES/set",freq:30,source:"KLB/KICD",color:"#38bdf8",price:4600,corr:false},ict_ed:{label:"ICT Equipment",unit:"USD/unit",freq:14,source:"KEBS Import",color:"#bfdbfe",price:640,corr:true},teachers:{label:"Teacher Salaries",unit:"KES/mo",freq:30,source:"TSC/SRC",color:"#86efac",price:46200,corr:false},elec_ed:{label:"Electricity",unit:"KES/kWh",freq:30,source:"KPLC",color:"#fde68a",price:KP.kplc,corr:false},fx_ed:{label:"KES/USD (imports)",unit:"KES/USD",freq:1,source:"CBK",color:"#f87171",price:KP.kes_usd,corr:true}},corr:{ict_ed_fx_ed:0.74,textbooks_teachers:0.15},weights:{textbooks:20,ict_ed:20,teachers:35,elec_ed:10,fx_ed:15}},
  finance:{label:"Financial Services",icon:"🏦",color:"#e879f9",description:"Banking, insurance, capital markets, microfinance",inflationKey:"services",sharpeBase:0.58,authority:"CBK/NSE/IRA/SASRA",commodities:{cbr:{label:"CBK Base Rate",unit:"% p.a.",freq:30,source:"CBK MPC",color:"#e879f9",price:KP.cbk_rate,corr:false},tbill:{label:"91-Day T-Bill",unit:"% yield",freq:7,source:"CBK/NT",color:"#c4b5fd",price:14.57,corr:false},fx_vol:{label:"KES/USD Volatility",unit:"% daily",freq:1,source:"CBK FX",color:"#f87171",price:0.82,corr:true},nse:{label:"NSE 20 Index",unit:"points",freq:1,source:"NSE",color:"#fde68a",price:KP.nse20,corr:false},npl:{label:"NPL Ratio",unit:"%",freq:30,source:"CBK Sup Rpt",color:"#f59e0b",price:14.8,corr:false},fx_fin:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#60a5fa",price:KP.kes_usd,corr:true}},corr:{cbr_tbill:0.88,fx_vol_fx_fin:0.91,cbr_npl:0.55},weights:{cbr:20,tbill:20,fx_vol:15,nse:15,npl:20,fx_fin:10}},
  real_estate:{label:"Real Estate & Housing",icon:"🏘️",color:"#2dd4bf",description:"Residential, commercial, land, REITs",inflationKey:"housing",sharpeBase:0.46,authority:"Lands Ministry/CBK/HassConsult/AQSK",commodities:{land:{label:"Land (Nairobi)",unit:"KES/ha",freq:30,source:"Lands/HassConsult",color:"#2dd4bf",price:125000000,corr:false},mortgage:{label:"Mortgage Rate",unit:"% p.a.",freq:30,source:"CBK survey",color:"#bfdbfe",price:KP.mortgage,corr:false},rent:{label:"Rental Index",unit:"KES/sqm",freq:30,source:"HassConsult",color:"#86efac",price:1920,corr:false},build:{label:"Build Cost",unit:"KES/sqm",freq:14,source:"AQSK guide",color:"#fbbf24",price:KP.build_cost,corr:false},fx_re:{label:"KES/USD",unit:"KES/USD",freq:1,source:"CBK",color:"#f87171",price:KP.kes_usd,corr:true}},corr:{mortgage_build:0.42,land_rent:0.58,build_fx_re:0.35},weights:{land:20,mortgage:25,rent:20,build:25,fx_re:10}},
  tourism:{label:"Tourism & Hospitality",icon:"🦁",color:"#fb7185",description:"Hotels, safari, aviation, parks, F&B",inflationKey:"food",sharpeBase:0.33,authority:"KTB/KCAA/KWS/KAHC/KNBS",commodities:{arrivals:{label:"Tourist Arrivals",unit:"'000/mo",freq:30,source:"KTB/MOTA",color:"#fb7185",price:185,corr:false},fx_tour:{label:"USD/KES (visitor)",unit:"KES/USD",freq:1,source:"CBK",color:"#fbbf24",price:KP.kes_usd,corr:true},avtur_t:{label:"Avtur (Jet Fuel)",unit:"USD/L",freq:7,source:"KCAA/IATA",color:"#f87171",price:KP.avtur,corr:true},fb:{label:"F&B Costs",unit:"KES/pax",freq:14,source:"KAHC survey",color:"#86efac",price:2900,corr:false},parks:{label:"Park/Conservancy Fees",unit:"USD/pax",freq:30,source:"KWS/NRT",color:"#60a5fa",price:80,corr:false}},corr:{fx_tour_avtur_t:0.38,arrivals_fx_tour:0.45,avtur_t_fb:0.28},weights:{arrivals:25,fx_tour:20,avtur_t:20,fb:20,parks:15}},
  water:{label:"Water & Sanitation",icon:"💧",color:"#38bdf8",description:"Bulk water, treatment chemicals, irrigation, WASH",inflationKey:"utilities",sharpeBase:0.51,authority:"WRA/WASREB/KEBS/KPLC",commodities:{chlorine:{label:"Chlorine",unit:"KES/kg",freq:14,source:"WASREB",color:"#38bdf8",price:KP.chlorine,corr:true},pipes:{label:"uPVC/GI Pipes",unit:"KES/m",freq:14,source:"KEBS Import",color:"#bfdbfe",price:KP.pipes,corr:false},pumps:{label:"Pump Sets",unit:"USD/kW",freq:30,source:"KEBS Import",color:"#a78bfa",price:430,corr:true},elec_w:{label:"Pumping Power",unit:"KES/kWh",freq:30,source:"KPLC",color:"#fde68a",price:KP.kplc,corr:false},fx_w:{label:"KES/USD (imports)",unit:"KES/USD",freq:1,source:"CBK",color:"#f87171",price:KP.kes_usd,corr:true}},corr:{pumps_fx_w:0.70,chlorine_fx_w:0.55,elec_w_pumps:0.42},weights:{chlorine:20,pipes:25,pumps:20,elec_w:20,fx_w:15}},
};

const KES_UF_BASE = 1000;

// ─── STORAGE ──────────────────────────────────────────────────────────────────
async function storageSave(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}}
async function storageLoad(key){try{const r=localStorage.getItem(key);return r?JSON.parse(r):null;}catch(e){return null;}}

// ─── MATH ─────────────────────────────────────────────────────────────────────
function buildUF(inflKey){let v=KES_UF_BASE;return KNBS_CPI.map(r=>{v=v*(1+(r[inflKey]||r.overall)/100/12);return{month:r.month,uf:parseFloat(v.toFixed(4)),cpi:r[inflKey]||r.overall,erosion:parseFloat(((v/KES_UF_BASE-1)*100).toFixed(2))};});}
function genSeries(price,freq,corr,days){const s=[];let p=price,last=0;const shock=Math.floor(days*0.62);for(let d=0;d<days;d++){if(d-last>=freq){const bv=corr?0.016:0.009;const sh=(d>=shock&&d<=shock+7)?0.04:0;p=p*(1+(Math.random()-0.485)*bv+sh*0.01);last=d;}s.push({d,p:parseFloat(p.toFixed(4))});}return s;}
function getReturns(series,freq){const r=[];for(let i=freq;i<series.length;i+=freq){const a=series[i-freq].p,b=series[i].p;if(a>0)r.push((b-a)/a);}return r;}
function volStats(returns,freq){if(returns.length<3)return{hist:0,ewma:0,blended:0,n:0,mean:0};const n=Math.floor(252/freq);const mean=returns.reduce((a,b)=>a+b,0)/returns.length;const vari=returns.reduce((s,r)=>s+Math.pow(r-mean,2),0)/(returns.length-1);const hist=Math.sqrt(vari)*Math.sqrt(n);let ev=Math.pow(returns[0],2);for(let i=1;i<returns.length;i++)ev=0.94*ev+0.06*Math.pow(returns[i],2);const ewma=Math.sqrt(ev)*Math.sqrt(n);return{hist,ewma,blended:hist*0.5+ewma*0.5,n:returns.length,mean,vari};}
function sharpe(returns,freq){if(returns.length<3)return 0;const obs=Math.floor(252/freq);const mean=returns.reduce((a,b)=>a+b,0)/returns.length;const vari=returns.reduce((s,r)=>s+Math.pow(r-mean,2),0)/(returns.length-1);const annR=mean*obs,annV=Math.sqrt(vari)*Math.sqrt(obs);return annV>0?parseFloat(((annR-KENYA_RFR)/annV).toFixed(3)):0;}
function normScore(vol){return Math.min(vol/Math.max(0.6,vol*1.2),1.0);}
function dedup(scores,corrs){let total=Object.values(scores).reduce((s,v)=>s+v,0),pen=0;Object.entries(corrs).forEach(([pair,rho])=>{const parts=pair.split("_");for(let i=1;i<parts.length;i++){const a=parts.slice(0,i).join("_"),b=parts.slice(i).join("_");if(scores[a]!==undefined&&scores[b]!==undefined){pen+=rho*Math.min(scores[a],scores[b])*0.5;break;}}});return Math.max(0,total-pen);}
function getCRP(scores,days,weights,cpi,stressMult){const months=days/30.44,wT=Object.values(weights).reduce((a,b)=>a+b,0)||1;const wR=Object.entries(weights).reduce((s,[k,w])=>s+(scores[k]||0)*w,0)/wT;const vol=wR*stressMult*VOL_SCALE,infl=(cpi/100)*(months/12);return{vol:parseFloat((vol*100).toFixed(2)),infl:parseFloat((infl*100).toFixed(2)),total:parseFloat(((vol+infl)*100).toFixed(2))};}
function stressMult(days){const m=days/30.44;return m<=3?1.08:m<=6?1.15:m<=12?1.28:m<=24?1.45:1.65;}
function recLookback(contractDays,sid){const sec=SECTORS[sid];if(!sec)return{rec:90,reason:"Default 90-day window",byC:90,byF:90,avgFreq:10};const avgF=Object.values(sec.commodities).reduce((s,c)=>s+c.freq,0)/Object.keys(sec.commodities).length;const byC=Math.round(contractDays*0.5),byF=Math.round(avgF*10);const rec=Math.max(30,Math.min(Math.max(byC,byF),365));const reason=rec<=30?"Short engagement — 30-day snapshot captures current conditions":rec<=60?"Medium-term — 60 days balances recency with trend stability":rec<=90?"Standard — 90-day window optimal for this sector's update cadence":rec<=180?"Long contract — 180-day window captures seasonal commodity price cycles":"Extended — full 365-day window covers annual volatility regime";return{rec,reason,byC,byF,avgFreq:Math.round(avgF)};}
function computeRatio(baseVal,crpPct,ufEr,sectorCPI,contractDays){const months=contractDays/30.44;const supExp=(sectorCPI/100)*(months/12)*100,cliBen=crpPct,total=supExp+cliBen;const supShare=total>0?supExp/total:0.5,cliShare=1-supShare;return{ratioSup:parseFloat(supShare.toFixed(3)),ratioCli:parseFloat(cliShare.toFixed(3)),cliCRP:parseFloat((crpPct*cliShare).toFixed(2)),supAbs:parseFloat((crpPct*supShare).toFixed(2)),adjPay:Math.round(baseVal*(1+crpPct*cliShare/100)),ufPay:Math.round(baseVal*(1+ufEr/100)),mktPay:Math.round(baseVal*(1+crpPct/100)),basePay:Math.round(baseVal),supExp:parseFloat(supExp.toFixed(2)),cliBen:parseFloat(cliBen.toFixed(2)),totalRisk:parseFloat(total.toFixed(2)),factors:[{label:"KNBS Sector CPI",val:`${sectorCPI.toFixed(1)}% p.a.`,impact:`+${supExp.toFixed(2)}%`,side:"obligor",desc:"Annual input cost inflation Obligor must absorb on goods/services"},{label:"CRP Market Volatility",val:`${crpPct.toFixed(2)}%`,impact:`+${cliBen.toFixed(2)}%`,side:"obligee",desc:"Price-lock benefit accruing to Obligee on a fixed-price contract"},{label:"KES-UF Erosion Index",val:`${ufEr.toFixed(2)}%`,impact:ufEr>crpPct?"Above CRP":"Below CRP",side:"shared",desc:"Real purchasing power loss — shared liability between parties"},{label:"Contract Duration Risk",val:`${Math.round(contractDays)}d / ${months.toFixed(1)}mo`,impact:months>12?"High exposure":months>6?"Medium exposure":"Low exposure",side:"shared",desc:"Longer contracts compound all risk factors for both parties"}]};}
function runSector(sid,lookback,contractDays,weights){const sec=SECTORS[sid],sm=stressMult(contractDays);const cr={};let allR=[];Object.entries(sec.commodities).forEach(([cid,comm])=>{const series=genSeries(comm.price,comm.freq,comm.corr,lookback);const returns=getReturns(series,comm.freq);const vs=volStats(returns,comm.freq);const sh=sharpe(returns,comm.freq);cr[cid]={series,returns,...vs,score:normScore(vs.blended),sharpe:sh,comm,curPrice:series[series.length-1].p,chg:(series[series.length-1].p-series[0].p)/series[0].p};allR=allR.concat(returns);});const raw=Object.fromEntries(Object.entries(cr).map(([k,v])=>[k,v.score]));const deduped=dedup(raw,sec.corr);const cpi=KNBS_CPI[KNBS_CPI.length-1][sec.inflationKey]||KNBS_CPI[KNBS_CPI.length-1].overall;const crp=getCRP(raw,contractDays,weights,cpi,sm);return{cr,raw,deduped,crp,cpi,stressMult:sm,allR,sectSharpe:sharpe(allR,7)};}
function genRefCode(sid,contractDays){const abbr={construction:"CONS",health:"HLTH",agriculture:"AGRI",energy:"ENRG",manufacturing:"MFCG",ict:"ICTS",transport:"TRPT",education:"EDUC",finance:"FINC",real_estate:"RLST",tourism:"TOUR",water:"WATR"};const now=new Date();const yr=now.getFullYear(),mo=String(now.getMonth()+1).padStart(2,"0"),dy=String(now.getDate()).padStart(2,"0");const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const r4=Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join("");const r3=Array.from({length:3},()=>chars[Math.floor(Math.random()*chars.length)]).join("");const dur=contractDays<=30?"ST":contractDays<=180?"MT":contractDays<=365?"LT":"XL";return`KRP-${yr}${mo}${dy}-${abbr[sid]||"GENL"}-${dur}-${r4}-${r3}`;}

const fmt = n => n.toLocaleString("en-KE",{maximumFractionDigits:0});

// ─── DESIGN TOKENS (dark / light) ─────────────────────────────────────────────
const THEMES = {
  dark: {
    key:      "dark",
    bg:       "#060c15",
    surface:  "#0c1420",
    surface2: "#101b2b",
    border:   "#1a2a3d",
    border2:  "#243447",
    text:     "#dde6f0",
    textMid:  "#7a9ab8",
    textDim:  "#3d5470",
    accent:   "#00c8e0",
    accentDim:"#0e4a55",
    green:    "#10b981",
    greenDim: "#064028",
    amber:    "#f59e0b",
    amberDim: "#3d2a07",
    red:      "#f43f5e",
    redDim:   "#3d0d18",
    purple:   "#a78bfa",
    mono:     "'IBM Plex Mono', 'Fira Code', monospace",
    sans:     "'Syne', 'DM Sans', sans-serif",
  },
  light: {
    key:      "light",
    bg:       "#e8eef5",
    surface:  "#ffffff",
    surface2: "#f1f5f9",
    border:   "#cbd5e1",
    border2:  "#94a3b8",
    text:     "#0f172a",
    textMid:  "#475569",
    textDim:  "#64748b",
    accent:   "#0e7490",
    accentDim:"#cffafe",
    green:    "#059669",
    greenDim: "#d1fae5",
    amber:    "#d97706",
    amberDim: "#fef3c7",
    red:      "#dc2626",
    redDim:   "#fee2e2",
    purple:   "#7c3aed",
    mono:     "'IBM Plex Mono', 'Fira Code', monospace",
    sans:     "'Syne', 'DM Sans', sans-serif",
  },
};

const ThemeCtx = createContext(THEMES.dark);
function useThemeTokens() { return useContext(ThemeCtx); }

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Pill({score}) {
  const T = useThemeTokens();
  const cfg = score < 0.3
    ? {bg:"#064028",fg:"#34d399",label:"LOW"}
    : score < 0.6
    ? {bg:"#3d2a07",fg:"#fbbf24",label:"MED"}
    : {bg:"#3d0d18",fg:"#fb7185",label:"HIGH"};
  return (
    <span style={{
      background:cfg.bg,color:cfg.fg,
      padding:"2px 10px",borderRadius:99,fontSize:10,fontWeight:700,
      letterSpacing:1,fontFamily:T.mono,border:`1px solid ${cfg.fg}44`
    }}>{cfg.label}</span>
  );
}

function Bar({value,max=1,color,h=4}) {
  const T = useThemeTokens();
  return (
    <div style={{background:T.border,borderRadius:2,height:h,overflow:"hidden"}}>
      <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.5s ease"}}/>
    </div>
  );
}

function Spark({series,color,w=100,h=32}) {
  const T = useThemeTokens();
  const [hov,setHov] = useState(false);
  if(!series||series.length<2) return null;
  const vals=series.map(s=>s.p),mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  const last=vals[vals.length-1],lx=w,ly=h-((last-mn)/rng)*h;
  return (
    <div style={{position:"relative"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <svg width={w} height={h} style={{overflow:"visible",display:"block"}}>
        <defs>
          <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${color.replace("#","")})`}/>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx={lx} cy={ly} r="3" fill={color} stroke={T.surface} strokeWidth="1.5"/>
      </svg>
      {hov && (
        <div style={{position:"absolute",right:0,top:-28,background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:6,padding:"3px 8px",fontSize:11,color:T.text,fontFamily:T.mono,whiteSpace:"nowrap",zIndex:10}}>
          {last.toLocaleString("en-KE",{maximumFractionDigits:2})}
        </div>
      )}
    </div>
  );
}

function AxisChart({data,yKey,color,h=130,yLabel="%",xKey="month"}) {
  const T = useThemeTokens();
  const [hovered,setHovered] = useState(null);
  if(!data||data.length<2) return null;
  const vals=data.map(d=>d[yKey]||0);
  const rawMin=Math.min(...vals),rawMax=Math.max(...vals),pad=(rawMax-rawMin)*0.2||0.5;
  const yMin=Math.max(0,rawMin-pad),yMax=rawMax+pad,yRange=yMax-yMin||1;
  const LP=52,BP=28,RP=12,TP=12;
  const W=380,H=h,CW=W-LP-RP,CH=H-TP-BP;
  const xS=i=>LP+(i/(data.length-1))*CW;
  const yS=v=>TP+CH-((v-yMin)/yRange)*CH;
  const pts=vals.map((v,i)=>`${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(" ");
  const fill=`${xS(0).toFixed(1)},${(TP+CH).toFixed(1)} ${pts} ${xS(data.length-1).toFixed(1)},${(TP+CH).toFixed(1)}`;
  const yTicks=4;const yStep=(yMax-yMin)/yTicks;
  const xStep=data.length<=12?2:data.length<=24?4:6;
  const uid=`ac${yKey.slice(0,4)}${Math.random().toString(36).slice(2,5)}`;
  const lv=vals[vals.length-1],lx=xS(data.length-1),ly=yS(lv);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      {Array.from({length:yTicks+1},(_,i)=>{
        const v=yMin+i*yStep,y=yS(v);
        return (
          <g key={i}>
            <line x1={LP} y1={y} x2={W-RP} y2={y} stroke={T.border} strokeWidth="1" strokeDasharray="3,4"/>
            <text x={LP-6} y={y+4} textAnchor="end" fontSize="10" fill={T.textDim} fontFamily={T.mono}>{v.toFixed(1)}{yLabel}</text>
          </g>
        );
      })}
      <polygon points={fill} fill={`url(#${uid})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      {vals.map((v,i)=>(i%xStep===0||i===vals.length-1)
        ? <circle key={i} cx={xS(i)} cy={yS(v)} r="3.5" fill={color} stroke={T.surface} strokeWidth="1.5" style={{cursor:"pointer"}}
            onMouseEnter={()=>setHovered({x:xS(i),y:yS(v),v,label:data[i][xKey]})}
            onMouseLeave={()=>setHovered(null)}/>
        : null
      )}
      <g>
        <circle cx={lx} cy={ly} r="4.5" fill={color} stroke={T.surface} strokeWidth="2"/>
        <rect x={lx-28} y={ly-22} width={56} height={18} rx="4" fill={T.surface2} stroke={color} strokeWidth="1"/>
        <text x={lx} y={ly-9} textAnchor="middle" fontSize="10" fill={color} fontWeight="700" fontFamily={T.mono}>{lv.toFixed(1)}{yLabel}</text>
      </g>
      {data.map((d,i)=>(i%xStep===0||i===data.length-1)
        ? <text key={i} x={xS(i)} y={H-4} textAnchor="middle" fontSize="9" fill={T.textDim} fontFamily={T.mono}>{d[xKey]||""}</text>
        : null
      )}
      <line x1={LP} y1={TP+CH} x2={W-RP} y2={TP+CH} stroke={T.border2} strokeWidth="1"/>
      {hovered && (
        <g>
          <rect x={Math.max(LP,hovered.x-38)} y={Math.max(TP,hovered.y-32)} width={76} height={28} rx="5" fill={T.surface2} stroke={T.border2} strokeWidth="1"/>
          <text x={hovered.x} y={hovered.y-17} fontSize="9" fill={T.textMid} textAnchor="middle" fontFamily={T.mono}>{hovered.label}</text>
          <text x={hovered.x} y={hovered.y-6} fontSize="10" fill={color} textAnchor="middle" fontWeight="700" fontFamily={T.mono}>{hovered.v.toFixed(2)}{yLabel}</text>
        </g>
      )}
    </svg>
  );
}

function BellCurve({returns,color,W=340,H=110}) {
  const T = useThemeTokens();
  if(!returns||returns.length<5) return (
    <div style={{height:H,display:"flex",alignItems:"center",justifyContent:"center",color:T.textDim,fontSize:12}}>Insufficient data</div>
  );
  const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
  const vari=returns.reduce((s,r)=>s+Math.pow(r-mean,2),0)/(returns.length-1);
  const std=Math.sqrt(vari)||0.001;
  const PAD=20,xMin=mean-3.5*std,xMax=mean+3.5*std;
  const xS=x=>PAD+(x-xMin)/(xMax-xMin)*(W-2*PAD);
  const nPDF=x=>(1/(std*Math.sqrt(2*Math.PI)))*Math.exp(-0.5*Math.pow((x-mean)/std,2));
  const steps=80,pts=[];
  for(let i=0;i<=steps;i++){const x=xMin+(i/steps)*(xMax-xMin);pts.push({x,y:nPDF(x)});}
  const yMax=nPDF(mean)*1.1,yS=y=>H-PAD-(y/yMax)*(H-2*PAD);
  const pathD="M "+pts.map(p=>`${xS(p.x).toFixed(1)},${yS(p.y).toFixed(1)}`).join(" L ");
  const fill=pathD+` L ${xS(xMax).toFixed(1)},${(H-PAD).toFixed(1)} L ${xS(xMin).toFixed(1)},${(H-PAD).toFixed(1)} Z`;
  const bins=Array(14).fill(0);const bW=(xMax-xMin)/14;
  returns.forEach(r=>{const b=Math.floor((r-xMin)/bW);if(b>=0&&b<14)bins[b]++;});
  const maxB=Math.max(...bins)||1,bSW=(W-2*PAD)/14;
  const m0=xS(mean),mp1=xS(mean+std),mn1=xS(mean-std),mp2=xS(mean+2*std),mn2=xS(mean-2*std);
  const uid=`bc${color.replace("#","").slice(0,4)}${Math.floor(Math.random()*999)}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <rect x={mn1} y={PAD} width={mp1-mn1} height={H-2*PAD} fill={color} fillOpacity="0.08"/>
      <rect x={mn2} y={PAD} width={mp2-mn2} height={H-2*PAD} fill={color} fillOpacity="0.03"/>
      {bins.map((b,i)=>{const bx=PAD+i*bSW,bh=((b/maxB)*(H-2*PAD))*0.8;return <rect key={i} x={bx+1} y={H-PAD-bh} width={bSW-2} height={bh} fill={color} fillOpacity="0.35" rx="1"/>;} )}
      <path d={fill} fill={`url(#${uid})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke={T.border} strokeWidth="1"/>
      {[{x:mn1,l:"-1σ"},{x:m0,l:"μ"},{x:mp1,l:"+1σ"}].map(({x,l})=>(
        <g key={l}>
          <line x1={x} y1={PAD+4} x2={x} y2={H-PAD} stroke={l==="μ"?color:T.border2} strokeWidth={l==="μ"?"1.5":"1"} strokeDasharray={l==="μ"?"none":"3,3"}/>
          <text x={x} y={H-PAD+12} textAnchor="middle" fontSize="9" fill={l==="μ"?color:T.textDim} fontFamily={T.mono}>{l}</text>
        </g>
      ))}
      <text x={PAD+2} y={PAD+12} fontSize="10" fill={color} fontFamily={T.mono}>μ={(mean>=0?"+":"")+(mean*100).toFixed(2)}%</text>
      <text x={W-PAD-2} y={PAD+12} fontSize="10" fill={T.textDim} textAnchor="end" fontFamily={T.mono}>σ={(std*100).toFixed(2)}%</text>
    </svg>
  );
}

function SharpeGauge({value,baseline}) {
  const T = useThemeTokens();
  const norm=(Math.max(-1,Math.min(2,value))+1)/3;
  const color=value<0?T.red:value<0.5?T.amber:value<1?T.accent:T.green;
  const label=value<0?"Negative":value<0.5?"Sub-par":value<1?"Acceptable":"Excellent";
  return (
    <div style={{background:T.bg,borderRadius:10,padding:"16px 18px",border:`1px solid ${color}33`}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:T.textDim,textTransform:"uppercase",marginBottom:6,fontFamily:T.sans}}>Sharpe Ratio</div>
      <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}>
        <div style={{fontSize:40,fontWeight:700,color,fontFamily:T.mono,lineHeight:1}}>{value.toFixed(3)}</div>
        <div style={{fontSize:12,color,fontWeight:600,fontFamily:T.sans}}>{label}</div>
      </div>
      <Bar value={norm} color={color} h={5}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textDim,marginTop:6,fontFamily:T.mono}}>
        <span>−1</span>
        <span>RFR {(KENYA_RFR*100).toFixed(2)}% (CBK 91-d)</span>
        <span>+2</span>
      </div>
      {baseline && <div style={{fontSize:10,color:T.textDim,marginTop:4,fontFamily:T.mono}}>Sector baseline: {baseline.toFixed(2)}</div>}
    </div>
  );
}

function PartyForm({title,party,color,onChange}) {
  const T = useThemeTokens();
  const fields=[
    {k:"fullName",label:"Full Legal Name / Organisation",placeholder:"e.g. Nairobi City County Government",full:true},
    {k:"kraPin",label:"KRA PIN",placeholder:"e.g. P051234567X",full:false},
    {k:"phone",label:"Phone",placeholder:"+254 700 000 000",full:false},
    {k:"email",label:"Email",placeholder:"procurement@example.co.ke",full:false},
    {k:"address",label:"Registered Address",placeholder:"Haile Selassie Ave, Nairobi",full:true},
    {k:"repName",label:"Authorised Rep.",placeholder:"Full name of signatory",full:false},
    {k:"repTitle",label:"Rep. Title",placeholder:"Procurement Director",full:false},
  ];
  return (
    <div style={{background:T.bg,borderRadius:10,padding:18,border:`1px solid ${color}33`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{background:`${color}22`,color,padding:"3px 10px",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:T.sans}}>{title.toUpperCase()}</span>
      </div>
      <div className="crp-party-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {fields.map(f=>(
          <div key={f.k} style={{gridColumn:f.full?"1/-1":"auto"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:0.8,color:T.textDim,textTransform:"uppercase",marginBottom:5,fontFamily:T.sans}}>{f.label}</div>
            <input
              type="text" placeholder={f.placeholder} value={party[f.k]||""}
              onChange={e=>onChange(f.k,e.target.value)}
              style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,padding:"8px 10px",fontSize:13,fontFamily:T.mono,outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.2s"}}
              onFocus={e=>e.target.style.borderColor=color}
              onBlur={e=>e.target.style.borderColor=T.border}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CRPEngine() {
  const [durMode,setDurMode]         = useState("manual");
  const [manDays,setManDays]         = useState(365);
  const [manDaysIn,setManDaysIn]     = useState("365");
  const [startDate,setStartDate]     = useState(()=>new Date().toISOString().slice(0,10));
  const [endDate,setEndDate]         = useState(()=>{const d=new Date();d.setFullYear(d.getFullYear()+1);return d.toISOString().slice(0,10);});
  const [presetMo,setPresetMo]       = useState(12);
  const presetOpts=[{label:"1 Month",mo:1},{label:"3 Months",mo:3},{label:"6 Months",mo:6},{label:"1 Year",mo:12},{label:"2 Years",mo:24},{label:"3 Years",mo:36},{label:"5 Years",mo:60}];
  const [lbMode,setLbMode]           = useState("auto");
  const [manLb,setManLb]             = useState(90);
  const [activeSec,setActiveSec]     = useState(null);
  const [cfgPrimary,setCfgPrimary]   = useState(null);
  const [cfgCombine,setCfgCombine]   = useState(false);
  const [cfgSecondary,setCfgSecondary]= useState("health");
  const [combineWt,setCombineWt]     = useState(60);
  const [customWts,setCustomWts]     = useState(()=>{const w={};Object.entries(SECTORS).forEach(([sid,s])=>{w[sid]={...s.weights};});return w;});
  const [contractVal,setContractVal] = useState(null);
  const [contractValIn,setContractValIn]= useState("");
  const [obligee,setObligee]         = useState({});
  const [obligor,setObligor]         = useState({});
  const [refCode,setRefCode]         = useState(null);
  const [codeGen,setCodeGen]         = useState(false);
  const [secTabLb,setSecTabLb]       = useState(90);
  const [secTabLbMode,setSecTabLbMode]= useState("auto");
  const [secTabRes,setSecTabRes]     = useState(null);
  const [trackCode,setTrackCode]     = useState("");
  const [trackResult,setTrackResult] = useState(null);
  const [trackLoading,setTrackLoading]= useState(false);
  const [trackError,setTrackError]   = useState("");
  const [activeTab,setActiveTab]     = useState("dashboard");
  const [inflView,setInflView]       = useState("overall");
  const [reportsTab,setReportsTab]   = useState("inflation");
  const [sectorResults,setSectorResults]= useState({});
  const [lastRefresh,setLastRefresh] = useState(null);
  const [animKey,setAnimKey]         = useState(0);
  const [sectorQuery,setSectorQuery] = useState("");
  const [configStep,setConfigStep]   = useState(1);
  const [toast,setToast]             = useState("");
  const [sortBy,setSortBy]           = useState("price");
  const [sortDir,setSortDir]         = useState("desc");
  const [confirmDialog,setConfirmDialog]=useState(null);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  const [colorMode,setColorMode]=useState(()=>{
    try{const s=localStorage.getItem("crp-color-mode");return s==="light"?"light":"dark";}catch{return"dark";}
  });
  const T = THEMES[colorMode];

  const contractDays = useMemo(()=>{
    if(durMode==="preset") return presetMo*30.44;
    if(durMode==="dates"){const s=new Date(startDate),e=new Date(endDate);return Math.max(1,Math.round((e-s)/86400000));}
    return Math.max(1,manDays);
  },[durMode,presetMo,manDays,startDate,endDate]);
  const contractMonths = contractDays/30.44;

  const lbRec = useMemo(()=>recLookback(contractDays,cfgPrimary||"construction"),[contractDays,cfgPrimary]);
  const effectiveLb = lbMode==="auto"?lbRec.rec:manLb;
  const sm = stressMult(contractDays);

  const runEngine = useCallback(()=>{
    const res={};
    Object.keys(SECTORS).forEach(sid=>{res[sid]=runSector(sid,effectiveLb,contractDays,customWts[sid]||SECTORS[sid].weights);});
    setSectorResults(res);setLastRefresh(new Date().toLocaleTimeString());setAnimKey(k=>k+1);
    setCodeGen(false);setRefCode(null);
  },[effectiveLb,contractDays,customWts]);

  useEffect(()=>{runEngine();},[runEngine]);

  useEffect(()=>{
    if(!activeSec) return;
    const r=recLookback(contractDays,activeSec);
    const lb=secTabLbMode==="auto"?r.rec:secTabLb;
    setSecTabRes(runSector(activeSec,lb,contractDays,customWts[activeSec]||SECTORS[activeSec].weights));
  },[activeSec,secTabLb,secTabLbMode,contractDays,customWts]);

  const combinedCRP = useMemo(()=>{
    if(!cfgCombine||!sectorResults[cfgPrimary]||!sectorResults[cfgSecondary]) return null;
    const p=sectorResults[cfgPrimary].crp,s=sectorResults[cfgSecondary].crp,pw=combineWt/100,sw=1-pw;
    return{vol:parseFloat((p.vol*pw+s.vol*sw).toFixed(2)),infl:parseFloat((p.infl*pw+s.infl*sw).toFixed(2)),total:parseFloat((p.total*pw+s.total*sw).toFixed(2))};
  },[cfgCombine,cfgPrimary,cfgSecondary,combineWt,sectorResults]);

  const sec       = cfgPrimary?SECTORS[cfgPrimary]:null;
  const sRes      = cfgPrimary?sectorResults[cfgPrimary]:null;
  const latestCPI = KNBS_CPI[KNBS_CPI.length-1];
  const ufIdx     = useMemo(()=>buildUF(sec?sec.inflationKey:"overall"),[sec]);
  const ufLatest  = ufIdx[ufIdx.length-1];
  const ufErosion = ufLatest?(ufLatest.erosion*(contractMonths/24)):0;
  const activeCRP = cfgCombine&&combinedCRP?combinedCRP:(sRes?sRes.crp:null);
  const crpPct    = activeCRP?activeCRP.total:0;
  const secCPI    = sRes?sRes.cpi:(sec?latestCPI[sec.inflationKey]||latestCPI.overall:latestCPI.overall);
  const ratio     = useMemo(()=>contractVal&&activeCRP?computeRatio(contractVal,crpPct,ufErosion,secCPI,contractDays):null,[contractVal,activeCRP,crpPct,ufErosion,secCPI,contractDays]);
  const sWeights  = customWts[cfgPrimary]||(sec?sec.weights:{});
  const totalW    = Object.values(sWeights).reduce((a,b)=>a+b,0);
  const canGen    = cfgPrimary&&contractVal&&ratio&&(obligee.fullName||obligor.fullName);
  const secTabSec = activeSec?SECTORS[activeSec]:null;
  const secTabRec = activeSec?recLookback(contractDays,activeSec):{rec:90};
  const secTabEffLb = secTabLbMode==="auto"?secTabRec.rec:secTabLb;

  const filteredSectorEntries = useMemo(()=>{
    const q=sectorQuery.trim().toLowerCase();
    if(!q) return Object.entries(SECTORS);
    return Object.entries(SECTORS).filter(([,s])=>s.label.toLowerCase().includes(q)||s.description.toLowerCase().includes(q));
  },[sectorQuery]);

  const sortedCommodityRows = useMemo(()=>{
    if(!secTabRes) return [];
    const rows=Object.entries(secTabRes.cr);
    const dir=sortDir==="asc"?1:-1;
    return rows.sort((a,b)=>{
      const av=sortBy==="price"?a[1].comm.price:sortBy==="vol"?a[1].hist:a[1].sharpe;
      const bv=sortBy==="price"?b[1].comm.price:sortBy==="vol"?b[1].hist:b[1].sharpe;
      return (av-bv)*dir;
    });
  },[secTabRes,sortBy,sortDir]);

  async function handleGenCode() {
    if(!canGen) return;
    const code=genRefCode(cfgPrimary,contractDays);
    setRefCode(code);setCodeGen(true);
    const snap={code,generatedAt:new Date().toISOString(),sector:cfgPrimary,sectorLabel:SECTORS[cfgPrimary].label,obligee:{...obligee},obligor:{...obligor},contractValue:contractVal,contractDays,contractMonths,originalCRP:crpPct,originalVol:activeCRP?activeCRP.vol:0,originalInfl:activeCRP?activeCRP.infl:0,originalSectorCPI:secCPI,ufErosionAtAward:ufErosion,originalAdjustedPayment:ratio?ratio.adjPay:contractVal,ratioSup:ratio?ratio.ratioSup:0.5,ratioCli:ratio?ratio.ratioCli:0.5,lookback:effectiveLb,endDate:durMode==="dates"?endDate:new Date(Date.now()+contractDays*86400000).toISOString().slice(0,10)};
    await storageSave("crp:"+code,snap);
    setToast("Reference code generated and saved.");
  }

  async function handleTrack() {
    const code=trackCode.trim().toUpperCase();
    if(!code){setTrackError("Please enter a reference code.");return;}
    setTrackLoading(true);setTrackError("");setTrackResult(null);
    const saved=await storageLoad("crp:"+code);
    if(!saved){setTrackLoading(false);setTrackError("No contract found for: "+code);return;}
    const sid=saved.sector;
    if(!SECTORS[sid]){setTrackLoading(false);setTrackError("Unknown sector in saved contract.");return;}
    const curRes=runSector(sid,saved.lookback||90,saved.contractDays,SECTORS[sid].weights);
    const curUF=buildUF(SECTORS[sid].inflationKey);
    const curUFLatest=curUF[curUF.length-1];
    const elapsed=Math.round((new Date()-new Date(saved.generatedAt))/86400000);
    const curUFEr=curUFLatest.erosion*(saved.contractMonths/24);
    const curRatio=computeRatio(saved.contractValue,curRes.crp.total,curUFEr,curRes.cpi,saved.contractDays);
    const payDelta=curRatio.adjPay-saved.originalAdjustedPayment;
    const payDeltaPct=saved.originalAdjustedPayment>0?(payDelta/saved.originalAdjustedPayment)*100:0;
    setTrackResult({...saved,curCRP:curRes.crp,curSectorCPI:curRes.cpi,curUFEr,curAdjPay:curRatio.adjPay,curMktPay:curRatio.mktPay,elapsed,payDelta,payDeltaPct,curRatio,curSharpe:curRes.sectSharpe});
    setTrackLoading(false);
  }

  async function handleCopyRefCode() {
    if(!refCode) return;
    try{await navigator.clipboard.writeText(refCode);setToast("Code copied to clipboard.");}catch(e){}
  }

  function performClearConfigure() {
    const w={};
    Object.entries(SECTORS).forEach(([sid,s])=>{w[sid]={...s.weights};});
    const dEnd=new Date();dEnd.setFullYear(dEnd.getFullYear()+1);
    setObligee({});
    setObligor({});
    setCfgPrimary(null);
    setActiveSec(null);
    setCfgCombine(false);
    setCfgSecondary("health");
    setCombineWt(60);
    setCustomWts(w);
    setContractVal(null);
    setContractValIn("");
    setRefCode(null);
    setCodeGen(false);
    setDurMode("manual");
    setManDays(365);
    setManDaysIn("365");
    setPresetMo(12);
    setStartDate(new Date().toISOString().slice(0,10));
    setEndDate(dEnd.toISOString().slice(0,10));
    setLbMode("auto");
    setManLb(90);
    setConfigStep(1);
    setSecTabRes(null);
    setToast("Configure form cleared.");
  }

  function performResetWeights() {
    const r={};
    Object.entries(SECTORS).forEach(([sid,s])=>{r[sid]={...s.weights};});
    setCustomWts(r);
    setToast("Commodity weights reset to defaults.");
  }

  const confirmDialogCopy={
    clearConfigure:{
      title:"Clear configure form?",
      message:"Parties, sector, duration, lookback, contract value, cross-sector blend, commodity weights, and reference code will all return to defaults. Saved contracts on the Track tab are not removed.",
      confirmLabel:"Clear all fields",
      variant:"danger",
    },
    resetWeights:{
      title:"Reset commodity weights?",
      message:"Every sector’s commodity weights go back to the built-in defaults (totalling 100% per sector). Your current weight edits will be lost.",
      confirmLabel:"Reset to defaults",
      variant:"danger",
    },
  };

  function handleConfirmDialogAction() {
    if(!confirmDialog) return;
    if(confirmDialog.id==="clearConfigure") performClearConfigure();
    else if(confirmDialog.id==="resetWeights") performResetWeights();
    setConfirmDialog(null);
  }

  useEffect(()=>{
    if(!confirmDialog) return;
    const onKey=e=>{if(e.key==="Escape")setConfirmDialog(null);};
    window.addEventListener("keydown",onKey);
    const prev=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=prev;};
  },[confirmDialog]);

  useEffect(()=>{
    if(!toast) return;
    const t=setTimeout(()=>setToast(""),2500);
    return ()=>clearTimeout(t);
  },[toast]);

  useEffect(()=>{
    try{localStorage.setItem("crp-color-mode",colorMode);}catch{}
  },[colorMode]);

  useEffect(()=>{
    const onResize=()=>{if(window.innerWidth>900)setMobileNavOpen(false);};
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  useEffect(()=>{
    if(!mobileNavOpen)return;
    if(typeof window.matchMedia==="function"&&!window.matchMedia("(max-width:900px)").matches)return;
    const prev=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=prev;};
  },[mobileNavOpen]);

  // ─── NAV CONFIG ──────────────────────────────────────────────────────────────
  const navItems = [
    {id:"dashboard",label:"Dashboard",icon:"◉"},
    {id:"configure",label:"Configure",icon:"◈"},
    {id:"analyze",  label:"Analyze",  icon:"◫"},
    {id:"track",    label:"Track",    icon:"◎"},
    {id:"reports",  label:"Reports",  icon:"◐"},
  ];

  const stepMeta=[
    {n:1,label:"Parties",    done:()=>!!(obligee.fullName||obligor.fullName)},
    {n:2,label:"Sector",     done:()=>!!cfgPrimary},
    {n:3,label:"Duration",   done:()=>contractDays>0},
    {n:4,label:"Lookback",   done:()=>effectiveLb>0},
    {n:5,label:"Value",      done:()=>!!contractVal},
    {n:6,label:"Compare",    done:()=>!!contractVal&&!!activeCRP},
    {n:7,label:"Ratio",      done:()=>!!ratio},
    {n:8,label:"Reference",  done:()=>!!refCode},
  ];

  // ─── STYLE HELPERS ────────────────────────────────────────────────────────────
  const card     = (extra={}) => ({background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"var(--crp-card-pad,24px)",marginBottom:20,...extra});
  const cardHL   = (color,extra={}) => ({background:T.surface,border:`1px solid ${color}44`,borderTop:`2px solid ${color}`,borderRadius:12,padding:"var(--crp-card-pad,24px)",marginBottom:20,...extra});
  const label    = {fontSize:10,fontWeight:700,letterSpacing:1.5,color:T.textDim,textTransform:"uppercase",marginBottom:8,fontFamily:T.sans};
  const bigNum   = (color=T.text) => ({fontSize:36,fontWeight:700,color,fontFamily:T.mono,lineHeight:1,letterSpacing:"-0.5px"});
  const section  = {fontSize:16,fontWeight:700,color:T.text,marginBottom:16,paddingBottom:10,borderBottom:`1px solid ${T.border}`,fontFamily:T.sans,letterSpacing:"-0.2px"};
  const g2       = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:16,marginBottom:20};
  const g3       = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:14,marginBottom:20};
  const g4       = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:12,marginBottom:20};

  const sel = {
    background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,
    color:T.text,padding:"10px 12px",fontSize:13,fontFamily:T.mono,
    cursor:"pointer",outline:"none",width:"100%",
  };
  const inp = {
    background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,
    color:T.text,padding:"10px 12px",fontSize:13,fontFamily:T.mono,outline:"none",
  };
  const btn = (active, color=T.accent) => ({
    background:active?`${color}18`:"transparent",
    border:`1px solid ${active?color:T.border}`,
    borderRadius:8,color:active?color:T.textMid,
    padding:"9px 16px",fontSize:13,fontWeight:600,
    cursor:"pointer",fontFamily:T.sans,
    transition:"all 0.15s ease",letterSpacing:"0.2px",
  });
  const tBtn = (active, color) => ({
    background:active?`${color}22`:"transparent",
    border:`1px solid ${active?color:T.border}`,
    borderRadius:8,color:active?color:T.textMid,
    padding:"8px 14px",fontSize:13,fontWeight:600,
    cursor:"pointer",fontFamily:T.sans,transition:"all 0.15s ease",
  });

  const alertBox = (type) => ({
    background:type==="w"?T.amberDim:type==="g"?T.greenDim:type==="r"?T.redDim:`${T.accent}10`,
    border:`1px solid ${type==="w"?T.amber:type==="g"?T.green:type==="r"?T.red:T.accent}`,
    borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,
    color:type==="w"?T.amber:type==="g"?T.green:type==="r"?T.red:T.accent,
    lineHeight:1.6,fontFamily:T.sans,
  });

  const crpColor = (v) => v < 5 ? T.green : v < 12 ? T.amber : T.red;

  return (
    <ThemeCtx.Provider value={T}>
    <div style={{fontFamily:T.sans,background:T.bg,color:T.text,minHeight:"100vh",fontSize:14,lineHeight:1.6}}>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 ${T.accent}44}50%{box-shadow:0 0 20px 3px ${T.accent}44}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .fade-in{animation:fadeUp 0.3s ease forwards}
        .code-glow{animation:glow 3s ease-in-out infinite}
        .live-dot{animation:pulse 2s ease-in-out infinite}
        input,select,textarea{font-family:inherit;font-size:inherit;}
        select option{background:${T.surface2};}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:3px}
        button:hover:not(:disabled){opacity:0.88;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.3)}
        button:active:not(:disabled){opacity:1;transform:translateY(0);box-shadow:none}
        button:disabled{cursor:not-allowed;opacity:0.4}
        input:focus,select:focus{border-color:${T.accent}!important;box-shadow:0 0 0 2px ${T.accent}22;outline:none;}
        .sector-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4)!important}
        .nav-btn:hover{background:${T.surface2}!important;border-color:${T.border2}!important}
        .nav-btn-active{background:${T.accentDim}!important;border-color:${T.accent}!important;color:${T.accent}!important}
        button,a[role="button"]{touch-action:manipulation}
        /* ── card padding via custom property ── */
        :root{--crp-card-pad:24px}
        /* ── prevent iOS auto-zoom on focus ── */
        input,select,textarea{font-size:max(16px,1em)!important;}
        /* ── mobile topbar / sidebar drawer ── */
        .crp-mobile-topbar{display:none}
        .crp-nav-backdrop{display:none}
        .crp-page-header{display:flex}
        /* ── tablet (≤900px) ── */
        @media(max-width:900px){
          .crp-app-grid{grid-template-columns:1fr!important}
          .crp-mobile-topbar{
            display:flex!important;align-items:center;gap:10px;
            position:fixed;left:0;right:0;top:0;z-index:10002;
            min-height:56px;padding:0 14px;
            padding-top:env(safe-area-inset-top,0px);
            border-bottom:1px solid ${T.border};
            background:${T.surface};
            box-shadow:0 2px 16px rgba(0,0,0,0.15);
          }
          .crp-main{padding-top:calc(56px + env(safe-area-inset-top,0px) + 6px)!important;padding-left:16px!important;padding-right:16px!important;padding-bottom:max(24px,env(safe-area-inset-bottom,0px))!important}
          .crp-page-header{display:none!important}
          .sidebar{
            position:fixed!important;left:0;top:0;
            width:min(300px,88vw)!important;max-width:320px;
            height:100vh!important;height:100dvh!important;
            z-index:10003!important;
            transform:translate3d(-105%,0,0);
            transition:transform 0.26s cubic-bezier(0.4,0,0.2,1);
            display:flex!important;
            box-shadow:8px 0 40px rgba(0,0,0,0.35);
            padding-top:max(20px,env(safe-area-inset-top,0px))!important;
          }
          .sidebar.sidebar--open{transform:translate3d(0,0,0)}
          .sidebar button{min-height:48px!important}
          .crp-nav-backdrop.crp-nav-backdrop--show{
            display:block!important;position:fixed;inset:0;z-index:10001;
            background:rgba(0,0,0,0.55);-webkit-tap-highlight-color:transparent;
          }
          .crp-toast{left:12px!important;right:12px!important;bottom:max(20px,env(safe-area-inset-bottom,0px))!important;width:auto!important}
          :root{--crp-card-pad:18px}
          button,.crp-btn{min-height:44px}
          .crp-cfg-stickybg{top:calc(56px + env(safe-area-inset-top,0px))!important;box-shadow:0 4px 16px rgba(0,0,0,0.32)!important;border-radius:0 0 10px 10px!important}
        }
        /* ── mobile (≤640px) ── */
        @media(max-width:640px){
          :root{--crp-card-pad:14px}
          .crp-g2,.crp-g3,.crp-g4{grid-template-columns:1fr!important;gap:12px!important}
          .crp-party-grid{grid-template-columns:1fr!important}
          .crp-text-2col{grid-template-columns:1fr!important}
          .crp-grid-4{grid-template-columns:1fr!important}
          .crp-grid-3{grid-template-columns:1fr!important}
          .crp-bell-grid{grid-template-columns:1fr!important}
          .crp-config-date-grid{grid-template-columns:1fr!important}
          .crp-welcome-steps{grid-template-columns:1fr!important}
          .crp-sector-tiles{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
          .crp-analyze-metrics{flex-wrap:wrap!important;width:100%!important;justify-content:flex-start!important;gap:12px!important}
          .crp-progress-summary{grid-template-columns:1fr 1fr!important}
          .crp-report-uf-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
          .crp-card{padding:14px!important}
          .crp-wt-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
          .crp-step-nav{flex-direction:column!important;gap:10px!important}
          .crp-step-nav button{width:100%!important;justify-content:center!important}
          .crp-prev-next{flex-direction:row!important}
          .crp-prev-next button{flex:1!important;justify-content:center!important}
          .crp-track-form{flex-direction:column!important}
          .crp-track-form>div{width:100%!important}
          .crp-track-form>button{width:100%!important;justify-content:center!important}
          .crp-cpi-tabs{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:4px!important}
          .crp-cpi-tabs button{text-align:center!important;padding:7px 4px!important;font-size:11px!important}
          .crp-rank-col-hide{display:none!important}
          .crp-welcome-banner{flex-direction:column!important;gap:12px!important}
          .crp-welcome-banner>div:first-child{display:none}
        }
        /* ── tablet only (641–900) ── */
        @media(max-width:900px) and (min-width:641px){
          .crp-grid-4{grid-template-columns:repeat(2,1fr)!important}
          .crp-wt-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
          .crp-cpi-tabs{flex-wrap:wrap!important}
        }
        /* ── step pills: horizontal scroll on narrow ── */
        .crp-step-pills{display:flex;gap:5px;flex-wrap:wrap}
        @media(max-width:700px){
          .crp-step-pills{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:6px;gap:6px;scrollbar-width:thin}
          .crp-step-pills>button{flex:0 0 auto}
        }
        .crp-table-scroll{-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="crp-toast" style={{position:"fixed",bottom:24,right:24,background:T.surface2,border:`1px solid ${T.green}`,borderRadius:10,color:T.green,padding:"10px 16px",zIndex:9999,fontSize:13,fontFamily:T.sans,display:"flex",alignItems:"center",gap:8,boxShadow:`0 8px 24px ${T.bg}`}}>
          <span>✓</span> {toast}
        </div>
      )}

      {/* Confirmation dialog (replaces browser confirm) */}
      {confirmDialog && (()=>{
        const cfg=confirmDialogCopy[confirmDialog.id];
        const isDanger=cfg.variant==="danger";
        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crp-confirm-title"
            aria-describedby="crp-confirm-desc"
            style={{position:"fixed",inset:0,zIndex:10060,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
            onClick={e=>{if(e.target===e.currentTarget)setConfirmDialog(null);}}
          >
            <div
              className="fade-in"
              style={{
                width:"100%",maxWidth:440,background:T.surface,border:`1px solid ${isDanger?`${T.red}55`:T.border2}`,
                borderRadius:14,boxShadow:"0 24px 48px rgba(0,0,0,0.45)",padding:"22px 24px 20px",
              }}
              onClick={e=>e.stopPropagation()}
            >
              <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
                <div style={{
                  width:44,height:44,borderRadius:12,flexShrink:0,
                  background:isDanger?T.redDim:`${T.accent}18`,
                  border:`1px solid ${isDanger?`${T.red}44`:`${T.accent}44`}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:20,
                }}>{isDanger?"⚠":"?"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <h2 id="crp-confirm-title" style={{margin:0,fontSize:18,fontWeight:800,color:T.text,fontFamily:T.sans,lineHeight:1.25,letterSpacing:"-0.02em"}}>{cfg.title}</h2>
                  <p id="crp-confirm-desc" style={{margin:"10px 0 0",fontSize:14,color:T.textMid,lineHeight:1.55,fontFamily:T.sans}}>{cfg.message}</p>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:10,flexWrap:"wrap",paddingTop:4,borderTop:`1px solid ${T.border}`}}>
                <button type="button" onClick={()=>setConfirmDialog(null)} style={{...btn(false),padding:"10px 18px",fontSize:13,minHeight:44}}>
                  Cancel
                </button>
                <button type="button" onClick={handleConfirmDialogAction} style={{
                  ...btn(true,isDanger?T.red:T.accent),
                  padding:"10px 20px",fontSize:13,minHeight:44,fontWeight:700,
                  borderColor:isDanger?T.red:T.accent,
                  background:isDanger?T.redDim:`${T.accent}22`,
                  color:isDanger?T.red:T.accent,
                }}>
                  {cfg.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {mobileNavOpen && (
        <div className="crp-nav-backdrop crp-nav-backdrop--show" onClick={()=>setMobileNavOpen(false)} aria-hidden="true"/>
      )}

      <div
        className="crp-mobile-topbar"
        style={{background:T.surface,color:T.text,fontFamily:T.sans}}
      >
        <button
          type="button"
          className="nav-btn"
          aria-expanded={mobileNavOpen}
          aria-controls="crp-sidebar-nav"
          onClick={()=>setMobileNavOpen(o=>!o)}
          style={{...btn(false),minWidth:48,minHeight:48,padding:0,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10}}
        >
          {mobileNavOpen?"✕":"☰"}
        </button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:800,color:T.accent,letterSpacing:0.3}}>CRP Engine</div>
          <div style={{fontSize:12,color:T.textMid,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {navItems.find(i=>i.id===activeTab)?.label ?? "Menu"}
          </div>
        </div>
      </div>

      <div className="app-grid crp-app-grid" style={{maxWidth:1440,margin:"0 auto",display:"grid",gridTemplateColumns:"220px 1fr",minHeight:"100vh"}}>

        {/* ═══ SIDEBAR ═══ */}
        <aside id="crp-sidebar-nav" className={`sidebar ${mobileNavOpen?"sidebar--open":""}`} style={{background:T.surface,borderRight:`1px solid ${T.border}`,padding:"20px 14px",position:"sticky",top:0,height:"100vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:0}}>
          {/* Brand */}
          <div style={{marginBottom:24,padding:"0 2px"}}>
            <div style={{fontSize:18,fontWeight:800,color:T.accent,letterSpacing:"-0.3px",fontFamily:T.sans}}>CRP Engine</div>
            <div style={{fontSize:11,color:T.textDim,letterSpacing:0.5,fontFamily:T.mono,marginTop:2}}>Kenya · Apr 2026</div>
          </div>

          {/* Contract status mini-strip */}
          <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",marginBottom:18,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.textDim,fontFamily:T.sans,marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>Contract Status</div>
            {[
              {label:"Sector", value: cfgPrimary ? `${SECTORS[cfgPrimary].icon} ${SECTORS[cfgPrimary].label.split(" ")[0]}` : "Not set", done: !!cfgPrimary},
              {label:"Value",  value: contractVal ? `KES ${fmt(contractVal)}` : "Not set", done: !!contractVal},
              {label:"CRP",    value: activeCRP ? `${activeCRP.total.toFixed(2)}%` : "—", done: !!activeCRP},
            ].map(row=>(
              <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:11,color:T.textDim,fontFamily:T.sans}}>{row.label}</span>
                <span style={{fontSize:11,fontWeight:600,color:row.done?T.text:T.textDim,fontFamily:T.mono,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Nav */}
          <nav style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
            {navItems.map(item=>{
              const isActive = activeTab===item.id;
              const badge =
                item.id==="configure" && cfgPrimary && contractVal ? "✓" :
                item.id==="analyze"   && activeSec ? SECTORS[activeSec].icon :
                item.id==="track"     && trackResult ? "●" : null;
              return (
                <button key={item.id}
                  type="button"
                  onClick={()=>{setActiveTab(item.id);setMobileNavOpen(false);}}
                  className={isActive?"nav-btn nav-btn-active":"nav-btn"}
                  style={{
                    background: isActive ? T.accentDim : "transparent",
                    border: `1px solid ${isActive ? T.accent : "transparent"}`,
                    borderRadius:8, color: isActive ? T.accent : T.textMid,
                    padding:"9px 12px", fontSize:13, fontWeight: isActive?700:500,
                    cursor:"pointer", fontFamily:T.sans,
                    display:"flex", alignItems:"center", gap:10,
                    textAlign:"left", justifyContent:"flex-start",
                    transition:"all 0.15s ease",
                  }}>
                  <span style={{fontSize:15,opacity:isActive?1:0.6}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  {badge && <span style={{fontSize:11,fontFamily:T.mono,color:isActive?T.accent:T.green,opacity:0.9}}>{badge}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12,marginTop:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <span className="live-dot" style={{width:7,height:7,borderRadius:"50%",background:T.green,display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:11,color:T.textDim,fontFamily:T.mono}}>{lastRefresh||"—"}</span>
            </div>
            <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono,lineHeight:1.7,marginBottom:8}}>
              RFR: {(KENYA_RFR*100).toFixed(2)}%<br/>
              EPRA · KNBS · CBK
            </div>
            <div style={{fontSize:10,color:T.textDim,fontFamily:T.sans,marginBottom:6,letterSpacing:0.4,textTransform:"uppercase"}}>Appearance</div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <button type="button" aria-pressed={colorMode==="dark"} onClick={()=>setColorMode("dark")}
                style={{...btn(colorMode==="dark",T.accent),flex:1,minHeight:44,fontSize:12,padding:"8px 6px"}}>🌙 Dark</button>
              <button type="button" aria-pressed={colorMode==="light"} onClick={()=>setColorMode("light")}
                style={{...btn(colorMode==="light",T.accent),flex:1,minHeight:44,fontSize:12,padding:"8px 6px"}}>☀ Light</button>
            </div>
            <button style={{...btn(false),width:"100%",fontSize:12,padding:"7px 10px"}} onClick={runEngine}>↺ Refresh Data</button>
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="crp-main" style={{padding:24,overflowY:"auto"}}>

          {/* Header */}
          <div className="crp-page-header" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 20px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:11,color:T.textDim,fontFamily:T.mono,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>
                {["dashboard","configure","analyze","track","reports"].includes(activeTab)
                  ? `CRP Engine / ${activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}`
                  : "CRP Engine"}
              </div>
              <div style={{fontSize:18,fontWeight:800,color:T.text,letterSpacing:"-0.2px",fontFamily:T.sans,lineHeight:1.2,display:"flex",flexWrap:"wrap",alignItems:"baseline",gap:"6px 10px"}}>
                {activeTab==="dashboard"?"Economy-Wide Risk Overview"
                 :activeTab==="configure"?"Configure Contract"
                 :activeTab==="analyze"?"Sector Deep-Dive"
                 :activeTab==="track"?"Contract Monitoring"
                 :"Reports & Indices"}
                {activeTab==="analyze"&&activeSec && <span style={{fontSize:14,fontWeight:500,color:T.textMid}}>{SECTORS[activeSec].icon} {SECTORS[activeSec].label}</span>}
              </div>
              <div style={{fontSize:11,color:T.textDim,fontFamily:T.mono,marginTop:3}}>KNBS · EPRA · CBK · KEBS · KEMSA — Real Market Prices</div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              {refCode && (
                <div style={{fontSize:12,color:T.accent,background:T.accentDim,border:`1px solid ${T.accent}55`,borderRadius:8,padding:"6px 12px",fontFamily:T.mono,letterSpacing:1.2,cursor:"pointer"}}
                  onClick={handleCopyRefCode} title="Click to copy">
                  {refCode}
                </div>
              )}
              {activeCRP && cfgPrimary && (
                <div style={{background:`${crpColor(activeCRP.total)}12`,border:`2px solid ${crpColor(activeCRP.total)}44`,borderRadius:10,padding:"8px 16px",textAlign:"center",minWidth:80}}>
                  <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono,letterSpacing:1}}>CRP</div>
                  <div style={{fontSize:20,fontWeight:800,color:crpColor(activeCRP.total),fontFamily:T.mono,letterSpacing:"-0.5px"}}>{activeCRP.total.toFixed(2)}%</div>
                  <div style={{fontSize:9,color:T.textDim,fontFamily:T.mono}}>{SECTORS[cfgPrimary].label.split(" ")[0]}</div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ DASHBOARD ═══ */}
          {activeTab==="dashboard" && (
            <div key={animKey} className="fade-in">
              {!cfgPrimary && (
                <div className="crp-welcome-banner" style={{background:`${T.accent}08`,border:`1px solid ${T.accent}33`,borderRadius:12,padding:"20px 24px",marginBottom:20,display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
                  <div style={{fontSize:32}}>📋</div>
                  <div style={{flex:1,minWidth:220}}>
                    <div style={{fontSize:16,fontWeight:700,color:T.accent,fontFamily:T.sans,marginBottom:6}}>Welcome to CRP Engine</div>
                    <div style={{fontSize:13,color:T.textMid,lineHeight:1.7,marginBottom:12}}>
                      Price inflation risk into your Kenya government contracts in 3 steps: <strong style={{color:T.text}}>Configure</strong> your contract, <strong style={{color:T.text}}>Analyse</strong> the sector, then <strong style={{color:T.text}}>Generate</strong> a reference code.
                    </div>
                    <button onClick={()=>setActiveTab("configure")} style={{...btn(true,T.accent),fontSize:13,padding:"9px 20px"}}>
                      → Start Configuring
                    </button>
                  </div>
                  <div className="crp-welcome-steps" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,minWidth:220}}>
                    {[{step:"1",label:"Configure",desc:"Set sector, duration, value",icon:"◈",color:T.accent},{step:"2",label:"Analyse",desc:"Review risk metrics & charts",icon:"◫",color:T.purple},{step:"3",label:"Generate",desc:"Issue reference code",icon:"◉",color:T.green}].map(s=>(
                      <div key={s.step} style={{background:T.surface2,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:11,color:s.color,fontWeight:700,marginBottom:3,fontFamily:T.sans}}>{s.icon} {s.label}</div>
                        <div style={{fontSize:11,color:T.textDim,lineHeight:1.4}}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              <div style={{...card(),marginBottom:16,padding:"14px 18px"}}>
                <input
                  type="text" placeholder="🔍  Search sector by name or description…"
                  value={sectorQuery} onChange={e=>setSectorQuery(e.target.value)}
                  style={{...inp,width:"100%",background:"transparent",border:"none",fontSize:14,color:T.text,padding:"4px 0"}}
                />
              </div>

              {/* Sector Grid */}
              <div style={card()}>
                <div style={{...section,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Economy-Wide CRP — {Object.keys(SECTORS).length} Sectors</span>
                  <span style={{fontSize:11,color:T.textDim,fontFamily:T.mono,fontWeight:400}}>Click to deep-dive →</span>
                </div>
                <div className="crp-sector-tiles" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
                  {filteredSectorEntries.map(([sid,s])=>{
                    const r=sectorResults[sid],t=r?r.crp.total:0;
                    const col=crpColor(t);
                    const isActive=activeSec===sid||cfgPrimary===sid;
                    return (
                      <button key={sid}
                        className="sector-card"
                        onClick={()=>{setActiveSec(sid);setActiveTab("analyze");}}
                        style={{
                          background: isActive ? `${col}18` : `${col}07`,
                          border:`2px solid ${isActive?col:T.border}`,
                          borderRadius:12,padding:"16px 12px",cursor:"pointer",
                          textAlign:"center",
                          transition:"all 0.18s ease",outline:"none",
                          boxShadow: isActive ? `0 0 0 1px ${col}44` : "none",
                        }}>
                        <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
                        <div style={{fontSize:11,color:T.textMid,marginBottom:8,lineHeight:1.3,fontFamily:T.sans,minHeight:30}}>{s.label.split(" ").slice(0,3).join(" ")}</div>
                        <div style={{fontSize:24,fontWeight:800,color:col,fontFamily:T.mono,letterSpacing:"-0.5px",lineHeight:1}}>{Number(t).toFixed(2)}%</div>
                        <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono,marginTop:4,letterSpacing:0.5}}>CRP</div>
                        {isActive && <div style={{fontSize:9,color:col,fontFamily:T.mono,marginTop:4,fontWeight:700,letterSpacing:1}}>SELECTED</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="crp-g4" style={g4}>
                {[
                  (()=>{const e=Object.entries(sectorResults).sort((a,b)=>b[1].crp.total-a[1].crp.total)[0];return e?{lbl:"Highest CRP",val:`${e[1].crp.total}%`,sub:`${SECTORS[e[0]].icon} ${SECTORS[e[0]].label}`,color:T.red}:null;})(),
                  (()=>{const e=Object.entries(sectorResults).sort((a,b)=>a[1].crp.total-b[1].crp.total)[0];return e?{lbl:"Lowest CRP",val:`${e[1].crp.total}%`,sub:`${SECTORS[e[0]].icon} ${SECTORS[e[0]].label}`,color:T.green}:null;})(),
                  {lbl:"Economy Avg",val:`${Object.values(sectorResults).length>0?(Object.values(sectorResults).reduce((s,r)=>s+r.crp.total,0)/Object.values(sectorResults).length).toFixed(1):0}%`,sub:`${Object.keys(sectorResults).length} sectors tracked`,color:T.amber},
                  {lbl:"KNBS Overall CPI",val:`${latestCPI.overall}%`,sub:`${latestCPI.month} YoY`,color:T.accent},
                ].filter(Boolean).map((item,i)=>(
                  <div key={i} style={card({marginBottom:0})}>
                    <div style={label}>{item.lbl}</div>
                    <div style={bigNum(item.color)}>{item.val}</div>
                    <div style={{fontSize:12,color:T.textMid,marginTop:6,fontFamily:T.sans}}>{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Ranking Table */}
              <div style={card()}>
                <div style={{...section,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Sector Ranking — Risk-Return Overview</span>
                  <span style={{fontSize:11,color:T.textDim,fontFamily:T.mono,fontWeight:400}}>Click row to analyse</span>
                </div>
                <div className="crp-table-scroll" style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:580}}>
                  <thead>
                    <tr style={{background:T.bg,borderBottom:`2px solid ${T.border}`}}>
                      {[["#",false],["Sector",false],["Vol %",true],["CPI %",false],["Sharpe",true],["Risk",false],["CRP %",false]].map(([h,hide])=>(
                        <th key={h} className={hide?"crp-rank-col-hide":""} style={{padding:"10px 12px",textAlign:h==="#"?"center":h.includes("%")||h==="Sharpe"?"right":"left",fontSize:11,fontWeight:700,color:T.textDim,textTransform:"uppercase",letterSpacing:0.8,fontFamily:T.sans,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sectorResults).sort((a,b)=>b[1].crp.total-a[1].crp.total).map(([sid,r],i)=>{
                      const s=SECTORS[sid],sc=r.sectSharpe;
                      const scol=sc<0?T.red:sc<0.5?T.amber:sc<1?T.accent:T.green;
                      const col=crpColor(r.crp.total);
                      const isSelected=cfgPrimary===sid;
                      return (
                        <tr key={sid}
                          onClick={()=>{setActiveSec(sid);setActiveTab("analyze");}}
                          style={{
                            borderBottom:`1px solid ${T.border}`,cursor:"pointer",
                            transition:"background 0.12s",
                            background: isSelected ? `${col}0a` : i%2 ? T.surface2 : "transparent",
                          }}
                          onMouseEnter={e=>e.currentTarget.style.background=T.surface2}
                          onMouseLeave={e=>e.currentTarget.style.background=isSelected?`${col}0a`:i%2?T.surface2:"transparent"}>
                          <td style={{padding:"11px 12px",textAlign:"center",fontSize:12,color:T.textDim,fontFamily:T.mono}}>
                            {isSelected ? <span style={{color:col,fontSize:11,fontWeight:700}}>●</span> : `#${i+1}`}
                          </td>
                          <td style={{padding:"11px 12px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <span style={{fontSize:18}}>{s.icon}</span>
                              <div>
                                <div style={{fontSize:13,fontWeight:isSelected?700:500,color:isSelected?col:T.text,fontFamily:T.sans}}>{s.label}</div>
                                <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono}}>{s.authority.split("/")[0]}</div>
                              </div>
                            </div>
                          </td>
                          <td className="crp-rank-col-hide" style={{padding:"11px 12px",fontSize:13,color:T.purple,fontFamily:T.mono,textAlign:"right"}}>{r.crp.vol}%</td>
                          <td style={{padding:"11px 12px",fontSize:13,color:T.amber,fontFamily:T.mono,textAlign:"right"}}>{r.crp.infl}%</td>
                          <td className="crp-rank-col-hide" style={{padding:"11px 12px",fontSize:13,color:scol,fontWeight:700,fontFamily:T.mono,textAlign:"right"}}>{sc.toFixed(2)}</td>
                          <td style={{padding:"11px 12px"}}>
                            <div style={{width:72}}>
                              <Bar value={r.crp.total} max={Math.max(...Object.values(sectorResults).map(x=>x.crp.total))||20} color={col} h={6}/>
                            </div>
                          </td>
                          <td style={{padding:"11px 12px",textAlign:"right"}}>
                            <span style={{fontSize:14,fontWeight:800,color:col,fontFamily:T.mono}}>{r.crp.total}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ANALYZE ═══ */}
          {activeTab==="analyze" && (
            <div key={(activeSec||"none")+animKey} className="fade-in">
              <div className="crp-g2" style={g2}>
                <div>
                  <div style={label}>Select Industry Sector</div>
                  <select style={sel} value={activeSec||""} onChange={e=>setActiveSec(e.target.value||null)}>
                    <option value="">— Choose a sector —</option>
                    {filteredSectorEntries.map(([sid,s])=><option key={sid} value={sid}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                <div style={card({marginBottom:0,padding:16})}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={label}>Lookback Period</div>
                    <div style={{display:"flex",gap:6}}>
                      {[["auto","Auto"],["manual","Manual"]].map(([m,l])=>(
                        <button key={m} onClick={()=>setSecTabLbMode(m)} style={{...tBtn(secTabLbMode===m,T.purple),padding:"4px 10px",fontSize:11}}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {secTabLbMode==="auto"&&activeSec && (
                    <div>
                      <span style={{fontSize:20,fontWeight:700,color:T.purple,fontFamily:T.mono}}>{secTabRec.rec}d</span>
                      <span style={{fontSize:11,color:T.textDim,marginLeft:8,fontFamily:T.sans}}>auto-recommended</span>
                      <div style={{fontSize:11,color:T.textDim,marginTop:4,lineHeight:1.5}}>{secTabRec.reason}</div>
                    </div>
                  )}
                  {secTabLbMode==="manual" && (
                    <div>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                        <input type="number" min={14} max={730} value={secTabLb} onChange={e=>setSecTabLb(Math.max(14,Number(e.target.value)))}
                          style={{...inp,width:80,textAlign:"center",fontSize:16,fontWeight:700}}/>
                        <span style={{color:T.textDim,fontSize:12}}>days</span>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {[30,60,90,180,365].map(d=>(
                          <button key={d} onClick={()=>setSecTabLb(d)} style={{...tBtn(secTabLb===d,T.purple),padding:"3px 10px",fontSize:11}}>{d}d</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{fontSize:10,color:T.textDim,marginTop:8,fontFamily:T.mono}}>Effective: <span style={{color:T.purple}}>{secTabEffLb}d</span> · Contract: {Math.round(contractDays)}d</div>
                </div>
              </div>

              {/* Lookback explainer */}
              {activeSec && (
                <div style={{background:`${T.purple}08`,border:`1px solid ${T.purple}33`,borderRadius:10,padding:16,marginBottom:20}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.purple,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10,fontFamily:T.sans}}>📐 Lookback ↔ Contract Duration Alignment</div>
                  <div className="crp-text-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,fontSize:12,color:T.textMid,lineHeight:1.7}}>
                    <div><strong style={{color:T.text}}>What lookback does:</strong> Defines historical price window used to compute volatility (σ), EWMA, and Sharpe ratio. Short lookbacks react to recent shocks; longer windows capture seasonal cycles.</div>
                    <div><strong style={{color:T.text}}>Why it must match contract length:</strong> You are pricing risk over a comparable future horizon. A 30-day lookback for a 2-year contract systematically understates long-run volatility.</div>
                  </div>
                  <div className="crp-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
                    {[{dur:"Spot 1–30d",lb:"30d",col:T.green},{dur:"Short 1–6mo",lb:"60–90d",col:T.accent},{dur:"Medium 6–24mo",lb:"90–180d",col:T.amber},{dur:"Long 24mo+",lb:"180–365d",col:T.red}].map(({dur,lb,col})=>(
                      <div key={dur} style={{background:`${col}0c`,border:`1px solid ${col}33`,borderRadius:7,padding:10}}>
                        <div style={{color:col,fontWeight:700,fontSize:11,marginBottom:2,fontFamily:T.sans}}>{dur}</div>
                        <div style={{color:T.text,fontFamily:T.mono,fontSize:12}}>Use {lb}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!activeSec && (
                <div style={{textAlign:"center",padding:"60px 24px",color:T.textDim}}>
                  <div style={{fontSize:48,marginBottom:16}}>📊</div>
                  <div style={{fontSize:16,fontWeight:700,color:T.accent,marginBottom:8,fontFamily:T.sans}}>Select an Industry Sector</div>
                  <div style={{fontSize:13,lineHeight:1.7}}>Choose a sector from the dropdown above to view bell curve distributions, Sharpe ratio, and commodity-level price data.</div>
                </div>
              )}

              {activeSec && secTabRes && secTabSec && (
                <div>
                  {/* Sector header card */}
                  <div style={cardHL(secTabSec.color)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
                      <div>
                        <div style={{fontSize:28,marginBottom:6}}>{secTabSec.icon}</div>
                        <div style={{fontSize:18,fontWeight:700,color:secTabSec.color,fontFamily:T.sans}}>{secTabSec.label}</div>
                        <div style={{fontSize:12,color:T.textDim,marginTop:2}}>{secTabSec.description}</div>
                        <div style={{fontSize:10,color:T.textDim,marginTop:6,fontFamily:T.mono}}>
                          {secTabSec.authority} · KNBS:{secTabSec.inflationKey} · CPI <span style={{color:T.amber}}>{secTabRes.cpi.toFixed(1)}%</span> · Lookback <span style={{color:T.purple}}>{secTabEffLb}d</span>
                        </div>
                      </div>
                      <div className="crp-analyze-metrics" style={{display:"flex",gap:20}}>
                        {[
                          {lbl:"CRP Total",val:`${secTabRes.crp.total}%`,color:crpColor(secTabRes.crp.total)},
                          {lbl:"Vol Premium",val:`${secTabRes.crp.vol}%`,color:T.purple},
                          {lbl:"CPI Adj",val:`${secTabRes.crp.infl}%`,color:T.amber},
                        ].map(item=>(
                          <div key={item.lbl} style={{textAlign:"center"}}>
                            <div style={label}>{item.lbl}</div>
                            <div style={{fontSize:22,fontWeight:700,color:item.color,fontFamily:T.mono}}>{item.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginTop:14,gap:1}}>
                      <div style={{flex:secTabRes.crp.vol,background:T.purple,borderRadius:"4px 0 0 4px"}}/>
                      <div style={{flex:Math.max(secTabRes.crp.infl,0.1),background:T.amber,borderRadius:"0 4px 4px 0"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textDim,marginTop:4,fontFamily:T.mono}}>
                      <span>Vol {secTabRes.crp.vol}%</span><span>CPI {secTabRes.crp.infl}%</span>
                    </div>
                  </div>

                  {/* Sharpe + Bell */}
                  <div className="crp-g2" style={g2}>
                    <div style={card({marginBottom:0})}>
                      <div style={section}>Market Efficiency · Sharpe Ratio</div>
                      <SharpeGauge value={secTabRes.sectSharpe} baseline={secTabSec.sharpeBase}/>
                      <div style={{marginTop:12,fontSize:12,color:T.textMid,lineHeight:1.7}}>
                        <div><strong style={{color:T.text}}>RFR:</strong> {(KENYA_RFR*100).toFixed(2)}% p.a. — CBK 91-Day T-Bill</div>
                        <div><strong style={{color:T.text}}>Signal:</strong> {secTabRes.sectSharpe<0?"Returns below risk-free rate — elevated counterparty risk":secTabRes.sectSharpe<0.5?"Below-average risk-adjusted return":secTabRes.sectSharpe<1?"Acceptable market efficiency":"Superior risk-adjusted performance"}</div>
                      </div>
                    </div>
                    <div style={card({marginBottom:0})}>
                      <div style={section}>Return Distribution · n={secTabRes.allR.length}</div>
                      <BellCurve returns={secTabRes.allR} color={secTabSec.color}/>
                      <div className="crp-grid-3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                        {[["Observations",secTabRes.allR.length,T.text],["Mean return",secTabRes.allR.length>0?((secTabRes.allR.reduce((a,b)=>a+b,0)/secTabRes.allR.length)*100).toFixed(3)+"%":0,secTabSec.color],["Lookback",`${secTabEffLb}d`,T.purple]].map(([l,v,c])=>(
                          <div key={l}><div style={{fontSize:10,color:T.textDim,fontFamily:T.sans}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:c,fontFamily:T.mono}}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Commodity Table */}
                  <div style={card()}>
                    <div style={section}>Live Kenya Market Prices · {secTabEffLb}d · Official Sources</div>
                    <div className="crp-table-scroll" style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                        <thead>
                          <tr style={{borderBottom:`1px solid ${T.border}`}}>
                            {[{k:"commodity",l:"Commodity"},{k:"trend",l:"Trend"},{k:"price",l:"Market Price",sortable:true},{k:"vol",l:"Ann.Vol",sortable:true},{k:"ewma",l:"EWMA"},{k:"sharpe",l:"Sharpe",sortable:true},{k:"risk",l:"Risk"}].map(({k,l,sortable})=>(
                              <th key={k} style={{padding:"8px 10px",textAlign:k==="price"||k==="vol"||k==="ewma"||k==="sharpe"?"right":"left",fontSize:10,fontWeight:700,color:T.textDim,textTransform:"uppercase",letterSpacing:1,fontFamily:T.sans,whiteSpace:"nowrap",cursor:sortable?"pointer":"default"}}
                                onClick={()=>{if(!sortable)return;if(sortBy===k){setSortDir(d=>d==="asc"?"desc":"asc");}else{setSortBy(k);setSortDir("desc");}}}>
                                {l}{sortable&&sortBy===k?(sortDir==="asc"?" ▲":" ▼"):""}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedCommodityRows.map(([cid,data],ri)=>{
                            const sc=data.sharpe;
                            const scol=sc<0?T.red:sc<0.5?T.amber:sc<1?T.accent:T.green;
                            return (
                              <tr key={cid} style={{borderBottom:`1px solid ${T.bg}`,background:ri%2?T.surface2:"transparent"}}>
                                <td style={{padding:"10px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <span style={{width:8,height:8,borderRadius:"50%",background:data.comm.color,display:"block",flexShrink:0}}/>
                                    <div>
                                      <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:T.sans}}>{data.comm.label}</div>
                                      <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono}}>{data.comm.source}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{padding:"10px"}}>
                                  <Spark series={data.series} color={data.comm.color}/>
                                  <div style={{fontSize:10,color:data.chg>=0?T.green:T.red,marginTop:2,fontFamily:T.mono}}>{data.chg>=0?"▲":""}{(data.chg*100).toFixed(2)}%</div>
                                </td>
                                <td style={{padding:"10px",textAlign:"right"}}>
                                  <div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:T.mono}}>{data.comm.price.toLocaleString("en-KE",{maximumFractionDigits:2})}</div>
                                  <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono}}>{data.comm.unit}</div>
                                </td>
                                <td style={{padding:"10px",textAlign:"right",fontSize:13,color:data.comm.color,fontFamily:T.mono}}>{(data.hist*100).toFixed(2)}%</td>
                                <td style={{padding:"10px",textAlign:"right",fontSize:13,color:T.textMid,fontFamily:T.mono}}>{(data.ewma*100).toFixed(2)}%</td>
                                <td style={{padding:"10px",textAlign:"right",fontSize:13,fontWeight:700,color:scol,fontFamily:T.mono}}>{sc.toFixed(2)}</td>
                                <td style={{padding:"10px"}}>
                                  <Pill score={data.score}/>
                                  <div style={{marginTop:4,width:60}}><Bar value={data.score} color={data.comm.color} h={3}/></div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Per-commodity bells */}
                  <div style={card()}>
                    <div style={section}>Individual Return Distributions · All Inputs</div>
                    <div className="crp-bell-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      {Object.entries(secTabRes.cr).map(([cid,data])=>(
                        <div key={cid} style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${T.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                            <div style={{fontSize:12,fontWeight:700,color:data.comm.color,fontFamily:T.sans}}>{data.comm.label}</div>
                            <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono}}>{data.comm.price.toLocaleString("en-KE",{maximumFractionDigits:0})} {data.comm.unit}</div>
                          </div>
                          <BellCurve returns={data.returns} color={data.comm.color} W={300} H={80}/>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={alertBox("g")}>
                    ✓ Lookback {secTabEffLb}d · Deduplicated composite: {Object.values(secTabRes.raw).reduce((a,b)=>a+b,0).toFixed(3)} → {secTabRes.deduped.toFixed(3)} · RFR: {(KENYA_RFR*100).toFixed(2)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ CONFIGURE ═══ */}
          {activeTab==="configure" && (
            <div key="config" className="fade-in">
              {/* Sticky progress */}
              <div className="crp-cfg-stickybg" style={{position:"sticky",top:0,zIndex:50,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
                  <div style={{fontSize:12,color:T.textDim,fontFamily:T.sans}}>Configuration wizard</div>
                  <button type="button" onClick={()=>setConfirmDialog({id:"clearConfigure"})}
                    style={{...btn(false,T.red),borderColor:`${T.red}66`,color:T.red,background:T.redDim,padding:"8px 16px",fontSize:12,fontWeight:700}}>
                    Clear all fields
                  </button>
                </div>
                <div className="crp-progress-summary" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:10}}>
                  {[["Sector",cfgPrimary?SECTORS[cfgPrimary].label:"—",!!cfgPrimary],["Duration",`${Math.round(contractDays)}d`,true],["Value",contractVal?`KES ${fmt(contractVal)}`:"—",!!contractVal],["CRP",activeCRP?`${activeCRP.total.toFixed(2)}%`:"—",!!activeCRP]].map(([k,v,done])=>(
                    <div key={k} style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:done?T.green:T.border,display:"block",flexShrink:0}}/>
                      <span style={{fontSize:11,color:T.textDim,fontFamily:T.sans}}>{k}:</span>
                      <span style={{fontSize:11,fontWeight:600,color:done?T.text:T.textDim,fontFamily:T.mono,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</span>
                    </div>
                  ))}
                </div>
                {/* Step pills */}
                <div className="crp-step-pills">
                  {stepMeta.map(st=>{
                    const isActive=configStep===st.n;
                    const isDone=st.done();
                    return (
                      <button key={st.n} onClick={()=>setConfigStep(st.n)}
                        style={{
                          background: isActive ? `${T.accent}20` : isDone ? `${T.green}12` : "transparent",
                          border: `1px solid ${isActive ? T.accent : isDone ? `${T.green}55` : T.border}`,
                          borderRadius:8, color: isActive ? T.accent : isDone ? T.green : T.textMid,
                          padding:"5px 12px", fontSize:12, fontWeight: isActive?700:500,
                          cursor:"pointer", fontFamily:T.sans, transition:"all 0.15s",
                          display:"flex", alignItems:"center", gap:5,
                        }}>
                        <span style={{
                          width:18,height:18,borderRadius:"50%",
                          background: isActive ? T.accent : isDone ? T.green : T.border,
                          color: isActive||isDone ? T.bg : T.textDim,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:10,fontWeight:700,flexShrink:0,
                        }}>{isDone&&!isActive?"✓":st.n}</span>
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 — Parties */}
              {configStep===1 && (
                <div>
                  <div style={{...alertBox("g"),marginBottom:16}}>
                    <strong>⚖ Obligee (Client)</strong> commissions and pays for services. <strong>Obligor (Supplier)</strong> provides goods/services and bears input cost inflation risk.
                  </div>
                  <div className="crp-g2" style={g2}>
                    <PartyForm title="Obligee (Client)" party={obligee} color={T.green} onChange={(k,v)=>setObligee(p=>({...p,[k]:v}))}/>
                    <PartyForm title="Obligor (Supplier)" party={obligor} color={T.amber} onChange={(k,v)=>setObligor(p=>({...p,[k]:v}))}/>
                  </div>
                </div>
              )}

              {/* Step 2 — Sector */}
              {configStep===2 && (
                <div style={cardHL(T.accent)}>
                  <div style={section}>Step 2 · Industry Sector</div>
                  {!cfgPrimary && <div style={alertBox("b")}>Select a primary sector. All CRP calculations are industry-specific.</div>}
                  <div className="crp-g2" style={g2}>
                    <div>
                      <div style={label}>Primary Sector</div>
                      <select style={sel} value={cfgPrimary||""} onChange={e=>{setCfgPrimary(e.target.value||null);setActiveSec(e.target.value||null);}}>
                        <option value="">— Select sector —</option>
                        {filteredSectorEntries.map(([sid,s])=><option key={sid} value={sid}>{s.icon} {s.label}</option>)}
                      </select>
                      {cfgPrimary && <div style={{fontSize:11,color:T.textDim,marginTop:8,lineHeight:1.6}}>{SECTORS[cfgPrimary].description}<br/><span style={{fontFamily:T.mono,color:T.textMid}}>{SECTORS[cfgPrimary].authority}</span></div>}
                    </div>
                    <div style={{background:T.bg,borderRadius:10,padding:16,border:`1px solid ${cfgCombine?T.accent:T.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:T.sans}}>Cross-Sector Contract?</div>
                          <div style={{fontSize:11,color:T.textDim,marginTop:2}}>Blend two sector CRPs</div>
                        </div>
                        <label style={{cursor:"pointer"}}>
                          <input type="checkbox" checked={cfgCombine} onChange={e=>setCfgCombine(e.target.checked)} style={{display:"none"}}/>
                          <div style={{width:48,height:26,borderRadius:99,background:cfgCombine?T.accent:T.border2,position:"relative",transition:"background 0.2s",border:`1px solid ${cfgCombine?T.accent:T.border}`}}>
                            <div style={{position:"absolute",top:3,left:cfgCombine?25:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                          </div>
                        </label>
                      </div>
                      {cfgCombine && cfgPrimary && (
                        <div>
                          <div style={label}>Secondary Sector</div>
                          <select style={{...sel,marginBottom:12}} value={cfgSecondary} onChange={e=>setCfgSecondary(e.target.value)}>
                            {Object.entries(SECTORS).filter(([sid])=>sid!==cfgPrimary).map(([sid,s])=><option key={sid} value={sid}>{s.icon} {s.label}</option>)}
                          </select>
                          <div style={label}>Weight — Primary {combineWt}% : Secondary {100-combineWt}%</div>
                          <input type="range" min={10} max={90} step={5} value={combineWt} onChange={e=>setCombineWt(Number(e.target.value))} style={{width:"100%",marginBottom:8,accentColor:T.accent}}/>
                          <div style={{display:"flex",height:6,borderRadius:3,overflow:"hidden",marginBottom:10}}>
                            <div style={{flex:combineWt,background:cfgPrimary?SECTORS[cfgPrimary].color:T.accent,borderRadius:"3px 0 0 3px"}}/>
                            <div style={{flex:100-combineWt,background:SECTORS[cfgSecondary]?SECTORS[cfgSecondary].color:T.textMid,borderRadius:"0 3px 3px 0"}}/>
                          </div>
                          {combinedCRP && (
                            <div style={{background:T.surface2,borderRadius:8,padding:12}}>
                              <div style={{display:"flex",gap:16}}>
                                {[["Combined CRP",`${combinedCRP.total}%`,crpColor(combinedCRP.total)],["Vol",`${combinedCRP.vol}%`,T.purple],["CPI",`${combinedCRP.infl}%`,T.amber]].map(([l,v,c])=>(
                                  <div key={l}><div style={{fontSize:10,color:T.textDim}}>{l}</div><div style={{fontSize:16,fontWeight:700,color:c,fontFamily:T.mono}}>{v}</div></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Duration */}
              {configStep===3 && (
                <div style={cardHL(T.green)}>
                  <div style={section}>Step 3 · Contract Duration</div>
                  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                    {[["preset","Preset"],["manual","Manual Days"],["dates","Date Range"]].map(([m,l])=>(
                      <button key={m} onClick={()=>setDurMode(m)} style={tBtn(durMode===m,T.green)}>{l}</button>
                    ))}
                  </div>
                  {durMode==="preset" && (
                    <div className="crp-g2" style={g2}>
                      <div>
                        <div style={label}>Preset Duration</div>
                        <select style={sel} value={presetMo} onChange={e=>setPresetMo(Number(e.target.value))}>
                          {presetOpts.map(o=><option key={o.mo} value={o.mo}>{o.label}</option>)}
                        </select>
                      </div>
                      <div style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${T.border}`}}>
                        <div style={label}>Period</div>
                        <div style={{fontSize:28,fontWeight:700,color:T.green,fontFamily:T.mono}}>{presetMo}mo</div>
                        <div style={{fontSize:11,color:T.textDim,marginTop:4,fontFamily:T.mono}}>≈ {Math.round(presetMo*30.44)} days · Stress ×{stressMult(presetMo*30.44).toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                  {durMode==="manual" && (
                    <div className="crp-g2" style={g2}>
                      <div>
                        <div style={label}>Days</div>
                        <input type="number" min={1} max={3650} value={manDaysIn}
                          onChange={e=>{setManDaysIn(e.target.value);const n=parseInt(e.target.value);if(!isNaN(n)&&n>0)setManDays(n);}}
                          style={{...inp,fontSize:24,fontWeight:700,width:140,textAlign:"center"}}/>
                        <div style={{fontSize:11,color:T.textDim,marginTop:6}}>For spot purchases or short-term service engagements.</div>
                      </div>
                      <div style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${T.border}`}}>
                        <div style={label}>Computed</div>
                        <div style={{fontSize:28,fontWeight:700,color:T.green,fontFamily:T.mono}}>{manDays}d</div>
                        <div style={{fontSize:11,color:T.textDim,marginTop:4,fontFamily:T.mono}}>≈ {(manDays/30.44).toFixed(1)} months · Stress ×{stressMult(manDays).toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                  {durMode==="dates" && (
                    <div className="crp-g2" style={g2}>
                      <div className="crp-config-date-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        <div>
                          <div style={label}>Commencement</div>
                          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{...inp,width:"100%"}}/>
                        </div>
                        <div>
                          <div style={label}>Completion</div>
                          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{...inp,width:"100%"}}/>
                        </div>
                      </div>
                      <div style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${T.border}`}}>
                        <div style={label}>Duration</div>
                        <div style={{fontSize:28,fontWeight:700,color:T.green,fontFamily:T.mono}}>{Math.round(contractDays)}d</div>
                        <div style={{fontSize:11,color:T.textDim,marginTop:4,fontFamily:T.mono}}>≈ {contractMonths.toFixed(1)} months · Stress ×{sm.toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4 — Lookback */}
              {configStep===4 && (
                <div style={cardHL(T.purple)}>
                  <div style={section}>Step 4 · Price Lookback Period</div>
                  <div style={{...alertBox("b"),borderColor:`${T.purple}77`,color:T.purple,background:`${T.purple}0c`,marginBottom:16}}>
                    The lookback window must match your contract duration. Longer contracts require longer history to accurately price forward risk.
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                    {[["auto","Auto-Recommend"],["manual","Manual Entry"]].map(([m,l])=>(
                      <button key={m} onClick={()=>setLbMode(m)} style={tBtn(lbMode===m,T.purple)}>{l}</button>
                    ))}
                  </div>
                  {lbMode==="auto" && (
                    <div style={{background:T.bg,borderRadius:10,padding:18,border:`1px solid ${T.purple}44`}}>
                      <div style={{fontSize:10,color:T.purple,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,fontFamily:T.sans}}>Recommended</div>
                      <div style={{fontSize:40,fontWeight:700,color:T.purple,fontFamily:T.mono,marginBottom:6}}>{lbRec.rec}d</div>
                      <div style={{fontSize:12,color:T.textMid,marginBottom:12,lineHeight:1.6}}>{lbRec.reason}</div>
                      <div style={{display:"flex",gap:8}}>
                        {[30,60,90,180,365].map(d=>(
                          <div key={d} style={{flex:1,background:d===lbRec.rec?`${T.purple}22`:T.surface2,border:`1px solid ${d===lbRec.rec?T.purple:T.border}`,borderRadius:6,padding:"6px 4px",textAlign:"center",fontSize:11,color:d===lbRec.rec?T.purple:T.textDim,fontFamily:T.mono}}>
                            {d}d{d===lbRec.rec?" ✓":""}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {lbMode==="manual" && (
                    <div className="crp-g2" style={g2}>
                      <div>
                        <div style={label}>Manual Lookback</div>
                        <input type="number" min={14} max={730} value={manLb} onChange={e=>setManLb(Math.max(14,Number(e.target.value)))}
                          style={{...inp,width:120,fontSize:24,fontWeight:700,textAlign:"center"}}/>
                        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                          {[30,60,90,180,365].map(d=>(
                            <button key={d} onClick={()=>setManLb(d)} style={{...tBtn(manLb===d,T.purple),padding:"4px 10px",fontSize:11}}>{d}d</button>
                          ))}
                        </div>
                      </div>
                      <div style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${T.border}`}}>
                        <div style={label}>Recommendation</div>
                        <div style={{fontSize:22,fontWeight:700,color:T.purple,fontFamily:T.mono}}>{lbRec.rec}d</div>
                        <div style={{fontSize:11,color:T.textDim,marginTop:4,lineHeight:1.5}}>{lbRec.reason}</div>
                        <button style={{...btn(false),marginTop:8,fontSize:11,padding:"6px 12px"}} onClick={()=>setManLb(lbRec.rec)}>Use recommended</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5 — Value */}
              {configStep===5 && (
                <div style={cardHL(T.amber)}>
                  <div style={section}>Step 5 · Contract Base Value</div>
                  <div style={{...alertBox("w"),marginBottom:16}}>
                    ⚖ This is the base BoQ value agreed before CRP adjustment. Do not commit until the CRP-adjusted total (Step 7) is reviewed by both parties.
                  </div>
                  {!cfgPrimary && <div style={alertBox("w")}>⚠ Select a sector in Step 2 first.</div>}
                  <div className="crp-g2" style={g2}>
                    <div>
                      <div style={label}>Base Contract Amount (KES)</div>
                      <input type="text" placeholder="e.g. 15000000"
                        value={contractValIn}
                        onChange={e=>{setContractValIn(e.target.value);const n=parseFloat(e.target.value.replace(/,/g,""));if(!isNaN(n)&&n>0)setContractVal(n);else setContractVal(null);}}
                        style={{...inp,width:"100%",fontSize:20,fontWeight:700,borderColor:contractVal?T.amber:T.border}}/>
                      <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                        {[1000000,5000000,10000000,50000000,100000000].map(v=>(
                          <button key={v} onClick={()=>{setContractVal(v);setContractValIn(String(v));}} style={{...tBtn(contractVal===v,T.amber),fontSize:11,padding:"5px 10px"}}>
                            {v>=1000000?`${v/1000000}M`:`${v/1000}K`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${T.border}`}}>
                      <div style={label}>Summary</div>
                      <div style={{fontSize:18,fontWeight:700,color:contractVal?T.amber:T.textDim,fontFamily:T.mono}}>{contractVal?`KES ${fmt(contractVal)}`:"—"}</div>
                      <div style={{fontSize:12,color:T.textMid,marginTop:8,lineHeight:2,fontFamily:T.mono}}>
                        {cfgPrimary?`${SECTORS[cfgPrimary].icon} ${SECTORS[cfgPrimary].label}`:"No sector"}<br/>
                        {Math.round(contractDays)}d ({contractMonths.toFixed(1)}mo)<br/>
                        CRP: {activeCRP?`${activeCRP.total}%`:"awaiting sector"}<br/>
                        UF Erosion: {ufErosion.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6 — Payment Comparison */}
              {configStep===6 && contractVal && activeCRP && cfgPrimary && (
                <div style={cardHL(T.accent)}>
                  <div style={section}>Step 6 · Payment Comparison</div>
                  <div style={{...alertBox("g"),marginBottom:16}}>
                    ⚖ Market Price transfers full risk to Obligee. KES-UF protects Obligor. CRP Adjusted is the equitable recommendation.
                  </div>
                  <div className="crp-table-scroll" style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${T.border}`}}>
                          {["Payment Item","Base (Fixed)","Market (Full Risk)","KES-UF Protected","CRP Adjusted"].map(h=>(
                            <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:T.textDim,textTransform:"uppercase",letterSpacing:1,fontFamily:T.sans,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {label:"Contract at Award",desc:`${SECTORS[cfgPrimary].icon} ${sec.label}`,base:contractVal,mkt:contractVal,uf:contractVal,crp:contractVal,hi:false},
                          {label:"Input Inflation Add-on",desc:`KNBS ${sec.inflationKey} CPI ${secCPI.toFixed(1)}% p.a.`,base:0,mkt:Math.round(contractVal*(secCPI/100)*(contractMonths/12)),uf:Math.round(contractVal*(ufErosion/100)),crp:Math.round(contractVal*(activeCRP.infl/100)),hi:false},
                          {label:"Market Volatility Premium",desc:`Commodity vol · ×${sm.toFixed(2)} stress`,base:0,mkt:Math.round(contractVal*(activeCRP.total/100)),uf:0,crp:Math.round(contractVal*(activeCRP.vol/100)),hi:false},
                          {label:"Total Obligation",desc:"All-in at completion",base:contractVal,mkt:Math.round(contractVal*(1+activeCRP.total/100)),uf:Math.round(contractVal*(1+ufErosion/100)),crp:Math.round(contractVal*(1+activeCRP.total/100)),hi:true},
                          {label:"Premium over Base",desc:"Above agreed BoQ",base:null,mkt:Math.round(contractVal*(activeCRP.total/100)),uf:Math.round(contractVal*(ufErosion/100)),crp:Math.round(contractVal*(activeCRP.total/100)),hi:false,isDiff:true},
                        ].map((row,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${T.bg}`,background:row.hi?`${T.accent}0a`:"transparent"}}>
                            <td style={{padding:"10px 12px"}}>
                              <div style={{fontSize:13,fontWeight:row.hi?700:500,color:row.hi?T.text:T.textMid,fontFamily:T.sans}}>{row.label}</div>
                              <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono}}>{row.desc}</div>
                            </td>
                            <td style={{padding:"10px 12px",fontSize:13,color:T.textDim,fontFamily:T.mono}}>{row.base===null?"—":`KES ${fmt(row.base)}`}</td>
                            <td style={{padding:"10px 12px",fontSize:row.hi?14:13,fontWeight:row.hi?700:400,color:row.hi?T.red:T.textMid,fontFamily:T.mono}}>{row.isDiff?`+KES ${fmt(row.mkt)}`:`KES ${fmt(row.mkt)}`}</td>
                            <td style={{padding:"10px 12px",fontSize:row.hi?14:13,fontWeight:row.hi?700:400,color:row.hi?T.green:T.textMid,fontFamily:T.mono}}>{row.isDiff?`+KES ${fmt(row.uf)}`:`KES ${fmt(row.uf)}`}</td>
                            <td style={{padding:"10px 12px",fontSize:row.hi?14:13,fontWeight:row.hi?700:400,color:row.hi?T.accent:T.textMid,fontFamily:T.mono}}>{row.isDiff?`+KES ${fmt(row.crp)}`:`KES ${fmt(row.crp)}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 7 — Standard Ratio */}
              {configStep===7 && ratio && activeCRP && contractVal && cfgPrimary && (
                <div style={cardHL("#e879f9")}>
                  <div style={section}>Step 7 · Standard Ratio — Equitable Risk Distribution</div>
                  <div style={alertBox("g")}>
                    ⚖ <strong>Standard Ratio Legal Basis</strong> — Distributes CRP equitably between Obligee and Obligor using KNBS data and market metrics. Implement via a <em>Price Adjustment Clause (PAC)</em> referencing this ratio.
                  </div>
                  <div style={{...alertBox("w"),marginBottom:20}}>
                    ⚠ Fixed-price contracts transfer 100% of input inflation to the Obligor, raising default risk. The Standard Ratio mitigates this.
                  </div>

                  {/* Factor Cards */}
                  <div className="crp-g2" style={g2}>
                    {ratio.factors.map((f,i)=>(
                      <div key={i} style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${f.side==="obligor"?`${T.red}33`:f.side==="obligee"?`${T.accent}33`:T.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:T.sans}}>{f.label}</div>
                          <span style={{fontSize:9,fontWeight:700,color:f.side==="obligor"?T.red:f.side==="obligee"?T.accent:T.textMid,background:f.side==="obligor"?T.redDim:f.side==="obligee"?T.accentDim:T.surface2,padding:"2px 7px",borderRadius:3,fontFamily:T.sans,letterSpacing:0.5}}>{f.side.toUpperCase()}</span>
                        </div>
                        <div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:T.mono,marginBottom:3}}>{f.val}</div>
                        <div style={{fontSize:11,color:T.amber,fontWeight:600,marginBottom:3}}>{f.impact}</div>
                        <div style={{fontSize:11,color:T.textDim,lineHeight:1.5}}>{f.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Ratio Visualization */}
                  <div style={{background:T.bg,borderRadius:12,padding:20,border:"1px solid #7c3aed44",marginBottom:20}}>
                    <div style={label}>Computed Ratio · Obligor : Obligee</div>
                    <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16,flexWrap:"wrap"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:11,color:T.amber,fontWeight:700,marginBottom:4,fontFamily:T.sans}}>OBLIGOR</div>
                        <div style={{fontSize:48,fontWeight:700,color:T.amber,fontFamily:T.mono,lineHeight:1}}>{(ratio.ratioSup*100).toFixed(0)}</div>
                        <div style={{fontSize:11,color:T.textDim,fontFamily:T.mono}}>absorbs {ratio.supAbs}% CRP</div>
                      </div>
                      <div style={{fontSize:32,color:T.border2,fontWeight:200}}>:</div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:11,color:T.green,fontWeight:700,marginBottom:4,fontFamily:T.sans}}>OBLIGEE</div>
                        <div style={{fontSize:48,fontWeight:700,color:T.green,fontFamily:T.mono,lineHeight:1}}>{(ratio.ratioCli*100).toFixed(0)}</div>
                        <div style={{fontSize:11,color:T.textDim,fontFamily:T.mono}}>contributes {ratio.cliCRP}% CRP</div>
                      </div>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{display:"flex",height:20,borderRadius:6,overflow:"hidden",gap:2}}>
                          <div style={{flex:ratio.ratioSup,background:T.amber,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.surface}}>{(ratio.ratioSup*100).toFixed(0)}%</div>
                          <div style={{flex:ratio.ratioCli,background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.surface}}>{(ratio.ratioCli*100).toFixed(0)}%</div>
                        </div>
                        <div style={{fontSize:10,color:T.textDim,marginTop:4,textAlign:"center",fontFamily:T.mono}}>Obligor : Obligee risk share</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment grid */}
                  <div className="crp-g3" style={g3}>
                    {[
                      {tag:"BASE",label:"Base Contract",val:`KES ${fmt(ratio.basePay)}`,desc:"Agreed BoQ",color:T.textDim},
                      {tag:"MARKET RISK",label:"Market-Priced",val:`KES ${fmt(ratio.mktPay)}`,desc:`+Full CRP ${crpPct.toFixed(1)}%`,color:T.red},
                      {tag:"OBLIGOR PROTECTED",label:"KES-UF",val:`KES ${fmt(ratio.ufPay)}`,desc:`+UF erosion ${ufErosion.toFixed(2)}%`,color:T.green},
                      {tag:"✓ RECOMMENDED",label:"Ratio-Adjusted Final",val:`KES ${fmt(ratio.adjPay)}`,desc:`Obligee pays ${ratio.cliCRP}% of CRP`,color:"#e879f9",hi:true},
                      {tag:"OBLIGEE ADDS",label:"Additional Obligation",val:`+KES ${fmt(ratio.adjPay-ratio.basePay)}`,desc:`${ratio.cliCRP}% fair share`,color:T.green},
                      {tag:"OBLIGOR ABSORBS",label:"Margin Reduction",val:`−KES ${fmt(Math.round(ratio.basePay*(ratio.supAbs/100)))}`,desc:`${ratio.supAbs}% accepted risk`,color:T.amber},
                    ].map((item,i)=>(
                      <div key={i} style={{background:item.hi?`${"#7c3aed"}18`:T.bg,borderRadius:8,padding:14,border:`1px solid ${item.hi?"#7c3aed":T.border}`}}>
                        <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:item.color,textTransform:"uppercase",marginBottom:5,fontFamily:T.sans}}>{item.tag}</div>
                        <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4,fontFamily:T.sans}}>{item.label}</div>
                        <div style={{fontSize:16,fontWeight:700,color:item.color,fontFamily:T.mono,marginBottom:4}}>{item.val}</div>
                        <div style={{fontSize:11,color:T.textDim}}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={alertBox("g")}>
                    ✓ Standard Ratio {(ratio.ratioSup*100).toFixed(0)}:{(ratio.ratioCli*100).toFixed(0)} (Obligor:Obligee) · Total obligation: <strong>KES {fmt(ratio.adjPay)}</strong> · CRP {crpPct.toFixed(2)}% · UF {ufErosion.toFixed(2)}% · {Math.round(contractDays)}d duration
                  </div>
                </div>
              )}

              {/* Step 8 — Reference Code */}
              {configStep===8 && (
                <div style={cardHL(T.accent)}>
                  <div style={section}>Step 8 · Contract Reference Code</div>
                  <div style={alertBox("b")}>
                    ℹ Generated once all fields are complete. Cite this code in all correspondence, invoices, and contract documents. Use <strong>Track</strong> to monitor the contract.
                  </div>
                  <div className="crp-g4" style={g4}>
                    {[
                      {label:"Industry Sector",done:!!cfgPrimary,val:cfgPrimary?SECTORS[cfgPrimary].label:"—"},
                      {label:"Contract Value",done:!!contractVal,val:contractVal?`KES ${fmt(contractVal)}`:"—"},
                      {label:"Obligee Name",done:!!(obligee.fullName?.trim()),val:obligee.fullName||"—"},
                      {label:"Obligor Name",done:!!(obligor.fullName?.trim()),val:obligor.fullName||"—"},
                    ].map((item,i)=>(
                      <div key={i} style={{background:T.bg,borderRadius:8,padding:12,border:`1px solid ${item.done?T.green:T.border}`}}>
                        <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:item.done?T.green:T.textDim,textTransform:"uppercase",marginBottom:4,fontFamily:T.sans}}>{item.done?"✓ ":""}{item.label}</div>
                        <div style={{fontSize:12,color:item.done?T.text:T.textDim,fontFamily:item.done?T.mono:T.sans}}>{item.val}</div>
                      </div>
                    ))}
                  </div>

                  {codeGen && refCode ? (
                    <div className="code-glow" style={{background:T.bg,border:`2px solid ${T.accent}`,borderRadius:12,padding:24,textAlign:"center",marginBottom:16}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:T.textDim,textTransform:"uppercase",marginBottom:10,fontFamily:T.sans}}>Contract Reference Code</div>
                      <div style={{fontSize:24,fontWeight:700,color:T.accent,letterSpacing:3,fontFamily:T.mono,marginBottom:14}}>{refCode}</div>
                      <button onClick={handleCopyRefCode} style={{...btn(true,T.accent),fontSize:12,padding:"8px 20px",marginBottom:14}}>Copy Code</button>
                      <div style={{fontSize:11,color:T.textMid,lineHeight:2,fontFamily:T.mono}}>
                        {SECTORS[cfgPrimary].icon} {SECTORS[cfgPrimary].label}<br/>
                        Obligee: {obligee.fullName||"—"} · Obligor: {obligor.fullName||"—"}<br/>
                        KES {fmt(contractVal)} · {Math.round(contractDays)}d · CRP {crpPct.toFixed(2)}%<br/>
                        Ratio-Adjusted: <strong style={{color:"#e879f9"}}>KES {ratio?fmt(ratio.adjPay):"—"}</strong><br/>
                        <span style={{color:T.textDim}}>Generated: {new Date().toLocaleString("en-KE")}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{textAlign:"center",padding:"20px 0"}}>
                      <button onClick={handleGenCode} disabled={!canGen}
                        style={{...btn(canGen,T.accent),fontSize:14,padding:"12px 32px",opacity:canGen?1:0.4,cursor:canGen?"pointer":"not-allowed",letterSpacing:1}}>
                        ⊕ Generate Reference Code
                      </button>
                      {!canGen && <div style={{fontSize:11,color:T.textDim,marginTop:10}}>Complete sector (Step 2), value (Step 5), and at least one party name (Step 1).</div>}
                    </div>
                  )}

                  {/* Commodity Weights */}
                  {cfgPrimary && (
                    <div style={{marginTop:24}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                        <div style={section}>{SECTORS[cfgPrimary].icon} Commodity Weights</div>
                        <div style={{fontSize:11,color:totalW===100?T.green:T.red,fontFamily:T.mono,fontWeight:700}}>Total: {totalW}% {totalW!==100?"⚠":"✓"}</div>
                      </div>
                      <div className="crp-wt-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10}}>
                        {Object.entries(SECTORS[cfgPrimary].commodities).map(([cid,comm])=>(
                          <div key={cid} style={{background:T.bg,borderRadius:8,padding:12,border:`1px solid ${T.border}`}}>
                            <div style={{fontSize:10,color:comm.color,fontWeight:700,marginBottom:6,fontFamily:T.sans}}>{comm.label}</div>
                            <input type="number" min={0} max={100} value={sWeights[cid]||0}
                              onChange={e=>setCustomWts(prev=>({...prev,[cfgPrimary]:{...prev[cfgPrimary],[cid]:Number(e.target.value)}}))}
                              style={{...inp,width:64,textAlign:"center",fontSize:16,fontWeight:700,padding:"6px"}}/>
                            <div style={{fontSize:9,color:T.textDim,marginTop:4,fontFamily:T.mono,lineHeight:1.6}}>{comm.price.toLocaleString("en-KE",{maximumFractionDigits:0})} {comm.unit}<br/>{comm.source}</div>
                            <div style={{marginTop:4}}><Bar value={sWeights[cid]||0} max={100} color={comm.color} h={3}/></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!contractVal && cfgPrimary && configStep>=6 && (
                <div style={alertBox("w")}>⚠ Enter the base contract amount in Step 5 to unlock payment comparison and ratio calculation.</div>
              )}

              {/* Step nav */}
              <div className="crp-step-nav" style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
                <button style={btn(false)} onClick={runEngine}>↺ Recompute</button>
                <button type="button" style={{...btn(false),fontSize:13}} onClick={()=>setConfirmDialog({id:"resetWeights"})}>↺ Reset Weights</button>
                {cfgPrimary && <button style={{...btn(true,T.green),fontSize:13}} onClick={()=>{setActiveSec(cfgPrimary);setActiveTab("analyze");}}>→ Analyse Sector</button>}
              </div>
              <div className="crp-prev-next" style={{display:"flex",justifyContent:"space-between",marginTop:20,gap:10}}>
                <button style={{...btn(configStep>1),flex:"0 0 auto",minWidth:120}} onClick={()=>setConfigStep(s=>Math.max(1,s-1))} disabled={configStep===1}>← Previous</button>
                <button style={{...btn(configStep<8,T.accent),flex:"0 0 auto",minWidth:120}} onClick={()=>setConfigStep(s=>Math.min(8,s+1))} disabled={configStep===8}>Next →</button>
              </div>
            </div>
          )}

          {/* ═══ REPORTS ═══ */}
          {activeTab==="reports" && (
            <div className="fade-in">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20,maxWidth:320}}>
                <button style={{...tBtn(reportsTab==="inflation",T.accent),justifyContent:"center"}} onClick={()=>setReportsTab("inflation")}>CPI Report</button>
                <button style={{...tBtn(reportsTab==="uf",T.accent),justifyContent:"center"}} onClick={()=>setReportsTab("uf")}>KES-UF Report</button>
              </div>

              {reportsTab==="inflation" && (
                <div>
                  <div style={section}>KNBS CPI — All Sub-Indices · Kenya National Bureau of Statistics</div>
                  <div className="crp-cpi-tabs" style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap",overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
                    {["overall","construction","health","food","transport","housing","energy","manufacturing","services","education","utilities"].map(k=>(
                      <button key={k} onClick={()=>setInflView(k)} style={{...tBtn(inflView===k,T.accent),padding:"6px 12px",fontSize:11,flexShrink:0}}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
                    ))}
                  </div>
                  <div style={card()}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
                      <div>
                        <div style={label}>{inflView.toUpperCase()} CPI YoY%</div>
                        <div style={{fontSize:36,fontWeight:700,color:T.accent,fontFamily:T.mono}}>{latestCPI[inflView]}%<span style={{fontSize:13,fontWeight:400,color:T.textDim,marginLeft:10}}>{latestCPI.month}</span></div>
                      </div>
                      <div style={{display:"flex",gap:20}}>
                        {[["Min",Math.min(...KNBS_CPI.map(d=>d[inflView]||0))],["Max",Math.max(...KNBS_CPI.map(d=>d[inflView]||0))],["Avg",KNBS_CPI.reduce((s,d)=>s+(d[inflView]||0),0)/KNBS_CPI.length]].map(([l,v])=>(
                          <div key={l} style={{textAlign:"center"}}>
                            <div style={{fontSize:10,color:T.textDim,fontFamily:T.sans}}>{l}</div>
                            <div style={{fontSize:16,fontWeight:700,color:T.accent,fontFamily:T.mono}}>{v.toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <AxisChart data={KNBS_CPI} yKey={inflView} color={T.accent} h={112} yLabel="%" xKey="month"/>
                    <div style={{fontSize:10,color:T.textDim,marginTop:8,textAlign:"right",fontFamily:T.mono}}>Source: Kenya National Bureau of Statistics (KNBS) · YoY%</div>
                  </div>
                  <div style={card()}>
                    <div style={section}>Cross-Sector CPI Summary</div>
                    <div className="crp-table-scroll" style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:480}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${T.border}`}}>
                          {[["Index",false],["Latest",false],["3mo Avg",true],["6mo Avg",true],["Trend",false],[`CRP Impact (${Math.round(contractMonths)}mo)`,false]].map(([h,hide])=>(
                            <th key={h} className={hide?"crp-rank-col-hide":""} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.textDim,textTransform:"uppercase",letterSpacing:1,fontFamily:T.sans,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["overall","construction","health","food","transport","housing","energy","manufacturing","services","education","utilities"].map((key,i)=>{
                          const vals=KNBS_CPI.map(d=>d[key]||0),latest=vals[vals.length-1];
                          const avg3=(vals.slice(-3).reduce((a,b)=>a+b,0)/3).toFixed(1);
                          const avg6=(vals.slice(-6).reduce((a,b)=>a+b,0)/6).toFixed(1);
                          const trend=latest>parseFloat(avg3)?"▲ Rising":latest<parseFloat(avg3)?"▼ Easing":"→ Stable";
                          const tc=latest>parseFloat(avg3)?T.red:latest<parseFloat(avg3)?T.green:T.textMid;
                          const impact=((latest/100)*(contractMonths/12)*100).toFixed(2);
                          return (
                            <tr key={key} style={{borderBottom:`1px solid ${T.bg}`,background:i%2?T.surface2:"transparent"}}>
                              <td style={{padding:"8px 10px",color:T.text,fontWeight:600,textTransform:"capitalize",fontFamily:T.sans}}>{key}</td>
                              <td style={{padding:"8px 10px",color:T.accent,fontWeight:700,fontFamily:T.mono}}>{latest}%</td>
                              <td className="crp-rank-col-hide" style={{padding:"8px 10px",color:T.textMid,fontFamily:T.mono}}>{avg3}%</td>
                              <td className="crp-rank-col-hide" style={{padding:"8px 10px",color:T.textMid,fontFamily:T.mono}}>{avg6}%</td>
                              <td style={{padding:"8px 10px",color:tc,fontSize:12,fontFamily:T.mono}}>{trend}</td>
                              <td style={{padding:"8px 10px"}}>
                                <span style={{background:parseFloat(impact)>8?T.redDim:parseFloat(impact)>5?T.amberDim:T.greenDim,color:parseFloat(impact)>8?T.red:parseFloat(impact)>5?T.amber:T.green,padding:"2px 8px",borderRadius:4,fontSize:11,fontFamily:T.mono,fontWeight:700}}>+{impact}%</span>
                              </td>
                            </tr>
                          );
                        })}
                        </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}

              {reportsTab==="uf" && (
                <div>
                  <div style={section}>KES-UF Index · Modelled on Chile's Unidad de Fomento</div>
                  <div style={alertBox("b")}>
                    ℹ The KES-UF is a daily-compounded unit of account derived from KNBS sector sub-indices. Base: KES {KES_UF_BASE.toLocaleString()} (May-24). Denominating contracts in KES-UF protects purchasing power without renegotiation.
                  </div>
                  <div className="crp-report-uf-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8,marginBottom:20}}>
                    {Object.entries(SECTORS).map(([sid,s])=>{
                      const uf=buildUF(s.inflationKey),latest=uf[uf.length-1];
                      return (
                        <button key={sid} onClick={()=>setActiveSec(sid)}
                          style={{background:activeSec===sid?`${s.color}15`:T.surface,border:`1px solid ${activeSec===sid?s.color:T.border}`,borderRadius:8,padding:12,cursor:"pointer",textAlign:"left",transition:"all 0.15s",outline:"none"}}>
                          <div style={{fontSize:14,marginBottom:3}}>{s.icon}</div>
                          <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:4,fontFamily:T.sans}}>{s.label.split("&")[0].trim()}</div>
                          <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:T.mono}}>KES {latest?latest.uf.toFixed(2):"—"}</div>
                          <div style={{fontSize:10,color:T.textDim,marginTop:2,fontFamily:T.mono}}>+{latest?latest.erosion:0}%</div>
                          <div style={{marginTop:4}}><Bar value={latest?latest.erosion:0} max={18} color={s.color} h={3}/></div>
                        </button>
                      );
                    })}
                  </div>
                  {activeSec && secTabSec && (()=>{
                    const uf=buildUF(secTabSec.inflationKey),latest=uf[uf.length-1];
                    return (
                      <div style={cardHL(secTabSec.color)}>
                        <div style={section}>{secTabSec.icon} {secTabSec.label} · KES-UF Detail</div>
                        <div className="crp-g3" style={g3}>
                          {[["Current KES-UF",`KES ${latest?latest.uf.toFixed(2):"—"}`,secTabSec.color,"Base KES 1,000 (May-24)"],["Total Erosion",`+${latest?latest.erosion:0}%`,T.amber,"Since inception"],["Sector CPI",`${latest?latest.cpi:0}%`,T.red,`KNBS ${secTabSec.inflationKey}`]].map(([l,v,c,sub])=>(
                            <div key={l}>
                              <div style={label}>{l}</div>
                              <div style={bigNum(c)}>{v}</div>
                              <div style={{fontSize:12,color:T.textMid,marginTop:6}}>{sub}</div>
                            </div>
                          ))}
                        </div>
                        <AxisChart data={uf} yKey="uf" color={secTabSec.color} h={96} yLabel="" xKey="month"/>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ═══ TRACK ═══ */}
          {activeTab==="track" && (
            <div className="fade-in">
              <div style={card()}>
                <div style={section}>Contract Monitoring</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:20}}>
                  {[
                    {icon:"🔍",title:"Enter Code",desc:"Paste the KRP reference code from Configure → Step 8"},
                    {icon:"📊",title:"Live Recompute",desc:"CRP is recalculated using today's KNBS & market data"},
                    {icon:"💰",title:"Value Delta",desc:"See how much the contract value has shifted since award"},
                  ].map(c=>(
                    <div key={c.title} style={{background:T.bg,borderRadius:8,padding:"12px 14px",border:`1px solid ${T.border}`,display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:20}}>{c.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:T.sans,marginBottom:3}}>{c.title}</div>
                        <div style={{fontSize:12,color:T.textMid,lineHeight:1.5}}>{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="crp-track-form" style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:260}}>
                    <div style={label}>Reference Code</div>
                    <input type="text" placeholder="KRP-20260422-CONS-MT-X7K9-Q3R"
                      value={trackCode} onChange={e=>setTrackCode(e.target.value.toUpperCase())}
                      onKeyDown={e=>{if(e.key==="Enter")handleTrack();}}
                      style={{...inp,width:"100%",fontSize:14,fontWeight:700,letterSpacing:1.5,fontFamily:T.mono,borderColor:trackCode?T.accent:T.border}}/>
                    <div style={{fontSize:11,color:T.textDim,marginTop:5,fontFamily:T.mono}}>Format: KRP-YYYYMMDD-SECT-DUR-XXXX-XXX</div>
                  </div>
                  <button onClick={handleTrack} disabled={trackLoading||!trackCode.trim()}
                    style={{...btn(!!trackCode.trim(),T.accent),padding:"11px 24px",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>
                    {trackLoading?"⟳ Loading…":"🔍 Retrieve Contract"}
                  </button>
                </div>
                {trackError && <div style={{...alertBox("r"),marginTop:12}}>{trackError}</div>}
              </div>

              {trackResult && (()=>{
                const tr=trackResult;
                const s=SECTORS[tr.sector];
                const crpDelta=tr.curCRP.total-tr.originalCRP;
                const crpDeltaColor=crpDelta>0?T.red:crpDelta<0?T.green:T.textMid;
                const payDelta=tr.curAdjPay-tr.originalAdjustedPayment;
                const payDeltaPct=tr.originalAdjustedPayment>0?(payDelta/tr.originalAdjustedPayment)*100:0;
                const progress=Math.min(tr.elapsed/tr.contractDays,1);
                const endDateObj=new Date(tr.endDate);
                const daysLeft=Math.max(0,Math.round((endDateObj-new Date())/86400000));
                const inflKey=s?s.inflationKey:"overall";
                const recentCPI=KNBS_CPI.slice(-8);
                return (
                  <div>
                    {/* Code Banner */}
                    <div className="code-glow" style={{background:T.bg,border:`2px solid ${T.accent}`,borderRadius:12,padding:"var(--crp-card-pad,18px) 22px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:T.textDim,textTransform:"uppercase",marginBottom:4,fontFamily:T.sans}}>Reference</div>
                        <div style={{fontSize:22,fontWeight:700,color:T.accent,fontFamily:T.mono,letterSpacing:2}}>{tr.code}</div>
                        <div style={{fontSize:11,color:T.textDim,marginTop:3,fontFamily:T.mono}}>Issued: {new Date(tr.generatedAt).toLocaleString("en-KE")} · {s?s.icon:""} {tr.sectorLabel}</div>
                      </div>
                      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                        {[["Value",`KES ${fmt(tr.contractValue)}`,T.amber],["Duration",`${Math.round(tr.contractDays)}d`,T.green],["Remaining",`${daysLeft}d`,daysLeft<30?T.red:T.text]].map(([l,v,c])=>(
                          <div key={l} style={{textAlign:"center"}}>
                            <div style={{fontSize:10,color:T.textDim,fontFamily:T.sans,letterSpacing:1}}>{l}</div>
                            <div style={{fontSize:16,fontWeight:700,color:c,fontFamily:T.mono}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={card()}>
                      <div style={section}>Contract Period Progress</div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textDim,marginBottom:8,fontFamily:T.mono}}>
                        <span>{new Date(tr.generatedAt).toLocaleDateString("en-KE")}</span>
                        <span style={{color:T.accent,fontWeight:700}}>{(progress*100).toFixed(0)}% elapsed · {tr.elapsed}d</span>
                        <span>{endDateObj.toLocaleDateString("en-KE")}</span>
                      </div>
                      <div style={{background:T.border,borderRadius:6,height:14,overflow:"hidden",marginBottom:6}}>
                        <div style={{width:`${(progress*100).toFixed(0)}%`,height:"100%",background:`linear-gradient(90deg,${T.green},${progress>0.75?T.amber:T.accent})`,borderRadius:6,transition:"width 0.8s ease",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6}}>
                          {progress>0.05&&<span style={{fontSize:9,fontWeight:700,color:T.surface}}>{(progress*100).toFixed(0)}%</span>}
                        </div>
                      </div>
                    </div>

                    {/* CRP Movement + Sharpe */}
                    <div className="crp-g2" style={g2}>
                      <div style={card({marginBottom:0})}>
                        <div style={section}>CRP Movement Since Award</div>
                        <div style={{display:"flex",gap:12,marginBottom:12}}>
                          <div style={{flex:1,background:T.bg,borderRadius:8,padding:12,border:`1px solid ${T.border}`}}>
                            <div style={{fontSize:10,color:T.textDim,marginBottom:4,fontFamily:T.sans}}>At Award</div>
                            <div style={{fontSize:24,fontWeight:700,color:T.textMid,fontFamily:T.mono}}>{tr.originalCRP.toFixed(2)}%</div>
                          </div>
                          <div style={{flex:1,background:T.bg,borderRadius:8,padding:12,border:`1px solid ${crpDelta>0?T.red:crpDelta<0?T.green:T.border}`}}>
                            <div style={{fontSize:10,color:T.textDim,marginBottom:4,fontFamily:T.sans}}>Current</div>
                            <div style={{fontSize:24,fontWeight:700,color:crpDeltaColor,fontFamily:T.mono}}>{tr.curCRP.total.toFixed(2)}%</div>
                            <div style={{fontSize:11,color:crpDeltaColor,fontFamily:T.mono}}>{crpDelta>=0?"+":""}{crpDelta.toFixed(2)}pp</div>
                          </div>
                        </div>
                        <div style={{background:T.bg,borderRadius:8,padding:12,border:`1px solid ${T.border}`}}>
                          <div style={{fontSize:10,color:T.textDim,marginBottom:4,fontFamily:T.sans}}>Sector CPI — Current vs Award</div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{fontSize:18,fontWeight:700,color:T.amber,fontFamily:T.mono}}>{tr.curSectorCPI.toFixed(1)}%</div>
                            <div style={{fontSize:11,color:tr.curSectorCPI>tr.originalSectorCPI?T.red:T.green,fontFamily:T.mono}}>
                              {tr.curSectorCPI>tr.originalSectorCPI?"▲":"▼"} {Math.abs(tr.curSectorCPI-tr.originalSectorCPI).toFixed(1)}pp (was {tr.originalSectorCPI.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={card({marginBottom:0})}>
                        <div style={section}>Current Market Efficiency</div>
                        <SharpeGauge value={tr.curSharpe} baseline={s?s.sharpeBase:0.5}/>
                        <div style={{marginTop:12,background:T.bg,borderRadius:8,padding:12,border:`1px solid ${T.border}`}}>
                          <div style={{fontSize:10,color:T.textDim,marginBottom:8,fontFamily:T.sans}}>KES-UF Erosion</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                            {[["At Award",`${tr.ufErosionAtAward.toFixed(2)}%`,T.textDim],["Current",`${tr.curUFEr.toFixed(2)}%`,T.green]].map(([l,v,c])=>(
                              <div key={l}><div style={{fontSize:10,color:T.textDim}}>{l}</div><div style={{fontSize:16,fontWeight:700,color:c,fontFamily:T.mono}}>{v}</div></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Tracker */}
                    <div style={cardHL("#e879f9")}>
                      <div style={section}>Contract Money Value Tracker</div>
                      <div style={{...alertBox("g"),marginBottom:16}}>
                        ⚖ Shows how this contract's monetary value has evolved since award based on current Kenya market conditions.
                      </div>
                      <div className="crp-g4" style={g4}>
                        {[
                          {lbl:"Original BoQ",val:`KES ${fmt(tr.contractValue)}`,sub:"Agreed at award",color:T.textDim},
                          {lbl:"Original Ratio-Adjusted",val:`KES ${fmt(tr.originalAdjustedPayment)}`,sub:`CRP ${tr.originalCRP.toFixed(2)}% at award`,color:T.textMid},
                          {lbl:"Current Ratio-Adjusted",val:`KES ${fmt(tr.curAdjPay)}`,sub:`CRP ${tr.curCRP.total.toFixed(2)}% today`,color:payDelta>0?T.red:T.green},
                          {lbl:"Value Change",val:`${payDelta>=0?"+":"−"}KES ${fmt(Math.abs(payDelta))}`,sub:`${payDelta>=0?"+":""}${payDeltaPct.toFixed(2)}% vs original`,color:payDelta>0?T.red:T.green},
                        ].map((item,i)=>(
                          <div key={i} style={{background:T.bg,borderRadius:8,padding:14,border:`1px solid ${item.color}33`}}>
                            <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:item.color,textTransform:"uppercase",marginBottom:5,fontFamily:T.sans}}>{item.lbl}</div>
                            <div style={{fontSize:16,fontWeight:700,color:item.color,fontFamily:T.mono,marginBottom:4}}>{item.val}</div>
                            <div style={{fontSize:11,color:T.textDim}}>{item.sub}</div>
                          </div>
                        ))}
                      </div>
                      <div className="crp-table-scroll" style={{overflowX:"auto",marginTop:12}}>
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:380}}>
                        <thead>
                          <tr style={{borderBottom:`1px solid ${T.border}`}}>
                            {["Scenario","At Award","Current","Change"].map(h=>(
                              <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.textDim,textTransform:"uppercase",letterSpacing:1,fontFamily:T.sans,whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {label:"Base Contract",award:`KES ${fmt(tr.contractValue)}`,cur:`KES ${fmt(tr.contractValue)}`,delta:"—",dc:T.textDim},
                            {label:"Market-Priced",award:`KES ${fmt(Math.round(tr.contractValue*(1+tr.originalCRP/100)))}`,cur:`KES ${fmt(tr.curMktPay)}`,delta:`+KES ${fmt(tr.curMktPay-Math.round(tr.contractValue*(1+tr.originalCRP/100)))}`,dc:T.red},
                            {label:"KES-UF Protected",award:`KES ${fmt(Math.round(tr.contractValue*(1+tr.ufErosionAtAward/100)))}`,cur:`KES ${fmt(tr.curRatio.ufPay)}`,delta:`+KES ${fmt(tr.curRatio.ufPay-Math.round(tr.contractValue*(1+tr.ufErosionAtAward/100)))}`,dc:T.green},
                            {label:"Ratio-Adjusted ✓",award:`KES ${fmt(tr.originalAdjustedPayment)}`,cur:`KES ${fmt(tr.curAdjPay)}`,delta:`${payDelta>=0?"+":""}KES ${fmt(Math.abs(payDelta))}`,dc:payDelta>0?T.red:T.green,hi:true},
                          ].map((row,i)=>(
                            <tr key={i} style={{borderBottom:`1px solid ${T.bg}`,background:row.hi?`${"#7c3aed"}12`:"transparent"}}>
                              <td style={{padding:"10px",fontSize:13,fontWeight:row.hi?700:400,color:row.hi?T.text:T.textMid,fontFamily:T.sans}}>{row.label}</td>
                              <td style={{padding:"10px",fontSize:12,color:T.textMid,fontFamily:T.mono}}>{row.award}</td>
                              <td style={{padding:"10px",fontSize:12,fontWeight:row.hi?700:400,color:row.hi?"#e879f9":T.textMid,fontFamily:T.mono}}>{row.cur}</td>
                              <td style={{padding:"10px",fontSize:12,fontWeight:700,color:row.dc,fontFamily:T.mono}}>{row.delta}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>

                    {/* CPI Trend */}
                    <div style={card()}>
                      <div style={section}>KNBS {inflKey.toUpperCase()} CPI Trend — Last 8 Months</div>
                      <AxisChart data={recentCPI} yKey={inflKey} color={s?s.color:T.accent} h={130} yLabel="%" xKey="month"/>
                    </div>

                    {/* Party details */}
                    <div className="crp-g2" style={g2}>
                      {[{title:"Obligee (Client)",data:tr.obligee,color:T.green},{title:"Obligor (Supplier)",data:tr.obligor,color:T.amber}].map(({title,data,color})=>(
                        <div key={title} style={{background:T.bg,border:`1px solid ${color}33`,borderRadius:10,padding:16}}>
                          <div style={{fontSize:13,fontWeight:700,color,marginBottom:12,fontFamily:T.sans}}>{title}</div>
                          {["fullName","kraPin","phone","email","address","repName","repTitle"].map(k=>(
                            data&&data[k]?<div key={k} style={{display:"flex",gap:10,marginBottom:6}}>
                              <span style={{color:T.textDim,minWidth:90,flexShrink:0,fontSize:11,fontFamily:T.sans}}>{k==="fullName"?"Legal Name":k==="kraPin"?"KRA PIN":k==="repName"?"Rep.":k==="repTitle"?"Title":k.charAt(0).toUpperCase()+k.slice(1)}:</span>
                              <span style={{color:T.text,fontSize:11,fontFamily:T.mono}}>{data[k]}</span>
                            </div>:null
                          ))}
                          {(!data||!data.fullName)&&<div style={{color:T.textDim,fontSize:12}}>No party information recorded</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>
    </div>
    </ThemeCtx.Provider>
  );
}