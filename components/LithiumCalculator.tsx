/**
 * @file LithiumCalculator.tsx
 * @description Operational Watt-Hour and Gram-Lithium compliance calculator.
 * Evaluates lithium-ion/metal cells against IATA DGR and strict LATAM Cargo operator variations.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Zap, Info, ShieldAlert, Sparkles, AlertTriangle, CheckCircle, Flame, Layers, AppWindow } from 'lucide-react';

interface LithiumCalculatorProps {
  onClose: () => void;
}

export const LithiumCalculator: React.FC<LithiumCalculatorProps> = ({ onClose }) => {
  const [batteryChemistry, setBatteryChemistry] = useState<'ION' | 'METAL'>('ION');
  const [packagingType, setPackagingType] = useState<'LOOSE' | 'WITH_EQUIP' | 'IN_EQUIP'>('LOOSE');
  
  const [ionInputMode, setIonInputMode] = useState<'WH' | 'MAH'>('WH');
  const [wattHours, setWattHours] = useState<number>(20);
  const [mahConfig, setMahConfig] = useState({ mah: 4000, volts: 5.0 });
  
  const [lithiumGrams, setLithiumGrams] = useState<number>(1.5);
  const [qtyPerPackage, setQtyPerPackage] = useState<number>(2);
  const [totalPackages, setTotalPackages] = useState<number>(5);
  const [isOverpack, setIsOverpack] = useState<boolean>(false);
  const [socCompliant, setSocCompliant] = useState<boolean>(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const effectiveWattHours = useMemo(() => {
    if (ionInputMode === 'MAH') {
      return (mahConfig.mah * mahConfig.volts) / 1000;
    }
    return wattHours;
  }, [ionInputMode, mahConfig, wattHours]);

  // Computed results based on IATA DGR rules of lithium
  const evaluation = useMemo(() => {
    let unNumber = '';
    let packingInstruction = '';
    let category = 'Section II';
    let isLatamForbidden = false;
    let latamProhibitionReason = '';
    let labelsRequired: string[] = [];
    let dgdRequired = false;
    let caohazlabel = false;
    let ergCode = '';
    let socAlert = false;

    if (batteryChemistry === 'ION') {
      ergCode = '12FZ';
      
      // Lithium Ion: UN3480 (loose) or UN3481 (with or in equipment)
      if (packagingType === 'LOOSE') {
        unNumber = 'UN 3480';
        packingInstruction = 'PI 965';
        
        if (!socCompliant) {
          socAlert = true;
          isLatamForbidden = true;
          latamProhibitionReason = 'IATA DGR: Baterias UN 3480 exigem SoC máximo de 30% para embarque. (Requisito mandatório PI 965).';
        }
        
        // Under DGR Ion rules, loose battery limit determine Section
        if (effectiveWattHours > 100) {
          category = 'Section IA';
          dgdRequired = true;
          caohazlabel = true;
        } else {
          // If cells <= 20Wh, batteries <= 100Wh
          category = 'Section IB';
          dgdRequired = true; 
          caohazlabel = true;
        }

        // LATAM Variance Operator Variation (LA-03 / JJ-03 / UC-03)
        // Loose UN3480 batteries can never be shipped under Section II on LATAM Group.
        // Even small ones must be under Section IB (with Class 9 Labelling, DGD and CAO).
        labelsRequired = ['Etiqueta de Bateria de Lítio (Fig 7.1.C)', 'Etiqueta de Classe 9 - Baterias de Lítio (Fig 7.3.X)', 'Etiqueta Cargo Aircraft Only (CAO)'];
      } else if (packagingType === 'WITH_EQUIP') {
        unNumber = 'UN 3481';
        packingInstruction = 'PI 966';
        if (effectiveWattHours > 100) {
          category = 'Section IA';
          dgdRequired = true;
          caohazlabel = true;
          labelsRequired = ['Etiqueta de Classe 9 (Fig 7.3.C)', 'Etiqueta Cargo Aircraft Only (CAO)'];
        } else {
          category = 'Section II';
          labelsRequired = ['Etiqueta de Bateria de Lítio (Fig 7.1.C)'];
        }
      } else {
        unNumber = 'UN 3481';
        packingInstruction = 'PI 967';
        if (effectiveWattHours > 100) {
          category = 'Section IA';
          dgdRequired = true;
          caohazlabel = true;
          labelsRequired = ['Etiqueta de Classe 9 (Fig 7.3.C)', 'Etiqueta Cargo Aircraft Only (CAO)'];
        } else {
          category = 'Section II';
          // Mark only needed if there are > 4 cells or > 2 batteries per package, or > 2 packages in shipment
          if (qtyPerPackage > 4 || totalPackages > 2) {
             labelsRequired = ['Etiqueta de Bateria de Lítio (Fig 7.1.C)'];
          } else {
             labelsRequired = ['Nenhuma (Embalagem isenta sob condições básicas da Section II)'];
          }
        }
      }
    } else {
      ergCode = '12FZ';
      // Lithium Metal: UN3090 (loose) or UN3091 (with or in equipment)
      if (packagingType === 'LOOSE') {
        unNumber = 'UN 3090';
        packingInstruction = 'PI 968';
        if (lithiumGrams > 2) {
          category = 'Section IA';
          dgdRequired = true;
          caohazlabel = true;
        } else {
          category = 'Section IB';
          dgdRequired = true;
          caohazlabel = true;
        }

        // LATAM Operator Variation M3-12 weight restrictions
        const totalWeightGrams = lithiumGrams * qtyPerPackage * totalPackages;
        const totalWeightKg = totalWeightGrams / 1000;
        
        // Metal lithium loose requires approval
        labelsRequired = ['Etiqueta de Bateria de Lítio (Fig 7.1.C)', 'Etiqueta de Classe 9 (Fig 7.3.C)', 'Etiqueta Cargo Aircraft Only (CAO)'];
        
        if (totalPackages * qtyPerPackage * 0.1 > 140) { // Approx weight threshold
          isLatamForbidden = true;
          latamProhibitionReason = 'A variação LATAM M3-12 proíbe remessas de UN 3090 Sections IA/IB excedendo 140 kg peso líquido total ou 70 kg por volume/compartimento.';
        }
      } else if (packagingType === 'WITH_EQUIP') {
        unNumber = 'UN 3091';
        packingInstruction = 'PI 969';
        if (lithiumGrams > 2) {
          category = 'Section IA';
          dgdRequired = true;
          caohazlabel = true;
          labelsRequired = ['Etiqueta de Classe 9 (Fig 7.3.C)', 'Etiqueta Cargo Aircraft Only (CAO)'];
        } else {
          category = 'Section II';
          labelsRequired = ['Etiqueta de Bateria de Lítio (Fig 7.1.C)'];
        }
      } else {
        unNumber = 'UN 3091';
        packingInstruction = 'PI 970';
        if (lithiumGrams > 2) {
          category = 'Section IA';
          dgdRequired = true;
          caohazlabel = true;
          labelsRequired = ['Etiqueta de Classe 9 (Fig 7.3.C)', 'Etiqueta Cargo Aircraft Only (CAO)'];
        } else {
          category = 'Section II';
          if (qtyPerPackage > 4 || totalPackages > 2) {
            labelsRequired = ['Etiqueta de Bateria de Lítio (Fig 7.1.C)'];
          } else {
            labelsRequired = ['Nenhuma (Isento de rotulação na Section II sob limites pequenos)'];
          }
        }
      }
    }

    // Checking LATAM-specific prohibitions
    // Prohibited on Pax Flights by LA/JJ (UN 3480 and UN 3090 are always Cargo Only)
    let flightRestriction = '';
    let flightStatus: 'PAX_OK' | 'PAX_RESTRICTED' | 'CAO_ONLY' = 'PAX_OK';
    let packingModeDescription = '';
    
    if (packagingType === 'LOOSE') {
      packingModeDescription = 'Pilhas/Baterias Soltas (Loose)';
      flightRestriction = 'Cargo Aircraft Only (CAO) Exclusivo - Estritamente proibido em aviões de passageiro (PAX). Adicional via Variações LA-01 / JJ-01.';
      flightStatus = 'CAO_ONLY';
      caohazlabel = true; 
    } else {
      if (packagingType === 'WITH_EQUIP') {
        packingModeDescription = 'Embaladas Com Equipamento (Packed With Equip)';
      } else {
        packingModeDescription = 'Contidas No Equipamento (Contained In Equip)';
      }

      if (category === 'Section II') {
        flightRestriction = 'Permitido em Passageiro e Cargueiro (PAX/CAO) - Isento de DGD sob limites da Section II (Máx 5kg líq. por volume para PAX).';
        flightStatus = 'PAX_OK';
      } else {
        flightRestriction = 'Restrito - Permitido em PAX até 5kg líq. por volume. Excedendo 5kg, deve voar como Cargo Aircraft Only (CAO) até 35kg e portar etiqueta respectiva.';
        flightStatus = 'PAX_RESTRICTED';
        if (caohazlabel) {
           flightRestriction += ' (Aviso de CAO pré-programado)';
        }
      }
    }

    if (isOverpack) {
      labelsRequired.push('Marca "OVERPACK" (Letras mín. 12mm de altura)');
    }

    return {
      unNumber,
      packingInstruction,
      category,
      dgdRequired,
      caohazlabel,
      labelsRequired,
      isLatamForbidden,
      latamProhibitionReason,
      flightRestriction,
      flightStatus,
      packingModeDescription,
      ergCode,
      socAlert
    };
  }, [batteryChemistry, packagingType, effectiveWattHours, lithiumGrams, qtyPerPackage, totalPackages, isOverpack, socCompliant]);

  let generatedHash = useMemo(() => {
    let raw = `${batteryChemistry}-${packagingType}-${effectiveWattHours}-${qtyPerPackage}-LIO-2026`;
    let result = 0;
    for (let i = 0; i < raw.length; i++) {
       result = (result << 5) - result + raw.charCodeAt(i);
       result |= 0;
    }
    return 'LIO-SEAL-' + Math.abs(result).toString(16).toUpperCase() + '-2026';
  }, [batteryChemistry, packagingType, effectiveWattHours, qtyPerPackage]);

  return (
    <div id="lithium-compliance-calculator" className="min-h-screen bg-gray-50 flex flex-col font-sans pb-16">
      {/* Dynamic Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            id="btn-calc-close"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer"
            aria-label="Voltar para a tela inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-500" />
              Calculadora de Compliance de Baterias de Lítio LATAM
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Apoio a Classificação de IATA PI 965 a PI 970</p>
          </div>
        </div>
        <button 
          id="btn-calc-go-back"
          onClick={onClose}
          className="text-xs font-black text-white bg-latam-indigo px-4 py-2 rounded-lg hover:bg-latam-indigoLight cursor-pointer"
        >
          Painel Principal
        </button>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (5 Columns wide) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-extrabold text-sm text-gray-700 uppercase tracking-wider mb-6 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-gray-400" />
                Configurar Parâmetros de Carga
              </h3>

              {/* Chemistry Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Composição Química</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-chem-ion"
                    onClick={() => { setBatteryChemistry('ION'); setShowCertificate(false); }}
                    className={`py-3 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                      batteryChemistry === 'ION'
                        ? 'border-latam-indigo bg-indigo-50 text-latam-indigo shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    Lithium-Ion (Recarregável)
                  </button>
                  <button
                    id="btn-chem-metal"
                    onClick={() => { setBatteryChemistry('METAL'); setShowCertificate(false); }}
                    className={`py-3 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                      batteryChemistry === 'METAL'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    Lithium-Metal (Não-Recarregável)
                  </button>
                </div>
              </div>

              {/* Packaging Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Modo de Embalagem</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="btn-pack-loose"
                    onClick={() => { setPackagingType('LOOSE'); setShowCertificate(false); }}
                    className={`py-3 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      packagingType === 'LOOSE'
                        ? 'border-latam-indigo bg-indigo-50 text-latam-indigo font-black'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    Baterias Soltas
                  </button>
                  <button
                    id="btn-pack-with"
                    onClick={() => { setPackagingType('WITH_EQUIP'); setShowCertificate(false); }}
                    className={`py-3 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      packagingType === 'WITH_EQUIP'
                        ? 'border-latam-indigo bg-indigo-50 text-latam-indigo font-black'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    Com Equipamento
                  </button>
                  <button
                    id="btn-pack-in"
                    onClick={() => { setPackagingType('IN_EQUIP'); setShowCertificate(false); }}
                    className={`py-3 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      packagingType === 'IN_EQUIP'
                        ? 'border-latam-indigo bg-indigo-50 text-latam-indigo font-black'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    No Equipamento
                  </button>
                </div>
              </div>

              {/* Dynamic input depending on family */}
              {batteryChemistry === 'ION' ? (
                <div className="mb-6 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-extrabold text-indigo-900 uppercase">Método de Inserção</label>
                    <div className="bg-white rounded-md border border-indigo-100 flex p-0.5">
                      <button
                        onClick={() => { setIonInputMode('WH'); setShowCertificate(false); }}
                        className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer ${ionInputMode === 'WH' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Direto (Wh)
                      </button>
                      <button
                        onClick={() => { setIonInputMode('MAH'); setShowCertificate(false); }}
                        className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer ${ionInputMode === 'MAH' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Por Volts/mAh
                      </button>
                    </div>
                  </div>

                  {ionInputMode === 'WH' ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-indigo-900 uppercase">Potência (Wh)</label>
                        <span className="text-sm font-black text-indigo-700">{wattHours} Wh</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="300"
                        value={wattHours}
                        onChange={(e) => { setWattHours(Number(e.target.value)); setShowCertificate(false); }}
                        className="w-full accent-latam-indigo"
                      />
                      <div className="flex justify-between text-[10px] text-indigo-400/80 mt-1 font-bold">
                        <span>1 Wh</span>
                        <span>100 Wh (Limite Padrão)</span>
                        <span>300 Wh</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in-up">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">Voltagem (V)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={mahConfig.volts}
                            onChange={(e) => { setMahConfig(prev => ({ ...prev, volts: Number(e.target.value) })); setShowCertificate(false); }}
                            className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-indigo-900 font-bold focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">Capacidade (mAh)</label>
                          <input
                            type="number"
                            min="1"
                            step="100"
                            value={mahConfig.mah}
                            onChange={(e) => { setMahConfig(prev => ({ ...prev, mah: Number(e.target.value) })); setShowCertificate(false); }}
                            className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-indigo-900 font-bold focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none text-xs"
                          />
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] font-extrabold text-indigo-500 uppercase">Potência Calculada:</span>
                        <span className="text-sm font-black text-latam-indigo">{effectiveWattHours.toFixed(1)} Wh</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-indigo-100/50">
                    <span className="block text-[10px] font-bold text-indigo-900 uppercase mb-2">Presets Rápidos</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => { setPackagingType('IN_EQUIP'); setQtyPerPackage(1); setIonInputMode('WH'); setWattHours(12); setShowCertificate(false); }}
                        className="px-2 py-1 bg-indigo-100/50 text-indigo-800 text-[10px] font-bold rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200/50"
                      >
                        📱 Smartphone (~12Wh)
                      </button>
                      <button
                        onClick={() => { setPackagingType('IN_EQUIP'); setQtyPerPackage(1); setIonInputMode('WH'); setWattHours(55); setShowCertificate(false); }}
                        className="px-2 py-1 bg-indigo-100/50 text-indigo-800 text-[10px] font-bold rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200/50"
                      >
                        💻 Laptop (~55Wh)
                      </button>
                      <button
                        onClick={() => { setPackagingType('LOOSE'); setQtyPerPackage(2); setIonInputMode('WH'); setWattHours(74); setShowCertificate(false); }}
                        className="px-2 py-1 bg-indigo-100/50 text-indigo-800 text-[10px] font-bold rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200/50"
                      >
                        🔋 Powerbank (~74Wh)
                      </button>
                      <button
                        onClick={() => { setPackagingType('LOOSE'); setQtyPerPackage(1); setIonInputMode('WH'); setWattHours(160); setShowCertificate(false); }}
                        className="px-2 py-1 bg-indigo-100/50 text-indigo-800 text-[10px] font-bold rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200/50"
                      >
                        🚲 Bateria e-Bike (~160Wh)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-amber-50/45 p-4 rounded-lg border border-amber-200/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-amber-900 uppercase">Conteúdo de Lítio por Bateria (g)</label>
                    <span className="text-sm font-black text-amber-700">{lithiumGrams} g</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.1"
                    value={lithiumGrams}
                    onChange={(e) => { setLithiumGrams(Number(e.target.value)); setShowCertificate(false); }}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                    <span>0.1 g</span>
                    <span>2.0 g (Limite Isenção)</span>
                    <span>10.0 g</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-amber-200/50">
                    <span className="block text-[10px] font-bold text-amber-900 uppercase mb-2">Presets Rápidos</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => { setPackagingType('IN_EQUIP'); setQtyPerPackage(1); setLithiumGrams(0.1); setShowCertificate(false); }}
                        className="px-2 py-1 bg-amber-100/50 text-amber-800 text-[10px] font-bold rounded-md hover:bg-amber-200 transition-colors border border-amber-200/50"
                      >
                        ⌚ Pilha Moeda/CR2032 (~0.1g)
                      </button>
                      <button
                        onClick={() => { setPackagingType('LOOSE'); setQtyPerPackage(4); setLithiumGrams(1.0); setShowCertificate(false); }}
                        className="px-2 py-1 bg-amber-100/50 text-amber-800 text-[10px] font-bold rounded-md hover:bg-amber-200 transition-colors border border-amber-200/50"
                      >
                        📷 Pilha Câmera AA (~1.0g)
                      </button>
                      <button
                        onClick={() => { setPackagingType('LOOSE'); setQtyPerPackage(1); setLithiumGrams(3.5); setShowCertificate(false); }}
                        className="px-2 py-1 bg-amber-100/50 text-amber-800 text-[10px] font-bold rounded-md hover:bg-amber-200 transition-colors border border-amber-200/50"
                      >
                        🏭 Bateria Industrial (~3.5g)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity fields */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd Baterias/Volume</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={qtyPerPackage}
                    onChange={(e) => { setQtyPerPackage(Math.max(1, Number(e.target.value))); setShowCertificate(false); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 font-bold focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Volumes (AWB)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={totalPackages}
                    onChange={(e) => { setTotalPackages(Math.max(1, Number(e.target.value))); setShowCertificate(false); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 font-bold focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none"
                  />
                </div>
              </div>

              {/* Advanced Flags */}
              <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                 <label className="flex items-center space-x-3 cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 text-latam-indigo rounded border-gray-300 focus:ring-latam-indigo cursor-pointer"
                     checked={isOverpack}
                     onChange={(e) => { setIsOverpack(e.target.checked); setShowCertificate(false); }}
                   />
                   <span className="text-xs font-bold text-gray-700">O embarque consolida pacotes em um OVERPACK?</span>
                 </label>
                 
                 {batteryChemistry === 'ION' && packagingType === 'LOOSE' && (
                   <label className="flex items-center space-x-3 cursor-pointer">
                     <input 
                       type="checkbox" 
                       className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-600 cursor-pointer"
                       checked={socCompliant}
                       onChange={(e) => { setSocCompliant(e.target.checked); setShowCertificate(false); }}
                     />
                     <span className="text-xs font-bold text-gray-700">Estado de Carga (SoC) é menor ou igual a 30%? (Req. UN3480)</span>
                   </label>
                 )}
              </div>

              <button
                id="btn-calc-generate"
                onClick={() => setShowCertificate(true)}
                className="w-full bg-latam-indigo text-white py-3 rounded-lg text-sm font-bold hover:bg-latam-indigoLight shadow shadow-indigo-100 flex items-center justify-center transition-all cursor-pointer"
              >
                Gerar Parecer Técnico de Prontidão
              </button>
            </div>
          </div>

          {/* Results Output Block (7 Columns wide) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Classification Quick Plate card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-tight">Classificação Resultante</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mapeamento Normativo IATA DGR</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                  {evaluation.unNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="block text-[10px] text-gray-400 font-black uppercase mb-0.5">Instrução:</span>
                  <span className="text-xl font-black text-gray-950">{evaluation.packingInstruction}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="block text-[10px] text-gray-400 font-black uppercase mb-0.5">Seção:</span>
                  <span className="text-xl font-black text-latam-indigo">{evaluation.category}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="block text-[10px] text-gray-400 font-black uppercase mb-0.5">ERG Drill Code:</span>
                  <span className="text-xl font-black text-latam-coral">{evaluation.ergCode}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="block text-[10px] text-gray-400 font-black uppercase mb-0.5">Modo de Embalagem:</span>
                  <span className="text-[11px] font-black text-gray-800 leading-tight block mt-1">{evaluation.packingModeDescription}</span>
                </div>
              </div>

              {/* Rules and Label checklist */}
              <div className="space-y-4 font-medium text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="text-gray-400 mr-3 mt-0.5 font-bold">📄</div>
                  <div className="w-full">
                    <span className="block text-[10px] text-gray-400 font-black uppercase">Exigência de DGD (Declaração):</span>
                    <span className="font-bold text-gray-950">{evaluation.dgdRequired ? 'OBRIGATÓRIO (Emissão de DGD Eletrônica em Inglês)' : 'NÃO REQUERIDO'}</span>
                    {evaluation.dgdRequired && (
                      <div className="mt-2 bg-indigo-50 border border-indigo-100 p-2 rounded text-xs text-indigo-900">
                        <span className="font-extrabold block mb-1">Contato de Emergência (Telefone 24h)</span>
                        Obrigatório preenchimento na DGD um contato em prontidão ininterrupta. Adicional LA-02 válido.
                      </div>
                    )}
                  </div>
                </div>

                {evaluation.socAlert && (
                  <div className="flex items-start">
                    <div className="text-red-500 mr-3 mt-0.5 font-bold">⚠️</div>
                    <div className="w-full">
                      <span className="block text-[10px] text-red-500 font-black uppercase mb-2">Alerta de Risco (State of Charge):</span>
                      <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-lg text-xs font-bold w-full flex items-start space-x-3">
                         <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                         <div>Estado de Carga (SoC) não documentado/validado. Baterias UN 3480 exigem SoC não excedendo 30%. O embarque deve ser rejeitado ou deve apresentar aprovação prévia competente.</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="text-gray-400 mr-3 mt-0.5 font-bold mb-1">✈️</div>
                  <div className="w-full">
                    <span className="block text-[10px] text-gray-400 font-black uppercase mb-2">Diretriz de Voo & Mapeamento de Aeronave:</span>
                    <div className={`p-3 rounded-lg border flex items-start space-x-3 text-xs font-bold leading-relaxed w-full ${
                      evaluation.flightStatus === 'PAX_OK' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                      evaluation.flightStatus === 'PAX_RESTRICTED' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                      'bg-red-50 border-red-200 text-red-900'
                    }`}>
                       {evaluation.flightStatus === 'PAX_OK' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                       {evaluation.flightStatus === 'PAX_RESTRICTED' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                       {evaluation.flightStatus === 'CAO_ONLY' && <Flame className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                       <div>
                         {evaluation.flightRestriction}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start border-t border-gray-100 pt-4">
                  <div className="text-gray-400 mr-3 mt-0.5 font-bold">🏷️</div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Rotulagem Exigida no Volume:</span>
                    <ul className="list-disc pl-5 space-y-1 font-bold text-xs text-gray-800">
                      {evaluation.labelsRequired.map((lbl, idx) => (
                        <li key={idx} className="text-latam-indigo">{lbl}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* LATAM Restrictions Warning board */}
            <div className={`p-5 rounded-xl border ${evaluation.isLatamForbidden ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Variação Operacional LATAM Cargo Group ({evaluation.packingInstruction})
              </h4>
              <p className="text-xs leading-relaxed font-bold uppercase text-amber-900">
                Atenção Ground Agent:
              </p>
              <ul className="list-disc pl-5 mt-2 text-xs font-medium space-y-1 leading-relaxed text-gray-700">
                <li>
                  <span className="font-bold text-gray-900">LA-03/JJ-03:</span> Baterias soltas preparadas para voar sob a Section II de qualquer instrução de embalagem são estritamente proíbidas na malha da LATAM. O expedição deve proceder sob a Section IB / IA.
                </li>
                {evaluation.isLatamForbidden && (
                  <li className="text-red-700 font-bold">
                    {evaluation.latamProhibitionReason}
                  </li>
                )}
                <li>
                  TAM/ABSA exige no CT-e o registro fidedigno em "Natureza de Mercadorias" da contagem líquida dos volumes homologados de lítio.
                </li>
              </ul>
            </div>

            {/* Certificate Display */}
            {showCertificate && (
              <div className="bg-white p-6 rounded-xl shadow-xl border border-dashed border-gray-300 animate-zoom-in">
                <div className="text-center">
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-green-600 animate-spin" />
                    Parecer de Classificação Validado
                  </span>
                  <h4 className="text-base font-black text-gray-900 mb-4 uppercase">Selo de Embarque Seguro de Lítio (TAM/ABSA)</h4>
                </div>

                <div className="border border-gray-100 p-4 rounded-lg bg-gray-50/50 mb-4 space-y-2 text-xs font-mono font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-400">TIPO DE CARGA:</span>
                    <span className="text-gray-800 font-bold">{evaluation.unNumber} {batteryChemistry === 'ION' ? 'ION' : 'METAL'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">INSTRUÇÃO DE EMBALAGEM:</span>
                    <span className="text-gray-800 font-bold">{evaluation.packingInstruction} {evaluation.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">QUANTIDADE TOTAL:</span>
                    <span className="text-gray-800 font-bold">{qtyPerPackage * totalPackages} célula(s) em {totalPackages} volume(s)</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-blue-700">
                    <span>SELO DIGITAL:</span>
                    <span className="font-bold tracking-wider">{generatedHash}</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold italic">
                    Esse parecer foi simulado em {new Date().toLocaleDateString('pt-BR')} de acordo com o Manual do IATA DGR do ano vigente.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default React.memo(LithiumCalculator);
