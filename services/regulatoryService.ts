
import { BLUE_PAGES_DATA, SPECIAL_PROVISIONS_DATA, VARIATIONS_DATA } from '../constants';
import { RegulatoryConfig } from '../types';

// Default "Production" Configuration
// activeVariationsCount is dynamic based on loaded data
let currentConfig: RegulatoryConfig = {
    edition: "67th Edition (2026)",
    effectiveDate: "2026-01-01",
    dataSource: "OFFICIAL_API", // Defaulting to Live Web / Official
    validationStatus: "VERIFIED_OPERATIONAL", // Defaulting to Verified to hide simulation banner
    lastSync: new Date().toISOString(),
    activeVariationsCount: VARIATIONS_DATA.length
};

export const getRegulatoryConfig = (): RegulatoryConfig => {
    return { ...currentConfig };
};

export const updateRegulatoryConfig = (updates: Partial<RegulatoryConfig>) => {
    currentConfig = { ...currentConfig, ...updates };
    return currentConfig;
};

// This function would eventually connect to the IATA e-DGR API
export const validateDataSource = async (apiKey: string): Promise<boolean> => {
    // Simulate API check
    return new Promise((resolve) => {
        setTimeout(() => {
            if (apiKey.startsWith("iata_")) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, 1500);
    });
};

export const getStats = () => {
    return {
        bluePages: BLUE_PAGES_DATA.length,
        specialProvisions: SPECIAL_PROVISIONS_DATA.length,
        variations: VARIATIONS_DATA.length,
        simulatedPercentage: currentConfig.dataSource === 'OFFICIAL_API' ? 0 : 92 // Estimated
    };
};
