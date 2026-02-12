
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
    { un: "3091", name: "Lithium metal batteries packed with equipment", class: "9", sub: "", pg: "", eq: "E0", lq_pi: "Forbidden", lq_max: "Forbidden", pax_pi: "969", pax_max: "5 kg", cao_pi: "969", cao_max: "35 kg", sp: "A48 A99", erg: "12FZ" },
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

const STARTING_PAGE = 412; // Realistic page number for the start of Section 4.2
const ITEMS_PER_PAGE = 28; // Realistic number of entries per page in the DGR book

const allBluePagesEntries = [...REAL_BLUE_PAGES, ...generateFillerData()].sort((a,b) => a.un.localeCompare(b.un));

export const BLUE_PAGES_DATA = allBluePagesEntries.map((entry, index) => ({
    ...entry,
    page: STARTING_PAGE + Math.floor(index / ITEMS_PER_PAGE)
}));

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

export const PACKING_INSTRUCTIONS_DATA = [
    // --- CLASS 1 ---
    { id: "101", title: "Explosivos (Div 1.1, 1.2, 1.3, 1.5)", applies_to: "Classe 1", type: "CAO Only", description: "PROIBIDO em aeronaves de passageiros. Requer embalagens de especificação UN (4G, 1A2). Exige aprovações de Estado e Operador." },
    { id: "110", title: "Explosivos (Div 1.3)", applies_to: "UN 0075", type: "CAO Only", description: "Embalagens combinadas. Internas de metal ou plástico. Externas de madeira ou papelão." },
    { id: "112", title: "Explosivos Deflagrantes (Div 1.1D, 1.3D)", applies_to: "UN 0160, UN 0161", type: "CAO Only", description: "Embalagens de metal ou plástico em caixas ou tambores. Requer design robusto." },
    { id: "114", title: "Explosivos (Div 1.1, 1.3)", applies_to: "UN 0082, UN 0241", type: "CAO Only", description: "Embalagens internas de papel, plástico ou metal. Externas de madeira, papelão ou metal." },
    { id: "116", title: "Pólvora sem Fumaça (Div 1.3C, 1.3G)", applies_to: "UN 0161", type: "CAO Only", description: "Requer embalagens combinadas. Internas em sacos de papel, plástico ou tecido. Externas em caixas (4C1, 4G) ou tambores (1G)." },
    { id: "117", title: "Foguetes (Div 1.3C)", applies_to: "UN 0186", type: "CAO Only", description: "Embalagens externas robustas (madeira, metal). Artigos devem ser acondicionados para evitar movimento." },
    { id: "130", title: "Explosivos (Div 1.4S)", applies_to: "UN 0012, UN 0014, UN 0323", type: "PAX/CAO", description: "Permite embalagens robustas como caixas de aço, madeira ou plástico (4A, 4B, 4C1, 4D, 4F, 4G). Quantidade máxima: 25kg (Pax) / 100kg (CAO)." },
    { id: "131", title: "Isqueiros (Div 1.4S)", applies_to: "UN 0340", type: "PAX/CAO", description: "Embalagens internas devem separar os artigos. Máximo 10kg por volume." },
    { id: "134", title: "Sinalizadores de Fumaça (Div 1.4G)", applies_to: "UN 0197, UN 0313", type: "CAO Only", description: "Embalagens externas de madeira, papelão ou metal. Máx 75kg." },
    { id: "135", title: "Fogos de Artifício (Div 1.4G)", applies_to: "UN 0336", type: "CAO Only", description: "PROIBIDO em aeronaves de passageiros. Requer embalagens de especificação UN (ex: 4G, 4C1). Quantidade máxima por volume: 75kg." },
    { id: "137", title: "Cargas de Profundidade (Div 1.1D)", applies_to: "UN 0056", type: "CAO Only", description: "Embalagens externas robustas e aprovadas. Devem ser seguras contra movimento." },
    { id: "143", title: "Explosivos, n.o.s. (Div 1.4C, 1.4D, 1.4E)", applies_to: "UN 0384, UN 0481", type: "CAO Only", description: "Requer embalagens de especificação UN. Máx 75kg." },
    
    // --- CLASS 2 ---
    { id: "200", title: "Gases Comprimidos ou Liquefeitos", applies_to: "UN 1066 (Nitrogênio), UN 1072 (Oxigênio)", type: "PAX/CAO", description: "Instrução padrão para cilindros de gás. Válvulas devem ser protegidas. Quantidade máxima: 75kg (Pax) / 150kg (CAO)." },
    { id: "201", title: "Gases Liquefeitos, inflamáveis", applies_to: "UN 1011 (Butano)", type: "PAX/CAO", description: "Cilindros de metal. Válvulas devem ser protegidas. Quantidade máxima: 75kg (Pax) / 150kg (CAO)." },
    { id: "202", title: "Gases Refrigerados Liquefeitos", applies_to: "UN 1977 (Nitrogênio, líquido refrigerado)", type: "PAX/CAO", description: "Requer recipientes criogênicos (dewars) com isolamento a vácuo. Devem ser transportados na vertical." },
    { id: "203", title: "Aerossóis & Recipientes Pequenos com Gás", applies_to: "UN 1950", type: "PAX/CAO", description: "Embalagens externas fortes são necessárias. Limite por recipiente interno: 1L." },
    { id: "Y203", title: "Aerossóis & Recipientes Pequenos (LQ)", applies_to: "UN 1950", type: "PAX (LQ)", description: "Embalagens externas fortes. Limite por recipiente interno: 1L. Peso bruto máximo do volume: 30kg." },
    { id: "204", title: "Artigos Contendo Gás sob Pressão", applies_to: "UN 3164", type: "PAX/CAO", description: "Para artigos como amortecedores. Devem ser embalados em caixas ou engradados fortes. Máx 100kg." },
    { id: "205", title: "Isqueiros", applies_to: "UN 1057", type: "CAO Only", description: "PROIBIDO em Pax. Os isqueiros devem ser embalados para prevenir movimento e descarga acidental. Quantidade máxima por volume: 10kg." },
    { id: "206", title: "Gás Adsorvido", applies_to: "UN 3510, UN 3511", type: "PAX/CAO", description: "Requer cilindros especiais com material sólido poroso. Válvulas protegidas. Máx 75kg (Pax)/150kg (CAO)." },
    { id: "207", title: "Recipientes Pequenos com Gás (Cartuchos)", applies_to: "UN 2037", type: "PAX/CAO", description: "Embalagens combinadas. Internas com capacidade máx de 120mL. Externas fortes. Máx 75kg (Pax)/150kg (CAO)." },
    { id: "208", title: "Cilindros de Gás para Descarte", applies_to: "UN 1011, UN 1978", type: "CAO Only", description: "Cilindros não recarregáveis. Embalados em caixas externas fortes. Máx 150kg." },
    { id: "210", title: "Recargas de Isqueiro", applies_to: "UN 1057", type: "PAX/CAO", description: "Aerossóis contendo gás inflamável. Embalagens externas fortes. Máx 75kg (Pax)/150kg (CAO)." },
    { id: "211", title: "Gases Tóxicos, GE I (Inalação)", applies_to: "Classe 2.3", type: "CAO Only", description: "PROIBIDO em Pax. Requer cilindros de alta especificação e testes rigorosos. Quantidade máxima: 50kg." },
    { id: "212", title: "Módulos de Airbag ou Pré-tensores", applies_to: "UN 3268", type: "PAX/CAO", description: "Embalados para prevenir ativação acidental. Máx 35kg (Pax)/50kg (CAO)." },
    { id: "213", title: "Extintores de Incêndio", applies_to: "UN 1044", type: "PAX/CAO", description: "Devem ser embalados em caixas externas fortes para prevenir ativação acidental. Quantidade máxima: 75kg (Pax) / 150kg (CAO)." },
    { id: "218", title: "Máquinas de Refrigeração", applies_to: "UN 2857", type: "PAX/CAO", description: "Contendo gás não-inflamável e não-tóxico. Embalagem robusta. Máx 150kg." },
    { id: "219", title: "Gás Tóxico por Inalação (Líquidos)", applies_to: "UN 3308, UN 3309", type: "CAO Only", description: "PROIBIDO em Pax. Cilindros com testes de pressão rigorosos." },
    { id: "220", title: "Veículos ou Motores a Gás", applies_to: "UN 3166", type: "PAX/CAO", description: "Transportado sob PI 950 ou 951, mas esta PI se aplica aos cilindros de gás se transportados separadamente." },
    { id: "221", title: "Geradores de Gás Químico", applies_to: "UN 3356 (Geradores de Oxigênio)", type: "CAO Only", description: "Embalados para prevenir ativação. Artigos devem ser transportados de forma que fiquem visíveis à tripulação." },
    { id: "222", title: "Dispositivos de Salva-Vidas com Gás Comprimido", applies_to: "UN 2990, UN 3072", type: "PAX/CAO", description: "Para coletes salva-vidas, escorregadores. Embalados para prevenir ativação acidental. Máx 100kg." },

    // --- CLASS 3 ---
    { id: "350", title: "Líquidos Inflamáveis, GE I (sem emb. interna)", applies_to: "Classe 3, GE I", type: "PAX", description: "Uso de embalagens únicas PROIBIDO. Use PI 351." },
    { id: "351", title: "Líquidos Inflamáveis, GE I", applies_to: "Classe 3, GE I", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 0.5L) ou plástico/metal (máx 1L). Quantidade máxima por volume: 1L." },
    { id: "352", title: "Líquidos Inflamáveis com Sub-risco Tóxico, GE I/II", applies_to: "UN 1230 (Metanol)", type: "PAX", description: "Requisitos mais rigorosos. Internas de vidro (máx 0.5L) ou outras (máx 1L). Quantidade máxima por volume: 1L." },
    { id: "353", title: "Líquidos Inflamáveis, GE II", applies_to: "UN 1090 (Acetona)", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 1L) ou plástico/metal (máx 5L). Quantidade máxima por volume: 5L." },
    { id: "354", title: "Líquidos Inflamáveis com Sub-risco, GE II", applies_to: "Classe 3 com sub-risco", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 0.5L) ou outras (máx 2.5L). Quantidade máxima por volume: 5L." },
    { id: "355", title: "Líquidos Inflamáveis, GE III", applies_to: "UN 1223 (Querosene)", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 5L) ou plástico/metal (máx 10L). Quantidade máxima por volume: 60L." },
    { id: "361", title: "Líquidos Inflamáveis, GE I", applies_to: "Classe 3, GE I", type: "CAO Only", description: "Permite embalagens únicas (tambores, bombonas) até 30L." },
    { id: "362", title: "Líquidos Inflamáveis Tóxicos, GE I/II", applies_to: "UN 1230 (Metanol)", type: "CAO Only", description: "Permite embalagens únicas até 60L." },
    { id: "364", title: "Líquidos Inflamáveis, GE II", applies_to: "UN 1090 (Acetona)", type: "CAO Only", description: "Permite embalagens únicas (tambores, bombonas) até 60L." },
    { id: "366", title: "Líquidos Inflamáveis, GE III", applies_to: "UN 1223 (Querosene)", type: "CAO Only", description: "Permite embalagens únicas (tambores, bombonas) até 220L." },
    { id: "370", title: "Líquidos Inflamáveis Viscosos", applies_to: "UN 1263 (Tinta)", type: "PAX/CAO", description: "Permite o uso de embalagens únicas maiores para líquidos viscosos que atendam a critérios específicos de teste. Máx 30L (Pax)/220L (CAO)." },
    { id: "373", title: "Máquinas ou Aparelhos", applies_to: "UN 3166, UN 3363", type: "PAX/CAO", description: "Para equipamentos contendo líquidos inflamáveis. Devem ser drenados ou ter tanques selados. Sem limite de quantidade." },
    { id: "378", title: "Motores de Combustão Interna", applies_to: "UN 3528", type: "PAX/CAO", description: "Motores devem ser drenados de combustível. Baterias removidas ou terminais protegidos. Sem limite de quantidade." },
    { id: "Y341", title: "Líquidos Inflamáveis, GE II (LQ)", applies_to: "Classe 3, GE II", type: "PAX (LQ)", description: "Embalagens combinadas. Internas de vidro, plástico ou metal até 1L. Peso bruto máximo do volume: 30kg." },
    { id: "Y344", title: "Líquidos Inflamáveis, GE III (LQ)", applies_to: "Classe 3, GE III", type: "PAX (LQ)", description: "Embalagens combinadas. Internas de vidro, plástico ou metal até 5L. Peso bruto máximo do volume: 30kg." },
    
    // --- CLASS 4 ---
    { id: "445", title: "Sólidos Inflamáveis, GE II", applies_to: "Classe 4.1, GE II", type: "PAX", description: "Embalagens combinadas com internas até 5kg. Quantidade máxima por volume: 15kg." },
    { id: "446", title: "Sólidos Inflamáveis, GE III", applies_to: "Classe 4.1, GE III", type: "PAX", description: "Embalagens combinadas com internas até 10kg. Quantidade máxima por volume: 25kg." },
    { id: "448", title: "Sólidos Inflamáveis, GE II", applies_to: "Classe 4.1, GE II", type: "CAO Only", description: "Permite embalagens únicas (sacos, caixas) até 50kg." },
    { id: "449", title: "Sólidos Inflamáveis, GE III", applies_to: "Classe 4.1, GE III", type: "CAO Only", description: "Permite embalagens únicas até 100kg." },
    { id: "Y441", title: "Sólidos Inflamáveis, GE II (LQ)", applies_to: "Classe 4.1, GE II", type: "PAX (LQ)", description: "Embalagens combinadas. Internas até 1kg. Peso bruto máximo do volume: 30kg." },
    { id: "Y443", title: "Sólidos Inflamáveis, GE III (LQ)", applies_to: "Classe 4.1, GE III", type: "PAX (LQ)", description: "Embalagens combinadas. Internas até 5kg. Peso bruto máximo do volume: 30kg." },
    { id: "453", title: "Fósforos de Segurança", applies_to: "UN 1944", type: "PAX/CAO", description: "Embalagens internas devem ser caixas de fósforos. Externas de madeira ou papelão. Máx 25kg (Pax)/100kg (CAO)." },
    { id: "454", title: "Baterias de Sódio", applies_to: "UN 3292", type: "PAX/CAO", description: "Baterias devem ser protegidas contra curto-circuito e acondicionadas em embalagens externas resistentes." },
    { id: "459", title: "Substâncias Auto-Reativas", applies_to: "Classe 4.1", type: "PAX/CAO", description: "Requer embalagens de especificação UN. Muitas requerem controle de temperatura. Quantidades são geralmente muito limitadas." },
    { id: "466", title: "Subst. Combustão Espontânea, GE II (Sólidos)", applies_to: "Classe 4.2, GE II", type: "PAX", description: "Requer embalagens hermeticamente fechadas. Quantidade máxima por volume: 15kg." },
    { id: "468", title: "Subst. Combustão Espontânea, GE II (Sólidos)", applies_to: "Classe 4.2, GE II", type: "CAO Only", description: "Embalagens únicas hermeticamente fechadas até 50kg." },
    { id: "471", title: "Subst. Combustão Espontânea, GE III (Sólidos)", applies_to: "Classe 4.2, GE III", type: "CAO Only", description: "Embalagens únicas até 100kg." },
    { id: "484", title: "Subst. Perigosas Quando Molhadas, GE II (Sólidos)", applies_to: "Classe 4.3, GE II", type: "PAX", description: "Embalagens devem ser estanques (à prova d'água). Quantidade máxima: 15kg." },
    { id: "487", title: "Subst. Perigosas Quando Molhadas, GE I (Líquidos)", applies_to: "Classe 4.3, GE I", type: "CAO Only", description: "PROIBIDO em Pax. Embalagens únicas estanques. Máx 30L." },
    { id: "490", title: "Subst. Perigosas Quando Molhadas, GE II (Sólidos)", applies_to: "Classe 4.3, GE II", type: "CAO Only", description: "Embalagens únicas estanques até 50kg." },
    { id: "492", title: "Artigos contendo Subst. Perigosas Quando Molhadas", applies_to: "UN 3292", type: "PAX/CAO", description: "Para baterias de sódio e outros artigos. Devem ser hermeticamente selados." },

    // --- CLASS 5 ---
    { id: "550", title: "Oxidantes, Líquidos, GE II", applies_to: "Classe 5.1, GE II", type: "PAX", description: "Embalagens combinadas com internas de vidro (máx 1L) ou outras (máx 2.5L). Quantidade máxima por volume: 5L." },
    { id: "551", title: "Oxidantes, Líquidos, GE III", applies_to: "Classe 5.1, GE III", type: "PAX", description: "Embalagens combinadas com internas até 5L. Quantidade máxima por volume: 25L." },
    { id: "553", title: "Oxidantes, Líquidos, com Sub-risco, GE II", applies_to: "Classe 5.1 com sub-risco", type: "PAX", description: "Requisitos mais rigorosos. Internas de vidro (máx 0.5L). Máx 2.5L por volume." },
    { id: "554", title: "Oxidantes, Líquidos, GE II", applies_to: "Classe 5.1, GE II", type: "CAO Only", description: "Embalagens únicas até 25L." },
    { id: "555", title: "Oxidantes, Líquidos, GE III", applies_to: "Classe 5.1, GE III", type: "CAO Only", description: "Embalagens únicas até 220L." },
    { id: "558", title: "Oxidantes, Sólidos, GE II", applies_to: "Classe 5.1, GE II", type: "PAX", description: "Embalagens combinadas com internas de até 5kg. Quantidade máxima por volume: 25kg." },
    { id: "562", title: "Oxidantes, Sólidos, GE II", applies_to: "Classe 5.1, GE II", type: "CAO Only", description: "Embalagens únicas até 100kg." },
    { id: "563", title: "Oxidantes, Sólidos, GE III", applies_to: "Classe 5.1, GE III", type: "CAO Only", description: "Embalagens únicas até 200kg." },
    { id: "565", title: "Geradores Químicos de Oxigênio", applies_to: "UN 3356", type: "CAO Only", description: "Dispositivo de ativação deve ser protegido. Proibido em Pax. Quantidade máxima por volume: 25kg." },
    { id: "570", title: "Peróxidos Orgânicos (Líquidos e Sólidos)", applies_to: "Classe 5.2", type: "PAX/CAO", description: "Requer controle de temperatura para muitos peróxidos. Geralmente embalagens combinadas. Exige embalagens testadas UN." },
    { id: "571", title: "Peróxidos Orgânicos (Líquidos e Sólidos)", applies_to: "Classe 5.2", type: "CAO Only", description: "Instrução para CAO, permitindo quantidades maiores que a PI 570. Pode requerer controle de temperatura." },
    { id: "572", title: "Peróxidos Orgânicos (Líquidos e Sólidos, IBC)", applies_to: "Classe 5.2", type: "CAO Only", description: "Permite o uso de IBCs (Intermediate Bulk Containers) para peróxidos específicos. Requer aprovação." },

    // --- CLASS 6 ---
    { id: "602", title: "Substâncias Tóxicas por Inalação, Líquidas", applies_to: "UN 3381, UN 3382", type: "CAO Only", description: "PROIBIDO em Pax. Embalagens internas de metal em tambores ou caixas. Requer embalagem hermética." },
    { id: "620", title: "Substância Infecciosa, Categoria A", applies_to: "UN 2814, UN 2900", type: "PAX/CAO", description: "Requer embalagem tríplice (primário estanque, secundário estanque, externo rígido) certificada UN. Limites: 50mL/g (Pax), 4L/kg (CAO)." },
    { id: "621", title: "Resíduos Clínicos, n.o.s.", applies_to: "UN 3291", type: "CAO Only", description: "Embalagens rígidas, estanques, resistentes a perfurações, marcadas com o símbolo de risco biológico. Máx 100kg." },
    { id: "622", title: "Resíduos Médicos Regulados, Categoria A", applies_to: "UN 3549", type: "CAO Only", description: "Proibido em Pax. Requer embalagens rígidas e estanques de especificação UN. Máximo 100kg." },
    { id: "650", title: "Substância Biológica, Categoria B", applies_to: "UN 3373", type: "PAX/CAO", description: "Embalagem tríplice de boa qualidade (não precisa ser UN). Limite por recipiente primário: 1L/1kg. Limite por volume: 4L/4kg." },
    { id: "652", title: "Líquidos Tóxicos, GE I", applies_to: "Classe 6.1, GE I", type: "PAX", description: "Embalagens combinadas com internas de vidro (máx 0.5L). Quantidade máxima por volume: 1L." },
    { id: "654", title: "Líquidos Tóxicos, GE II", applies_to: "Classe 6.1, GE II", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 1L) ou outras (máx 2L). Quantidade máxima por volume: 5L." },
    { id: "655", title: "Líquidos Tóxicos, GE III", applies_to: "Classe 6.1, GE III", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 5L) ou outras (máx 10L). Quantidade máxima por volume: 60L." },
    { id: "658", title: "Líquidos Tóxicos, GE I", applies_to: "Classe 6.1, GE I", type: "CAO Only", description: "Embalagens únicas até 30L." },
    { id: "659", title: "Sólidos Tóxicos, GE I", applies_to: "Classe 6.1, GE I", type: "PAX", description: "Embalagens combinadas. Internas até 0.5kg. Máx 5kg por volume." },
    { id: "662", title: "Líquidos Tóxicos, GE II", applies_to: "Classe 6.1, GE II", type: "CAO Only", description: "Embalagens únicas até 60L." },
    { id: "663", title: "Líquidos Tóxicos, GE III", applies_to: "Classe 6.1, GE III", type: "CAO Only", description: "Embalagens únicas até 220L." },
    { id: "669", title: "Sólidos Tóxicos, GE II", applies_to: "Classe 6.1, GE II", type: "PAX", description: "Embalagens combinadas com internas até 5kg. Quantidade máxima por volume: 25kg." },
    { id: "675", title: "Sólidos Tóxicos, GE III", applies_to: "Classe 6.1, GE III", type: "PAX", description: "Embalagens únicas até 200kg." },
    { id: "676", title: "Sólidos Tóxicos, GE II", applies_to: "Classe 6.1, GE II", type: "CAO Only", description: "Embalagens únicas até 100kg." },
    { id: "Y641", title: "Líquidos Tóxicos, GE II (LQ)", applies_to: "Classe 6.1, GE II", type: "PAX (LQ)", description: "Embalagens combinadas. Internas de vidro (máx 100mL) ou outras (máx 500mL). Peso bruto máximo: 30kg." },
    { id: "Y642", title: "Líquidos Tóxicos, GE III (LQ)", applies_to: "Classe 6.1, GE III", type: "PAX (LQ)", description: "Embalagens combinadas. Internas até 1L. Peso bruto máximo: 30kg." },
    { id: "Y644", title: "Sólidos Tóxicos, GE II (LQ)", applies_to: "Classe 6.1, GE II", type: "PAX (LQ)", description: "Embalagens combinadas. Internas até 500g. Peso bruto máximo: 30kg." },
    
    // --- CLASS 7 ---
    { id: "N/A", title: "Material Radioativo", applies_to: "Classe 7", type: "PAX/CAO", description: "Embalagem de material radioativo não segue o sistema padrão de PI. Deve estar em conformidade com os requisitos detalhados no Capítulo 10." },
    
    // --- CLASS 8 ---
    { id: "850", title: "Líquidos Corrosivos, GE I", applies_to: "Classe 8, GE I", type: "PAX", description: "Requisitos rigorosos. Embalagens combinadas. Internas de vidro (máx 0.5L). Quantidade máxima por volume: 0.5L." },
    { id: "851", title: "Líquidos Corrosivos, GE II", applies_to: "Classe 8, GE II", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 0.5L) ou outras (máx 1L). Quantidade máxima por volume: 1L." },
    { id: "852", title: "Líquidos Corrosivos, GE III", applies_to: "Classe 8, GE III", type: "PAX", description: "Embalagens combinadas. Internas de vidro (máx 2.5L) ou outras (máx 5L). Quantidade máxima por volume: 5L." },
    { id: "854", title: "Líquidos Corrosivos, GE I", applies_to: "Classe 8, GE I", type: "CAO Only", description: "Permite embalagens únicas (vidro, metal) até 2.5L." },
    { id: "855", title: "Líquidos Corrosivos, GE II", applies_to: "Classe 8, GE II", type: "CAO Only", description: "Embalagens únicas até 30L." },
    { id: "856", title: "Líquidos Corrosivos, GE III", applies_to: "Classe 8, GE III", type: "CAO Only", description: "Embalagens únicas até 60L." },
    { id: "859", title: "Sólidos Corrosivos, GE II", applies_to: "Classe 8, GE II", type: "PAX", description: "Embalagens combinadas com internas até 5kg. Quantidade máxima por volume: 15kg." },
    { id: "860", title: "Sólidos Corrosivos, GE III", applies_to: "Classe 8, GE III", type: "PAX", description: "Embalagens combinadas com internas até 10kg. Quantidade máxima por volume: 25kg." },
    { id: "863", title: "Sólidos Corrosivos, GE II", applies_to: "Classe 8, GE II", type: "CAO Only", description: "Embalagens únicas até 100kg." },
    { id: "864", title: "Sólidos Corrosivos, GE III", applies_to: "Classe 8, GE III", type: "CAO Only", description: "Embalagens únicas até 200kg." },
    { id: "Y840", title: "Líquidos Corrosivos, GE II (LQ)", applies_to: "Classe 8, GE II", type: "PAX (LQ)", description: "Embalagens combinadas. Internas de vidro (máx 0.5L). Peso bruto máximo do volume: 30kg." },
    { id: "Y841", title: "Líquidos Corrosivos, GE III (LQ)", applies_to: "Classe 8, GE III", type: "PAX (LQ)", description: "Embalagens combinadas. Internas de vidro ou plástico até 1L. Peso bruto máximo do volume: 30kg." },
    { id: "Y845", title: "Sólidos Corrosivos, GE III (LQ)", applies_to: "Classe 8, GE III", type: "PAX (LQ)", description: "Embalagens combinadas. Internas até 5kg. Peso bruto máximo do volume: 30kg." },
    { id: "869", title: "Kits de Teste ou Primeiros Socorros", applies_to: "UN 1760, UN 1848", type: "PAX", description: "Contendo pequenas quantidades de corrosivos. Embalagens internas até 250mL. Máx 1L por kit." },
    { id: "870", title: "Baterias úmidas, com ácido", applies_to: "UN 2794", type: "PAX/CAO", description: "Baterias em contentores rígidos à prova de vazamento. Terminais protegidos. Máx 30kg (Pax), Sem limite (CAO)." },
    { id: "871", title: "Baterias úmidas, com álcali", applies_to: "UN 2795", type: "PAX/CAO", description: "Baterias em contentores rígidos à prova de vazamento. Terminais protegidos. Máx 30kg (Pax), Sem limite (CAO)." },
    { id: "872", title: "Baterias não derramáveis", applies_to: "UN 2800", type: "PAX/CAO", description: "Terminais protegidos. Se a bateria estiver intacta, não é necessária embalagem externa. Sem limite de quantidade." },

    // --- CLASS 9 ---
    { id: "950", title: "Veículos movidos a Gás Inflamável", applies_to: "UN 3166", type: "PAX/CAO", description: "Válvula do tanque fechada. Bateria desconectada. Sem limite de quantidade. Requer aprovação." },
    { id: "951", title: "Motores movidos a Gás Inflamável", applies_to: "UN 3166", type: "PAX/CAO", description: "Combustível deve ser drenado. Bateria desconectada. Sem limite de quantidade. Requer aprovação." },
    { id: "952", title: "Veículo movido a Bateria / Unidade de Carga", applies_to: "UN 3171, UN 3491", type: "PAX/CAO", description: "Para veículos elétricos e unidades de carga com baterias de lítio. Bateria firmemente fixada. Terminais protegidos. Sem limite de quantidade." },
    { id: "953", title: "Dispositivos de Salva-Vidas", applies_to: "UN 2990, UN 3072", type: "PAX/CAO", description: "Para coletes salva-vidas, escorregadores, etc. Embalados para prevenir ativação acidental. Máx 100kg (Pax)/100kg (CAO)." },
    { id: "954", title: "Gelo Seco (Dióxido de Carbono, sólido)", applies_to: "UN 1845", type: "PAX/CAO", description: "Embalagem deve permitir a liberação de gás (ventilação). Máximo de 200kg por volume." },
    { id: "955", title: "Esferas Poliméricas Expansíveis", applies_to: "UN 2211", type: "PAX/CAO", description: "Embalagens devem ser feitas de material que não seja facilmente permeável ao vapor inflamável. Máx 100kg (Pax)/100kg(CAO)." },
    { id: "956", title: "Subst. Perigosas ao Meio Ambiente, Sólidas", applies_to: "UN 3077", type: "PAX/CAO", description: "Instrução genérica para sólidos da Classe 9. Máx 400kg (Pax) / 400kg (CAO)." },
    { id: "Y956", title: "Subst. Perigosas ao Meio Ambiente, Sólidas (LQ)", applies_to: "UN 3077", type: "PAX (LQ)", description: "Embalagens combinadas. Peso bruto máximo do volume: 30kg." },
    { id: "957", title: "Material Magnetizado", applies_to: "UN 2807", type: "PAX/CAO", description: "Embalado de forma que o campo magnético não desvie a bússola em mais de 2 graus a 2.1m. Sem limite de quantidade." },
    { id: "958", title: "Plásticos de Moldagem a Quente", applies_to: "UN 3314", type: "PAX/CAO", description: "Embalagens que permitam a ventilação, como sacos ou caixas. Máx 100kg (Pax)/200kg (CAO)." },
    { id: "959", title: "Amianto", applies_to: "UN 2212, UN 2590", type: "PAX/CAO", description: "Embalagens rígidas, estanques à poeira. Máx 200kg (Pax)/400kg (CAO)." },
    { id: "960", title: "Kits Químicos ou de Primeiros Socorros", applies_to: "UN 3316", type: "PAX/CAO", description: "Quantidade por embalagem interna não pode exceder 250ml/g. Máx 10kg por volume." },
    { id: "Y960", title: "Kits Químicos ou de Primeiros Socorros (LQ)", applies_to: "UN 3316", type: "PAX (LQ)", description: "Quantidade por embalagem interna não pode exceder 30ml/g. Peso bruto máximo do volume: 1kg." },
    { id: "961", title: "Baterias em Equipamento (alcalinas, zinco-carbono)", applies_to: "UN 3028", type: "PAX/CAO", description: "Equipamento deve ser protegido contra ativação acidental. Terminais protegidos. Sem limite de quantidade." },
    { id: "962", title: "Aparelhos com Célula de Combustível", applies_to: "UN 3473, UN 3479", type: "PAX/CAO", description: "Para equipamentos eletrônicos com cartuchos de célula de combustível. Requer conformidade com IEC 62282-6-100." },
    { id: "963", title: "Mercadoria de Consumo (Consumer Commodity)", applies_to: "ID 8000", type: "PAX/CAO (LQ)", description: "Para materiais embalados para varejo, elegíveis para LQ. Peso bruto máximo do volume: 30kg." },
    { id: "964", title: "Subst. Perigosas ao Meio Ambiente, Líquidas", applies_to: "UN 3082", type: "PAX/CAO", description: "Instrução genérica para líquidos da Classe 9. Máx 450L (Pax) / 450L (CAO)." },
    { id: "Y964", title: "Subst. Perigosas ao Meio Ambiente, Líquidas (LQ)", applies_to: "UN 3082", type: "PAX (LQ)", description: "Embalagens combinadas. Peso bruto máximo do volume: 30kg." },
    { id: "965", title: "Baterias de Íon Lítio", applies_to: "UN 3480", type: "CAO Only", description: "Proibido em Pax. SoC (estado de carga) não >30%. Requer embalagem UN. Seção IA (>20Wh), IB (≤20Wh), II (≤2.7Wh)." },
    { id: "966", title: "Baterias de Íon Lítio com Equipamento", applies_to: "UN 3481", type: "PAX/CAO", description: "Equipamento deve ser protegido. Seção I: DGD necessária. Seção II: Sem DGD, até 2 baterias extras, limites de Wh aplicam-se." },
    { id: "967", title: "Baterias de Íon Lítio em Equipamento", applies_to: "UN 3481", type: "PAX/CAO", description: "Equipamento deve estar desligado e protegido. Seção I: DGD necessária. Seção II: Sem DGD, limites de Wh e quantidade por pacote aplicam-se." },
    { id: "968", title: "Baterias de Lítio Metal", applies_to: "UN 3090", type: "CAO Only", description: "Proibido em Pax. Requer embalagem UN. Sujeito a aprovações. Seção IA (>2g Li), IB (≤2g Li), II (≤0.3g Li)." },
    { id: "969", title: "Baterias de Lítio Metal com Equipamento", applies_to: "UN 3091", type: "PAX/CAO", description: "Equipamento deve ser protegido. Seção I: DGD necessária. Seção II: Sem DGD, até 2 baterias extras, limites de gramas de lítio aplicam-se." },
    { id: "970", title: "Baterias de Lítio Metal em Equipamento", applies_to: "UN 3091, UN 3499 (Capacitor)", type: "PAX/CAO", description: "Equipamento deve estar desligado e protegido. Seção I: DGD necessária. Seção II: Sem DGD, limites aplicam-se. Também para Capacitores assimétricos." },
].sort((a, b) => {
    // Treat 'N/A' as a high number to place it correctly
    const idA = a.id === 'N/A' ? 9999 : parseInt(a.id.replace('Y', ''));
    const idB = b.id === 'N/A' ? 9999 : parseInt(b.id.replace('Y', ''));
    if (idA !== idB) return idA - idB;
    // If numbers are the same (e.g., 341 and Y341), 'Y' instructions come after
    return a.id.startsWith('Y') ? 1 : -1;
});


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
        { id: "1.3.1", title: "Responsabilidades do Expedidor", blocks: [{ type: "paragraph", content: "O expedidor (shipper) é a principal parte responsável por garantir que as mercadorias perigosas sejam oferecidas para transporte em total conformidade com estes regulamentos. Esta responsabilidade não pode ser delegada. O expedidor deve garantir que:"}, {type: "list", content: { ordered: true, type: 'alpha', items: ["Os artigos ou substâncias não estão proibidos para transporte aéreo.", "Os artigos ou substâncias estão devidamente identificados, classificados, embalados, marcados, etiquetados e documentados em conformidade com todas as regulamentações aplicáveis.", "Antes de reutilizar uma embalagem, todos os rótulos e marcações irrelevantes foram removidos ou obliterados.", "A Declaração do Expedidor para Mercadorias Perigosas (DGD) foi preenchida com precisão, em inglês, e assinada.", "Todo o pessoal envolvido na preparação da remessa foi devidamente treinado para cumprir suas funções."]}}] },
        { id: "1.3.2", title: "Responsabilidades do Operador", blocks: [{ type: "paragraph", content: "O operador (companhia aérea) deve garantir que apenas mercadorias perigosas aceitáveis, devidamente documentadas e inspecionadas sejam carregadas a bordo. As responsabilidades incluem:", }, {type: "list", content: { ordered: true, type: 'alpha', items: ["Aceitar mercadorias perigosas apenas se estiverem em conformidade, usando um checklist de aceitação.", "Inspecionar os volumes quanto a vazamentos ou danos antes do carregamento.", "Garantir a segregação adequada de pacotes incompatíveis.", "Fornecer ao Piloto em Comando a informação necessária (NOTOC).", "Assegurar que avisos aos passageiros sejam exibidos.", "Relatar incidentes e acidentes com mercadorias perigosas."]}}] },
        { id: "1.4", title: "Definição de Mercadorias Perigosas", blocks: [{ type: "paragraph", content: "Mercadorias perigosas são artigos ou substâncias que são capazes de colocar em risco a saúde, a segurança, a propriedade ou o meio ambiente e que estão apresentadas na lista de mercadorias perigosas nestes regulamentos ou que são classificadas de acordo com estes regulamentos." }] },
        { id: "1.5", title: "Treinamento (CBTA)", blocks: [{ type: "paragraph", content: "O treinamento deve ser baseado em competências (Competency-Based Training and Assessment - CBTA). Todos os funcionários envolvidos no transporte de carga aérea devem receber treinamento adequado à sua função e ser avaliados periodicamente. O treinamento deve ser projetado para alcançar a proficiência funcional." }, { type: "note", content: { title: "Validade e Reciclagem", text: "O treinamento é válido por 24 meses. A reciclagem deve ocorrer dentro dos 3 meses finais do período de validade para garantir a continuidade da qualificação." } }] },
        { id: "1.5.1", title: "Requisitos de Treinamento por Função", blocks: [{ type: "paragraph", content: "O escopo do treinamento varia conforme a responsabilidade do funcionário. Por exemplo, o pessoal de aceitação de carga requer treinamento aprofundado em todas as etapas, enquanto o pessoal de rampa pode necessitar de treinamento focado em reconhecimento de etiquetas, manuseio seguro e procedimentos de emergência." }] },
        { id: "1.5.2", title: "Manutenção de Registros de Treinamento", blocks: [{ type: "paragraph", content: "Os empregadores devem manter registros do treinamento de mercadorias perigosas de seus funcionários por um período mínimo de 36 meses a partir da data do treinamento mais recente, e disponibilizá-los mediante solicitação do funcionário ou da autoridade competente." }] },
        { id: "1.6", title: "Segurança (Security)", blocks: [{ type: "paragraph", content: "Medidas de segurança devem ser implementadas para minimizar o roubo ou uso indevido de mercadorias perigosas que possam ser usadas para fins terroristas."}] },
        { id: "1.6.1", title: "Plano de Segurança", blocks: [{ type: "paragraph", content: "Expedidores e operadores de mercadorias perigosas de alto risco (como certos explosivos, substâncias tóxicas e radioativas) devem adotar, implementar e cumprir um plano de segurança que aborde elementos como alocação de responsabilidades, registros de treinamento, revisão de operações e procedimentos operacionais de segurança."}] },
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
        { id: "2.1", title: "Mercadorias Proibidas", blocks: [{ type: "paragraph", content: "Salvo disposição em contrário, o transporte aéreo de mercadorias perigosas é proibido, a menos que preparado de acordo com estes regulamentos." }] },
        { id: "2.1.1", title: "Proibido em Todas as Circunstâncias", blocks: [{ type: "paragraph", content: "Artigos e substâncias que, como apresentados para transporte, são suscetíveis de explodir, reagir perigosamente, produzir uma chama ou evolução perigosa de calor, ou uma emissão perigosa de gases ou vapores tóxicos, corrosivos ou inflamáveis sob condições normais encontradas no transporte aéreo. Exemplos incluem resíduos de aerossóis para descarte e baterias de lítio danificadas." }] },
        { id: "2.2", title: "Mercadorias Ocultas (Hidden DG)", blocks: [{ type: "paragraph", content: "Muitos itens de aparência inofensiva podem conter mercadorias perigosas não declaradas. O pessoal de aceitação deve ser treinado para identificá-los. Exemplos comuns incluem:" }, { type: "list", content: { ordered: false, items: ["Equipamento de Mergulho (pode conter cilindros de ar comprimido ou lâmpadas de alta intensidade)", "Peças Automotivas (podem conter baterias, airbags, amortecedores com gás)", "Equipamento Médico (pode conter cilindros de oxigênio, termômetros de mercúrio)", "Amostras de Diagnóstico (podem ser substâncias infecciosas)", "Equipamento de acampamento (pode conter gás inflamável, líquidos inflamáveis, fósforos)", "Material de perfuração de poços (pode conter explosivos ou ácidos)", "Instrumentos meteorológicos (podem conter mercúrio)"] } }] },
        { id: "2.3", title: "Mercadorias Perigosas em Bagagem", blocks: [{ type: "paragraph", content: "Certos artigos são permitidos para transporte por passageiros ou tripulantes, seja na bagagem de mão, na bagagem despachada ou na pessoa, desde que cumpram restrições estritas de quantidade e embalagem." }, { type: "database", content: { id: "pax-provisions", title: "Tabela 2.3.A - Disposições para Passageiros", type: "variations",  columns: [{ key: "item", label: "Item", width: "w-64" }, { key: "carry_on", label: "Cabine / Pessoa", width: "w-24" }, { key: "checked", label: "Despacho", width: "w-24" }, { key: "operator_approval", label: "Aprov.", width: "w-20" }, { key: "limits", label: "Limites/Condições", width: "w-64" }], data: PAX_PROVISIONS_DATA } }] },
        { id: "2.4", title: "Transporte pelo Correio", blocks: [{ type: "paragraph", content: "A maioria das mercadorias perigosas é proibida no correio aéreo internacional (air mail). As administrações postais nacionais podem ter exceções para o correio doméstico." }] },
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
        { id: "3.6.1.1", title: "Critérios do Grupo de Embalagem", blocks: [{ type: "paragraph", content: "O grupo de embalagem para substâncias da Divisão 6.1 é atribuído com base nos dados de toxicidade aguda por exposição oral, dérmica ou por inalação."}, { type: "table", content: { caption: "Tabela 3.6.A - Critérios de Toxicidade por Grupo de Embalagem", headers: ["Grupo de Embalagem", "Toxicidade Oral (LD50 mg/kg)", "Toxicidade Dérmica (LD50 mg/kg)", "Toxicidade por Inalação (LC50 mg/L)"], rows: [["I (Alto Risco)", "≤ 5", "≤ 50", "≤ 0.2"],["II (Risco Médio)", "> 5 e ≤ 50", "> 50 e ≤ 200", "> 0.2 e ≤ 2.0"],["III (Baixo Risco)", "> 50 e ≤ 300 (sólidos), > 50 e ≤ 2000 (líquidos)", "> 200 e ≤ 1000", "> 2.0 e ≤ 4.0"]]}}]},
        { id: "3.6.2", title: "Divisão 6.2 – Substâncias Infectantes", blocks: [{ type: "paragraph", content: "Substâncias que contêm patógenos, que são micro-organismos (incluindo bactérias, vírus, etc.) que podem causar doenças em humanos ou animais." }] },
        { id: "3.7", title: "Classe 7 - Material Radioativo", blocks: [{ type: "paragraph", content: "Qualquer material contendo radionuclídeos onde tanto a concentração de atividade quanto a atividade total na remessa excedem os valores especificados." }] },
        { id: "3.8", title: "Classe 8 - Corrosivos", blocks: [{ type: "paragraph", content: "Substâncias que, por ação química, causam danos severos quando em contato com tecidos vivos ou, em caso de vazamento, danificam ou destroem materialmente outras mercadorias ou os meios de transporte." }] },
        { id: "3.8.1", title: "Critérios do Grupo de Embalagem", blocks: [{ type: "paragraph", content: "O grupo de embalagem para substâncias da Classe 8 é atribuído com base na observação da destruição total da espessura da pele intacta."}, { type: "table", content: { caption: "Tabela 3.8.A - Critérios de Corrosividade por Grupo de Embalagem", headers: ["Grupo de Embalagem", "Tempo de Exposição", "Período de Observação", "Efeito"], rows: [["I (Alto Risco)", "≤ 3 min", "≤ 60 min", "Destruição total da pele"],["II (Risco Médio)", "> 3 min e ≤ 1 h", "≤ 14 dias", "Destruição total da pele"],["III (Baixo Risco)", "> 1 h e ≤ 4 h", "≤ 14 dias", "Destruição total da pele"]]}}]},
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
        { id: "4.2", title: "Lista de Mercadorias Perigosas (Blue Pages)", blocks: [{ type: "paragraph", content: "A Tabela 4.2, conhecida como 'Páginas Azuis', é a principal referência para todas as mercadorias perigosas listadas. Ela fornece informações sobre classificação, embalagem, limites e disposições especiais." }, { type: "database", content: { id: "blue-pages", title: "Tabela 4.2 - Lista Azul", type: "blue-pages", columns: [{ key: "un", label: "UN", width: "w-16", filterable: true }, { key: "page", label: "Pág.", width: "w-16" }, { key: "name", label: "Nome Apropriado", width: "w-64", filterable: true }, { key: "class", label: "Cls", width: "w-12" }, { key: "sub", label: "Sub", width: "w-12" }, { key: "pg", label: "PG", width: "w-12" }, { key: "eq", label: "EQ", width: "w-12" }, { key: "lq_pi", label: "Y-PI", width: "w-16" }, { key: "pax_pi", label: "Pax PI", width: "w-16" }, { key: "cao_pi", label: "CAO PI", width: "w-16" }, { key: "sp", label: "SP", width: "w-24" }], data: BLUE_PAGES_DATA } }] },
        { id: "4.3", title: "Nomes Genéricos e N.O.S. (Não Especificados de Outra Forma)", blocks: [
                { type: "paragraph", content: "Quando uma substância ou mistura não é listada especificamente por nome na Tabela 4.2, uma entrada 'genérica' ou 'não especificada de outra forma' (N.O.S.) deve ser usada. Para garantir a identificação adequada do risco, essas entradas devem ser complementadas com o nome técnico dos componentes perigosos." },
                { type: "note", content: {
                    title: "Exemplo de Aplicação",
                    text: "Uma mistura de álcool isopropílico e tolueno seria declarada como: UN 1993, Líquido Inflamável, n.o.s. (tolueno, álcool isopropílico), 3, GE II."
                }},
                { type: "paragraph", content: "Geralmente, no máximo dois componentes que mais contribuem para o risco da mistura devem ser mostrados entre parênteses. Esta informação é crucial para a resposta a emergências." }
        ]},
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
        { id: "5.0", title: "Disposições Gerais", blocks: [{type: "paragraph", content: "O expedidor é responsável por garantir que a embalagem selecionada esteja em conformidade com a Instrução de Embalagem aplicável, que os limites de quantidade não sejam excedidos e que todos os requisitos gerais de embalagem sejam atendidos."}] },
        { id: "5.0.1", title: "Responsabilidades do Expedidor", blocks:[{ type: "paragraph", content: "O expedidor é responsável por garantir que a embalagem selecionada esteja em conformidade com a Instrução de Embalagem aplicável e que os limites de quantidade não sejam excedidos."}]},
        { id: "5.0.2", title: "Requisitos Gerais de Embalagem", blocks:[{ type: "paragraph", content: "Todas as embalagens usadas para mercadorias perigosas devem atender aos seguintes requisitos fundamentais:"}, {type: "list", content: {ordered: true, items: ["As embalagens devem ser de boa qualidade, fabricadas com materiais adequados e devem ser fortes o suficiente para suportar os choques e cargas normalmente encontrados durante o transporte, incluindo transferência entre aeronaves e armazéns.", "As embalagens devem ser construídas e fechadas de forma a prevenir qualquer vazamento que possa ser causado em condições normais de transporte, por mudanças de temperatura, umidade, pressão ou vibração.", "As partes da embalagem que entram em contato direto com mercadorias perigosas não devem ser afetadas ou enfraquecidas significativamente por essa substância e não devem causar um efeito perigoso (ex: catalisar uma reação).", "Para embalagens combinadas, as embalagens internas devem ser acondicionadas de forma segura com material de acolchoamento para evitar que se quebrem ou sejam perfuradas e para controlar qualquer vazamento.", "Para líquidos em embalagens internas, deve haver material absorvente suficiente para absorver todo o conteúdo líquido. O material absorvente não deve reagir perigosamente com o líquido.", "As embalagens devem estar devidamente fechadas de acordo com as instruções do fabricante.", "Nenhuma embalagem deve ter resíduos perigosos aderidos ao seu exterior."]}}]},
        { id: "5.0.3", title: "Overpacks", blocks:[{ type: "paragraph", content: "Um invólucro usado por um expedidor para conter um ou mais volumes. Deve ser marcado com 'OVERPACK' e todas as marcações e etiquetas dos volumes internos devem ser reproduzidas no exterior."}]},
        { id: "5.0.4", title: "Embalagens de Resgate (Salvage)", blocks:[{ type: "paragraph", content: "Embalagens especiais usadas para transportar volumes de mercadorias perigosas que foram danificados, defeituosos ou que vazaram."}]},
        { 
            id: "5.1", 
            title: "Lista de Instruções de Embalagem", 
            blocks: [
                { type: "paragraph", content: "Esta seção contém uma lista de referência das Instruções de Embalagem (PI) mais comuns. Utilize a ferramenta de busca para encontrar uma PI específica ou navegue pelos dados. A designação correta da PI é encontrada na Tabela 4.2 (Páginas Azuis) com base no Número UN e Grupo de Embalagem." },
                { 
                    type: "database", 
                    content: { 
                        id: "pi-database", 
                        title: "Base de Dados de Instruções de Embalagem", 
                        type: 'pi-list',
                        columns: [ 
                            { key: "id", label: "PI Nº", width: "w-24", filterable: true }, 
                            { key: "title", label: "Título", width: "w-48", filterable: true }, 
                            { key: "description", label: "Descrição Resumida", width: "w-96", filterable: true },
                            { key: "applies_to", label: "Aplicação Comum", width: "w-48", filterable: true },
                            { key: "type", label: "Tipo", width: "w-32" }
                        ], 
                        data: PACKING_INSTRUCTIONS_DATA 
                    } 
                }
            ]
        }
    ]
  },
  {
      id: 6,
      title: "Especificações de Embalagem",
      description: "Requisitos de fabricação, teste de performance e marcação para embalagens de especificação UN.",
      color: "border-gray-700",
      icon: Box,
      sections: [
          { id: "6.0", title: "Aplicabilidade e Requisitos Gerais", blocks: [{ type: "paragraph", content: "Este capítulo detalha os requisitos para a fabricação e teste de embalagens de especificação da ONU. Estas embalagens são identificadas por uma marcação específica (ex: '4G/Y145/S/23...'). As especificações não se aplicam a cilindros de gás, embalagens para material radioativo ou para substâncias infectantes, que possuem requisitos próprios." }] },
          { id: "6.1", title: "Códigos para Tipos de Embalagem", blocks: [{ type: "paragraph", content: "Os códigos que formam a primeira parte da marcação UN identificam o tipo de embalagem, o material de construção e, em alguns casos, a categoria dentro do tipo." }, { type: 'table', content: { headers: ["Código", "Significado"], rows: [["1", "Tambor (Drum)"], ["3", "Jerrican (Bombona)"], ["4", "Caixa (Box)"], ["A", "Aço (Steel)"], ["B", "Alumínio (Aluminium)"], ["G", "Papelão (Fibreboard)"], ["H", "Plástico (Plastic)"], ["1A1", "Tambor de aço com tampa não removível"], ["4G", "Caixa de papelão"]] } }] },
          { id: "6.2", title: "Marcação de Embalagens de Especificação UN", blocks: [{ type: "paragraph", content: "Cada embalagem testada e certificada deve exibir uma marca durável e legível. A marca indica que a embalagem corresponde a um design-tipo testado com sucesso. Exemplo:" }, { type: 'paragraph', content: "u\n/n 4G/Y145/S/23/USA/M1234" }, {type: 'definition-list', content: [
              {term: 'u\n/n', definition: 'Símbolo das Nações Unidas para embalagens.'},
              {term: '4G', definition: 'Código do tipo de embalagem (neste caso, Caixa de Papelão).'},
              {term: 'Y', definition: 'Nível de performance. X para PG I, II, III; Y para PG II, III; Z para PG III.'},
              {term: '145', definition: 'Para embalagens de sólidos ou combinadas, indica a massa bruta máxima permitida em kg. Para embalagens únicas de líquidos, indica a densidade relativa máxima permitida.'},
              {term: 'S', definition: 'Indica que a embalagem é para Sólidos ou para embalagens internas. Para líquidos, a pressão do teste hidráulico em kPa seria mostrada aqui.'},
              {term: '23', definition: 'Os dois últimos dígitos do ano de fabricação.'},
              {term: 'USA', definition: 'O código do país que autorizou a marcação.'},
              {term: 'M1234', definition: 'Código de identificação da agência de testes ou do fabricante.'}
          ]}] },
          { id: "6.3", title: "Requisitos para Embalagens", blocks: [{ type: "paragraph", content: "As embalagens devem ser fabricadas sob um programa de garantia de qualidade. Os materiais devem ser compatíveis com o conteúdo, e os fechos devem ser projetados para resistir às condições de transporte sem vazar. Para caixas de papelão (4G), é crucial que sejam protegidas da umidade, pois a água pode comprometer sua integridade estrutural." }] },
          { id: "6.4", title: "Requisitos de Teste de Performance", blocks: [{ type: "paragraph", content: "Protótipos de cada design de embalagem devem passar por testes rigorosos antes de serem autorizados. Os testes são projetados para simular as tensões do transporte." }] },
          { id: "6.4.1", title: "Teste de Queda (Drop Test)", blocks:[{ type: "paragraph", content: "As embalagens são enchidas com um substituto (água para líquidos, areia para sólidos) e derrubadas sobre uma superfície rígida e não resiliente. A altura da queda depende do Grupo de Embalagem:" }, {type: 'table', content: { headers: ["Grupo de Embalagem", "Altura de Queda"], rows: [["I (Alto Risco)", "1.2 m"], ["II (Médio Risco)", "1.2 m"], ["III (Baixo Risco)", "1.2 m"]]}}, {type: 'note', content: {title: "Nota para Transporte Aéreo", text: "A altura de queda para os Grupos de Embalagem II e III é harmonizada em 1.2 m para a maioria das substâncias no transporte aéreo, refletindo condições de manuseio mais severas, ao contrário de outros modais que podem usar 0.8 m."}}] }, 
          { id: "6.4.2", title: "Teste de Empilhamento (Stacking Test)", blocks:[{ type: "paragraph", content: "A embalagem deve suportar o peso de uma pilha de embalagens idênticas até uma altura de 3 metros por 24 horas, sem vazar ou deformar a ponto de reduzir sua eficácia." }] },
          { id: "6.4.3", title: "Teste de Pressão Hidráulica (Hydrostatic Pressure)", blocks:[{ type: "paragraph", content: "Embalagens para líquidos devem ser capazes de suportar uma pressão interna mínima (geralmente 95 kPa para transporte aéreo) sem vazar. Este teste simula as diferenças de pressão em altitude." }] },
          { id: "6.4.4", title: "Teste de Estanqueidade (Leakproofness Test)", blocks:[{ type: "paragraph", content: "Todas as embalagens para líquidos devem ser testadas com uma baixa pressão de ar para garantir que não haja vazamentos nos fechos ou no corpo da embalagem."}] }
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
          { id: "7.1.1", title: "Número UN e Nome Apropriado", blocks:[{type: "paragraph", content:"O UN Number e o Proper Shipping Name devem ser marcados em cada volume. O tamanho mínimo da marcação é de 12 mm de altura, a menos que o pacote seja muito pequeno."}]},
          { id: "7.1.2", title: "Endereços", blocks:[{type: "paragraph", content:"Nome e endereço completo do expedidor e do destinatário."}]},
          { id: "7.1.3", title: "Marcas de Especificação de Embalagem", blocks:[{ type: "paragraph", content: "A marca de especificação UN deve ser durável, legível e visível." }]},
          { id: "7.1.4", title: "Requisitos de Idioma", blocks: [{ type: "paragraph", content: "Salvo disposição em contrário, todas as marcações devem estar em inglês." }] },
          { id: "7.1.5", title: "Marcas de Quantidade Limitada e Excepcionada", blocks: [{ type: "paragraph", content: "Requisitos específicos de marcação para volumes preparados sob as provisões de LQ e EQ." }] },
          { id: "7.1.6", title: "Outras Marcas", blocks: [{ type: "paragraph", content: "Cobre marcas para Baterias de Lítio, Substâncias Perigosas ao Meio Ambiente, Material Magnetizado, etc." }, {type: "visual-mark", content: {type: 'lithium-battery', data: {unNumbers: '3480', phone: '+1 555-123-4567'}, caption: 'Marca de Bateria de Lítio'}}]},
          { id: "7.2", title: "Etiquetagem", blocks: [{ type: "paragraph", content: "Etiquetas de risco (Losangos 100x100mm) devem ser afixadas para indicar o risco primário e, se aplicável, os riscos secundários." }] },
          { id: "7.2.1", title: "Aplicabilidade das Etiquetas", blocks:[{ type: "paragraph", content: "Descreve quando as etiquetas de risco primário e secundário são necessárias." }]},
          { id: "7.2.2", title: "Especificações das Etiquetas", blocks:[{ type: "paragraph", content: "As etiquetas devem ter dimensões, cores e símbolos específicos. O tamanho padrão é um losango de 100 mm x 100 mm." }]},
          { id: "7.2.3", title: "Posicionamento das Etiquetas", blocks:[{ type: "paragraph", content: "As etiquetas devem ser afixadas em uma superfície do volume, perto da marca do Nome Apropriado, e não devem ser cobertas ou obscurecidas. Para cilindros, a etiqueta pode ser fixada no ombro." }]},
          { id: "7.3", title: "Etiquetas de Manuseio", blocks: [{ type: "paragraph", content: "Além das etiquetas de risco, etiquetas de manuseio são necessárias para fornecer instruções sobre como o volume deve ser manuseado e estivado." }, { type: "visual-mark", content: { type: 'cargo-only', caption: 'Cargo Aircraft Only' } }, { type: "visual-mark", content: { type: 'orientation', caption: 'Setas de Orientação' } } ] }
      ]
  },
  {
      id: 8,
      title: "Documentação",
      description: "Preenchimento correto da Shipper's Declaration (DGD) e do Air Waybill (AWB).",
      color: "border-green-600",
      icon: FileText,
      sections: [
          { id: "8.0", title: "Aplicabilidade", blocks: [{ type: "paragraph", content: "Salvo exceções (como Quantidades Limitadas Seção II, Gelo Seco como refrigerante, etc.), uma Shipper's Declaration for Dangerous Goods (DGD) preenchida e assinada é necessária para cada remessa de mercadorias perigosas." }] },
          { id: "8.1", title: "Shipper's Declaration (DGD)", blocks: [{ type: "paragraph", content: "A DGD é um documento legal onde o expedidor certifica que a remessa está em total conformidade com os regulamentos da IATA. Deve ser apresentada em duas cópias (uma para o operador de origem, outra para acompanhar a carga)." }] },
          { id: "8.1.1", title: "Preenchimento da DGD", blocks:[{ type: "paragraph", content: "A DGD deve ser preenchida com precisão e sem erros. As correções devem ser feitas de forma que a alteração original permaneça legível. A seção de identificação da mercadoria perigosa deve seguir uma sequência estrita:" }, {type: 'definition-list', content: [
              {term: 'UN Number', definition: 'O número de 4 dígitos precedido por "UN".'},
              {term: 'Proper Shipping Name (PSN)', definition: 'O nome em negrito da Tabela 4.2. Para entradas N.O.S., o nome técnico deve ser adicionado entre parênteses.'},
              {term: 'Class or Division', definition: 'A classe de risco primária, seguida pelo risco subsidiário entre parênteses, se houver.'},
              {term: 'Packing Group', definition: 'O grupo de embalagem (I, II ou III), se aplicável.'}
          ]}, { type: "note", content: { title: "Exemplo de Sequência", text: "UN 1263, Paint, 3, PG II" } }] },
          { id: "8.1.2", title: "Quantidade e Tipo de Embalagem", blocks:[{ type: "paragraph", content: "Esta coluna deve detalhar o número de volumes, o tipo de embalagem (usando códigos UN ou descrição completa, ex: '1 Fibreboard Box') e a quantidade líquida por volume. Para overpacks, a declaração 'Overpack Used' é obrigatória." }] },
          { id: "8.1.3", title: "Packing Instruction & Autorização", blocks:[{ type: "paragraph", content: "O número da Instrução de Embalagem (ex: 965) deve ser declarado. A coluna 'Autorização' é usada para Disposições Especiais, aprovações de autoridades competentes ou outras informações relevantes." }] },
          { id: "8.1.4", title: "Declaração e Assinatura", blocks:[{ type: "paragraph", content: "O expedidor (ou seu agente designado) deve assinar, datar e indicar o local da assinatura, certificando a conformidade da remessa." }] },
          { id: "8.1.5", title: "Exemplo de DGD Preenchida", blocks:[{ type: "note", content: { title: "Exemplo de Declaração para UN 1263", text: `
SHIPPER: Exemplo Global de Tintas Ltda, Rua das Cores 123, São Paulo, Brasil
CONSIGNEE: Loja de Tintas ABC, Av. Principal 456, Miami, FL, EUA
AIR WAYBILL No.: 123-45678910
PAGE 1 OF 1
SHIPPER'S REFERENCE No.: INV-2026-001

TRANSPORT DETAILS:
AIRPORT OF DEPARTURE: GRU (Guarulhos)
AIRPORT OF DESTINATION: MIA (Miami)
SHIPMENT TYPE: [X] CARGO AIRCRAFT ONLY

NATURE AND QUANTITY OF DANGEROUS GOODS:
-------------------------------------------------------------------------------------------------
| UN or ID No. | Proper Shipping Name/Description                        | Class | PG | Quantity & Type of Packing | Packing Inst. | Authorization |
|--------------|---------------------------------------------------------|-------|----|----------------------------|---------------|---------------|
| UN 1263      | Paint (contains Toluene)                                | 3     | II | 1 Steel drum x 50 L        | 364           | N/A           |
-------------------------------------------------------------------------------------------------

ADDITIONAL HANDLING INFORMATION: Emergency Contact: +55 11 99999-8888

I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packed, marked and labelled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations.

Name/Title of Signatory: J. da Silva, Gerente de Logística
Place and Date: São Paulo, 2026-01-15
Signature: (Assinatura de J. da Silva)
`}}]},
          { id: "8.2", title: "Conhecimento Aéreo (Air Waybill)", blocks: [{ type: "paragraph", content: "O AWB que acompanha uma remessa com DGD deve conter uma declaração clara no campo 'Handling Information' (Informações de Manuseio)." }, { type: "warning", content: { text: "Declaração Mandatória: 'Dangerous Goods as per attached Shipper's Declaration' ou 'Dangerous Goods as per attached DGD'." } }, { type: "note", content: {title: 'Carga sem DGD', text: 'Para cargas perigosas que não requerem DGD (ex: baterias de lítio Seção II), o AWB deve conter a declaração "Dangerous Goods - Shipper\'s Declaration Not Required" e outras informações aplicáveis.'}}] }
      ]
  },
  {
      id: 9,
      title: "Manuseio",
      description: "Aceitação, armazenamento, segregação, carregamento e o NOTOC.",
      color: "border-blue-700",
      icon: Plane,
      sections: [
          { id: "9.1", title: "Aceitação", blocks: [ { type: "paragraph", content: "O operador não deve aceitar uma remessa de mercadorias perigosas a menos que tenha sido inspecionada por pessoal treinado, usando um checklist, para garantir que a documentação e os volumes estejam em total conformidade." } ] },
          { id: "9.1.1", title: "Checklist de Aceitação", blocks:[{ type: "paragraph", content: "O checklist é uma ferramenta sistemática para verificar cada requisito regulatório. A falha em qualquer item resulta na recusa da remessa." }, {type: 'checklist', content: {id: 'acceptance-checklist', title: 'Checklist de Aceitação Detalhado', items: [
              {id: 'c1', text: 'Documentação: DGD e AWB estão consistentes e corretamente preenchidos?', reference: '8.1, 8.2'},
              {id: 'c2', text: 'Idioma: Documentos e marcações estão em inglês?', reference: '8.1.1'},
              {id: 'c3', text: 'Tipo de Embarque: A remessa está limitada a "Cargo Aircraft Only" se necessário?', reference: 'Colunas J/L Tabela 4.2'},
              {id: 'c4', text: 'Marcações: Todos os volumes possuem UN Number, PSN, endereços completos e marca de especificação UN (se aplicável)?', reference: '7.1'},
              {id: 'c5', text: 'Etiquetas: Etiquetas de risco primário/subsidiário e de manuseio estão corretas, visíveis e afixadas adequadamente?', reference: '7.2, 7.3'},
              {id: 'c6', text: 'Embalagem: O tipo de embalagem corresponde ao declarado e está em boas condições (sem vazamentos ou danos)?', reference: '5.0.2'},
              {id: 'c7', text: 'Quantidade: A quantidade por volume está dentro dos limites da Instrução de Embalagem aplicável?', reference: '4.2'},
              {id: 'c8', text: 'Variações: Todas as variações de Estado e Operador aplicáveis foram cumpridas?', reference: '2.8'},
              {id: 'c9', text: 'Overpack: Se usado, está corretamente marcado com "OVERPACK" e todas as marcações internas estão reproduzidas?', reference: '5.0.3'}
          ]}}] }, 
          { id: "9.2", title: "Armazenamento", blocks: [ { type: "paragraph", content: "Volumes de mercadorias perigosas devem ser armazenados em locais seguros, protegidos do clima e de danos, e segregados de materiais incompatíveis e de áreas de alto tráfego." } ] },
          { id: "9.3", title: "Segregação", blocks: [ { type: "paragraph", content: "Mercadorias perigosas incompatíveis não devem ser carregadas na aeronave de forma que possam vazar e se misturar perigosamente. A segregação também se aplica ao armazenamento." } ] },
          { id: "9.3.1", title: "Tabela de Segregação (9.3.A)", blocks:[{ type: "paragraph", content: "A Tabela 9.3.A define os requisitos de segregação entre as classes de risco. Um 'X' na tabela indica que os pacotes devem ser segregados. Nota: Esta tabela não considera os riscos subsidiários, que devem ser levados em conta adicionalmente." }, {type: 'table', content: {
              headers: ["", "1", "2.1", "2.2", "2.3", "3", "4.1", "4.2", "4.3", "5.1", "5.2", "6.1", "6.2", "7", "8", "9"],
              rows: [
                  ["1", false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
                  ["2.1", false, false, false, false, false, false, true, false, true, true, false, false, true, false, false],
                  ["2.2", false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
                  ["2.3", false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
                  ["3", false, false, false, false, false, false, true, false, true, true, false, false, true, false, false],
                  ["4.1", false, false, false, false, false, false, true, false, true, true, false, false, true, false, false],
                  ["4.2", true, true, true, true, true, true, false, true, true, true, true, true, true, true, true],
                  ["4.3", false, false, false, false, false, false, true, false, false, true, false, false, true, true, false],
                  ["5.1", false, true, false, false, true, true, true, false, false, true, false, false, true, true, false],
                  ["5.2", true, true, true, true, true, true, true, true, true, false, true, true, true, true, true],
                  ["6.1", false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
                  ["6.2", false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
                  ["7", true, true, true, true, true, true, true, true, true, true, true, true, false, true, true],
                  ["8", false, false, false, false, false, false, true, true, true, true, false, false, true, false, false],
                  ["9", false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
              ],
              caption: "Tabela 9.3.A - Requisitos de Segregação",
              type: 'matrix',
              footnotes: ["'true' (ou X na DGR): Segregação necessária.", "'false' (ou célula em branco na DGR): Segregação não necessária. Riscos subsidiários e requisitos de segregação para alimentos/rações não são mostrados."]
          }}] },
          { id: "9.3.2", title: "Segregação de Material Radioativo", blocks: [{ type: "paragraph", content: "Volumes de material radioativo devem ser segregados de áreas ocupadas por pessoas e de filmes fotográficos não revelados. A distância mínima de separação é baseada na soma dos Índices de Transporte (TI) de todos os pacotes." }, { type: "table", content: { caption: "Tabela 10.9.C - Distâncias Mínimas de Separação (Simplificada)", headers: ["Soma dos Índices de Transporte (TI)", "Distância Mínima (metros)"], rows: [["0.1 a 1.0", "0.5 m"], ["1.1 a 2.0", "1.0 m"], ["2.1 a 3.0", "1.5 m"], ["3.1 a 4.0", "2.0 m"], ["4.1 a 5.0", "2.5 m"], ["5.1 a 10.0", "4.5 m"], ["10.1 a 20.0", "6.5 m"], ["20.1 a 50.0", "9.0 m"]]}}]},
          {
              id: "9.4",
              title: "Carregamento (Loading)",
              blocks: [
                  { type: "paragraph", content: "O carregamento de mercadorias perigosas deve ser supervisionado por pessoal qualificado. Antes do carregamento, cada volume deve ser inspecionado externamente para garantir que não haja vazamentos ou danos. Volumes danificados não devem ser carregados." },
                  { type: "list", content: {
                      ordered: false,
                      items: [
                          "Os volumes devem ser carregados, estivados e amarrados de forma a prevenir movimento e danos durante o voo.",
                          "A orientação dos volumes (indicada pelas setas de orientação) deve ser mantida durante todo o transporte.",
                          "Volumes com a etiqueta 'Cargo Aircraft Only' (CAO) são proibidos em aeronaves de passageiros e devem ser carregados em aeronaves cargueiras, preferencialmente em locais acessíveis à tripulação.",
                          "Mercadorias perigosas não devem ser carregadas em um ULD (Unit Load Device) contendo alimentos, rações ou outros produtos comestíveis."
                      ]
                  }},
                  { type: "warning", content: {
                      title: "Manuseio de CAO",
                      text: "Volumes com a etiqueta 'Cargo Aircraft Only' não devem ser carregados na cabine de passageiros ou no convés inferior de uma aeronave de passageiros. Devem ser carregados de tal forma que a tripulação possa ver, manusear e, se necessário, separar os pacotes."
                  }}
              ]
          },
          { id: "9.5", title: "Informação ao Piloto em Comando (NOTOC)", blocks: [{ type: "paragraph", content: "Antes da partida, o operador deve fornecer ao piloto em comando (PIC) informações precisas e legíveis sobre as mercadorias perigosas a bordo. Este documento é o NOTOC." }, {type: 'list', content: {ordered: true, items: [
              "Número do Conhecimento Aéreo (AWB)",
              "Número UN e Nome Apropriado para Embarque",
              "Classe/Divisão e Riscos Subsidiários",
              "Grupo de Embalagem",
              "Número de volumes e sua localização exata na aeronave (ex: CPT 3 AFT)",
              "Quantidade líquida ou massa bruta por volume",
              "Para Classe 7: Índice de Transporte (TI), Categoria e Dimensões",
              "Confirmação de que nenhum pacote danificado foi carregado."
          ]}}] },
          { id: "9.6", title: "Fornecimento de Informações", blocks: [ { type: "paragraph", content: "Informações cruciais sobre mercadorias perigosas devem ser comunicadas a várias partes para garantir a segurança em todas as fases do transporte." } ] },
          { id: "9.6.1", title: "Informação aos Passageiros", blocks: [{ type: "paragraph", content: "Os operadores aéreos devem garantir que avisos sejam exibidos de forma clara e proeminente nos aeroportos (em áreas de check-in, venda de passagens, portões de embarque) e em seus websites. Esses avisos informam aos passageiros sobre os tipos de mercadorias perigosas que são estritamente proibidas em sua bagagem de mão e despachada." }] },
          { id: "9.6.2", title: "Informação a Funcionários", blocks: [{ type: "paragraph", content: "Manuais operacionais e instruções de emergência devem estar prontamente disponíveis para todos os funcionários envolvidos no manuseio de carga. O NOTOC (Notification to Pilot-in-Command) é a principal fonte de informação para a tripulação de voo e para o pessoal de terra responsável pelo carregamento." }] },
          { id: "9.6.3", title: "Informação em Emergência em Voo", blocks: [{ type: "paragraph", content: "No evento de uma emergência em voo, o piloto-em-comando deve, assim que a situação permitir, informar a unidade de controle de tráfego aéreo (ATC) apropriada sobre as mercadorias perigosas a bordo. A informação deve ser clara e concisa, incluindo, se possível, o Nome Apropriado para Embarque, Classe, Número UN, quantidade e localização na aeronave." }] },
          { id: "9.7", title: "Retenção de Documentos", blocks: [{ type: "paragraph", content: "O operador deve reter uma cópia da DGD, do checklist de aceitação e do NOTOC por um período mínimo de três meses após o voo." }] }
      ]
  },
  {
      id: 10,
      title: "Material Radioativo",
      description: "Conceitos chave para classificação, embalagem e manuseio de Classe 7.",
      color: "border-yellow-600",
      icon: Radiation,
      sections: [
          { id: "10.0", title: "Aplicabilidade e Base Regulatória", blocks:[{ type: "paragraph", content: "Este capítulo estabelece os requisitos para o transporte aéreo seguro de material radioativo (Classe 7), que são baseados nos regulamentos da Agência Internacional de Energia Atômica (AIEA), especificamente o Regulamento para o Transporte Seguro de Materiais Radioativos (TS-R-1). Detalha todos os requisitos para o transporte seguro de materiais da Classe 7 por via aérea, cobrindo classificação, embalagem, marcação, etiquetagem, documentação e manuseio." }] },
          { id: "10.1", title: "Limitações Gerais", blocks: [
              { type: "paragraph", content: "O transporte de material radioativo está sujeito a limitações estritas para garantir a segurança." },
              { type: "list", content: { ordered: false, items: [
                  "É proibido o transporte pelo correio aéreo internacional.",
                  "É proibido o transporte em bagagem de passageiros ou tripulantes, salvo exceções muito específicas (ex: marcapassos implantados).",
                  "Certos radionuclídeos de alto risco podem ser proibidos, a menos que contidos em um dispositivo aprovado pela autoridade competente.",
                  "Operadores podem ter variações mais restritivas que proíbem certos tipos de material radioativo em sua rede."
              ]}}
          ]},
          { id: "10.2", title: "Determinação do Nível de Atividade", blocks:[
              { type: "paragraph", content: "A classificação e os limites de um material radioativo são determinados por sua atividade (medida em Becquerels, Bq) e pelos valores A1 e A2, que são encontrados na Tabela 10.3.A do manual IATA DGR." },
              { type: 'definition-list', content: [
                {term: 'Valor A1', definition: 'Limite de atividade para material radioativo de "forma especial" (special form). Material de forma especial é encapsulado de forma sólida e robusta, de modo que não se disperse facilmente em caso de acidente.'},
                {term: 'Valor A2', definition: 'Limite de atividade para material radioativo de "forma normal" (other than special form), como líquidos ou pós, que podem se dispersar.'}
              ]},
              { type: "note", content: { title: "Cálculo", text: "Para uma mistura de radionuclídeos, o cálculo para determinar se os limites A1 ou A2 são excedidos requer uma fórmula específica de soma de frações descrita na seção 10.3.1.2." }}
          ]},
          { id: "10.3", title: "Classificação de Materiais", blocks: [] },
          { id: "10.3.1", title: "Designação de Números UN", blocks: [{ type: "paragraph", content: "A classificação começa com a atribuição do número UN correto, que varia com base no tipo de material, atividade e se é físsil." }] },
          { id: "10.3.2", title: "Material de Baixa Atividade Específica (LSA)", blocks: [{ type: "paragraph", content: "Material radioativo que por sua natureza tem uma atividade específica limitada. É dividido em LSA-I, LSA-II e LSA-III com base na sua composição e atividade." }] },
          { id: "10.3.3", title: "Objeto Contaminado na Superfície (SCO)", blocks: [{ type: "paragraph", content: "Um objeto sólido que não é em si radioativo, mas tem material radioativo distribuído em suas superfícies. Dividido em SCO-I e SCO-II." }] },
          { id: "10.3.4", title: "Material Físsil", blocks: [{ type: "paragraph", content: "Materiais como urânio-233, urânio-235, plutônio-239, que são capazes de sustentar uma reação nuclear em cadeia. Requerem controle estrito para garantir a segurança contra criticidade (uma reação nuclear acidental)." }] },
          { id: "10.4", title: "Requisitos de Fabricação e Teste para Pacotes", blocks: [] },
          { id: "10.4.1", title: "Tipos de Pacotes", blocks: [{ type: "paragraph", content: "Existem vários tipos de pacotes, projetados para diferentes níveis de risco:" }, { type: 'definition-list', content: [
                { term: 'Pacote Exceptuado (Excepted Package)', definition: 'Para quantidades muito pequenas de material radioativo com risco mínimo, isentos da maioria dos requisitos de marcação, etiquetagem e documentação.' },
                { term: 'Pacote Industrial (Industrial Package - IP)', definition: 'Para materiais LSA e SCO, com três níveis de integridade (IP-1, IP-2, IP-3).' },
                { term: 'Pacote Tipo A', definition: 'Projetado para resistir a condições normais de transporte (quedas, chuva, empilhamento) sem liberar o conteúdo. Usado para quantidades de material até A1 ou A2.' },
                { term: 'Pacote Tipo B', definition: 'Projetado para resistir a condições severas de acidente (impacto, fogo, imersão) sem liberar o conteúdo. Usado para materiais de alta atividade, excedendo os limites do Tipo A. Requer certificação da autoridade competente.' },
                { term: 'Pacote Tipo C', definition: 'Similar ao Tipo B, mas com testes de performance ainda mais rigorosos, projetado especificamente para transporte aéreo de materiais de alta atividade.' }
            ]}] },
          { id: "10.4.2", title: "Testes de Performance", blocks: [{ type: "paragraph", content: "Pacotes, especialmente os do Tipo A, B e C, devem passar por uma série rigorosa de testes, incluindo testes de queda de várias alturas, testes de penetração, spray de água e compressão para simular as tensões do transporte normal e de acidentes." }] },
          { id: "10.5", title: "Pacotes Exceptuados (Excepted Packages)", blocks:[
              { type: "paragraph", content: "UN 2908, UN 2909, UN 2910 e UN 2911 são pacotes com quantidades extremamente pequenas de material radioativo que apresentam um risco muito baixo. Eles estão isentos da maioria dos requisitos de etiquetagem e documentação (DGD)." },
              { type: "warning", content: { text: "Apesar de isentos de DGD, a natureza da mercadoria ('Radioactive material, excepted package...') deve ser declarada no Air Waybill."}},
              { type: "paragraph", content: "A embalagem deve ser marcada com 'Radioactive Material, Excepted Package' e o número UN. Deve haver uma marcação interna que avise sobre o conteúdo radioativo caso a embalagem seja aberta." }
          ]},
          { id: "10.6", title: "Índice de Transporte (TI) e Categorias", blocks:[] },
          { id: "10.6.1", title: "Índice de Transporte (TI)", blocks:[{ type: "paragraph", content: "O TI é um número único atribuído a um volume para controlar a exposição à radiação. Ele é determinado medindo a dose máxima de radiação em milisieverts por hora (mSv/h) a 1 metro da superfície do volume e multiplicando por 100. (Ex: 0.05 mSv/h a 1m resulta em um TI de 5)." }, {type: 'warning', content: {text: "O TI é o principal fator para determinar os requisitos de segregação de pessoas e de outras cargas sensíveis, como filme fotográfico não revelado."}} ] },
          { id: "10.6.2", title: "Categorias de Volumes", blocks:[{ type: "paragraph", content: "Com base no TI e no nível de radiação máximo na superfície, os volumes são classificados em três categorias, cada uma com sua própria etiqueta de risco:" }, {type: 'table', content: {
                headers: ['Categoria', 'Nível de Radiação na Superfície', 'Índice de Transporte (TI)'],
                rows: [
                    ['I-BRANCA', '≤ 0.005 mSv/h', '0'],
                    ['II-AMARELA', '> 0.005 mSv/h a ≤ 0.5 mSv/h', '> 0 a ≤ 1'],
                    ['III-AMARELA', '> 0.5 mSv/h a ≤ 2 mSv/h', '> 1 a ≤ 10']
                ],
                caption: 'Tabela 10.6.B - Categorias de Volumes Radioativos'
            }}] },
          { id: "10.7", title: "Marcação e Etiquetagem", blocks:[] },
          { id: "10.7.1", title: "Marcação", blocks:[
              { type: "paragraph", content: "Cada volume de material radioativo (exceto pacotes exceptuados) deve ser marcado de forma clara e durável com:" },
              { type: "list", content: { ordered: true, items: [
                  "Nome e endereço completo do expedidor e do destinatário.",
                  "Número UN, precedido pelas letras 'UN', e o Nome Apropriado para Embarque (PSN).",
                  "Massa bruta, se exceder 50 kg.",
                  "O tipo de pacote (ex: 'TYPE A', 'TYPE B(U)').",
                  "A marca de conformidade da autoridade competente para pacotes Tipo B(U), B(M) ou C."
              ]}}
          ]},
          { id: "10.7.2", title: "Etiquetagem", blocks:[
              { type: "paragraph", content: "Cada volume deve ser etiquetado com a(s) etiqueta(s) de categoria apropriada(s). A informação na etiqueta deve ser preenchida de forma legível:"},
              { type: "list", content: { ordered: true, items: [
                  "**Conteúdo (Contents):** O nome ou símbolo do(s) radionuclídeo(s) principal(is).",
                  "**Atividade (Activity):** A atividade máxima do conteúdo radioativo em Becquerels (Bq).",
                  "**Índice de Transporte (TI - Transport Index):** Apenas para as categorias II-AMARELA e III-AMARELA."
              ]}},
              { type: "paragraph", content: "As etiquetas de risco subsidiário (ex: Corrosivo) também são necessárias, se aplicável. A etiqueta 'Cargo Aircraft Only' é obrigatória se o volume for proibido em aeronaves de passageiros."},
              { type: "visual-mark", content: { type: 'radioactive-i', caption: "Categoria I-BRANCA" } },
              { type: "visual-mark", content: { type: 'radioactive-ii', caption: "Categoria II-AMARELA" } },
              { type: "visual-mark", content: { type: 'radioactive-iii', caption: "Categoria III-AMARELA" } },
          ]},
          { id: "10.8", title: "Documentação (DGD)", blocks:[
              { type: "paragraph", content: "Além dos requisitos padrão, a Declaração do Expedidor para Classe 7 deve incluir as seguintes informações adicionais:" },
              { type: 'list', content: { ordered: true, items: [
                  "Nome ou símbolo de cada radionuclídeo.",
                  "Uma descrição da forma física e química do material.",
                  "A atividade máxima do conteúdo radioativo em Becquerels (Bq).",
                  "A categoria da etiqueta do volume (I-BRANCA, II-AMARELA, III-AMARELA).",
                  "O Índice de Transporte (TI), se aplicável.",
                  "Para material físsil, o Índice de Segurança de Criticidade (CSI - Criticality Safety Index).",
                  "Identificação de qualquer certificado de aprovação de autoridade competente (ex: para pacotes Tipo B)."
              ]}}
          ]},
          { id: "10.9", title: "Manuseio, Segregação e Limites", blocks:[
              { type: "paragraph", content: "Volumes radioativos devem ser segregados de pessoas, animais vivos e filme fotográfico não revelado. A distância de segregação é determinada pela soma dos Índices de Transporte (TI) de todos os volumes carregados, utilizando a Tabela 10.9.C." },
              { type: "warning", content: { title: "Limites de TI por Aeronave/Compartimento", text: "A soma total dos Índices de Transporte em uma única aeronave não deve exceder 200. Para um único compartimento de carga, o limite é 50."}}
          ]},
          { id: "10.10", title: "Disposições para Emergências", blocks: [
              { type: "paragraph", content: "Em caso de incidente ou acidente envolvendo material radioativo, os procedimentos de emergência devem ser ativados imediatamente. A área deve ser isolada e o acesso restrito. O NOTOC (Notification to Captain) é a fonte primária de informação para a tripulação e equipes de emergência sobre os materiais a bordo. As autoridades competentes nacionais e de aviação civil devem ser notificadas." }
          ]}
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
          { id: "B.1", title: "Unidades de Medida SI", blocks: [{ type: "paragraph", content: "Este apêndice fornece fatores de conversão para unidades comumente usadas no transporte de mercadorias perigosas. As regulamentações da IATA são baseadas no Sistema Internacional de Unidades (SI)."}] },
          { id: "B.2", title: "Tabelas de Conversão Comuns", blocks: [
                {type: "table", content: { caption: "Conversão de Massa", headers: ["Unidade", "Equivalente em kg"], rows: [["1 quilograma (kg)", "1.0 kg"], ["1 grama (g)", "0.001 kg"], ["1 libra (lb)", "0.453592 kg"], ["1 onça (oz)", "0.028350 kg"]]}},
                {type: "table", content: { caption: "Conversão de Volume", headers: ["Unidade", "Equivalente em Litros (L)"], rows: [["1 Litro (L)", "1.0 L"], ["1 mililitro (mL)", "0.001 L"], ["1 galão americano (US gal)", "3.78541 L"], ["1 galão imperial (Imp gal)", "4.54609 L"]]}},
                {type: "table", content: { caption: "Conversão de Pressão", headers: ["Unidade", "Equivalente em kPa"], rows: [["1 quilopascal (kPa)", "1.0 kPa"], ["1 bar", "100 kPa"], ["1 libra por polegada² (psi)", "6.89476 kPa"], ["1 atmosfera (atm)", "101.325 kPa"]]}},
                {type: "table", content: { caption: "Conversão de Radioatividade", headers: ["Unidade", "Equivalente em Becquerel (Bq)"], rows: [["1 Becquerel (Bq)", "1 Bq (1 desintegração/s)"], ["1 Curie (Ci)", "3.7 x 10¹⁰ Bq (37 GBq)"], ["1 milicurie (mCi)", "3.7 x 10⁷ Bq (37 MBq)"], ["1 microcurie (μCi)", "3.7 x 10⁴ Bq (37 kBq)"]]}}
          ]}
      ]
  },
  {
      id: "C",
      title: "Apêndice C - Substâncias Não Listadas",
      description: "Procedimentos para substâncias não listadas nominalmente.",
      color: "border-gray-400",
      icon: FileQuestion,
      sections: [
          { id: "C.1", title: "Classificação de Substâncias Não Listadas", blocks: [
              { type: "paragraph", content: "Quando uma substância ou mistura não está listada pelo nome na Tabela 4.2, ela deve ser classificada com base em sua estrutura química, propriedades físicas e nos critérios de perigo definidos no Capítulo 3. Após a determinação da classe e do grupo de embalagem, o expedidor deve atribuir a entrada 'genérica' ou 'não especificada de outra forma' (N.O.S.) mais apropriada." },
              { type: "note", content: { title: "Nome Técnico Obrigatório", text: "Para a maioria das entradas N.O.S., o Nome Apropriado para Embarque deve ser complementado com o(s) nome(s) técnico(s) do(s) componente(s) que contribui(em) para o perigo, por exemplo, 'UN 1993, Flammable liquid, n.o.s. (Ethanol, Methanol)'." }}
          ]},
          { id: "C.2", title: "Precedência de Riscos para Classificação", blocks: [
              { type: "paragraph", content: "Se uma substância apresenta múltiplos riscos, a classe primária é determinada usando a Tabela de Precedência de Riscos (ver Tabela 3.10.A). Esta tabela estabelece uma hierarquia de perigos para garantir que o risco mais significativo seja sempre o primário." },
              { type: "warning", content: { title: "Exceções à Precedência", text: "A tabela de precedência não se aplica a substâncias das Classes 1, 2, 7, Divisões 5.2 e 6.2, e substâncias auto-reativas da Divisão 4.1. Esses riscos sempre têm precedência." }},
              { type: "table", content: {
                  caption: "Tabela de Precedência de Riscos (Simplificada)",
                  headers: ["Risco", "Prioridade Mais Alta Sobre"],
                  rows: [
                      ["4.2 (Combustão Espontânea)", "Todos os outros riscos (exceto exceções)"],
                      ["4.3 (Perigoso Quando Molhado)", "Todos os outros riscos (exceto 4.2 e exceções)"],
                      ["6.1 PG I (Tóxico - Inalação)", "Todos os outros riscos (exceto 4.2, 4.3 e exceções)"],
                      ["3 (Líquido Inflamável)", "8 (Corrosivo), 6.1 (Tóxico Oral/Dérmico)"],
                      ["8 (Corrosivo)", "9 (Miscelânea)"]
                  ],
                  footnotes: ["Esta é uma representação simplificada. Consulte sempre a Tabela 3.10.A completa no Capítulo 3 para classificação oficial."]
              }}
          ]}
      ]
  },
  {
      id: "D",
      title: "Apêndice D - Autoridades Competentes",
      description: "Lista de contatos das autoridades nacionais de aviação civil.",
      color: "border-gray-400",
      icon: Building2,
      sections: [
          { id: "D.1", title: "Lista de Contatos (Exemplos)", blocks: [{ type: "paragraph", content: "A lista completa de autoridades competentes é mantida pela ICAO. Abaixo estão alguns exemplos:" }, { type: "table", content: { headers: ["País", "Autoridade", "Website"], rows: [["Brasil", "ANAC - Agência Nacional de Aviação Civil", "www.anac.gov.br"], ["Estados Unidos", "FAA - Federal Aviation Administration", "www.faa.gov"], ["Reino Unido", "CAA - Civil Aviation Authority", "www.caa.co.uk"], ["Canadá", "Transport Canada", "tc.canada.ca"], ["União Europeia", "EASA", "www.easa.europa.eu"]] } }] }
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
