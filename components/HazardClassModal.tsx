import React from 'react';
import { X, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import HazardLabel from './HazardLabel';

interface HazardClassDetails {
  title: string;
  classNumber: string;
  description: string;
  precautions: string[];
}

const HAZARD_DETAILS: Record<string, HazardClassDetails> = {
  'explosive-1.1': {
    title: 'Explosives - Mass Explosion Hazard',
    classNumber: '1.1',
    description: 'Substances and articles which have a mass explosion hazard (a mass explosion is one which affects almost the entire load virtually instantaneously).',
    precautions: ['Keep away from heat, sparks, and open flames.', 'Handle with extreme care.', 'Protect from shock and friction.']
  },
  'explosive-1.4': {
    title: 'Explosives - Minor Explosion Hazard',
    classNumber: '1.4',
    description: 'Substances and articles which present no significant hazard. The explosive effects are largely confined to the package and no projection of fragments of appreciable size or range is to be expected.',
    precautions: ['Keep away from heat and fire.', 'Handle carefully to avoid package damage.']
  },
  'explosive-1.5': {
    title: 'Very Insensitive Explosives',
    classNumber: '1.5',
    description: 'Very insensitive substances which have a mass explosion hazard but are so insensitive that there is very little probability of initiation or of transition from burning to detonation under normal conditions of transport.',
    precautions: ['Keep away from strong heat sources.', 'Avoid shock and friction.']
  },
  'explosive-1.6': {
    title: 'Extremely Insensitive Articles',
    classNumber: '1.6',
    description: 'Extremely insensitive articles which do not have a mass explosion hazard. This division comprises articles which contain only extremely insensitive detonating substances.',
    precautions: ['Standard explosive handling precautions apply.']
  },
  'flammable-gas': {
    title: 'Flammable Gases',
    classNumber: '2.1',
    description: 'Gases which at 20°C and a standard pressure of 101.3 kPa are ignitable when in a mixture of 13% or less by volume with air, or have a flammable range with air of at least 12 percentage points regardless of the lower flammable limit.',
    precautions: ['Keep away from ignition sources.', 'Ensure adequate ventilation.', 'Store in cool areas.']
  },
  'non-flammable-gas': {
    title: 'Non-Flammable, Non-Toxic Gases',
    classNumber: '2.2',
    description: 'Gases which are asphyxiant (gases which dilute or replace the oxygen normally in the atmosphere) or oxidizing (gases which may, generally by providing oxygen, cause or contribute to the combustion of other material more than air does).',
    precautions: ['Store in well-ventilated areas.', 'Protect cylinders from physical damage.', 'Beware of asphyxiation risk in confined spaces.']
  },
  'toxic-gas': {
    title: 'Toxic Gases',
    classNumber: '2.3',
    description: 'Gases which are known to be so toxic or corrosive to humans as to pose a hazard to health, or are presumed to be toxic or corrosive to humans because they have an LC50 value equal to or less than 5,000 ml/m3 (ppm).',
    precautions: ['Use appropriate PPE (respirators).', 'Ensure excellent ventilation.', 'Avoid any inhalation.']
  },
  'flammable-liquid': {
    title: 'Flammable Liquids',
    classNumber: '3',
    description: 'Liquids, or mixtures of liquids, or liquids containing solids in solution or suspension which give off a flammable vapour at temperatures of not more than 60°C, closed-cup test, or not more than 65.6°C, open-cup test.',
    precautions: ['Keep away from heat, sparks, and open flames.', 'Keep containers tightly closed.', 'Ground/bond containers when transferring material.']
  },
  'flammable-solid': {
    title: 'Flammable Solids',
    classNumber: '4.1',
    description: 'Solids which, under conditions encountered in transport, are readily combustible or may cause or contribute to fire through friction; self-reactive substances which are liable to undergo a strongly exothermic reaction; solid desensitized explosives.',
    precautions: ['Keep away from heat and ignition sources.', 'Protect from friction and impact.']
  },
  'spontaneously-combustible': {
    title: 'Substances Liable to Spontaneous Combustion',
    classNumber: '4.2',
    description: 'Substances which are liable to spontaneous heating under normal conditions encountered in transport, or to heating up in contact with air, and being then liable to catch fire.',
    precautions: ['Store in cool, well-ventilated places.', 'Keep away from air if pyrophoric.']
  },
  'dangerous-when-wet': {
    title: 'Substances which, in Contact with Water, Emit Flammable Gases',
    classNumber: '4.3',
    description: 'Substances which, by interaction with water, are liable to become spontaneously flammable or to give off flammable gases in dangerous quantities.',
    precautions: ['Keep strictly dry.', 'Protect from moisture and rain.', 'Do not use water for firefighting.']
  },
  'oxidizer': {
    title: 'Oxidizing Substances',
    classNumber: '5.1',
    description: 'Substances which, while in themselves not necessarily combustible, may, generally by yielding oxygen, cause, or contribute to, the combustion of other material.',
    precautions: ['Keep away from combustible and flammable materials.', 'Store in cool, dry areas.', 'Avoid friction and impact.']
  },
  'organic-peroxide': {
    title: 'Organic Peroxides',
    classNumber: '5.2',
    description: 'Organic substances which contain the bivalent -O-O- structure and may be considered derivatives of hydrogen peroxide, where one or both of the hydrogen atoms have been replaced by organic radicals.',
    precautions: ['Keep away from heat and direct sunlight.', 'Store away from other dangerous goods.', 'Strict temperature control may be required.']
  },
  'toxic': {
    title: 'Toxic Substances',
    classNumber: '6.1',
    description: 'Substances liable either to cause death or serious injury or to harm human health if swallowed or inhaled or by skin contact.',
    precautions: ['Avoid all contact with skin, eyes, and clothing.', 'Do not inhale dust/fumes/vapors.', 'Wash thoroughly after handling.']
  },
  'infectious-substance': {
    title: 'Infectious Substances',
    classNumber: '6.2',
    description: 'Substances which are known or are reasonably expected to contain pathogens. Pathogens are defined as microorganisms (including bacteria, viruses, rickettsiae, parasites, fungi) and other agents such as prions, which can cause disease in humans or animals.',
    precautions: ['Handle with extreme care.', 'Use appropriate PPE.', 'Follow strict decontamination procedures in case of spill.']
  },
  'radioactive-i': {
    title: 'Radioactive Material - Category I-White',
    classNumber: '7',
    description: 'Radioactive material with a maximum radiation level at any point on the external surface of the package not exceeding 0.005 mSv/h (0.5 mrem/h). Transport Index (TI) is 0.',
    precautions: ['Minimize time spent near the package.', 'Maintain distance when possible.']
  },
  'radioactive-ii': {
    title: 'Radioactive Material - Category II-Yellow',
    classNumber: '7',
    description: 'Radioactive material with a maximum radiation level at any point on the external surface of the package greater than 0.005 mSv/h but not exceeding 0.5 mSv/h. Transport Index (TI) is greater than 0 but not more than 1.0.',
    precautions: ['Minimize time spent near the package.', 'Maintain distance.', 'Observe segregation distances from persons and undeveloped film.']
  },
  'radioactive-iii': {
    title: 'Radioactive Material - Category III-Yellow',
    classNumber: '7',
    description: 'Radioactive material with a maximum radiation level at any point on the external surface of the package greater than 0.5 mSv/h but not exceeding 2 mSv/h. Transport Index (TI) is greater than 1.0 but not more than 10.',
    precautions: ['Minimize time spent near the package.', 'Maintain strict distance.', 'Observe segregation distances from persons and undeveloped film.']
  },
  'corrosive': {
    title: 'Corrosive Substances',
    classNumber: '8',
    description: 'Substances which, by chemical action, will cause severe damage when in contact with living tissue, or, in the case of leakage, will materially damage, or even destroy, other goods or the means of transport.',
    precautions: ['Avoid all contact with skin and eyes.', 'Wear protective clothing, gloves, and eye/face protection.', 'Keep away from incompatible materials (e.g., acids away from bases).']
  },
  'miscellaneous': {
    title: 'Miscellaneous Dangerous Goods',
    classNumber: '9',
    description: 'Substances and articles which, during transport, present a danger not covered by other classes. This includes environmentally hazardous substances, elevated temperature substances, and lithium batteries.',
    precautions: ['Follow specific handling instructions based on the exact substance.', 'Ensure proper packaging and securing.']
  },
  'environmentally-hazardous': {
    title: 'Environmentally Hazardous Substances',
    classNumber: '9',
    description: 'Substances which are hazardous to the aquatic environment (marine pollutants).',
    precautions: ['Prevent release to the environment.', 'Contain spills immediately.']
  },
  'lithium-battery': {
    title: 'Lithium Batteries',
    classNumber: '9',
    description: 'Lithium metal or lithium ion batteries. They present a risk of fire and explosion if damaged, short-circuited, or overcharged.',
    precautions: ['Protect from physical damage.', 'Do not load if package is damaged.', 'Keep away from extreme heat.']
  },
  'cargo-only': {
    title: 'Cargo Aircraft Only (CAO)',
    classNumber: 'Handling',
    description: 'Indicates that the package containing dangerous goods must only be loaded on a cargo aircraft and is forbidden on passenger aircraft.',
    precautions: ['Do not load on passenger aircraft.', 'Ensure proper segregation and accessibility on the cargo aircraft.']
  },
  'orientation': {
    title: 'Package Orientation (This Way Up)',
    classNumber: 'Handling',
    description: 'Indicates the correct upright position of the package. Must be applied on two opposite vertical sides of the package.',
    precautions: ['Always keep the package upright as indicated by the arrows.', 'Do not invert or lay on its side.']
  },
  'magnetized-material': {
    title: 'Magnetized Material',
    classNumber: '9',
    description: 'Any material which, when packed for air transport, has a magnetic field strength of 0.159 A/m (0.002 gauss) or more at a distance of 2.1 m from any point on the surface of the assembled package.',
    precautions: ['Keep away from aircraft compasses and sensitive navigation equipment.', 'Follow specific loading instructions.']
  },
  'cryogenic': {
    title: 'Cryogenic Liquid',
    classNumber: '2.2',
    description: 'Refrigerated liquefied gases. They present hazards of extreme cold (frostbite) and asphyxiation due to rapid expansion when vaporizing.',
    precautions: ['Wear cryogenic gloves and face shield.', 'Keep upright.', 'Ensure excellent ventilation.']
  }
};

interface HazardClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazardType: string | null;
}

const HazardClassModal: React.FC<HazardClassModalProps> = ({ isOpen, onClose, hazardType }) => {
  if (!isOpen || !hazardType) return null;

  const details = HAZARD_DETAILS[hazardType] || {
    title: hazardType.replace('-', ' ').toUpperCase(),
    classNumber: 'N/A',
    description: 'No detailed description available for this hazard type.',
    precautions: ['Handle with care according to standard dangerous goods procedures.']
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-latam-indigo to-[#2e1065] p-5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-latam-coral" />
            <h2 className="text-xl font-bold tracking-tight">Detalhes da Classe de Risco</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Label Visual */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-inner">
              <div className="w-40 h-40 flex items-center justify-center">
                <HazardLabel type={hazardType} />
              </div>
              <div className="mt-4 text-center">
                <span className="inline-block px-3 py-1 bg-latam-indigo/10 text-latam-indigo font-bold rounded-full text-sm">
                  Classe {details.classNumber}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="w-full md:w-2/3 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{details.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {details.description}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="flex items-center text-yellow-800 font-bold mb-3 text-sm uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Precauções de Manuseio
                </h4>
                <ul className="space-y-2">
                  {details.precautions.map((precaution, idx) => (
                    <li key={idx} className="flex items-start text-sm text-yellow-900/80">
                      <span className="mr-2 mt-1 text-yellow-500">•</span>
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazardClassModal;
