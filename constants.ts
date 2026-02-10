
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
        { id: "1.0", title: "Prefácio", blocks: [{ type: "paragraph", content: "Este manual reflete a 67ª edição dos Regulamentos de Mercadorias Perigosas da IATA, com base nas Instruções Técnicas da ICAO para o Transporte Seguro de Mercadorias Perigosas por Ar, e é eficaz a partir de 1 de Janeiro de 2026." }] },
        { id: "1.1", title: "Base da Regulamentação", blocks: [{ type: "paragraph", content: "Estas regulamentações contêm todos os requisitos das Instruções Técnicas da ICAO e incluem requisitos adicionais mais restritivos, que são mais rigorosos do que os requisitos da ICAO." }] },
        { id: "1.2", title: "Aplicação Geral", blocks: [{ type: "paragraph", content: "Estes regulamentos são aplicáveis a todos os operadores (companhias aéreas) que são membros da IATA e a todos os expedidores e agentes que oferecem remessas para estes operadores." }, { type: "list", content: { ordered: false, items: ["Expedidores (Shippers)", "Agentes de Carga (Freight Forwarders)", "Operadores (Airlines)", "Agentes de Manuseio (Ground Handling Agents)", "Passageiros e Tripulação"] } }] },
        { id: "1.3", title: "Responsabilidades", blocks: [{ type: "paragraph", content: "O transporte seguro de mercadorias perigosas é uma responsabilidade compartilhada por todas as partes envolvidas na cadeia de transporte." }] },
        { id: "1.3.1", title: "Responsabilidades do Expedidor", blocks: [{ type: "paragraph", content: "O expedidor (shipper) é a principal parte responsável por garantir que as mercadorias perigosas sejam oferecidas para transporte em total conformidade com estes regulamentos. Esta responsabilidade não pode ser delegada. O expedidor deve garantir que:"}, {type: "list", content: { ordered: true, type: 'alpha', items: ["Os artigos ou substâncias não estão proibidos para transporte aéreo.", "Os artigos ou substâncias estão devidamente identificados, classificados, embalados, marcados, etiquetados e documentados.", "A Declaração do Expedidor para Mercadorias Perigosas (DGD) foi preenchida com precisão e assinada.", "Todo o pessoal envolvido foi devidamente treinado."]}}] },
        { id: "1.3.2", title: "Responsabilidades do Operador", blocks: [{ type: "paragraph", content: "O operador (companhia aérea) deve garantir que apenas mercadorias perigosas aceitáveis, devidamente documentadas e inspecionadas sejam carregadas a bordo."}] },
        { id: "1.4", title: "Definição de Mercadorias Perigosas", blocks: [{ type: "paragraph", content: "Mercadorias perigosas são artigos ou substâncias que são capazes de colocar em risco a saúde, a segurança, a propriedade ou o meio ambiente e que estão apresentadas na lista de mercadorias perigosas nestes regulamentos ou que são classificadas de acordo com estes regulamentos." }] },
        { id: "1.5", title: "Treinamento (CBTA)", blocks: [{ type: "paragraph", content: "O treinamento deve ser baseado em competências (Competency-Based Training and Assessment - CBTA). Todos os funcionários envolvidos no transporte de carga aérea devem receber treinamento adequado à sua função e ser avaliados periodicamente." }, { type: "note", content: { title: "Validade", text: "O treinamento é válido por 24 meses. A reciclagem deve ocorrer dentro dos 3 meses finais do período de validade." } }] },
        { id: "1.5.1", title: "Requisitos de Treinamento por Função", blocks: [{ type: "paragraph", content: "O escopo do treinamento varia conforme a responsabilidade do funcionário. Por exemplo, o pessoal de aceitação de carga requer treinamento aprofundado, enquanto o pessoal de rampa pode necessitar de treinamento focado em reconhecimento e manuseio." }] },
        { id: "1.5.2", title: "Manutenção de Registros de Treinamento", blocks: [{ type: "paragraph", content: "Os empregadores devem manter registros do treinamento de mercadorias perigosas de seus funcionários por um período mínimo de 36 meses a partir da data do treinamento mais recente." }] },
        { id: "1.6", title: "Segurança (Security)", blocks: [{ type: "paragraph", content: "Medidas de segurança devem ser implementadas para minimizar o roubo ou uso indevido de mercadorias perigosas que possam ser usadas para fins terroristas."}] },
        { id: "1.6.1", title: "Plano de Segurança", blocks: [{ type: "paragraph", content: "Expedidores e operadores de mercadorias perigosas de alto risco devem adotar, implementar e cumprir um plano de segurança que aborde elementos como alocação de responsabilidades, registros de treinamento e procedimentos operacionais."}] },
        { id: "1.7", title: "Relato de Ocorrências", blocks: [{ type: "paragraph", content: "Operadores devem reportar incidentes e acidentes com mercadorias perigosas às autoridades competentes do Estado do Operador e do Estado de Ocorrência. Um incidente ocorre quando há vazamento, derramamento ou qualquer evento que indique falha na integridade da embalagem." }, { type: "warning", content: { text: "O reporte deve ser feito dentro de 72 horas após a descoberta do incidente, salvo exigência local mais estrita." } }] }
    ]
  },
  {
    id: 2,
    title: "Limitações",
    description: "Mercadorias proibidas, ocultas, quantidades limitadas, e variações de Estados e Operadores.",
    color: "border-red-600",
    icon: Ban,
    sections: [
        { id: "2.1", title: "Mercadorias Proibidas", blocks: [{ type: "paragraph", content: "Salvo disposição em contrário, o transporte aéreo de mercadorias perigosas é proibido, a menos que preparado de acordo com estes regulamentos." },] },
        { id: "2.1.1", title: "Proibido em Todas as Circunstâncias", blocks: [{ type: "paragraph", content: "Artigos e substâncias que, como apresentados para transporte, são suscetíveis de explodir, reagir perigosamente, produzir uma chama ou evolução perigosa de calor, ou uma emissão perigosa de gases ou vapores tóxicos, corrosivos ou inflamáveis sob condições normais encontradas no transporte aéreo. Exemplos incluem resíduos de aerossóis para descarte e baterias de lítio danificadas." }] },
        { id: "2.2", title: "Mercadorias Ocultas (Hidden DG)", blocks: [{ type: "paragraph", content: "Muitos itens de aparência inofensiva podem conter mercadorias perigosas não declaradas. O pessoal de aceitação deve ser treinado para identificá-los." }, { type: "list", content: { ordered: false, items: ["Equipamento de Mergulho (Luzes de alta intensidade, Cilindros de ar comprimido)", "Peças Automotivas (Baterias, Amortecedores, Airbags)", "Equipamento Médico (Cilindros de O2, Termômetros de mercúrio)", "Amostras de Diagnóstico"] } }] },
        { id: "2.3", title: "Mercadorias Perigosas em Bagagem", blocks: [{ type: "paragraph", content: "Certos artigos são permitidos para transporte por passageiros ou tripulantes, seja na bagagem de mão, na bagagem despachada ou na pessoa, desde que cumpram restrições estritas de quantidade e embalagem." }, { type: "database", content: { id: "pax-provisions", title: "Tabela 2.3.A - Disposições para Passageiros", type: "variations",  columns: [{ key: "item", label: "Item", width: "w-64" }, { key: "carry_on", label: "Cabine / Pessoa", width: "w-24" }, { key: "checked", label: "Despacho", width: "w-24" }, { key: "operator_approval", label: "Aprov.", width: "w-20" }, { key: "limits", label: "Limites/Condições", width: "w-64" }], data: PAX_PROVISIONS_DATA } }] },
        { id: "2.4", title: "Transporte pelo Correio", blocks: [{ type: "paragraph", content: "A maioria das mercadorias perigosas é proibida no correio aéreo internacional (air mail). As administrações postais nacionais podem ter exceções para o correio doméstico." },] },
        { id: "2.5", title: "Mercadorias Perigosas do Operador (COMAT)", blocks: [{ type: "paragraph", content: "Mercadorias perigosas transportadas por um operador para seu próprio uso (COMAT - Company Materials) devem cumprir integralmente os regulamentos, a menos que especificamente isentas (ex: peças de aeronave)." }] },
        { id: "2.6", title: "Quantidades Excecionadas (EQ)", blocks: [{ type: "paragraph", content: "Pequenas quantidades de certas mercadorias perigosas podem ser transportadas com requisitos regulatórios bastante reduzidos. A coluna F da Tabela 4.2 indica o código EQ aplicável. O limite máximo por aeronave é de 1.000 pacotes." }, { type: "visual-mark", content: { type: 'eq', data: {class: '3', unNumbers: '1263'}, caption: "Marca de Quantidade Excecionada" } }] },
        { id: "2.7", title: "Quantidades Limitadas (LQ)", blocks: [{ type: "paragraph", content: "Permite o uso de embalagens combinadas de boa qualidade que não precisam ser testadas conforme as especificações da ONU. O peso bruto máximo por volume é 30 kg." }, { type: "note", content: { title: "Identificação", text: "Instruções de embalagem para Quantidades Limitadas começam com a letra 'Y' (ex: Y341)." } }, { type: "visual-mark", content: { type: 'lq-y', caption: "Marca de Quantidade Limitada (Aérea)" } }] },
        { id: "2.8", title: "Variações de Estados e Operadores", blocks: [{ type: "paragraph", content: "Estados (países) e Operadores (companhias aéreas) podem impor restrições mais rigorosas do que as da IATA. É obrigatório verificar e cumprir todas as variações aplicáveis." }, { type: "database", content: { id: "variations-db", title: "Tabela 2.8 - Variações", type: "variations", columns: [ { key: "code", label: "Cód" }, { key: "owner", label: "Estado/Operador" }, { key: "text", label: "Restrição" } ], data: VARIATIONS_DATA } }] }
    ]
  },
  {
    id: 3,
    title: "Classificação",
    description: "As 9 classes de perigo, grupos de embalagem e critérios de precedência de risco.",
    color: "border-orange-500",
    icon: FlaskConical,
    sections: [
        { id: "3.0", title: "Responsabilidade pela Classificação", blocks: [{ type: "paragraph", content: "O expedidor é responsável por classificar corretamente as mercadorias perigosas de acordo com os critérios detalhados nesta seção." }] },
        { id: "3.1", title: "Classe 1 - Explosivos", blocks: [{ type: "paragraph", content: "Qualquer substância ou artigo que tenha a capacidade de produzir, por reação química, gás a tal temperatura, pressão e velocidade que cause danos ao seu redor." }] },
        { id: "3.1.1", title: "Divisões", blocks:[{ type: "paragraph", content: "A Classe 1 é dividida em seis divisões baseadas no tipo de risco que apresentam:" }, { type: 'definition-list', content: [
            { term: 'Divisão 1.1', definition: 'Substâncias e artigos com risco de explosão em massa.' },
            { term: 'Divisão 1.2', definition: 'Substâncias e artigos com risco de projeção, mas sem risco de explosão em massa.' },
            { term: 'Divisão 1.3', definition: 'Substâncias e artigos com risco de fogo e risco menor de explosão ou projeção, mas sem risco de explosão em massa.' },
            { term: 'Divisão 1.4', definition: 'Substâncias e artigos que não apresentam risco significativo.' },
            { term: 'Divisão 1.5', definition: 'Substâncias muito insensíveis com risco de explosão em massa.' },
            { term: 'Divisão 1.6', definition: 'Artigos extremamente insensíveis sem risco de explosão em massa.' }
        ]}] }, 
        { id: "3.1.2", title: "Grupos de Compatibilidade", blocks:[{ type: "paragraph", content: "Os explosivos são atribuídos a um dos 13 grupos de compatibilidade (A-S, exceto I, M, O, P, Q, R) para controlar a segregação durante o transporte:" }, { type: 'definition-list', content: [
            { term: 'A', definition: 'Substância explosiva primária.' },
            { term: 'B', definition: 'Artigo contendo uma substância explosiva primária, sem dois ou mais dispositivos de proteção eficazes.' },
            { term: 'C', definition: 'Substância explosiva propelente ou outra substância explosiva deflagrante.' },
            { term: 'D', definition: 'Substância explosiva detonante secundária; ou pólvora negra.' },
            { term: 'E', definition: 'Artigo contendo uma substância explosiva detonante secundária, sem meios de iniciação, com carga propelente.' },
            { term: 'F', definition: 'Artigo contendo uma substância explosiva detonante secundária, com seus próprios meios de iniciação.' },
            { term: 'G', definition: 'Substância pirotécnica ou artigo contendo uma substância pirotécnica.' },
            { term: 'H', definition: 'Artigo contendo uma substância explosiva e fósforo branco.' },
            { term: 'J', definition: 'Artigo contendo uma substância explosiva e líquido ou gel inflamável.' },
            { term: 'K', definition: 'Artigo contendo uma substância explosiva e um agente químico tóxico.' },
            { term: 'L', definition: 'Substância explosiva ou artigo contendo uma substância explosiva que apresenta um risco especial.' },
            { term: 'N', definition: 'Artigos contendo apenas substâncias detonantes extremamente insensíveis.' },
            { term: 'S', definition: 'Substância ou artigo embalado ou projetado de forma que quaisquer efeitos perigosos fiquem confinados dentro do volume.' }
        ]}] },
        { id: "3.2", title: "Classe 2 - Gases", blocks: [{ type: "paragraph", content: "Substâncias que são completamente gasosas a 20°C e 101.3 kPa, ou que têm uma pressão de vapor superior a 300 kPa a 50°C. Inclui gases comprimidos, liquefeitos, dissolvidos e refrigerados." }] },
        { id: "3.2.1", title: "Divisão 2.1 – Gases Inflamáveis", blocks:[{ type: "paragraph", content: "Gases que a 20°C e 101.3 kPa são inflamáveis em mistura de 13% ou menos por volume com ar, ou que têm uma faixa de inflamabilidade com ar de pelo menos 12 pontos percentuais." }] }, 
        { id: "3.2.2", title: "Divisão 2.2 – Gases Não-Inflamáveis, Não-Tóxicos", blocks:[{ type: "paragraph", content: "Gases que são asfixiantes, oxidantes ou que não se enquadram em outras divisões." }] }, 
        { id: "3.2.3", title: "Divisão 2.3 – Gases Tóxicos", blocks:[{ type: "paragraph", content: "Gases que são conhecidos por serem tóxicos ou corrosivos para humanos a ponto de representar um risco à saúde durante o transporte, ou que se presume serem tóxicos ou corrosivos porque seu valor de LC50 é igual ou inferior a 5000 mL/m³ (ppm)." }] },
        { id: "3.3", title: "Classe 3 - Líquidos Inflamáveis", blocks: [{ type: "paragraph", content: "Líquidos que têm um ponto de fulgor não superior a 60°C (140°F), ou qualquer material em estado líquido com um ponto de fulgor acima de 60°C que é intencionalmente aquecido e oferecido para transporte a uma temperatura igual ou superior ao seu ponto de fulgor." }] },
        { id: "3.3.1", title: "Determinação do Ponto de Fulgor", blocks:[{ type: "paragraph", content: "O ponto de fulgor deve ser determinado por métodos de teste de vaso fechado, como os especificados na norma ISO 1523." }] }, 
        { id: "3.3.2", title: "Determinação do Grupo de Embalagem", blocks:[{ type: "paragraph", content: "O Grupo de Embalagem para Classe 3 é determinado pela combinação do ponto de fulgor e do ponto de ebulição inicial. PG I representa o maior perigo." }] },
        { id: "3.4", title: "Classe 4 - Sólidos Inflamáveis", blocks: [{ type: "paragraph", content: "Substâncias que não são líquidos nem gases, mas que podem facilmente entrar em combustão ou causar fogo através de fricção." }] },
        { id: "3.4.1", title: "Divisão 4.1 – Sólidos Inflamáveis", blocks: [{ type: "paragraph", content: "Sólidos que são facilmente combustíveis e sólidos que podem causar fogo através de fricção; Substâncias auto-reativas; Explosivos sólidos dessensibilizados." }] },
        { id: "3.4.2", title: "Divisão 4.2 – Substâncias Sujeitas à Combustão Espontânea", blocks: [{ type: "paragraph", content: "Substâncias que são suscetíveis a aquecimento espontâneo em condições normais de transporte, ou a aquecer em contato com o ar, sendo então suscetíveis a pegar fogo." }] },
        { id: "3.4.3", title: "Divisão 4.3 – Substâncias que Emitem Gases Inflamáveis em Contato com Água", blocks: [{ type: "paragraph", content: "Substâncias que, por interação com a água, são suscetíveis a se tornarem espontaneamente inflamáveis ou a emitir gases inflamáveis em quantidades perigosas." }] },
        { id: "3.5", title: "Classe 5 - Oxidantes e Peróxidos Orgânicos", blocks: [{ type: "paragraph", content: "Substâncias que, embora não sejam necessariamente combustíveis, podem, geralmente ao ceder oxigênio, causar ou contribuir para a combustão de outros materiais." }] },
        { id: "3.5.1", title: "Divisão 5.1 – Substâncias Oxidantes", blocks: [{ type: "paragraph", content: "Substâncias que, embora não sejam necessariamente combustíveis, podem, geralmente ao ceder oxigênio, causar ou contribuir para a combustão de outros materiais." }] },
        { id: "3.5.2", title: "Divisão 5.2 – Peróxidos Orgânicos", blocks: [{ type: "paragraph", content: "Substâncias termicamente instáveis que podem sofrer decomposição exotérmica auto-acelerada." }] },
        { id: "3.6", title: "Classe 6 - Tóxicos e Infectantes", blocks: [{ type: "paragraph", content: "Substâncias que podem causar morte, lesões graves ou danos à saúde humana se ingeridas, inaladas ou em contato com a pele." }] },
        { id: "3.6.1", title: "Divisão 6.1 – Substâncias Tóxicas", blocks: [{ type: "paragraph", content: "Substâncias que podem causar morte, lesões graves ou danos à saúde humana se ingeridas, inaladas ou em contato com a pele." }] },
        { id: "3.6.2", title: "Divisão 6.2 – Substâncias Infectantes", blocks: [{ type: "paragraph", content: "Substâncias que contêm patógenos, que são micro-organismos (incluindo bactérias, vírus, etc.) que podem causar doenças em humanos ou animais." }] },
        { id: "3.7", title: "Classe 7 - Material Radioativo", blocks: [{ type: "paragraph", content: "Qualquer material contendo radionuclídeos onde tanto a concentração de atividade quanto a atividade total na remessa excedem os valores especificados." }] },
        { id: "3.8", title: "Classe 8 - Corrosivos", blocks: [{ type: "paragraph", content: "Substâncias que, por ação química, causam danos severos quando em contato com tecidos vivos ou, em caso de vazamento, danificam ou destroem materialmente outras mercadorias ou os meios de transporte." }] },
        { id: "3.9", title: "Classe 9 - Miscelâneas", blocks: [{ type: "paragraph", content: "Artigos e substâncias que, durante o transporte aéreo, apresentam um perigo não coberto por outras classes." }] },
        { id: "3.9.1", title: "Geral", blocks: [{ type: "paragraph", content: "Esta classe abrange substâncias e artigos que, durante o transporte aéreo, apresentam um perigo não coberto por outras classes, como substâncias perigosas ao meio ambiente (UN 3077, UN 3082), material magnetizado, e gelo seco (UN 1845)." }] },
        { id: "3.9.2", title: "Baterias de Lítio", blocks: [{ type: "paragraph", content: "Regulamentações específicas para o transporte de baterias de lítio metálico (UN 3090, UN 3091) e de íon lítio (UN 3480, UN 3481). A classificação e embalagem dependem da capacidade em Watt-hora (Wh) para íon-lítio ou do conteúdo de lítio em gramas (g) para lítio-metal." }] },
        { id: "3.9.3", title: "Material Magnetizado", blocks: [{ type: "paragraph", content: "Artigos que possuem campos magnéticos fortes o suficiente para causar um desvio de bússola superior a 2 graus a uma distância de 2.1 m de qualquer ponto na superfície do pacote." }] },
        { id: "3.10", title: "Precedência de Riscos", blocks: [{ type: "paragraph", content: "Para substâncias com múltiplos riscos não listadas na Tabela 4.2, a classificação é determinada pela Tabela de Precedência de Riscos (Tabela 3.10.A), que define qual risco tem prioridade." }, { type: "note", content: { title: "Referência Cruzada", text: "A Tabela 3.10.A é fundamental para a classificação correta de substâncias com múltiplos perigos." } } ] }
    ]
  },
  {
    id: 4,
    title: "Identificação",
    description: "A Lista de Mercadorias Perigosas (Tabela 4.2) e Nomes Apropriados para Embarque.",
    color: "border-latam-indigo",
    icon: ListFilter,
    sections: [
        { id: "4.0", title: "Visão Geral", blocks: [{ type: "paragraph", content: "Este capítulo trata da identificação correta de artigos perigosos, incluindo a seleção do Nome Apropriado para Embarque (PSN)." }] },
        { id: "4.1", title: "Nome Apropriado para Embarque (PSN)", blocks: [{ type: "paragraph", content: "O expedidor deve selecionar o nome que melhor descreve a substância na Tabela 4.2." }] },
        { id: "4.1.1", title: "Seleção do PSN", blocks:[{type: "paragraph", content: "O nome em negrito na Tabela 4.2, seguido por qualquer texto não em itálico, constitui o PSN."}]},
        { id: "4.1.2", title: "Entradas Genéricas e N.O.S.", blocks:[{type: "paragraph", content: "Entradas 'não especificadas de outra forma' (n.o.s.) devem ser suplementadas com o(s) nome(s) técnico(s) do(s) componente(s) perigoso(s)."}]},
        { id: "4.2", title: "Lista de Mercadorias Perigosas (Blue Pages)", blocks: [{ type: "paragraph", content: "A Tabela 4.2, conhecida como 'Páginas Azuis', é a principal referência para todas as mercadorias perigosas listadas. Ela fornece informações sobre classificação, embalagem, limites e disposições especiais." }, { type: "database", content: { id: "blue-pages", title: "Tabela 4.2 - Lista Azul", type: "blue-pages", columns: [{ key: "un", label: "UN", width: "w-16", filterable: true }, { key: "name", label: "Nome Apropriado", width: "w-64", filterable: true }, { key: "class", label: "Cls", width: "w-12" }, { key: "sub", label: "Sub", width: "w-12" }, { key: "pg", label: "PG", width: "w-12" }, { key: "eq", label: "EQ", width: "w-12" }, { key: "lq_pi", label: "Y-PI", width: "w-16" }, { key: "pax_pi", label: "Pax PI", width: "w-16" }, { key: "cao_pi", label: "CAO PI", width: "w-16" }, { key: "sp", label: "SP", width: "w-24" }], data: BLUE_PAGES_DATA } }] },
        { id: "4.4", title: "Disposições Especiais", blocks: [{ type: "paragraph", content: "Códigos 'A' (A1, A2, etc.) listados na Coluna M da Tabela 4.2 modificam os requisitos para itens específicos." }, { type: "database", content: { id: "sp-db", title: "Tabela 4.4 - Disposições Especiais", type: "variations", columns: [ { key: "code", label: "Cód" }, { key: "text", label: "Descrição" } ], data: SPECIAL_PROVISIONS_DATA } }] }
    ]
  },
  {
    id: 5,
    title: "Embalagem",
    description: "Instruções de Embalagem (PI) detalhadas para todas as classes.",
    color: "border-yellow-500",
    icon: Package,
    sections: [
        { id: "5.0", title: "Disposições Gerais", blocks: [] },
        { id: "5.0.1", title: "Responsabilidades do Expedidor", blocks:[{ type: "paragraph", content: "O expedidor é responsável por garantir que a embalagem selecionada esteja em conformidade com a Instrução de Embalagem aplicável e que os limites de quantidade não sejam excedidos."}]},
        { id: "5.0.2", title: "Requisitos Gerais de Embalagem", blocks:[{ type: "paragraph", content: "Todas as embalagens usadas para mercadorias perigosas devem atender aos seguintes requisitos fundamentais:"}, {type: "list", content: {ordered: false, items: ["As embalagens devem ser de boa qualidade e construídas de forma a prevenir vazamentos sob condições normais de transporte, incluindo mudanças de temperatura, umidade, pressão e vibração.", "As embalagens devem ser compatíveis com o conteúdo. As partes da embalagem que entram em contato direto com mercadorias perigosas não devem ser afetadas ou enfraquecidas significativamente por essa substância.", "Deve ser utilizado material absorvente e de acolchoamento adequado para líquidos em embalagens combinadas.", "As embalagens devem estar devidamente fechadas de acordo com as instruções do fabricante."]}}]},
        { id: "5.0.3", title: "Overpacks", blocks:[{ type: "paragraph", content: "Um invólucro usado por um expedidor para conter um ou mais volumes. Deve ser marcado com 'OVERPACK' e todas as marcações e etiquetas dos volumes internos devem ser reproduzidas no exterior."}]},
        { id: "5.0.4", title: "Embalagens de Resgate (Salvage)", blocks:[{ type: "paragraph", content: "Embalagens especiais usadas para transportar volumes de mercadorias perigosas que foram danificados, defeituosos ou que vazaram."}]},
        { id: "5.3", title: "Instruções de Embalagem - Classe 3", blocks: [{ type: "paragraph", content: "Contém as Instruções de Embalagem de 340 a 378." }, {type: "packing-instruction", content: {id: "353", title: "Líquidos Inflamáveis, GE II", transportMode: "Passenger and Cargo", content: [{type: "paragraph", content: "Esta instrução se aplica a líquidos inflamáveis do Grupo de Embalagem II em embalagens combinadas em aeronaves de passageiros."}, {type: "table", content: {headers: ["Embalagem Interna", "Quantidade Líquida Máxima"], rows: [["Vidro, Plástico, Metal", "1 L"]]}}, {type: "note", content: {title: "Embalagem Externa", text: "As embalagens internas devem ser acondicionadas em embalagens externas resistentes, como caixas de papelão (4G) ou tambores de aço (1A2)."}}, {type: "paragraph", content: "A quantidade líquida total por volume não deve exceder 5 L."}]}} ] },
        { id: "5.6", title: "Instruções de Embalagem - Classe 6", blocks: [{ type: "paragraph", content: "Contém as Instruções de Embalagem de 620 a 682." }, {type: "packing-instruction", content: {id: "650", title: "Substância Biológica, Categoria B (UN 3373)", transportMode: "Passenger and Cargo", content: [{type: "paragraph", content: "Esta instrução se aplica a substâncias biológicas da Categoria B (UN 3373)."}, {type: "paragraph", content: "A embalagem deve consistir em três componentes:"}, {type: "list", content: {ordered: true, items: ["Um recipiente primário estanque.", "Uma embalagem secundária estanque.", "Uma embalagem externa rígida com material absorvente adequado posicionado entre o recipiente primário e a embalagem secundária."]}}, {type: "note", content: {title: "Limites", text: "O recipiente primário não deve exceder 1 L (líquido) ou a massa da embalagem externa (sólido). A quantidade total por volume não deve exceder 4 L ou 4 kg."}}, {type: "warning", content: {text: "A marca 'Biological Substance, Category B' deve ser exibida na embalagem externa."}}]}} ] },
        { id: "5.8", title: "Instruções de Embalagem - Classe 9", blocks: [{ type: "paragraph", content: "Contém as Instruções de Embalagem de 950 a 970." }, {type: "packing-instruction", content: {id: "965", title: "Baterias de Íon Lítio (UN 3480)", transportMode: "Cargo Aircraft Only", content: [{type: "paragraph", content: "Esta instrução se aplica a baterias de íon lítio (UN 3480) sem equipamento. O transporte em aeronaves de passageiros é proibido."}, {type: "note", content: {title: "Estado de Carga (SoC)", text: "As baterias devem ser enviadas com um estado de carga (SoC) não superior a 30% de sua capacidade nominal."}}, {type: "warning", content: {text: "Seção IA: Exige embalagem de especificação UN (PG II) e DGD completa. Seção IB: Não exige embalagem UN, mas tem limites de peso e requer DGD. Seção II: Embalagens mais simples, sem DGD, para baterias pequenas."}}, {type: "paragraph", content: "Todas as baterias devem ser protegidas contra curto-circuito e danos acidentais. Volumes devem portar a Etiqueta de Risco Classe 9 e a Marca de Bateria de Lítio."}]}}] },
    ]
  },
  {
      id: 6,
      title: "Especificações de Embalagem",
      description: "Requisitos de fabricação e testes de performance para embalagens UN.",
      color: "border-gray-700",
      icon: Box,
      sections: [
          { id: "6.0", title: "Aplicabilidade e Requisitos Gerais", blocks: [{ type: "paragraph", content: "Este capítulo define os requisitos de construção e teste para embalagens de especificação UN, exceto para Classe 2, 6.2 e 7." }] },
          { id: "6.1", title: "Códigos para Tipos de Embalagem", blocks: [{ type: "list", content: { ordered: false, items: ["1A1: Tambor de Aço com tampa não removível", "4G: Caixa de Papelão", "3H1: Jerrican de Plástico com tampa não removível"] } }] },
          { id: "6.2", title: "Marcação de Embalagens", blocks: [{ type: "paragraph", content: "Detalha o significado da marca UN (ex: 4G/Y145/S/23/USA/M1234), que indica o tipo, nível de performance, ano de fabricação, etc." }] },
          { id: "6.3", title: "Requisitos para Embalagens", blocks: [{ type: "paragraph", content: "Especificações detalhadas para cada tipo de embalagem (tambores, caixas, jerricans, etc.)." }] },
          { id: "6.3.1", title: "Requisitos para Tambores", blocks: [{ type: "paragraph", content: "Detalhes sobre materiais, construção e fechamento de tambores de aço, alumínio, etc." }] },
          { id: "6.3.2", title: "Requisitos para Caixas", blocks: [{ type: "paragraph", content: "Detalhes sobre materiais e construção de caixas de papelão, madeira, plástico, etc." }] },
          { id: "6.4", title: "Requisitos de Teste para Embalagens", blocks: [{ type: "paragraph", content: "As embalagens devem passar por testes rigorosos para obter a certificação UN." }] },
          { id: "6.4.1", title: "Teste de Queda", blocks:[{ type: "paragraph", content: "Simula quedas durante o manuseio. A altura da queda varia com o Grupo de Embalagem (1.8m para PG I)." }] }, 
          { id: "6.4.2", title: "Teste de Estanqueidade", blocks:[{ type: "paragraph", content: "Aplicável a embalagens para líquidos, para garantir que não haja vazamentos." }] }, 
          { id: "6.4.3", title: "Teste de Pressão Hidráulica Interna", blocks:[{ type: "paragraph", content: "Testa a capacidade da embalagem de resistir à pressão interna." }] }, 
          { id: "6.4.4", title: "Teste de Empilhamento", blocks:[{ type: "paragraph", content: "Testa a resistência da embalagem ao peso de outras embalagens empilhadas sobre ela." }] }
      ]
  },
  {
      id: 7,
      title: "Marcas e Etiquetas",
      description: "Requisitos para marcação e rotulagem de pacotes.",
      color: "border-purple-600",
      icon: Tag,
      sections: [
          { id: "7.0", title: "Responsabilidade do Expedidor", blocks: [{ type: "paragraph", content: "O expedidor é responsável por todas as marcas e etiquetas necessárias em cada volume." }] },
          { id: "7.1", title: "Marcação", blocks: [{ type: "paragraph", content: "Cada volume contendo mercadorias perigosas deve ser marcado de forma durável e legível com informações essenciais. As marcações devem resistir à exposição ao clima sem redução substancial de sua eficácia." }] },
          { id: "7.1.1", title: "Número UN e Nome Apropriado", blocks:[{type: "paragraph", content:"O UN Number e o Proper Shipping Name devem ser marcados em cada volume."}]},
          { id: "7.1.2", title: "Endereços", blocks:[{type: "paragraph", content:"Nome e endereço completo do expedidor e do destinatário."}]},
          { id: "7.1.3", title: "Marcas de Especificação de Embalagem", blocks:[{ type: "paragraph", content: "A marca de especificação UN deve ser durável, legível e visível." }]},
          { id: "7.1.4", title: "Requisitos de Idioma", blocks: [{ type: "paragraph", content: "Salvo disposição em contrário, todas as marcações devem estar em inglês." }] },
          { id: "7.1.5", title: "Marcas de Quantidade Limitada e Excepcionada", blocks: [{ type: "paragraph", content: "Requisitos específicos de marcação para volumes preparados sob as provisões de LQ e EQ." }] },
          { id: "7.1.6", title: "Outras Marcas", blocks: [{ type: "paragraph", content: "Cobre marcas para Baterias de Lítio, Substâncias Perigosas ao Meio Ambiente, Material Magnetizado, etc." }] },
          { id: "7.2", title: "Etiquetagem", blocks: [{ type: "paragraph", content: "Etiquetas de risco (Losangos 100x100mm) devem ser afixadas para indicar o risco primário e, se aplicável, os riscos secundários." }] },
          { id: "7.2.1", title: "Aplicabilidade das Etiquetas", blocks:[{ type: "paragraph", content: "Descreve quando as etiquetas de risco primário e secundário são necessárias." }]},
          { id: "7.2.2", title: "Especificações das Etiquetas", blocks:[{ type: "paragraph", content: "As etiquetas devem ter dimensões, cores e símbolos específicos." }]},
          { id: "7.2.3", title: "Posicionamento das Etiquetas", blocks:[{ type: "paragraph", content: "As etiquetas devem ser afixadas em uma superfície do volume, perto da marca do Nome Apropriado, e não devem ser cobertas ou obscurecidas." }]},
          { id: "7.3", title: "Etiquetas de Manuseio", blocks: [{ type: "paragraph", content: "Além das etiquetas de risco, etiquetas de manuseio são necessárias para fornecer instruções sobre como o volume deve ser manuseado e estivado." }, { type: "visual-mark", content: { type: 'cargo-only', caption: 'Cargo Aircraft Only' } }, { type: "visual-mark", content: { type: 'orientation', caption: 'Setas de Orientação' } } ] }
      ]
  },
  {
      id: 8,
      title: "Documentação",
      description: "Shipper's Declaration (DGD) e Air Waybill (AWB).",
      color: "border-green-600",
      icon: FileText,
      sections: [
          { id: "8.0", title: "Requisitos Gerais", blocks: [{ type: "paragraph", content: "Uma Shipper's Declaration for Dangerous Goods (DGD) é necessária para a maioria dos embarques de mercadorias perigosas." }] },
          { id: "8.1", title: "Shipper's Declaration (DGD)", blocks: [{ type: "paragraph", content: "Documento legal assinado pelo expedidor declarando conformidade. Deve ter bordas hachuradas vermelhas." }] },
          { id: "8.1.1", title: "Preenchimento", blocks:[{ type: "paragraph", content: "A DGD deve ser preenchida de forma precisa e completa, sem rasuras não autorizadas. As informações devem ser apresentadas na seguinte ordem: UN Number, Proper Shipping Name, Class or Division, e Packing Group." }] },
          { id: "8.1.2", title: "Número de Cópias", blocks:[{ type: "paragraph", content: "No mínimo, duas cópias da DGD devem ser fornecidas ao operador." }] },
          { id: "8.1.3", title: "Correções e Alterações", blocks:[{ type: "paragraph", content: "Alterações ou correções na DGD não são permitidas, a menos que sejam assinadas pela mesma pessoa que assinou a declaração." }] },
          { id: "8.2", title: "Conhecimento Aéreo (Air Waybill)", blocks: [{ type: "paragraph", content: "O AWB deve conter declarações específicas na caixa 'Handling Information' quando acompanha uma DGD." }, { type: "warning", content: { text: "Statement obrigatório: 'Dangerous Goods as per attached Shipper's Declaration' ou 'Dangerous Goods as per attached DGD'." } }] }
      ]
  },
  {
      id: 9,
      title: "Manuseio",
      description: "Aceitação, armazenamento, carregamento e inspeção.",
      color: "border-blue-700",
      icon: Plane,
      sections: [
          { id: "9.1", title: "Aceitação", blocks: [ { type: "paragraph", content: "O operador não deve aceitar um volume ou remessa de mercadorias perigosas até que tenha verificado, por meio de um checklist, que os documentos e os pacotes estão em total conformidade com os regulamentos." } ] },
          { id: "9.1.1", title: "Checklist de Aceitação", blocks:[{ type: "paragraph", content: "Um checklist deve ser usado para garantir que os volumes e a documentação estejam em conformidade antes da aceitação." }] }, 
          { id: "9.1.2", title: "Recusa de Carga", blocks:[{ type: "paragraph", content: "Remessas que não cumprem os regulamentos devem ser recusadas e o expedidor notificado sobre as discrepâncias." }] },
          { id: "9.2", title: "Armazenamento", blocks: [ { type: "paragraph", content: "Mercadorias perigosas devem ser armazenadas de forma segura e segregada em áreas designadas." } ] },
          { id: "9.3", title: "Segregação", blocks: [ { type: "paragraph", content: "Volumes incompatíveis não devem ser carregados próximos um do outro para evitar reações perigosas." } ] },
          { id: "9.3.1", title: "Tabela de Segregação (9.3.A)", blocks:[{type: "tool", content: { toolType: 'segregation-checker', title: 'Verificador de Segregação Interativo', data: { classes: ['1', '2.1', '2.2', '2.3', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '7', '8'], labels: {'1': 'Explosivos', '2.1': 'Gás Inflamável', '2.2': 'Gás Não-Inflamável', '2.3': 'Gás Tóxico', '3': 'Líquido Inflamável', '4.1': 'Sólido Inflamável', '4.2': 'Combustão Espontânea', '4.3': 'Perigoso Quando Molhado', '5.1': 'Oxidante', '5.2': 'Peróxido Orgânico', '6.1': 'Tóxico', '7': 'Radioativo', '8': 'Corrosivo'}, matrix: {}, notes: {}} }}] }, 
          { id: "9.3.2", title: "Segregação de Radioativos", blocks:[{ type: "paragraph", content: "Material radioativo deve ser segregado de pessoas, animais vivos e filme fotográfico não revelado com base no Índice de Transporte (TI)." }] },
          { id: "9.4", title: "Carregamento", blocks: [ { type: "paragraph", content: "Volumes devem ser fixados para prevenir movimento durante o voo e protegidos contra danos." } ] },
          { id: "9.4.1", title: "Carregamento em ULDs", blocks:[{ type: "paragraph", content: "Requisitos específicos para o carregamento de mercadorias perigosas em Unit Load Devices." }] }, 
          { id: "9.4.2", title: "Fixação e Amarração", blocks:[{ type: "paragraph", content: "Os volumes devem ser adequadamente amarrados para evitar movimento em voo." }] },
          { id: "9.5", title: "Informação ao Piloto em Comando (NOTOC)", blocks: [{ type: "paragraph", content: "O piloto deve ser notificado por escrito (NOTOC) sobre as mercadorias perigosas a bordo, incluindo UN Number, Proper Shipping Name, Class/Division, Packing Group, quantidade líquida, localização na aeronave e, para material radioativo, o Índice de Transporte." }] },
          { id: "9.6", title: "Fornecimento de Informações", blocks: [{ type: "paragraph", content: "Informações sobre mercadorias perigosas devem ser disponibilizadas em diversas situações." }] },
          { id: "9.6.1", title: "Informações para Passageiros", blocks: [{ type: "paragraph", content: "Os operadores devem fornecer informações aos passageiros sobre as mercadorias perigosas proibidas em sua bagagem." }] },
          { id: "9.6.2", title: "Informações em Caso de Emergência", blocks: [{ type: "paragraph", content: "Em caso de emergência em voo, o piloto em comando deve informar o controle de tráfego aéreo sobre as mercadorias perigosas a bordo." }] },
          { id: "9.7", title: "Manutenção de Registros", blocks: [{ type: "paragraph", content: "Documentos como a DGD e o NOTOC devem ser retidos por no mínimo 3 meses após o voo." }] }
      ]
  },
  {
      id: 10,
      title: "Material Radioativo",
      description: "Classificação, embalagem e documentação específica para Classe 7.",
      color: "border-yellow-600",
      icon: Radiation,
      sections: [
          { id: "10.0", title: "Aplicabilidade e Disposições Gerais", blocks:[{ type: "paragraph", content: "Esta seção se aplica ao transporte de material radioativo (Classe 7)." }] },
          { id: "10.1", title: "Limitações", blocks:[{ type: "paragraph", content: "Limites de atividade para pacotes e remessas." }] },
          { id: "10.2", title: "Classificação", blocks:[{ type: "paragraph", content: "Classificação baseada em atividade, radionuclídeo e forma." }] },
          { id: "10.3", title: "Identificação", blocks:[{ type: "paragraph", content: "Seleção do UN Number e Nome Apropriado para Embarque corretos." }] },
          { id: "10.3.1", title: "Determinação dos valores A1 e A2", blocks:[{ type: "paragraph", content: "Valores A1 (forma especial) e A2 (forma normal) são usados para determinar os limites de atividade para radionuclídeos." }] },
          { id: "10.4", title: "Disposições Especiais", blocks: [{ type: "paragraph", content: "Disposições especiais aplicáveis a materiais radioativos." }] },
          { id: "10.5", title: "Embalagem", blocks: [{ type: "paragraph", content: "Requisitos de embalagem para material radioativo são altamente específicos." }] },
          { id: "10.5.1", title: "Determinação do Índice de Transporte (TI)", blocks:[{ type: "paragraph", content: "O TI é um número que controla a exposição à radiação. É determinado medindo o nível de radiação a 1 metro da superfície do pacote." }] },
          { id: "10.5.2", title: "Categorias I-Branca, II-Amarela, III-Amarela", blocks:[{ type: "paragraph", content: "Os pacotes são categorizados com base no TI e no nível de radiação na superfície." }] },
          { id: "10.6", title: "Especificações de Embalagem e Requisitos de Teste", blocks:[{ type: "paragraph", content: "Detalhes sobre pacotes Excepted, Industriais, Tipo A, Tipo B(U), Tipo B(M) e Tipo C." }] },
          { id: "10.7", title: "Marcação e Etiquetagem", blocks:[{ type: "paragraph", content: "Requisitos específicos de marcação e etiquetagem para volumes contendo material radioativo." }] },
          { id: "10.8", title: "Documentação", blocks:[{ type: "paragraph", content: "Informações adicionais requeridas na Shipper's Declaration para material radioativo." }] },
          { id: "10.9", title: "Manuseio", blocks:[{ type: "paragraph", content: "Procedimentos de manuseio, incluindo segregação de pessoas e cargas." }] }
      ]
  },
  {
      id: "A",
      title: "Apêndice A - Glossário",
      description: "Definições de termos técnicos usados no regulamento.",
      color: "border-gray-400",
      icon: Library,
      sections: [
          { id: "A.1", title: "Glossário de Termos", blocks: [{ type: "database", content: { id: "glossary-db", title: "Base de Dados de Termos Técnicos", type: "glossary", columns: [{ key: "term", label: "Termo", width: "w-48" }, { key: "definition", label: "Definição" }], data: GLOSSARY_DATA } }] }
      ]
  },
  {
      id: "B",
      title: "Apêndice B - Conversões",
      description: "Fatores de conversão e nomenclatura.",
      color: "border-gray-400",
      icon: Scale,
      sections: [
          { id: "B.1", title: "Unidades de Medida SI", blocks: [{ type: "table", content: { headers: ["Grandeza", "Unidade SI", "Equivalente Imperial/Comum"], rows: [["Pressão", "kPa (kilopascal)", "1 bar = 100 kPa"], ["Volume", "L (Litro)", "1 gal (US) = 3.785 L"], ["Massa", "kg (Quilograma)", "1 lb = 0.4536 kg"], ["Radioatividade", "Bq (Becquerel)", "1 Ci (Curie) = 37 GBq"]] } }] }
      ]
  },
  {
      id: "C",
      title: "Apêndice C - Substâncias Não Listadas",
      description: "Procedimentos para substâncias não listadas nominalmente.",
      color: "border-gray-400",
      icon: FileQuestion,
      sections: [
          { id: "C.1", title: "Classificação de Substâncias Não Listadas", blocks: [{ type: "paragraph", content: "Quando uma substância não está listada pelo nome na Tabela 4.2, ela deve ser classificada com base nos critérios do Capítulo 3 e transportada sob uma entrada genérica ou 'n.o.s.' (not otherwise specified) apropriada." }] }
      ]
  },
  {
      id: "D",
      title: "Apêndice D - Autoridades Competentes",
      description: "Lista de contatos das autoridades nacionais de aviação civil.",
      color: "border-gray-400",
      icon: Building2,
      sections: [
          { id: "D.1", title: "Lista de Contatos", blocks: [{ type: "table", content: { headers: ["País", "Autoridade", "Website"], rows: [["Brasil", "ANAC - Agência Nacional de Aviação Civil", "www.anac.gov.br"], ["Estados Unidos", "FAA - Federal Aviation Administration", "www.faa.gov"], ["Reino Unido", "CAA - Civil Aviation Authority", "www.caa.co.uk"], ["Canadá", "Transport Canada", "tc.canada.ca"], ["União Europeia", "EASA", "www.easa.europa.eu"]] } }] }
      ]
  },
  {
      id: "E",
      title: "Apêndice E - Centros de Teste",
      description: "Instalações aprovadas para testes de embalagens (UN) e materiais radioativos.",
      color: "border-gray-400",
      icon: FlaskConical,
      sections: [
          { id: "E.1", title: "Laboratórios Credenciados para Teste de Embalagens", blocks: [{ type: "paragraph", content: "Lista de instalações autorizadas pelas autoridades competentes a realizar testes de desempenho e certificar embalagens conforme as especificações da ONU (Capítulo 6)." }, { type: "table", content: { headers: ["País", "Laboratório", "Cidade"], rows: [["Brasil", "IPT - Instituto de Pesquisas Tecnológicas", "São Paulo"], ["Brasil", "Embalpack Ensaios", "Rio de Janeiro"], ["EUA", "Ten-E Packaging Services", "Newport, MN"], ["Alemanha", "BAM (Bundesanstalt für Materialforschung)", "Berlin"]] } }] }
      ]
  },
  {
      id: "F",
      title: "Apêndice F - Agentes de Venda",
      description: "Rede global de distribuidores autorizados de publicações da IATA.",
      color: "border-gray-400",
      icon: Globe,
      sections: [
          { id: "F.1", title: "Agentes Autorizados", blocks: [{ type: "paragraph", content: "A IATA disponibiliza suas publicações (DGR, LAR, PCR) através de uma rede de agentes credenciados mundialmente." }, { type: "list", content: { ordered: false, items: ["Publicações IATA podem ser adquiridas digitalmente ou em formato impresso.", "Verifique o selo de 'IATA Accredited Sales Agent'."] } }] }
      ]
  },
  {
      id: "G",
      title: "Apêndice G - Treinamento",
      description: "Centros de Treinamento Credenciados IATA (ATS) e escolas parceiras.",
      color: "border-gray-400",
      icon: BookOpen,
      sections: [
          { id: "G.1", title: "Centros ATS (Accredited Training School)", blocks: [{ type: "paragraph", content: "Instituições credenciadas para ministrar cursos de Mercadorias Perigosas (CBTA) com reconhecimento internacional." }, { type: "table", content: { headers: ["Região", "Instituição"], rows: [["Américas", "IATA Training Center - Miami"], ["Brasil", "Academia de Carga Aérea (Simulado)"], ["Europa", "Lufthansa Aviation Training"], ["Ásia", "Singapore Aviation Academy"]] } }] }
      ]
  },
  {
      id: "H",
      title: "Apêndice H - Diretrizes CBTA",
      description: "Guia de implementação para Treinamento e Avaliação Baseados em Competência.",
      color: "border-gray-400",
      icon: FileText,
      sections: [
          { id: "H.1", title: "Introdução ao CBTA", blocks: [{ type: "paragraph", content: "Este apêndice serve como guia para empregadores na implementação do modelo Competency-Based Training and Assessment (CBTA), obrigatório desde 2023." }] },
          { id: "H.2", title: "Componentes do Programa", blocks: [{ type: "list", content: { ordered: true, items: ["1. Análise de Necessidades de Treinamento (TNA)", "2. Design e Desenvolvimento do Currículo (adaptado à função)", "3. Entrega do Treinamento (Teórico e Prático)", "4. Avaliação de Competência (Contínua)"] } }] },
          { id: "H.3", title: "Funções Bem Definidas", blocks: [{ type: "paragraph", content: "O treinamento deve ser focado nas tarefas específicas executadas pelo funcionário (ex: 7.1 Classificar, 7.3 Processar/Aceitar Carga)." }] }
      ]
  }
];
