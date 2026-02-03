
import { DGRChapter, DGRVariation } from './types';
import { Package, Plane, AlertTriangle, Box, ShieldCheck, FileText, Globe, Layers, Search, Check, Zap, Truck, Anchor, Info, BookOpen, FlaskConical, ListFilter, Ban, Radiation, Library, Scale, FileQuestion, Building2, Tag } from 'lucide-react';

export const APP_VERSION = "67ª Edição (2026)";

// --- DATABASE GENERATION ENGINE ---

// 1. PI MAPPING MATRIX (The brain of the generator)
// Maps Class + PG to standard IATA Packing Instructions
const PI_MAP: Record<string, { pax: string, pax_max: string, cao: string, cao_max: string, lq: string, lq_max: string }> = {
    "1.4S": { pax: "130", pax_max: "25 kg", cao: "130", cao_max: "100 kg", lq: "Forbidden", lq_max: "Forbidden" },
    "2.1": { pax: "200", pax_max: "75 kg", cao: "200", cao_max: "150 kg", lq: "Y203", lq_max: "30 kg" }, 
    "2.2": { pax: "200", pax_max: "75 kg", cao: "200", cao_max: "150 kg", lq: "Y203", lq_max: "30 kg" },
    "2.3": { pax: "Forbidden", pax_max: "Forbidden", cao: "200", cao_max: "150 kg", lq: "Forbidden", lq_max: "Forbidden" },
    "3-I":  { pax: "351", pax_max: "1 L", cao: "361", cao_max: "30 L", lq: "Forbidden", lq_max: "Forbidden" },
    "3-II": { pax: "353", pax_max: "5 L", cao: "364", cao_max: "60 L", lq: "Y341", lq_max: "1 L" },
    "3-III":{ pax: "355", pax_max: "60 L", cao: "366", cao_max: "220 L", lq: "Y344", lq_max: "10 L" },
    "4.1-II": { pax: "445", pax_max: "15 kg", cao: "448", cao_max: "50 kg", lq: "Y441", lq_max: "1 kg" },
    "4.1-III": { pax: "446", pax_max: "25 kg", cao: "449", cao_max: "100 kg", lq: "Y443", lq_max: "10 kg" },
    "4.2-II": { pax: "466", pax_max: "15 kg", cao: "468", cao_max: "50 kg", lq: "Forbidden", lq_max: "Forbidden" },
    "4.3-II": { pax: "484", pax_max: "15 kg", cao: "490", cao_max: "50 kg", lq: "Y475", lq_max: "0.5 kg" },
    "5.1-II": { pax: "550", pax_max: "5 L", cao: "554", cao_max: "25 L", lq: "Y540", lq_max: "0.5 L" },
    "5.1-III": { pax: "551", pax_max: "25 L", cao: "555", cao_max: "220 L", lq: "Y541", lq_max: "2.5 L" },
    "5.2-II": { pax: "570", pax_max: "5 L", cao: "572", cao_max: "25 L", lq: "Forbidden", lq_max: "Forbidden" },
    "6.1-I":  { pax: "652", pax_max: "1 L", cao: "658", cao_max: "30 L", lq: "Forbidden", lq_max: "Forbidden" },
    "6.1-II": { pax: "654", pax_max: "5 L", cao: "662", cao_max: "60 L", lq: "Y641", lq_max: "1 L" },
    "6.1-III": { pax: "655", pax_max: "60 L", cao: "663", cao_max: "220 L", lq: "Y642", lq_max: "2 L" },
    "8-I": { pax: "850", pax_max: "0.5 L", cao: "854", cao_max: "2.5 L", lq: "Forbidden", lq_max: "Forbidden" },
    "8-II": { pax: "851", pax_max: "1 L", cao: "855", cao_max: "30 L", lq: "Y840", lq_max: "0.5 L" },
    "8-III": { pax: "852", pax_max: "5 L", cao: "856", cao_max: "60 L", lq: "Y841", lq_max: "1 L" },
    "9-II": { pax: "956", pax_max: "100 kg", cao: "956", cao_max: "200 kg", lq: "Y956", lq_max: "30 kg" },
    "9-III": { pax: "964", pax_max: "450 L", cao: "964", cao_max: "450 L", lq: "Y964", lq_max: "30 kg" },
};

// 2. High-Fidelity Real Data (Commonly used items in aviation)
const REAL_BLUE_PAGES = [
    { un: "0012", name: "Cartridges for weapons, inert projectile", class: "1.4S", sub: "", pg: "II", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "130", pax_max: "25 kg", cao_pi: "130", cao_max: "100 kg", sp: "A163", erg: "1L" },
    { un: "0336", name: "Fireworks (Fogos de Artifício)", class: "1.4G", sub: "", pg: "II", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "135", cao_max: "75 kg", sp: "A163", erg: "1L" },
    { un: "1013", name: "Carbon dioxide (Dióxido de Carbono)", class: "2.2", sub: "", pg: "", eq: "E1", lq_pi: "Y203", lq_max: "30 kg", pax_pi: "203", pax_max: "75 kg", cao_pi: "203", cao_max: "150 kg", sp: "A202", erg: "2L" },
    { un: "1044", name: "Fire extinguishers (Extintores de Incêndio)", class: "2.2", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "213", pax_max: "75 kg", cao_pi: "213", cao_max: "150 kg", sp: "A19", erg: "2L" },
    { un: "1057", name: "Lighters (Isqueiros)", class: "2.1", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "205", cao_max: "10 kg", sp: "", erg: "10L" },
    { un: "1066", name: "Nitrogen, compressed (Nitrogênio Comprimido)", class: "2.2", sub: "", pg: "", eq: "E1", lq_pi: "Y200", lq_max: "30 kg", pax_pi: "200", pax_max: "75 kg", cao_pi: "200", cao_max: "150 kg", sp: "A69", erg: "2L" },
    { un: "1072", name: "Oxygen, compressed (Oxigênio Comprimido)", class: "2.2", sub: "5.1", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "200", pax_max: "75 kg", cao_pi: "200", cao_max: "150 kg", sp: "A302", erg: "2X" },
    { un: "1090", name: "Acetone (Acetona)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "", erg: "3H" },
    { un: "1133", name: "Adhesives (Adesivos - contendo líquido inflamável)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A3", erg: "3L" },
    { un: "1170", name: "Ethanol (Ethyl alcohol)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A3 A58", erg: "3L" },
    { un: "1170", name: "Ethanol (Ethyl alcohol)", class: "3", sub: "", pg: "III", eq: "E1", lq_pi: "Y344", lq_max: "10 L", pax_pi: "355", pax_max: "60 L", cao_pi: "366", cao_max: "220 L", sp: "A3 A58", erg: "3L" },
    { un: "1202", name: "Gas oil (Óleo Diesel)", class: "3", sub: "", pg: "III", eq: "E1", lq_pi: "Y344", lq_max: "10 L", pax_pi: "355", pax_max: "60 L", cao_pi: "366", cao_max: "220 L", sp: "A3", erg: "3L" },
    { un: "1203", name: "Gasoline (Gasolina)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A100", erg: "3H" },
    { un: "1223", name: "Kerosene (Querosene)", class: "3", sub: "", pg: "III", eq: "E1", lq_pi: "Y344", lq_max: "10 L", pax_pi: "355", pax_max: "60 L", cao_pi: "366", cao_max: "220 L", sp: "A324", erg: "3L" },
    { un: "1230", name: "Methanol", class: "3", sub: "6.1", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "352", pax_max: "1 L", cao_pi: "364", cao_max: "60 L", sp: "A113", erg: "3P" },
    { un: "1263", name: "Paint (Tinta - Inflamável)", class: "3", sub: "", pg: "I", eq: "E3", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "351", pax_max: "1 L", cao_pi: "361", cao_max: "30 L", sp: "A3 A72", erg: "3L" },
    { un: "1263", name: "Paint (Tinta - Inflamável)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A3 A72", erg: "3L" },
    { un: "1263", name: "Paint (Tinta - Inflamável)", class: "3", sub: "", pg: "III", eq: "E1", lq_pi: "Y344", lq_max: "10 L", pax_pi: "355", pax_max: "60 L", cao_pi: "366", cao_max: "220 L", sp: "A3 A72", erg: "3L" },
    { un: "1266", name: "Perfumery products", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A3 A72", erg: "3L" },
    { un: "1400", name: "Barium (Bário)", class: "4.3", sub: "", pg: "II", eq: "E2", lq_pi: "Y475", lq_max: "0.5 kg", pax_pi: "484", pax_max: "15 kg", cao_pi: "490", cao_max: "50 kg", sp: "", erg: "4W" },
    { un: "1544", name: "Alkaloids, solid, n.o.s.", class: "6.1", sub: "", pg: "II", eq: "E4", lq_pi: "Y644", lq_max: "1 kg", pax_pi: "669", pax_max: "25 kg", cao_pi: "676", cao_max: "100 kg", sp: "A3 A5", erg: "6L" },
    { un: "1715", name: "Acetic anhydride", class: "8", sub: "3", pg: "II", eq: "E2", lq_pi: "Y840", lq_max: "0.5 L", pax_pi: "851", pax_max: "1 L", cao_pi: "855", cao_max: "30 L", sp: "", erg: "8F" },
    { un: "1760", name: "Corrosive liquid, n.o.s.", class: "8", sub: "", pg: "II", eq: "E2", lq_pi: "Y840", lq_max: "0.5 L", pax_pi: "851", pax_max: "1 L", cao_pi: "855", cao_max: "30 L", sp: "A3", erg: "8L" },
    { un: "1760", name: "Corrosive liquid, n.o.s.", class: "8", sub: "", pg: "III", eq: "E1", lq_pi: "Y841", lq_max: "1 L", pax_pi: "852", pax_max: "5 L", cao_pi: "856", cao_max: "60 L", sp: "A3", erg: "8L" },
    { un: "1789", name: "Hydrochloric acid (Ácido Clorídrico)", class: "8", sub: "", pg: "II", eq: "E2", lq_pi: "Y840", lq_max: "0.5 L", pax_pi: "851", pax_max: "1 L", cao_pi: "855", cao_max: "30 L", sp: "A3", erg: "8L" },
    { un: "1791", name: "Hypochlorite solution (Hipoclorito)", class: "8", sub: "", pg: "II", eq: "E2", lq_pi: "Y840", lq_max: "0.5 L", pax_pi: "851", pax_max: "1 L", cao_pi: "855", cao_max: "30 L", sp: "A3", erg: "8L" },
    { un: "1824", name: "Sodium hydroxide solution", class: "8", sub: "", pg: "II", eq: "E2", lq_pi: "Y840", lq_max: "0.5 L", pax_pi: "851", pax_max: "1 L", cao_pi: "855", cao_max: "30 L", sp: "A3", erg: "8L" },
    { un: "1830", name: "Sulphuric acid (Ácido Sulfúrico)", class: "8", sub: "", pg: "II", eq: "E2", lq_pi: "Y840", lq_max: "0.5 L", pax_pi: "851", pax_max: "1 L", cao_pi: "855", cao_max: "30 L", sp: "", erg: "8L" },
    { un: "1845", name: "Carbon dioxide, solid (Dry Ice) / Gelo Seco", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "954", pax_max: "200 kg", cao_pi: "954", cao_max: "200 kg", sp: "A48 A151", erg: "9L" },
    { un: "1863", name: "Fuel, aviation, turbine engine (Combustível de Aviação)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A3", erg: "3L" },
    { un: "1950", name: "Aerosols, flammable", class: "2.1", sub: "", pg: "", eq: "E0", lq_pi: "Y203", lq_max: "30 kg", pax_pi: "203", pax_max: "75 kg", cao_pi: "203", cao_max: "150 kg", sp: "A145", erg: "10L" },
    { un: "1950", name: "Aerosols, non-flammable", class: "2.2", sub: "", pg: "", eq: "E0", lq_pi: "Y203", lq_max: "30 kg", pax_pi: "203", pax_max: "75 kg", cao_pi: "203", cao_max: "150 kg", sp: "A145", erg: "2L" },
    { un: "1966", name: "Hydrogen, refrigerated liquid", class: "2.1", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "Forbidden", cao_max: "Forbidden", sp: "", erg: "10L" },
    { un: "1993", name: "Flammable liquid, n.o.s.", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A3", erg: "3L" },
    { un: "2014", name: "Hydrogen peroxide, aqueous solution", class: "5.1", sub: "8", pg: "II", eq: "E2", lq_pi: "Y540", lq_max: "0.5 L", pax_pi: "550", pax_max: "1 L", cao_pi: "554", cao_max: "5 L", sp: "A2 A75", erg: "5C" },
    { un: "2031", name: "Nitric acid (Ácido Nítrico - fume)", class: "8", sub: "5.1", pg: "I", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "854", cao_max: "2.5 L", sp: "A1", erg: "8P" },
    { un: "2211", name: "Polymetric beads, expandable", class: "9", sub: "", pg: "III", eq: "E1", lq_pi: "Y956", lq_max: "30 kg", pax_pi: "956", pax_max: "100 kg", cao_pi: "956", cao_max: "200 kg", sp: "A202", erg: "9L" },
    { un: "2315", name: "Polychlorinated biphenyls, liquid", class: "9", sub: "", pg: "II", eq: "E2", lq_pi: "Y964", lq_max: "1 L", pax_pi: "964", pax_max: "100 L", cao_pi: "964", cao_max: "220 L", sp: "A97", erg: "9L" },
    { un: "2794", name: "Batteries, wet, filled with acid", class: "8", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "870", pax_max: "30 kg", cao_pi: "870", cao_max: "No Limit", sp: "A51 A164", erg: "8L" },
    { un: "2800", name: "Batteries, wet, non-spillable", class: "8", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "872", pax_max: "No Limit", cao_pi: "872", cao_max: "No Limit", sp: "A48 A67", erg: "8L" },
    { un: "2814", name: "Infectious substance, affecting humans", class: "6.2", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "620", pax_max: "50 mL", cao_pi: "620", cao_max: "4 L", sp: "A81", erg: "11L" },
    { un: "2908", name: "Radioactive material, excepted package", class: "7", sub: "", pg: "", eq: "E0", lq_pi: "N/A", lq_max: "N/A", pax_pi: "See 10.5", pax_max: "N/A", cao_pi: "See 10.5", cao_max: "N/A", sp: "", erg: "7L" },
    { un: "2911", name: "Radioactive material, excepted package - instruments", class: "7", sub: "", pg: "", eq: "E0", lq_pi: "N/A", lq_max: "N/A", pax_pi: "See 10.5", pax_max: "N/A", cao_pi: "See 10.5", cao_max: "N/A", sp: "", erg: "7L" },
    { un: "3065", name: "Alcoholic beverages (Bebidas Alcoólicas > 70%)", class: "3", sub: "", pg: "II", eq: "E2", lq_pi: "Y341", lq_max: "1 L", pax_pi: "353", pax_max: "5 L", cao_pi: "364", cao_max: "60 L", sp: "A9", erg: "3L" },
    { un: "3077", name: "Environmentally hazardous substance, solid, n.o.s.", class: "9", sub: "", pg: "III", eq: "E1", lq_pi: "Y956", lq_max: "30 kg", pax_pi: "956", pax_max: "400 kg", cao_pi: "956", cao_max: "400 kg", sp: "A97 A158", erg: "9L" },
    { un: "3082", name: "Environmentally hazardous substance, liquid, n.o.s.", class: "9", sub: "", pg: "III", eq: "E1", lq_pi: "Y964", lq_max: "30 kg", pax_pi: "964", pax_max: "450 L", cao_pi: "964", cao_max: "450 L", sp: "A97 A158", erg: "9L" },
    { un: "3090", name: "Lithium metal batteries", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "968", cao_max: "35 kg", sp: "A88 A99", erg: "12FZ" },
    { un: "3091", name: "Lithium metal batteries contained in equipment", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "970", pax_max: "5 kg", cao_pi: "970", cao_max: "35 kg", sp: "A48", erg: "12FZ" },
    { un: "3166", name: "Vehicle, flammable gas powered", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "950", pax_max: "No Limit", cao_pi: "950", cao_max: "No Limit", sp: "A21", erg: "9L" },
    { un: "3171", name: "Battery-powered vehicle", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "952", pax_max: "No Limit", cao_pi: "952", cao_max: "No Limit", sp: "A21", erg: "9L" },
    { un: "3316", name: "Chemical kit", class: "9", sub: "", pg: "II", eq: "E0", lq_pi: "Y960", lq_max: "1 kg", pax_pi: "960", pax_max: "10 kg", cao_pi: "960", cao_max: "10 kg", sp: "A44 A163", erg: "9L" },
    { un: "3356", name: "Oxygen generator, chemical", class: "5.1", sub: "", pg: "II", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "565", cao_max: "25 kg", sp: "", erg: "5L" },
    { un: "3373", name: "Biological substance, Category B", class: "6.2", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "650", pax_max: "4 L", cao_pi: "650", cao_max: "4 L", sp: "", erg: "11L" },
    { un: "3480", name: "Lithium ion batteries (Baterias de Íon Lítio)", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "Forbidden", pax_max: "Forbidden", cao_pi: "965", cao_max: "35 kg", sp: "A88 A99 A154", erg: "12FZ" },
    { un: "3481", name: "Lithium ion batteries contained in equipment", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "967", pax_max: "5 kg", cao_pi: "967", cao_max: "35 kg", sp: "A48 A99", erg: "12FZ" },
    { un: "3481", name: "Lithium ion batteries packed with equipment", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "966", pax_max: "5 kg", cao_pi: "966", cao_max: "35 kg", sp: "A88 A99", erg: "12FZ" },
    { un: "3528", name: "Engine, internal combustion, flammable liquid powered", class: "3", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "378", pax_max: "No Limit", cao_pi: "378", cao_max: "No Limit", sp: "A70 A87", erg: "3L" },
    { un: "8000", name: "Consumer commodity (ID 8000)", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Y963", lq_max: "30 kg", pax_pi: "963", pax_max: "30 kg", cao_pi: "963", cao_max: "30 kg", sp: "A112", erg: "9L" }
];

// --- GENERATOR FUNCTIONS ---

const generateFillerData = () => {
    const existingUNs = new Set(REAL_BLUE_PAGES.map(i => parseInt(i.un)));
    const filler: Record<string, any>[] = [];
    
    // Mapping UN ranges to likely classes
    const getProbableClass = (un: number): {cls: string, sub?: string, name: string} => {
        if (un < 500) return { cls: "1.4S", name: "Explosive article, n.o.s." };
        if (un >= 1000 && un < 1090) return { cls: "2.1", name: "Compressed gas, flammable, n.o.s." };
        if (un >= 1090 && un < 1100) return { cls: "2.2", name: "Compressed gas, n.o.s." };
        if (un >= 1100 && un < 1400) return { cls: "3", name: "Flammable liquid, n.o.s." };
        if (un >= 1400 && un < 1500) return { cls: "4.1", name: "Flammable solid, n.o.s." };
        if (un >= 1500 && un < 1700) return { cls: "6.1", name: "Toxic solid, n.o.s." };
        if (un >= 1700 && un < 1800) return { cls: "8", name: "Corrosive liquid, n.o.s." };
        if (un >= 1800 && un < 1900) return { cls: "8", name: "Corrosive solid, n.o.s." };
        if (un >= 1900 && un < 2000) return { cls: "2.3", name: "Toxic gas, n.o.s." };
        if (un >= 2000 && un < 2200) return { cls: "3", name: "Flammable liquid, n.o.s." };
        if (un >= 2200 && un < 2400) return { cls: "9", name: "Miscellaneous dangerous goods, n.o.s." };
        if (un >= 2400 && un < 2600) return { cls: "5.1", name: "Oxidizing solid, n.o.s." };
        if (un >= 2600 && un < 2800) return { cls: "6.1", name: "Toxic liquid, n.o.s." };
        if (un >= 2800 && un < 3000) return { cls: "8", name: "Corrosive liquid, n.o.s." };
        if (un >= 3000 && un < 3100) return { cls: "2.1", name: "Liquefied gas, flammable, n.o.s." };
        if (un >= 3100 && un < 3300) return { cls: "5.2", name: "Organic peroxide type C" };
        if (un >= 3300 && un < 3500) return { cls: "9", name: "Environmentally hazardous substance, n.o.s." };
        return { cls: "9", name: "Dangerous Goods, n.o.s." };
    };

    const createEntry = (un: number) => {
        const unStr = un.toString().padStart(4, '0');
        const { cls, name } = getProbableClass(un);
        
        // Determine PG based on modulus to simulate distribution
        let pg = "";
        if (!['1.4S', '2.1', '2.2', '2.3'].includes(cls)) {
            if (un % 3 === 0) pg = "II";
            else if (un % 3 === 1) pg = "III";
            else pg = "I";
        }

        // LOOKUP PI MAP
        const key = pg ? `${cls}-${pg}` : cls;
        const piData = PI_MAP[key] || PI_MAP[cls] || { pax: "Forbidden", pax_max: "Forbidden", cao: "Forbidden", cao_max: "Forbidden", lq: "Forbidden", lq_max: "Forbidden" };

        return {
            un: unStr,
            name: name, // Ensure clean name is used here
            class: cls,
            sub: "",
            pg: pg,
            eq: pg === "I" ? "E0" : (pg === "II" ? "E2" : "E1"),
            lq_pi: piData.lq,
            lq_max: piData.lq_max,
            pax_pi: piData.pax,
            pax_max: piData.pax_max,
            cao_pi: piData.cao,
            cao_max: piData.cao_max,
            sp: `A${(un % 200) + 1}`, // Link to realistic special provisions
            erg: `${parseInt(cls)}L`,
            isSimulated: true // Metadata to handle styling
        };
    };

    for (let i = 4; i <= 3500; i++) {
        if (!existingUNs.has(i)) {
            // Generate roughly 80% of numbers as entries to simulate fullness
            if (i % 10 !== 0 && i % 10 !== 1) { 
                filler.push(createEntry(i)); 
            }
        }
    }
    return filler;
};

// Generate ~800 Special Provisions
const generateSpecialProvisions = () => {
    const core = [
        { code: "A1", text: "Este artigo ou substância pode ser transportado em aeronaves de passageiros apenas com a aprovação prévia da autoridade apropriada do Estado de Origem e com a aprovação do operador." },
        { code: "A2", text: "Este artigo ou substância pode ser transportado em aeronaves de carga apenas com a aprovação prévia da autoridade apropriada do Estado de Origem." },
        { code: "A3", text: "Esta designação (PSN) só pode ser utilizada se não houver outra entrada mais específica na Tabela 4.2 que descreva adequadamente o conteúdo." },
        { code: "A4", text: "Líquidos com alto teor de viscosidade e inflamabilidade podem ser isentos de certos requisitos de embalagem se passarem em testes específicos." },
        { code: "A5", text: "Sólidos contendo líquidos corrosivos ou tóxicos não estão sujeitos a estes regulamentos se não houver líquido livre visível." },
        { code: "A6", text: "Para fins de classificação, misturas com um ponto de fulgor acima de 60°C não são consideradas Classe 3." },
        { code: "A9", text: "Bebidas alcoólicas contendo mais de 70% de álcool por volume devem ser transportadas sob UN 3065. As que contêm 24% ou menos não estão sujeitas a estes regulamentos." },
        { code: "A19", text: "Extintores de incêndio que contêm gases comprimidos ou liquefeitos devem ser embalados de acordo com a Instrução de Embalagem 213." },
        { code: "A21", text: "Esta entrada aplica-se a veículos movidos a gás inflamável ou líquido inflamável. Motores de combustão interna ou células de combustível." },
        { code: "A32", text: "Airbags ou pré-tensores de cinto de segurança contendo explosivos da classe 1.4G ou 1.4S devem ser transportados como UN 3268." },
        { code: "A44", text: "A designação de Kit Químico ou Kit de Primeiros Socorros destina-se a caixas, estojos etc. contendo pequenas quantidades de várias mercadorias perigosas." },
        { code: "A48", text: "A embalagem deve ser marcada com o texto 'Lithium ion batteries in compliance with Section II of PI 966' ou similar, conforme aplicável." },
        { code: "A51", text: "Baterias úmidas com eletrólito devem ser embaladas de forma a prevenir vazamentos e curtos-circuitos." },
        { code: "A57", text: "A autoridade competente pode autorizar o transporte de quantidades superiores às limitadas na Tabela 4.2." },
        { code: "A58", text: "Soluções aquosas contendo 24% ou menos de álcool por volume não estão sujeitas a estes regulamentos." },
        { code: "A67", text: "Baterias úmidas não derramáveis não estão sujeitas a estes regulamentos se os terminais estiverem protegidos contra curto-circuito." },
        { code: "A69", text: "Artigos contendo nitrogênio comprimido ou ar comprimido podem ser transportados sob esta entrada." },
        { code: "A70", text: "Motores de combustão interna movidos a combustível líquido inflamável devem ter o tanque drenado e as baterias desconectadas." },
        { code: "A72", text: "Kits de resina de poliéster contendo base e ativador devem ser transportados sob a entrada 'Polyester resin kit'." },
        { code: "A75", text: "Artigos contendo peróxidos orgânicos ou substâncias auto-reativas não devem ser transportados sob esta entrada sem aprovação." },
        { code: "A81", text: "A quantidade de material radioativo na embalagem não deve exceder os limites especificados na Tabela 10.3.A." },
        { code: "A87", text: "Veículos movidos apenas a bateria elétrica (BEV) devem ser transportados sob UN 3171." },
        { code: "A88", text: "Protótipos de baterias de lítio pré-produção podem ser transportados em aeronaves de carga com aprovação da autoridade competente do Estado de Origem." },
        { code: "A97", text: "Substâncias perigosas para o meio ambiente (aquático) não sujeitas a outras classes devem ser classificadas como UN 3077 ou UN 3082." },
        { code: "A99", text: "Baterias de lítio com peso superior a 35 kg podem ser transportadas em aeronaves de carga com aprovação da autoridade competente." },
        { code: "A100", text: "Esta entrada deve ser usada apenas para misturas que não tenham um nome técnico específico listado." },
        { code: "A112", text: "Bens de consumo (ID 8000) devem ser materiais embalados para venda a varejo ou uso pessoal/doméstico." },
        { code: "A113", text: "Esta entrada pode ser utilizada para misturas contendo metanol." },
        { code: "A123", text: "Esta entrada aplica-se a baterias, elétricas, contendo líquido ou sólido corrosivo ou material alcalino." },
        { code: "A132", text: "Esta entrada deve ser usada para artigos que contenham mercadorias perigosas em quantidades que excedam os limites de exceção." },
        { code: "A144", text: "Equipamentos contendo baterias de lítio devem ser embalados em embalagens externas resistentes." },
        { code: "A145", text: "Resíduos de aerossóis transportados para descarte ou reciclagem são proibidos, a menos que transportados sob aprovação especial." },
        { code: "A150", text: "Um pacote contendo mercadorias perigosas em quantidades limitadas (LQ) não precisa de etiqueta de orientação se for visível." },
        { code: "A151", text: "Se o gelo seco for usado como refrigerante para mercadorias não perigosas, a marcação e rotulagem de Gelo Seco e a DGD não são necessárias, mas o AWB deve indicar." },
        { code: "A154", text: "Baterias de lítio identificadas como defeituosas ou danificadas, com potencial de evolução perigosa de calor, fogo ou curto-circuito são PROIBIDAS." },
        { code: "A158", text: "Misturas de sólidos não sujeitos a estes regulamentos e líquidos perigosos para o meio ambiente devem ser classificadas como UN 3077." },
        { code: "A163", text: "Esta entrada aplica-se apenas a fogos de artifício classificados como 1.4G." },
        { code: "A164", text: "Baterias elétricas para veículos, contendo eletrólito líquido ácido." },
        { code: "A180", text: "Não radioativo. Aplica-se apenas a marcadores de urânio empobrecido." },
        { code: "A181", text: "Pacotes contendo baterias de lítio devem ter a etiqueta de bateria de lítio, a menos que as baterias estejam contidas no equipamento." },
        { code: "A182", text: "Equipamentos contendo baterias de lítio devem ser protegidos contra movimento e ativação acidental." },
        { code: "A183", text: "Baterias de lítio usadas para reciclagem ou descarte são proibidas no transporte aéreo, a menos que aprovadas." },
        { code: "A202", text: "Esta entrada aplica-se a dióxido de carbono liquefeito em cilindros." },
        { code: "A224", text: "Esta entrada aplica-se a artigos contendo baterias de lítio metálico ou iônico como fonte primária de energia." },
        { code: "A302", text: "Cilindros contendo gases oxidantes devem ter válvulas protegidas e não podem ser embalados com materiais inflamáveis." },
        { code: "A324", text: "Esta entrada aplica-se a querosene usado como combustível de aviação, para lâmpadas ou aquecimento." },
        { code: "A801", text: "Operador deve garantir que o passageiro foi informado sobre a proibição de transporte de mercadorias perigosas." },
        { code: "A802", text: "Não obstante a ausência de um grupo de embalagem na coluna E, as substâncias devem ser embaladas no Grupo de Embalagem II." },
        { code: "A803", text: "Não obstante a ausência de um grupo de embalagem na coluna E, as substâncias devem ser embaladas no Grupo de Embalagem III." },
        { code: "A804", text: "As baterias devem ser protegidas contra curto-circuito e devem ser embaladas de forma segura." }
    ];

    const templates = [
        "A aprovação prévia do Estado de Origem é necessária para o transporte desta substância.",
        "Embalagens devem ser testadas e aprovadas de acordo com o Grupo de Embalagem II.",
        "Esta substância é proibida em bagagem de mão, mas permitida em bagagem despachada.",
        "Os recipientes devem ser hermeticamente fechados e rotulados com 'Keep Upright'.",
        "A quantidade líquida por embalagem não deve exceder 5 litros ou 5 kg.",
        "Para transporte aéreo, o limite técnico de pressão não deve exceder 200 kPa.",
        "Artigos contendo mercúrio devem ser embalados de forma a prevenir vazamento.",
        "O transporte desta substância requer segregação de explosivos da Classe 1.",
        "Permitido apenas em aeronaves de carga (Cargo Aircraft Only) se a quantidade exceder 1L.",
        "Esta entrada pode ser usada para misturas contendo até 10% desta substância.",
    ];

    for (let i = 1; i <= 800; i++) {
        const code = `A${i}`;
        if (!core.find(c => c.code === code)) {
            core.push({
                code: code,
                text: `${templates[i % templates.length]} (Provision A${i} - Simulated text for regulatory volume).`
            });
        }
    }
    return core.sort((a,b) => parseInt(a.code.substring(1)) - parseInt(b.code.substring(1)));
};

// Generate ~500 Variations
const generateVariations = () => {
    const airlines = [
        { code: "AA", name: "American Airlines" }, { code: "AC", name: "Air Canada" }, { code: "AF", name: "Air France" },
        { code: "BA", name: "British Airways" }, { code: "CX", name: "Cathay Pacific" }, { code: "DL", name: "Delta Air Lines" },
        { code: "EK", name: "Emirates" }, { code: "FX", name: "FedEx" }, { code: "LA", name: "LATAM Airlines" },
        { code: "LH", name: "Lufthansa" }, { code: "QF", name: "Qantas" }, { code: "QR", name: "Qatar Airways" },
        { code: "SQ", name: "Singapore Airlines" }, { code: "UA", name: "United Airlines" }, { code: "UPS", name: "UPS" }
    ];
    const countries = [
        { code: "USG", name: "Estados Unidos" }, { code: "BRG", name: "Brasil" }, { code: "GBG", name: "Reino Unido" },
        { code: "CAG", name: "Canadá" }, { code: "JPG", name: "Japão" }, { code: "CNG", name: "China" },
        { code: "FRG", name: "França" }, { code: "DEG", name: "Alemanha" }, { code: "AUG", name: "Austrália" }
    ];

    const templates = [
        "Shipper's Declaration must be completed in English.",
        "Not accepted for carriage on passenger aircraft.",
        "Advance arrangements are required for Class 1 explosives.",
        "Lithium batteries (UN 3480) are strictly forbidden as cargo.",
        "Requires 24-hour emergency contact number on the DGD.",
        "Infectious substances require specific import permits.",
        "Overpacks must be clearly marked with the word 'OVERPACK'.",
        "Radioactive materials are only accepted at specific gateway airports.",
        "Accepts UN 3090 Section IA only with prior approval.",
        "Does not accept dangerous goods in consolidation.",
        "Engine powered equipment must have batteries disconnected."
    ];

    const variations = [
        { code: "USG-01", owner: "Estados Unidos", text: "A conformidade com os regulamentos 49 CFR é aceita, com certas limitações, para transporte de/para/através dos EUA." },
        { code: "USG-02", owner: "Estados Unidos", text: "O transporte de materiais radioativos fissíveis requer aprovação prévia do DOT." },
        { code: "USG-12", owner: "Estados Unidos", text: "Um número de telefone de resposta a emergências 24h deve ser fornecido no documento de transporte (DGD) para todos os embarques." },
        { code: "USG-13", owner: "Estados Unidos", text: "O transporte de baterias de lítio metal como carga em aeronaves de passageiros é proibido." },
        { code: "BRG-01", owner: "Brasil", text: "Todas as instruções de segurança e documentos de transporte devem estar em Português ou Inglês." },
        { code: "BRG-02", owner: "Brasil", text: "Explosivos e Armas requerem autorização prévia do Exército Brasileiro." },
        { code: "BRG-05", owner: "Brasil", text: "Explosivos da Classe 1 requerem autorização prévia do Exército Brasileiro para importação/exportação." },
        { code: "CAG-01", owner: "Canadá", text: "O expedidor deve fornecer um documento de transporte em conformidade com o TDG Regulations ou IATA DGR." },
        { code: "CAG-05", owner: "Canadá", text: "Certos explosivos requerem licença de importação/exportação emitida pela Natural Resources Canada." },
        { code: "GBG-01", owner: "Reino Unido", text: "Material radioativo só pode ser importado/exportado via aeroportos designados." },
        { code: "JPG-01", owner: "Japão", text: "Shipper's Declaration deve ser preenchida em Inglês." },
        { code: "CNG-01", owner: "China", text: "O transporte de baterias de lítio requer testes UN38.3 válidos e certificação de transporte aéreo." },
        { code: "AC-04", owner: "Air Canada", text: "Não aceita animais vivos de laboratório infectados (UN 2814/2900)." },
        { code: "AF-01", owner: "Air France", text: "Shipper's Declaration deve ter uma cópia extra anexada ao AWB." },
        { code: "AF-02", owner: "Air France", text: "Não aceita UN 3090 (Lítio Metal) como carga, exceto com aprovação específica." },
        { code: "AA-01", owner: "American Airlines", text: "Não aceita remessas de risco tóxico (6.1) primário ou secundário em aeronaves de passageiros, salvo exceções." },
        { code: "BA-01", owner: "British Airways", text: "Não aceita UN 3090 (Lítio Metal) Seção IA ou IB." },
        { code: "CX-01", owner: "Cathay Pacific", text: "Baterias de lítio UN 3480/3090 Seção II não são aceitas. Devem ser despachadas como Seção IB ou IA." },
        { code: "DL-01", owner: "Delta Air Lines", text: "Baterias de Ion Lítio (UN 3480) Seção IA e IB são proibidas como carga em todas as aeronaves." },
        { code: "DL-02", owner: "Delta Air Lines", text: "Hoverboards e dispositivos de equilíbrio pessoal movidos a lítio são proibidos como bagagem ou carga." },
        { code: "EK-02", owner: "Emirates", text: "Explosivos da Divisão 1.4S requerem aprovação prévia." },
        { code: "FX-02", owner: "FedEx", text: "Não aceita Cargas Perigosas para aeroportos onde não tem instalações adequadas. Consulte a lista de estações." },
        { code: "FX-04", owner: "FedEx", text: "O expedidor deve preparar a Shipper's Declaration usando software aprovado. Declarações manuscritas não são aceitas." },
        { code: "FX-18", owner: "FedEx", text: "Não aceita UN 3090 ou UN 3480 preparado sob a Seção II (apenas Seção IA/IB são aceitas com contrato)." },
        { code: "LA-01", owner: "LATAM Airlines", text: "UN 3480 (Baterias de Íon Lítio) é proibido em aeronaves de passageiros. Aceito apenas em CAO (Cargo Aircraft Only)." },
        { code: "LA-07", owner: "LATAM Airlines", text: "Animais vivos infectados não são aceitos para transporte." },
        { code: "LH-01", owner: "Lufthansa", text: "Não aceita explosivos 1.4S sem aprovação prévia." },
        { code: "LH-03", owner: "Lufthansa", text: "Restrições adicionais aplicam-se ao transporte de motores e veículos (UN 3166)." },
        { code: "QF-01", owner: "Qantas", text: "Não aceita animais vivos de laboratório (ratos, camundongos) como carga." },
        { code: "QR-01", owner: "Qatar Airways", text: "Todo embarque de mercadorias perigosas deve ser pré-reservado e aprovado." },
        { code: "SQ-01", owner: "Singapore Airlines", text: "Não aceita UN 3480 (Lítio Ion) em aeronaves de passageiros." },
        { code: "UA-01", owner: "United Airlines", text: "Não aceita UN 3090 ou 3480 sem contrato específico de mercadorias perigosas." },
        { code: "UPS-01", owner: "UPS", text: "Exige que todos os pacotes de mercadorias perigosas sejam preparados usando software compatível com UPS." }
    ];

    // Real data first
    const existingCodes = new Set(variations.map(v => v.code));

    // Generate filler
    [...airlines, ...countries].forEach(entity => {
        for (let i = 1; i <= 15; i++) {
            const code = `${entity.code}-${i.toString().padStart(2, '0')}`;
            if (!existingCodes.has(code)) {
                variations.push({
                    code: code,
                    owner: entity.name,
                    text: templates[i % templates.length] + ` (Variation ${code})`
                });
            }
        }
    });

    return variations.sort((a,b) => a.code.localeCompare(b.code));
};

export const BLUE_PAGES_DATA = [...REAL_BLUE_PAGES, ...generateFillerData()].sort((a,b) => a.un.localeCompare(b.un));
export const SPECIAL_PROVISIONS_DATA = generateSpecialProvisions();
export const VARIATIONS_DATA = generateVariations();

// Fully Expanded PAX PROVISIONS DATA (Table 2.3.A)
export const PAX_PROVISIONS_DATA = [
    { item: "Alcoholic beverages (< 70% alcohol)", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "Max 5L per person if between 24-70% alc. No limit if < 24%." },
    { item: "Ammunition (Cartridges for weapons), Div 1.4S", carry_on: "No", checked: "Yes", operator_approval: "Yes", limits: "Max 5kg gross per person. Securely boxed. Not loose." },
    { item: "Avalanche Rescue Backpack", carry_on: "Yes", checked: "Yes", operator_approval: "Yes", limits: "1 per person. Pyrotechnic trigger < 200mg net. Div 2.2 gas." },
    { item: "Batteries, spare (Lithium Ion), 100-160 Wh", carry_on: "Yes", checked: "No", operator_approval: "Yes", limits: "Max 2 spare batteries per person. Must be protected." },
    { item: "Batteries, spare (Lithium Ion), < 100 Wh", carry_on: "Yes", checked: "No", operator_approval: "No", limits: "No quantity limit (reasonable use). Protected." },
    { item: "Batteries, spare (Lithium Metal), < 2g", carry_on: "Yes", checked: "No", operator_approval: "No", limits: "Protected from short circuit." },
    { item: "Batteries, spare (Lithium Metal), 2-8g", carry_on: "Yes", checked: "No", operator_approval: "Yes", limits: "Max 2 spares. Only for PMED." },
    { item: "Camping Stoves (Empty of fuel)", carry_on: "No", checked: "Yes", operator_approval: "Yes", limits: "Tank must be drained and purged for 1h. Open cap." },
    { item: "Chemical Agent Monitoring Equipment", carry_on: "Yes", checked: "Yes", operator_approval: "Yes", limits: "Staff of OPCW on official travel only." },
    { item: "Disabling Devices (Mace, Pepper Spray)", carry_on: "Forbidden", checked: "Forbidden", operator_approval: "N/A", limits: "Strictly Forbidden in passenger baggage." },
    { item: "Dry Ice (Solid Carbon Dioxide)", carry_on: "Yes", checked: "Yes", operator_approval: "Yes", limits: "Max 2.5kg per person. Package vented." },
    { item: "E-Cigarettes (including e-pipes, vapes)", carry_on: "Yes (On person)", checked: "No", operator_approval: "No", limits: "Charging on board PROHIBITED. Liquids separate." },
    { item: "Electroshock Weapons (Tasers)", carry_on: "Forbidden", checked: "Forbidden", operator_approval: "N/A", limits: "Containing explosives/gases/lithium." },
    { item: "Fuel Cells (spare cartridges)", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "Max 2 spares. ISO 16111 marked." },
    { item: "Gas Cartridges, small, non-flammable", carry_on: "Yes", checked: "Yes", operator_approval: "Yes", limits: "Max 4 cartridges (water capacity < 50ml). CO2/N2." },
    { item: "Hair Curlers containing Hydrocarbon Gas", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "1 per person. Safety cover securely fitted. No refills." },
    { item: "Heat Producing Articles (Diving lamps)", carry_on: "Yes", checked: "Yes", operator_approval: "Yes", limits: "Battery removed or switch protected." },
    { item: "Insulated Packaging (Liquid Nitrogen)", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "Dry shipper only (absorbed liquid). Non-pressurized." },
    { item: "Internal Combustion Engines", carry_on: "No", checked: "Yes", operator_approval: "Yes", limits: "Must be purged of fuel and flushed." },
    { item: "Lamps, Energy Efficient", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "In retail packaging." },
    { item: "Matches, safety (one small packet)", carry_on: "On Person", checked: "No", operator_approval: "No", limits: "Strike anywhere matches FORBIDDEN." },
    { item: "Lighter, cigarette (one)", carry_on: "On Person", checked: "No", operator_approval: "No", limits: "Blue flame/Torch lighters FORBIDDEN." },
    { item: "Lighter Fuel / Refills", carry_on: "Forbidden", checked: "Forbidden", operator_approval: "N/A", limits: "Strictly Forbidden." },
    { item: "Medical Oxygen (Cylinders)", carry_on: "Yes (If req)", checked: "Yes", operator_approval: "Yes", limits: "Max 5kg gross weight. Valves protected." },
    { item: "Mobility Aids (Collapsible, Li-ion battery)", carry_on: "Yes", checked: "No (Battery)", operator_approval: "Yes", limits: "Battery removed and carried in cabin (< 300Wh)." },
    { item: "Mobility Aids (Non-spillable wet battery)", carry_on: "No", checked: "Yes", operator_approval: "Yes", limits: "Battery disconnected/protected from short circuit." },
    { item: "Non-radioactive Medicinal/Toiletry Articles", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "Max 0.5kg/0.5L per article. Max 2kg total (inc. perfumes)." },
    { item: "Permeation Devices", carry_on: "No", checked: "Yes", operator_approval: "Yes", limits: "For calibration of air quality monitoring." },
    { item: "Portable Electronic Devices (PED) with Li-batt", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "Max 15 PEDs per person. Completely switched off." },
    { item: "Radioisotopic Cardiac Pacemakers", carry_on: "On Person", checked: "No", operator_approval: "No", limits: "Implanted in person." },
    { item: "Security-type Attache Cases (Cash boxes)", carry_on: "Forbidden", checked: "Forbidden", operator_approval: "N/A", limits: "Containing lithium/pyrotechnics." },
    { item: "Smart Bags (Battery non-removable)", carry_on: "Forbidden", checked: "Forbidden", operator_approval: "N/A", limits: "Unless < 0.3g Li metal / 2.7Wh Li ion." },
    { item: "Specimens, non-infectious (in flammable liq)", carry_on: "Yes", checked: "Yes", operator_approval: "No", limits: "Max 30ml free liquid. UN 1170, 1219, 1987." },
    { item: "Thermometer (Medical/Clinical) - Mercury", carry_on: "No", checked: "Yes", operator_approval: "No", limits: "1 per person, in protective case." },
    { item: "Thermometer (Weather Bureau) - Mercury", carry_on: "Yes", checked: "Yes", operator_approval: "Yes", limits: "By government representative only." },
].sort((a,b) => a.item.localeCompare(b.item));

const GLOSSARY_DATA = [
    { term: "A1 Value", definition: "O valor da atividade de material radioativo de forma especial listado na Tabela 10.3.A, usado para determinar o limite de atividade para transporte." },
    { term: "A2 Value", definition: "O valor da atividade de material radioativo, que não seja de forma especial, listado na Tabela 10.3.A." },
    { term: "Approval", definition: "Uma autorização emitida pela autoridade competente nacional para o transporte de mercadorias perigosas." },
    { term: "Baggage", definition: "Pertences pessoais dos passageiros ou tripulação transportados na aeronave por acordo com o operador." },
    { term: "Cargo", definition: "Qualquer propriedade transportada em uma aeronave, exceto correio, bagagem ou provisões." },
    { term: "Cargo Aircraft", definition: "Qualquer aeronave, que não seja de passageiros, que transporta mercadorias ou propriedade." },
    { term: "Combination Packaging", definition: "Uma combinação de embalagens para fins de transporte, consistindo em uma ou mais embalagens internas fixadas em uma embalagem externa." },
    { term: "Competent Authority", definition: "Uma autoridade nacional ou internacional designada ou reconhecida por um Estado para qualquer finalidade em relação a estes Regulamentos." },
    { term: "Consignee", definition: "A pessoa ou organização a quem a remessa é destinada (destinatário)." },
    { term: "Consignment", definition: "Um ou mais pacotes de mercadorias perigosas aceitos por um operador de um expedidor de uma só vez e em um só endereço." },
    { term: "Dangerous Goods", definition: "Artigos ou substâncias capazes de colocar em risco a saúde, segurança, propriedade ou meio ambiente e que constam na lista de mercadorias perigosas." },
    { term: "Dangerous Goods Accident", definition: "Uma ocorrência associada e relacionada ao transporte de mercadorias perigosas que resulta em lesão fatal ou grave a uma pessoa ou dano maior à propriedade." },
    { term: "Dangerous Goods Incident", definition: "Uma ocorrência, que não seja um acidente, associada e relacionada ao transporte de mercadorias perigosas, não necessariamente ocorrendo a bordo de uma aeronave, que resulta em lesão, dano, fogo, quebra, derramamento, vazamento, etc." },
    { term: "Exception", definition: "Uma provisão nestes regulamentos que exclui um item específico dos requisitos gerais." },
    { term: "Exemption", definition: "Uma autorização emitida por uma autoridade nacional apropriada que prevê alívio das disposições destes Regulamentos." },
    { term: "Flash Point", definition: "A temperatura mais baixa na qual um líquido emite vapores inflamáveis suficientes para formar uma mistura inflamável com o ar perto da superfície." },
    { term: "Freight Forwarder", definition: "Uma pessoa ou organização que oferece o serviço de organizar o transporte de carga." },
    { term: "GHS", definition: "Globally Harmonized System of Classification and Labelling of Chemicals." },
    { term: "Gross Weight", definition: "O peso total do pacote, incluindo o conteúdo e todo o material de embalagem." },
    { term: "Handling Agent", definition: "Uma agência que executa em nome do operador algumas ou todas as funções deste, incluindo receber, carregar, descarregar, transferir ou outros processamentos de passageiros ou carga." },
    { term: "ID Number", definition: "Um número de identificação temporário atribuído a substâncias perigosas para as quais nenhum número UN foi atribuído (ex: ID 8000)." },
    { term: "Inner Packaging", definition: "Uma embalagem para a qual uma embalagem externa é necessária para o transporte." },
    { term: "Labels", definition: "Marcas visuais (losangos) afixadas na embalagem para indicar o risco (ex: Inflamável, Corrosivo)." },
    { term: "Limited Quantity", definition: "Uma quantidade de mercadoria perigosa que pode ser transportada em embalagens que não precisam atender a todos os requisitos de teste UN, desde que a quantidade por pacote seja limitada." },
    { term: "Marking", definition: "Texto ou símbolo aplicado na embalagem para identificar o conteúdo, o expedidor, o destinatário e as características de segurança." },
    { term: "Net Quantity", definition: "O peso ou volume da mercadoria perigosa contida em um pacote, excluindo o peso de qualquer material de embalagem." },
    { term: "Operator", definition: "Uma pessoa, organização ou empresa envolvida na operação de aeronaves (companhia aérea)." },
    { term: "Overpack", definition: "Um invólucro usado por um expedidor para conter um ou mais volumes e formar uma unidade de manuseio para conveniência de manuseio e estiva." },
    { term: "Package", definition: "O produto final da operação de embalagem, consistindo na embalagem e seu conteúdo preparado para transporte." },
    { term: "Packaging", definition: "Os recipientes e quaisquer outros componentes ou materiais necessários para que o recipiente desempenhe sua função de contenção." },
    { term: "Packing Group", definition: "Uma classificação atribuída a certas substâncias com base no grau de perigo: PG I (Alto perigo), PG II (Médio perigo), PG III (Baixo perigo)." },
    { term: "Passenger Aircraft", definition: "Uma aeronave que transporta qualquer pessoa além de um membro da tripulação, um funcionário do operador em capacidade oficial, ou um representante autorizado." },
    { term: "Pilot-in-Command", definition: "O piloto designado pelo operador, ou no caso de aviação geral, o proprietário, como estando no comando e encarregado da operação segura do voo." },
    { term: "Proper Shipping Name", definition: "O nome a ser utilizado para descrever um artigo ou substância no documento de transporte e na embalagem." },
    { term: "Radioactive Material", definition: "Qualquer material contendo radionuclídeos onde a concentração de atividade e a atividade total na remessa excedem os valores especificados." },
    { term: "Segregation", definition: "A separação de mercadorias perigosas incompatíveis durante o armazenamento ou transporte." },
    { term: "Self-Reactive Substances", definition: "Substâncias termicamente instáveis que podem sofrer decomposição fortemente exotérmica, mesmo sem oxigênio." },
    { term: "Shipper", definition: "A pessoa ou organização que oferece a mercadoria perigosa para transporte aéreo (Expedidor)." },
    { term: "State of Origin", definition: "O país no território do qual a carga foi embarcada inicialmente." },
    { term: "State of the Operator", definition: "O país no qual o operador tem seu principal local de negócios." },
    { term: "Transport Index (TI)", definition: "Um número atribuído a um pacote, overpack ou contêiner de carga para fornecer controle sobre a exposição à radiação." },
    { term: "UN Number", definition: "O número de quatro dígitos atribuído pelo Comitê de Especialistas das Nações Unidas para identificar uma substância ou grupo de substâncias." },
    { term: "Unit Load Device (ULD)", definition: "Qualquer tipo de contêiner de carga aérea, contêiner de aeronave, palete de aeronave com rede ou palete de aeronave com rede sobre um iglu." },
    { term: "Wetting Agent", definition: "Uma substância que reduz a tensão superficial de um líquido, promovendo o espalhamento e penetração." }
];

export const DGR_CHAPTERS: DGRChapter[] = [
  {
    id: 1,
    title: "Aplicabilidade",
    description: "Definições de responsabilidades, treinamento obrigatório (CBTA), segurança e disposições gerais.",
    color: "border-gray-500",
    icon: BookOpen,
    sections: [
      {
        id: "1.0",
        title: "Definição de Mercadorias Perigosas",
        blocks: [
          { type: "paragraph", content: "Mercadorias perigosas são artigos ou substâncias que são capazes de colocar em risco a saúde, a segurança, a propriedade ou o meio ambiente e que estão apresentadas na lista de mercadorias perigosas nestes regulamentos." }
        ]
      },
      {
          id: "1.1",
          title: "Base da Regulamentação",
          blocks: [
              { type: "paragraph", content: "Estas regulamentações contêm todos os requisitos das Instruções Técnicas da ICAO e incluem requisitos adicionais mais restritivos." }
          ]
      },
      {
        id: "1.2",
        title: "Aplicação Geral",
        blocks: [
          { type: "paragraph", content: "Estes regulamentos são aplicáveis a todos os operadores (companhias aéreas) que são membros da IATA." },
          { type: "list", content: { ordered: false, items: ["Expedidores", "Operadores", "Agentes de Carga", "Agentes de Manuseio", "Passageiros e Tripulação"] } }
        ]
      },
      {
        id: "1.3",
        title: "Informações Gerais",
        blocks: [
            { type: "paragraph", content: "O transporte de mercadorias perigosas é estritamente regulado para prevenir acidentes. O não cumprimento pode resultar em penalidades legais severas." }
        ]
      },
      {
        id: "1.4",
        title: "Responsabilidades do Expedidor",
        blocks: [
            { type: "paragraph", content: "O expedidor deve garantir que os artigos não são proibidos para transporte aéreo e estão corretamente classificados, embalados, marcados, etiquetados e documentados."}
        ]
      },
      {
        id: "1.5",
        title: "Treinamento (CBTA)",
        blocks: [
          { type: "paragraph", content: "O treinamento deve ser baseado em competências (CBTA). Todos os envolvidos no transporte de carga aérea devem ser treinados e avaliados a cada 24 meses." },
          { type: "note", content: { title: "Validade", text: "O treinamento é válido por 24 meses. A reciclagem deve ocorrer dentro dos 3 meses finais." } }
        ]
      },
      {
        id: "1.6",
        title: "Segurança (Security)",
        blocks: [
            { type: "paragraph", content: "Disposições para evitar roubo ou uso indevido de mercadorias perigosas de alto risco."}
        ]
      },
      {
          id: "1.7",
          title: "Relato de Incidentes",
          blocks: [
              { type: "paragraph", content: "Operadores devem reportar incidentes e acidentes com mercadorias perigosas às autoridades competentes do Estado do Operador e do Estado de Ocorrência." },
              { type: "warning", content: { text: "O reporte deve ser feito dentro de 72 horas após a descoberta do incidente, salvo exigência local mais estrita." } }
          ]
      }
    ]
  },
  {
    id: 2,
    title: "Limitações",
    description: "Mercadorias proibidas, ocultas, quantidades limitadas, e variações de Estados e Operadores.",
    color: "border-red-600",
    icon: Ban,
    sections: [
      {
        id: "2.1",
        title: "Mercadorias Proibidas",
        blocks: [
          { type: "paragraph", content: "Algumas mercadorias são perigosas demais para serem transportadas por via aérea sob quaisquer circunstâncias." },
          { type: "warning", content: { text: "Artigos suscetíveis a explodir ou reagir perigosamente são PROIBIDOS." } }
        ]
      },
      {
          id: "2.2",
          title: "Mercadorias Ocultas",
          blocks: [
              { type: "paragraph", content: "Muitos itens comuns podem conter mercadorias perigosas ocultas." },
              { type: "list", content: { ordered: false, items: ["Equipamento de Mergulho (Luzes, Cilindros)", "Peças Automotivas (Baterias, Amortecedores)", "Equipamento Médico (Cilindros de O2)", "Amostras de Diagnóstico"] } }
          ]
      },
      {
        id: "2.3",
        title: "Passageiros e Tripulação",
        blocks: [
          { type: "paragraph", content: "Alguns itens são permitidos na bagagem, desde que cumpram restrições estritas. Utilize a tabela abaixo para verificar itens comuns." },
          {
            type: "database",
            content: {
              id: "pax-provisions",
              title: "Tabela 2.3.A - Disposições para Passageiros",
              type: "variations", 
              columns: [
                { key: "item", label: "Item", width: "w-64" },
                { key: "carry_on", label: "Cabine / Pessoa", width: "w-24" },
                { key: "checked", label: "Despacho", width: "w-24" },
                { key: "operator_approval", label: "Aprov.", width: "w-20" },
                { key: "limits", label: "Limites/Condições", width: "w-64" }
              ],
              data: PAX_PROVISIONS_DATA
            }
          }
        ]
      },
      {
          id: "2.4",
          title: "Transporte pelo Correio",
          blocks: [
              { type: "paragraph", content: "A maioria das mercadorias perigosas é proibida no correio aéreo (air mail). Exceções incluem:" },
              { type: "list", content: { ordered: false, items: ["Baterias de Lítio contidas em equipamento (UN3481/UN3091) se aprovado", "Substâncias Biológicas Categoria B (UN3373)", "Material Radioativo em pacotes exceptivos"] } }
          ]
      },
      {
        id: "2.5",
        title: "Dangerous Goods in Operator's Property",
        blocks: [
            { type: "paragraph", content: "Mercadorias perigosas transportadas pelo operador (COMAT) devem cumprir integralmente os regulamentos, a menos que especificamente isentas." }
        ]
      },
      {
        id: "2.6",
        title: "Quantidades Excecionadas (EQ)",
        blocks: [
            { type: "paragraph", content: "Pequenas quantidades de mercadorias perigosas podem ser transportadas com requisitos reduzidos. A embalagem deve ter 3 camadas (tripla)." },
            {
                type: "table",
                content: {
                    caption: "Tabela 2.6.A - Códigos EQ",
                    headers: ["Code", "Max Net Qty (Inner)", "Max Net Qty (Outer)"],
                    rows: [
                        ["E0", "Not Permitted", "Not Permitted"],
                        ["E1", "30 g / 30 mL", "1 kg / 1 L"],
                        ["E2", "30 g / 30 mL", "500 g / 500 mL"],
                        ["E3", "30 g / 30 mL", "300 g / 300 mL"],
                        ["E4", "1 g / 1 mL", "500 g / 500 mL"],
                        ["E5", "1 g / 1 mL", "300 g / 300 mL"],
                    ]
                }
            },
            { type: "figure", content: { type: "label", labelClass: "eq", caption: "Marca de Quantidade Excecionada" } }
        ]
      },
      {
        id: "2.7",
        title: "Quantidades Limitadas (LQ)",
        blocks: [
            { type: "paragraph", content: "Permite o uso de embalagens de especificação não-UN se quantidades menores forem enviadas e embalagens robustas forem usadas. O peso bruto máximo por volume é 30 kg." },
            { type: "note", content: { title: "Identificação", text: "Instruções de embalagem LQ começam com a letra 'Y' (ex: Y341)." } }
        ]
      },
      {
          id: "2.8",
          title: "Variações de Estados e Operadores",
          blocks: [
              { type: "paragraph", content: "Estados e Operadores podem impor restrições mais rigorosas do que as da IATA. Consulte a base de dados abaixo para verificar códigos específicos." },
              {
                  type: "database",
                  content: {
                      id: "variations-db",
                      title: "Tabela 2.8 - Variações",
                      type: "variations",
                      columns: [ { key: "code", label: "Cód" }, { key: "owner", label: "Estado/Operador" }, { key: "text", label: "Restrição" } ],
                      data: VARIATIONS_DATA
                  }
              }
          ]
      }
    ]
  },
  {
    id: 3,
    title: "Classificação",
    description: "As 9 classes de perigo, grupos de embalagem e critérios de precedência de risco.",
    color: "border-orange-500",
    icon: FlaskConical,
    sections: [
        {
            id: "3.0",
            title: "Visão Geral",
            blocks: [
                { type: "paragraph", content: "As mercadorias perigosas são divididas em 9 classes." },
                { type: "list", content: { ordered: true, items: ["1: Explosivos", "2: Gases", "3: Líquidos Inflamáveis", "4: Sólidos Inflamáveis", "5: Oxidantes", "6: Tóxicos", "7: Radioativos", "8: Corrosivos", "9: Miscelâneos"] } }
            ]
        },
        { id: "3.1", title: "Classe 1 - Explosivos", blocks: [{ type: "paragraph", content: "Divisões 1.1 a 1.6 baseadas no risco de explosão em massa ou projeção." }] },
        { id: "3.2", title: "Classe 2 - Gases", blocks: [{ type: "paragraph", content: "Divisão 2.1 (Inflamável), 2.2 (Não-Inflamável), 2.3 (Tóxico)." }] },
        { id: "3.3", title: "Classe 3 - Líquidos Inflamáveis", blocks: [{ type: "paragraph", content: "Líquidos com ponto de fulgor igual ou inferior a 60°C. Inclui tintas, álcoois, e combustíveis." }, {type: "figure", content: {type: "label", labelClass: "3", caption: "Etiqueta Classe 3"}}] },
        { id: "3.4", title: "Classe 4 - Sólidos Inflamáveis", blocks: [{ type: "paragraph", content: "Substâncias sujeitas a combustão espontânea (4.2) ou que, em contato com água, emitem gases inflamáveis (4.3)." }] },
        { id: "3.5", title: "Classe 5 - Oxidantes e Peróxidos", blocks: [{ type: "paragraph", content: "5.1 Oxidantes (liberam oxigênio) e 5.2 Peróxidos Orgânicos (instáveis termicamente)." }] },
        { id: "3.6", title: "Classe 6 - Tóxicos e Infectantes", blocks: [{ type: "paragraph", content: "Divisão 6.1 (Tóxicos via oral/dérmica/inalação) e 6.2 (Substâncias Infectantes - Categoria A e B)." }] },
        { id: "3.7", title: "Classe 7 - Radioativos", blocks: [{ type: "paragraph", content: "Materiais contendo radionuclídeos onde a concentração de atividade excede os valores especificados." }, {type: "figure", content: {type: "label", labelClass: "7", caption: "Etiqueta Categoria II"}}] },
        { id: "3.8", title: "Classe 8 - Corrosivos", blocks: [{ type: "paragraph", content: "Substâncias que causam destruição severa por ação química em tecidos vivos ou metais (ex: Ácidos, Baterias)." }, {type: "figure", content: {type: "label", labelClass: "8", caption: "Etiqueta Corrosivo"}}] },
        { id: "3.9", title: "Classe 9 - Miscelâneos", blocks: [{ type: "paragraph", content: "Perigos não cobertos por outras classes (Gelo Seco, Baterias de Lítio, Motores, Magnetizados)." }, {type: "figure", content: {type: "label", labelClass: "9", caption: "Etiqueta Classe 9"}}] }
    ]
  },
  {
    id: 4,
    title: "Identificação",
    description: "A Lista de Mercadorias Perigosas (Tabela 4.2) e Nomes Apropriados para Embarque.",
    color: "border-latam-indigo",
    icon: ListFilter,
    sections: [
      {
          id: "4.0",
          title: "Visão Geral",
          blocks: [{ type: "paragraph", content: "Este capítulo trata da identificação correta de artigos perigosos, incluindo a seleção do Nome Apropriado para Embarque (PSN)." }]
      },
      {
        id: "4.1",
        title: "Nome Apropriado (PSN)",
        blocks: [
          { type: "paragraph", content: "O expedidor deve selecionar o nome que melhor descreve a substância na Tabela 4.2." },
          {
             type: "wizard",
             content: {
                 id: "psn-wizard",
                 title: "Assistente de Nome Apropriado",
                 startNodeId: "start",
                 nodes: {
                     "start": { question: "Existe nome técnico específico na Tabela 4.2?", options: [{ label: "Sim", nextNodeId: "specific" }, { label: "Não", nextNodeId: "mixture" }] },
                     "mixture": { question: "Você conhece os perigos?", options: [{ label: "Sim (Inflamável)", nextNodeId: "generic-flam" }, { label: "Não", nextNodeId: "unknown" }] }
                 },
                 results: {
                     "specific": { title: "Use o Nome Específico", description: "Priorize o nome técnico em negrito.", type: "success" },
                     "generic-flam": { title: "Use Entrada Genérica", description: "Provavelmente 'Flammable liquid, n.o.s.' com nome técnico entre parênteses.", type: "warning", actionText: "Ver UN 1993" },
                     "unknown": { title: "Pare!", description: "Consulte a FISPQ/SDS.", type: "danger" }
                 }
             }
          }
        ]
      },
      {
        id: "4.2",
        title: "Lista de Mercadorias Perigosas",
        blocks: [
          { type: "paragraph", content: "Consulte a tabela abaixo para obter informações detalhadas sobre UN/ID, Classes, Etiquetas e Instruções de Embalagem. Clique na linha para ver detalhes." },
          {
            type: "database",
            content: {
              id: "blue-pages",
              title: "Tabela 4.2 - Lista Azul",
              type: "blue-pages",
              columns: [
                { key: "un", label: "UN", width: "w-16", filterable: true },
                { key: "name", label: "Nome Apropriado", width: "w-64", filterable: true },
                { key: "class", label: "Cls", width: "w-12" },
                { key: "sub", label: "Sub", width: "w-12" },
                { key: "pg", label: "PG", width: "w-12" },
                { key: "eq", label: "EQ", width: "w-12" },
                { key: "lq_pi", label: "Y-PI", width: "w-16" },
                { key: "pax_pi", label: "Pax PI", width: "w-16" },
                { key: "cao_pi", label: "CAO PI", width: "w-16" },
                { key: "sp", label: "SP", width: "w-24" }
              ],
              data: BLUE_PAGES_DATA
            }
          }
        ]
      },
      {
          id: "4.3",
          title: "Índice Numérico",
          blocks: [{ type: "paragraph", content: "Consulte a Tabela 4.2 para buscar por número UN." }]
      },
      { 
          id: "4.4", 
          title: "Disposições Especiais", 
          blocks: [
              { type: "paragraph", content: "Códigos 'A' (A1, A2, etc.) listados na Coluna M da Tabela 4.2 modificam os requisitos para itens específicos." },
              {
                  type: "database",
                  content: {
                      id: "sp-db",
                      title: "Tabela 4.4 - Disposições Especiais",
                      type: "variations",
                      columns: [ { key: "code", label: "Cód" }, { key: "text", label: "Descrição" } ],
                      data: SPECIAL_PROVISIONS_DATA
                  }
              }
          ] 
      }
    ]
  },
  {
    id: 5,
    title: "Embalagem",
    description: "Instruções de Embalagem (PI) detalhadas.",
    color: "border-yellow-500",
    icon: Package,
    sections: [
        { id: "5.0", title: "Disposições Gerais", blocks: [{ type: "paragraph", content: "Embalagens devem ser de boa qualidade e compatíveis com o conteúdo. Devem resistir a vibrações e mudanças de pressão." }] },
        {
            id: "5.1",
            title: "Procedimentos de Embalagem",
            blocks: [
                { type: "paragraph", content: "Além das instruções específicas, procedimentos gerais devem ser seguidos para garantir a segurança." },
                {
                    type: "definition-list",
                    content: [
                        { term: "Ullage (Outage)", definition: "Espaço vazio deixado em uma embalagem para permitir a expansão térmica do líquido. Geralmente, a embalagem não deve estar mais de 98% cheia." },
                        { term: "Materiais Absorventes", definition: "Necessário para embalagens combinadas com líquidos para absorver todo o conteúdo em caso de vazamento." }
                    ]
                }
            ]
        },
        {
            id: "5.2",
            title: "Instruções de Embalagem - Classe 1",
            blocks: [
                { type: "paragraph", content: "O transporte de explosivos é severamente restrito. A maioria dos explosivos é proibida em aeronaves de passageiros e muitos requerem aprovação da autoridade competente. A Divisão 1.4S é a mais comumente permitida." },
                {
                    type: "packing-instruction",
                    content: {
                        id: "130",
                        title: "Artigos, Explosivos, Divisão 1.4S",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Esta instrução aplica-se a artigos da Divisão 1.4S, como UN 0012 (Cartuchos)." },
                            { type: "note", content: { title: "Embalagem Externa", text: "Deve ser uma embalagem de especificação UN (ex: caixas 4G, 4C1, 4D, 4F)." } },
                            { type: "list", content: { ordered: false, items: ["As embalagens internas devem ser projetadas e construídas para prevenir qualquer movimento dentro da embalagem externa.", "Os artigos devem ser embalados de forma a prevenir a ignição acidental."] } },
                            { type: "table", content: { caption: "Limites de Peso Bruto", headers: ["Tipo", "Pax", "CAO"], rows: [["Caixa de Fibra (4G)", "25 kg", "100 kg"], ["Caixa de Madeira (4C1)", "25 kg", "100 kg"]] } },
                            { type: "warning", content: { text: "Outras divisões de explosivos (1.1, 1.2, 1.3, 1.4F, 1.4G, 1.5, 1.6) são proibidas em aeronaves de passageiros." } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.3",
            title: "Instruções de Embalagem - Classe 2",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "200",
                        title: "Cilindros para Gases (Div. 2.1 e 2.2)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Cilindros devem ser aprovados pela autoridade competente e ter válvulas protegidas." },
                            { type: "table", content: { caption: "Tipos Permitidos", headers: ["Tipo", "Max Net Mass (Pax)", "Max Net Mass (CAO)"], rows: [["Aço (Sem costura)", "75 kg", "150 kg"], ["Alumínio", "75 kg", "150 kg"], ["Compósito", "75 kg", "150 kg"]] } },
                            { type: "warning", content: { text: "Divisão 2.3 (Gás Tóxico) é proibida em aeronaves de passageiros." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "203",
                        title: "Aerossóis (UN 1950)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Esta instrução aplica-se a Aerossóis UN 1950. As válvulas devem ser protegidas por uma tampa ou outro dispositivo para prevenir descarga acidental." },
                            { type: "note", content: { title: "Embalagem Externa", text: "Deve ser uma caixa de fibra, madeira ou metal robusta." } },
                            { type: "table", content: { caption: "Limites de Peso", headers: ["Tipo", "Max Net Qty / Pkg"], rows: [["Metal (Aerosol)", "30 kg (Gross)"], ["Plástico", "30 kg (Gross)"]] } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.4",
            title: "Instruções de Embalagem - Classe 3",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "353",
                        title: "Líquidos Inflamáveis PG II (Pax)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para UN 1170, UN 1263, UN 1993, UN 1090 e outros líquidos inflamáveis de Grupo de Embalagem II." },
                            { type: "table", content: { caption: "Limites de Quantidade (Pax)", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 1L", "5L"], ["Metal: 1L", "5L"], ["Plástico: 1L", "5L"]] } },
                            { type: "note", content: { title: "Embalagem Única", text: "Proibida. Deve usar embalagem combinada." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "355",
                        title: "Líquidos Inflamáveis PG III (Pax)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para UN 1263, UN 1223 e outros líquidos inflamáveis PG III." },
                            { type: "list", content: { ordered: true, items: ["Embalagens combinadas requeridas.", "Garrafas de vidro internas max 2.5L.", "Latas de metal internas max 10L."] } },
                            { type: "warning", content: { text: "Max 60L por volume em aeronaves de passageiros." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "364",
                        title: "Líquidos Inflamáveis PG II (CAO)",
                        transportMode: "Cargo Aircraft Only",
                        content: [
                            { type: "paragraph", content: "Para transporte em Aeronave de Carga apenas." },
                            { type: "table", content: { caption: "Limites de Quantidade (CAO)", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 2.5L", "60L"], ["Metal: 10L", "60L"], ["Plástico: 10L", "60L"]] } },
                            { type: "note", content: { title: "Embalagem Única", text: "Permitida para tambores de aço (1A1/1A2) e jerricans (3A1/3A2)." } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.5",
            title: "Instruções de Embalagem - Classe 4",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "445",
                        title: "Sólidos Inflamáveis PG II",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para sólidos da Divisão 4.1, Grupo de Embalagem II." },
                            { type: "table", content: { caption: "Limites", headers: ["Emb. Int.", "Emb. Ext. (Pax)", "Emb. Ext. (CAO)"], rows: [["Saco Plástico: 1kg", "15 kg", "50 kg"], ["Caixa Fibra: 1kg", "15 kg", "50 kg"]] } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.6",
            title: "Instruções de Embalagem - Classe 5",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "550",
                        title: "Oxidantes PG II",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para substâncias comburentes da Divisão 5.1." },
                            { type: "note", content: { title: "Compatibilidade", text: "Não embalar com materiais inflamáveis." } },
                            { type: "table", content: { caption: "Limites", headers: ["Emb. Int.", "Emb. Ext. (Pax)"], rows: [["Vidro: 1 L", "5 L"], ["Plástico: 2.5 L", "5 L"]] } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.7",
            title: "Instruções de Embalagem - Classe 6",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "650",
                        title: "Substâncias Biológicas, Categoria B (UN 3373)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Embalagem tripla requerida: Recipiente primário estanque, Embalagem secundária estanque, Embalagem externa rígida." },
                            { type: "list", content: { ordered: true, items: ["Primário ou secundário deve resistir a 95kPa.", "Material absorvente suficiente entre primário e secundário."] } },
                            { type: "note", content: { title: "Marcação", text: "Deve exibir a marca 'BIOLOGICAL SUBSTANCE, CATEGORY B' e o losango UN 3373." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "654",
                        title: "Tóxicos PG II (Pax)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para substâncias tóxicas (venenosas) da Divisão 6.1, PG II." },
                            { type: "table", content: { caption: "Limites", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 1 L/kg", "5 L/kg"], ["Plástico: 2.5 L/kg", "5 L/kg"]] } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.8",
            title: "Instruções de Embalagem - Classe 7",
            blocks: [
                { type: "paragraph", content: "Os requisitos de embalagem para Material Radioativo (Classe 7) são complexos e detalhados extensivamente na Seção 10." },
                { type: "note", content: { title: "Referência Cruzada", text: "Consulte o Capítulo 10 para todas as instruções de embalagem da Classe 7." } }
            ]
        },
        {
            id: "5.9",
            title: "Instruções de Embalagem - Classe 8",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "850",
                        title: "Líquidos Corrosivos PG I (Pax)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para ácidos muito fortes (PG I). Quantidades extremamente limitadas." },
                            { type: "table", content: { caption: "Limites de Quantidade", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 0.5L", "0.5L"], ["Metal: 0.5L", "0.5L"]] } },
                            { type: "warning", content: { text: "Muitos ácidos PG I são PROIBIDOS em aeronaves de passageiros." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "851",
                        title: "Líquidos Corrosivos PG II (Pax)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para Ácido Sulfúrico, Ácido Clorídrico e outros corrosivos PG II." },
                            { type: "table", content: { caption: "Limites de Quantidade", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 1L", "1L"], ["Metal: 1L", "1L"], ["Plástico: 1L", "1L"]] } },
                            { type: "note", content: { title: "Embalagem Única", text: "Proibida. Deve usar embalagem combinada." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "852",
                        title: "Líquidos Corrosivos PG III (Pax)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para corrosivos mais fracos (PG III)." },
                            { type: "table", content: { caption: "Limites de Quantidade", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 2.5L", "5L"], ["Metal: 5L", "5L"], ["Plástico: 5L", "5L"]] } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "854",
                        title: "Líquidos Corrosivos PG I (CAO)",
                        transportMode: "Cargo Aircraft Only",
                        content: [
                            { type: "paragraph", content: "Para Ácido Nítrico (fume) e outros corrosivos de alto risco." },
                            { type: "table", content: { caption: "Limites de Quantidade", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 2.5L", "2.5L"], ["Metal: 2.5L", "2.5L"]] } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "855",
                        title: "Líquidos Corrosivos PG II (CAO)",
                        transportMode: "Cargo Aircraft Only",
                        content: [
                            { type: "paragraph", content: "Para transporte em Aeronave de Carga apenas." },
                            { type: "table", content: { caption: "Limites de Quantidade", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 2.5L", "30L"], ["Metal: 10L", "30L"], ["Plástico: 10L", "30L"]] } },
                            { type: "note", content: { title: "Embalagem Única", text: "Permitida para alguns tambores de aço e jerricans." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "856",
                        title: "Líquidos Corrosivos PG III (CAO)",
                        transportMode: "Cargo Aircraft Only",
                        content: [
                            { type: "paragraph", content: "Para corrosivos de baixo risco em aeronaves de carga." },
                            { type: "table", content: { caption: "Limites de Quantidade", headers: ["Emb. Int.", "Emb. Ext."], rows: [["Vidro: 5L", "60L"], ["Metal: 20L", "60L"], ["Plástico: 10L", "60L"]] } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.10",
            title: "Instruções de Embalagem - Classe 9",
            blocks: [
                {
                    type: "packing-instruction",
                    content: {
                        id: "956",
                        title: "Substâncias Miscelâneas Sólidas",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para UN 3077 (Env. Haz. Solid) e outros sólidos Classe 9." },
                            { type: "table", content: { caption: "Limites", headers: ["Emb. Int.", "Emb. Ext. (Pax)", "Emb. Ext. (CAO)"], rows: [["Plástico: 30kg", "400 kg", "400 kg"], ["Fibra: 30kg", "400 kg", "400 kg"]] } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "964",
                        title: "Substâncias Miscelâneas Líquidas",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Para UN 3082 (Env. Haz. Liquid) e outros líquidos Classe 9." },
                            { type: "table", content: { caption: "Limites", headers: ["Emb. Int.", "Emb. Ext. (Pax)", "Emb. Ext. (CAO)"], rows: [["Vidro: 10L", "450 L", "450 L"], ["Plástico: 30L", "450 L", "450 L"]] } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "965",
                        title: "Baterias de Íon Lítio (Soltas)",
                        transportMode: "Cargo Aircraft Only",
                        content: [
                            { type: "note", content: { title: "SoC", text: "Max 30% SoC." } },
                            { type: "table", content: { caption: "Seções", headers: ["Seção", "Limite", "Emb. UN?"], rows: [["IA", "35 kg", true], ["IB", "10 kg", false]] } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "966",
                        title: "Baterias de Íon Lítio embaladas com equipamento",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Aplica-se a UN 3481. Baterias embaladas JUNTO com o equipamento, não dentro." },
                            { type: "note", content: { title: "Section I", text: "Baterias > 100Wh. Requer embalagem UN e DGD." } },
                            { type: "note", content: { title: "Section II", text: "Baterias <= 100Wh. Limite de 5kg por volume. Requer apenas Marca de Bateria de Lítio e AWB statement." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "967",
                        title: "Baterias de Íon Lítio contidas em equipamento",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Aplica-se a UN 3481. Baterias instaladas DENTRO do equipamento." },
                            { type: "list", content: { ordered: true, items: ["Equipamento deve ser protegido contra ativação acidental.", "Embalagem externa robusta necessária."] } },
                            { type: "warning", content: { text: "Seção II: Se houver apenas 2 pacotes por remessa, a marca de bateria não é necessária." } }
                        ]
                    }
                },
                {
                    type: "packing-instruction",
                    content: {
                        id: "968",
                        title: "Baterias de Metal Lítio (Soltas)",
                        transportMode: "Cargo Aircraft Only",
                        content: [
                            { type: "paragraph", content: "Aplica-se a UN 3090. PROIBIDO em aeronaves de passageiros." },
                            { type: "table", content: { caption: "Seções", headers: ["Seção", "Lítio", "Limite/Pkg"], rows: [["IA", "> 2g", "35 kg"], ["IB", "<= 2g", "2.5 kg"]] } },
                            { type: "warning", content: { text: "Seção II foi removida para transporte aéreo (apenas IA e IB permitidas)." } }
                        ]
                    }
                }
            ]
        },
        {
            id: "5.11",
            title: "Instruções de Embalagem - Miscelâneas",
            blocks: [
                { type: "paragraph", content: "Esta seção cobre instruções de embalagem para itens que não se enquadram nas classes principais, como ID 8000." },
                {
                    type: "packing-instruction",
                    content: {
                        id: "963",
                        title: "Consumer Commodity (ID 8000)",
                        transportMode: "Passenger and Cargo",
                        content: [
                            { type: "paragraph", content: "Aplica-se a bens de consumo, que são materiais embalados e distribuídos para venda no varejo para uso pessoal ou doméstico." },
                            { type: "note", content: { title: "Limite", text: "O peso bruto máximo por volume é de 30 kg." } },
                            { type: "warning", content: { text: "Os pacotes não devem conter mercadorias perigosas proibidas em aeronaves de passageiros." } }
                        ]
                    }
                }
            ]
        }
    ]
  },
  {
      id: 6,
      title: "Especificações de Embalagem",
      description: "Requisitos de fabricação e testes de performance (Drop, Stack) para embalagens UN.",
      color: "border-gray-700",
      icon: Box,
      sections: [
          {
              id: "6.0",
              title: "Visão Geral",
              blocks: [
                  { type: "paragraph", content: "Este capítulo define os requisitos de construção e teste para embalagens de especificação UN (caixas, tambores, jerricans)." }
              ]
          },
          {
              id: "6.1",
              title: "Applicability",
              blocks: [{ type: "paragraph", content: "Estes requisitos aplicam-se a embalagens para todas as classes, exceto Classe 7 e 6.2." }]
          },
          {
              id: "6.2",
              title: "Marking",
              blocks: [{ type: "paragraph", content: "Embalagens UN devem ser marcadas de forma durável, legível e em local visível." }]
          },
          {
              id: "6.3",
              title: "Códigos de Embalagem",
              blocks: [
                  { type: "paragraph", content: "O código consiste em: Tipo (1=Tambor, 4=Caixa) + Material (A=Aço, G=Fibra) + Categoria." },
                  { type: "list", content: { ordered: true, items: ["4G = Caixa de Papelão", "1A1 = Tambor de Aço (tampa fixa)", "1A2 = Tambor de Aço (tampa removível)", "4D = Caixa de Madeira Compensada"] } }
              ]
          },
          {
              id: "6.4",
              title: "Testing Requirements",
              blocks: [{ type: "paragraph", content: "Embalagens devem passar por testes de performance antes do uso." }]
          },
          {
              id: "6.5",
              title: "Requisitos de Teste",
              blocks: [
                  { type: "paragraph", content: "As embalagens devem passar por testes rigorosos antes de receberem a marca UN." },
                  {
                      type: "definition-list",
                      content: [
                          { term: "Drop Test (Queda)", definition: "Queda de altura específica (1.8m para PG I, 1.2m para PG II) para garantir integridade." },
                          { term: "Stacking Test (Empilhamento)", definition: "Suportar peso equivalente a uma pilha de 3 metros por 24 horas." }
                      ]
                  }
              ]
          },
          {
              id: "6.6",
              title: "Cylinders",
              blocks: [{ type: "paragraph", content: "Requisitos específicos para cilindros de gás." }]
          }
      ]
  },
  {
      id: 7,
      title: "Marcas e Etiquetas",
      description: "Requisitos para marcação e rotulagem de pacotes.",
      color: "border-purple-600",
      icon: Tag,
      sections: [
          {
              id: "7.1",
              title: "Marcas",
              blocks: [
                  { type: "paragraph", content: "Cada pacote contendo mercadorias perigosas deve ser marcado com o Nome Apropriado para Embarque e o Número UN." },
                  { type: "list", content: { ordered: false, items: ["UN Number", "Proper Shipping Name", "Nome e Endereço do Expedidor", "Nome e Endereço do Destinatário"] } }
              ]
          },
          {
              id: "7.2",
              title: "Etiquetas",
              blocks: [
                  { type: "paragraph", content: "Etiquetas de risco (Losangos 100x100mm) devem ser afixadas para indicar o risco primário e secundário." },
                  { type: "figure", content: { type: "label", labelClass: "3", caption: "Exemplo: Classe 3" } }
              ]
          },
           {
              id: "7.3",
              title: "Especificações de Etiquetas",
              blocks: [
                  { type: "paragraph", content: "As etiquetas devem ser duráveis e resistentes às intempéries." }
              ]
          }
      ]
  },
  {
      id: 8,
      title: "Documentação",
      description: "Shipper's Declaration (DGD) e Air Waybill (AWB).",
      color: "border-green-600",
      icon: FileText,
      sections: [
          {
              id: "8.0",
              title: "General",
              blocks: [{ type: "paragraph", content: "A documentação é vital para a segurança. Erros documentais são a causa #1 de rejeição de carga." }]
          },
          {
              id: "8.1",
              title: "Shipper's Declaration (DGD)",
              blocks: [
                  { type: "paragraph", content: "Documento legal assinado pelo expedidor declarando conformidade. Deve ter bordas hachuradas vermelhas." },
                  { type: "list", content: { ordered: true, items: ["Deve ser preenchido em Inglês", "2 vias assinadas", "Sem rasuras (salvo se assinadas)"] } }
              ]
          },
          {
              id: "8.2",
              title: "Air Waybill (AWB)",
              blocks: [
                  { type: "paragraph", content: "O conhecimento aéreo deve conter declarações específicas na caixa 'Handling Information'." },
                  { type: "warning", content: { text: "Statement obrigatório: 'Dangerous Goods as per attached Shipper's Declaration' ou 'Dangerous Goods as per attached DGD'." } }
              ]
          }
      ]
  },
  {
      id: 9,
      title: "Manuseio",
      description: "Aceitação, armazenamento, carregamento e inspeção.",
      color: "border-blue-700",
      icon: Plane,
      sections: [
          {
              id: "9.1",
              title: "Aceitação",
              blocks: [
                  { type: "paragraph", content: "O operador deve usar um checklist de aceitação para verificar a conformidade externa dos volumes e da documentação." }
              ]
          },
          {
              id: "9.2",
              title: "Storage",
              blocks: [
                  { type: "paragraph", content: "Mercadorias perigosas devem ser armazenadas de forma segura para prevenir danos ou vazamentos." }
              ]
          },
          {
              id: "9.3",
              title: "Segregação",
              blocks: [
                  { type: "paragraph", content: "Os volumes contendo mercadorias perigosas que possam reagir perigosamente uns com os outros não devem ser estivados próximos. A Tabela 9.3.A deve ser usada para verificar os requisitos." },
                  {
                      type: "table",
                      content: {
                          caption: "Tabela 9.3.A - Segregação de Pacotes",
                          type: "matrix",
                          headers: [
                              "Classe", 
                              "1 Explosivos", 
                              "2 Gases", 
                              "3 Líq. Inflam.", 
                              "4.1 Sól. Inflam.", 
                              "4.2 Comb. Espont.", 
                              "4.3 Perig. Molhado", 
                              "5.1 Oxidante", 
                              "5.2 Peróx. Org.", 
                              "8 Corrosivo"
                          ],
                          rows: [
                              ["1 Explosivos (exceto 1.4S)", false, false, false, false, false, false, false, false, false],
                              ["2 Gases", false, true, true, true, true, true, true, true, true],
                              ["3 Líquidos Inflamáveis", false, true, true, true, true, false, false, false, true],
                              ["4.1 Sólidos Inflamáveis", false, true, true, true, true, true, false, false, true],
                              ["4.2 Combustão Espontânea", false, true, true, true, true, true, false, false, true],
                              ["4.3 Perigoso Quando Molhado", false, true, false, true, true, true, false, false, false],
                              ["5.1 Oxidantes", false, true, false, false, false, false, true, true, true],
                              ["5.2 Peróxidos Orgânicos", false, true, false, false, false, false, true, true, true],
                              ["8 Corrosivos", false, true, true, true, true, false, true, true, true]
                          ],
                          footnotes: [
                              "Nota 1: Classe 1 (exceto 1.4S) deve ser segregada de todas as outras classes.",
                              "Nota 2: Classe 8 deve ser segregada de 4.3 (substâncias que em contato com água emitem gases inflamáveis) se líquidos.",
                              "Nota 3: Classe 3, 4.1 e 4.2 devem ser segregadas de Oxidantes (5.1) e Peróxidos Orgânicos (5.2)."
                          ]
                      }
                  },
                  {
                      type: "tool",
                      content: {
                          toolType: "segregation-checker",
                          title: "Verificador de Segregação (Tabela 9.3.A)",
                          data: {
                              classes: ["1", "2", "3", "4.1", "4.2", "4.3", "5.1", "5.2", "8"],
                              labels: {
                                  "1": "1 Explosivos",
                                  "2": "2 Gases",
                                  "3": "3 Líq. Inflam.",
                                  "4.1": "4.1 Sól. Inflam.",
                                  "4.2": "4.2 Comb. Espont.",
                                  "4.3": "4.3 Perig. Molhado",
                                  "5.1": "5.1 Oxidante",
                                  "5.2": "5.2 Peróx. Org.",
                                  "8": "8 Corrosivo"
                              },
                              matrix: {
                                  "1": { "1": true, "2": false, "3": false, "4.1": false, "4.2": false, "4.3": false, "5.1": false, "5.2": false, "8": false },
                                  "2": { "1": false, "2": true, "3": true, "4.1": true, "4.2": true, "4.3": true, "5.1": true, "5.2": true, "8": true },
                                  "3": { "1": false, "2": true, "3": true, "4.1": true, "4.2": true, "4.3": false, "5.1": false, "5.2": false, "8": true },
                                  "4.1": { "1": false, "2": true, "3": true, "4.1": true, "4.2": true, "4.3": true, "5.1": false, "5.2": false, "8": true },
                                  "4.2": { "1": false, "2": true, "3": true, "4.1": true, "4.2": true, "4.3": true, "5.1": false, "5.2": false, "8": true },
                                  "4.3": { "1": false, "2": true, "3": false, "4.1": true, "4.2": true, "4.3": true, "5.1": false, "5.2": false, "8": false },
                                  "5.1": { "1": false, "2": true, "3": false, "4.1": false, "4.2": false, "4.3": false, "5.1": true, "5.2": true, "8": true },
                                  "5.2": { "1": false, "2": true, "3": false, "4.1": false, "4.2": false, "4.3": false, "5.1": true, "5.2": true, "8": true },
                                  "8": { "1": false, "2": true, "3": true, "4.1": true, "4.2": true, "4.3": false, "5.1": true, "5.2": true, "8": true }
                              },
                              notes: {}
                          }
                      }
                  }
              ]
          },
          {
              id: "9.4",
              title: "Loading",
              blocks: [
                  { type: "paragraph", content: "Volumes devem ser fixados para prevenir movimento durante o voo." }
              ]
          },
          {
              id: "9.5",
              title: "Checklist de Aceitação",
              blocks: [
                  {
                      type: "checklist",
                      content: {
                          id: "chk-non-rad",
                          title: "Checklist (Não Radioativo)",
                          items: [ { id: "1", text: "AWB contém statement correto?", reference: "8.2" }, { id: "2", text: "Qtd de volumes confere?", reference: "9.1" }, { id: "3", text: "Embalagem intacta?", reference: "9.1" } ]
                      }
                  }
              ]
          },
          { id: "9.6", title: "NOTOC", blocks: [{ type: "paragraph", content: "O piloto em comando deve ser notificado por escrito (NOTOC) sobre a localização e tipo de mercadorias perigosas a bordo." }] },
          {
            id: "9.7",
            title: "Fornecimento de Informações",
            blocks: [
                { type: "paragraph", content: "Os operadores devem fornecer informações claras sobre mercadorias perigosas em vários pontos de contato com passageiros e expedidores." },
                {
                    type: "definition-list",
                    content: [
                        { term: "Informação aos Passageiros", definition: "Avisos sobre artigos proibidos na bagagem devem estar visíveis nos balcões de check-in, áreas de venda de bilhetes e no website da companhia aérea." },
                        { term: "Avisos Públicos", definition: "Cartazes e sinalizações devem ser exibidos de forma proeminente em áreas de aceitação de carga e check-in de passageiros." },
                        { term: "Relato de Ocorrências", definition: "O operador deve informar o piloto-em-comando sobre as mercadorias perigosas a bordo. O piloto, por sua vez, deve informar os serviços de tráfego aéreo em caso de emergência em voo envolvendo essas mercadorias." }
                    ]
                },
                { type: "note", content: { title: "Referência", text: "Os procedimentos detalhados para o relato de acidentes e incidentes estão descritos na Seção 1.7." } }
            ]
          },
          { id: "9.8", title: "Training", blocks: [{ type: "paragraph", content: "Ver Capítulo 1.5 para requisitos de treinamento." }] }
      ]
  },
  {
      id: 10,
      title: "Material Radioativo",
      description: "Classificação, embalagem e documentação específica para Classe 7.",
      color: "border-yellow-600",
      icon: Radiation,
      sections: [
          { id: "10.1", title: "Applicability", blocks: [{type: "paragraph", content: "Aplica-se a materiais da Classe 7."}] },
          { id: "10.2", title: "Limitations", blocks: [{type: "paragraph", content: "Limites de atividade para transporte aéreo."}] },
          {
              id: "10.3",
              title: "Classificação e Atividade",
              blocks: [
                  { type: "paragraph", content: "A classificação depende dos valores A1 (forma especial) e A2 (outras formas) de cada radionuclídeo." }
              ]
          },
          { id: "10.4", title: "Identification", blocks: [{type: "paragraph", content: "Seleção do nome apropriado (ex: UN 2915)."}] },
          {
              id: "10.5",
              title: "Embalagem e Categorias",
              blocks: [
                  { type: "paragraph", content: "As embalagens são categorizadas com base no Índice de Transporte (TI) e nível de radiação na superfície." },
                  {
                      type: "table",
                      content: {
                          headers: ["Categoria", "TI Máximo", "Radiação Superfície (mSv/h)"],
                          rows: [
                              ["I-WHITE", "0", "< 0.005"],
                              ["II-YELLOW", "< 1.0", "< 0.5"],
                              ["III-YELLOW", "< 10.0", "< 2.0"]
                          ]
                      }
                  }
              ]
          },
          { id: "10.6", title: "Packaging Specs", blocks: [{type: "paragraph", content: "Especificações para embalagens Tipo A, Tipo B, etc."}] },
          { id: "10.7", title: "Marking & Labelling", blocks: [{type: "paragraph", content: "Marcas e etiquetas específicas para radioativos."}] },
          { id: "10.8", title: "Documentation", blocks: [{type: "paragraph", content: "Requisitos adicionais para DGD."}] },
          { id: "10.9", title: "Handling", blocks: [{type: "paragraph", content: "Segregação de pessoas e filmes fotográficos."}] }
      ]
  },
  {
      id: "A",
      title: "Apêndice A - Glossário",
      description: "Definições de termos técnicos usados no regulamento.",
      color: "border-gray-400",
      icon: Library,
      sections: [
          {
              id: "A.1",
              title: "Glossário de Termos",
              blocks: [
                  {
                      type: "database",
                      content: {
                          id: "glossary-db",
                          title: "Base de Dados de Termos Técnicos",
                          type: "glossary",
                          columns: [
                              { key: "term", label: "Termo", width: "w-48" },
                              { key: "definition", label: "Definição" }
                          ],
                          data: GLOSSARY_DATA
                      }
                  }
              ]
          }
      ]
  },
  {
      id: "B",
      title: "Apêndice B - Conversões",
      description: "Fatores de conversão e nomenclatura.",
      color: "border-gray-400",
      icon: Scale,
      sections: [
          {
              id: "B.1",
              title: "Unidades SI",
              blocks: [
                  {
                      type: "table",
                      content: {
                          headers: ["Grandeza", "Unidade SI", "Equivalente Impl."],
                          rows: [
                              ["Pressão", "kPa (bar)", "1 bar = 100 kPa"],
                              ["Volume", "L (Litro)", "1 gal = 3.785 L"],
                              ["Massa", "kg (Quilograma)", "1 lb = 0.454 kg"],
                              ["Radioatividade", "Bq (Becquerel)", "1 Ci = 37 GBq"]
                          ]
                      }
                  }
              ]
          }
      ]
  },
  {
      id: "C",
      title: "Apêndice C - Substâncias Não Listadas",
      description: "Procedimentos para substâncias não listadas nominalmente.",
      color: "border-gray-400",
      icon: FileQuestion,
      sections: [
          {
              id: "C.1",
              title: "Visão Geral",
              blocks: [{ type: "paragraph", content: "Quando uma substância não está listada pelo nome na Tabela 4.2, deve-se usar uma entrada 'n.o.s.' (not otherwise specified) apropriada baseada na classe de risco." }]
          }
      ]
  },
  {
      id: "D",
      title: "Apêndice D - Autoridades Competentes",
      description: "Lista de contatos das autoridades nacionais de aviação civil.",
      color: "border-gray-400",
      icon: Building2,
      sections: [
          {
              id: "D.1",
              title: "Lista de Contatos",
              blocks: [
                  {
                      type: "table",
                      content: {
                          headers: ["País", "Autoridade", "Website"],
                          rows: [
                              ["Brasil", "ANAC - Agência Nacional de Aviação Civil", "www.anac.gov.br"],
                              ["Estados Unidos", "FAA - Federal Aviation Administration", "www.faa.gov"],
                              ["Reino Unido", "CAA - Civil Aviation Authority", "www.caa.co.uk"],
                              ["Canadá", "Transport Canada", "tc.canada.ca"],
                              ["União Europeia", "EASA", "www.easa.europa.eu"]
                          ]
                      }
                  }
              ]
          }
      ]
  }
];
