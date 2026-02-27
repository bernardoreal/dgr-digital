import React from 'react';

interface HazardLabelProps {
  type: string;
}

const HazardLabel: React.FC<HazardLabelProps> = ({ type }) => {
  // Helper to render the diamond base
  const Diamond = ({ bg, topBg, bottomBg, border = "black", stripePattern }: any) => (
    <>
      {bg && <polygon points="50,2 98,50 50,98 2,50" fill={bg} />}
      {topBg && <polygon points="2,50 50,2 98,50" fill={topBg} />}
      {bottomBg && <polygon points="2,50 98,50 50,98" fill={bottomBg} />}
      {stripePattern && <polygon points="50,2 98,50 50,98 2,50" fill={`url(#${stripePattern})`} />}
      <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke={border} strokeWidth="1.5" />
    </>
  );

  const renderLabel = () => {
    let content: React.ReactNode = null;

    // Common text styles
    const textStyle = { fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 900, textAnchor: 'middle' as const, letterSpacing: '0.5px' };

    // Standard UN Colors
    const cOrange = "#FF6600";
    const cRed = "#E3000F";
    const cGreen = "#007A33";
    const cBlue = "#005bbb";
    const cYellow = "#FFD100";

    // High-Fidelity Symbols
    const flame = (color: string) => (
      <path d="M50,15 C35,35 40,55 50,55 C60,55 65,35 50,15 Z M50,35 C53,42 55,48 50,50 C45,48 47,42 50,35 Z" fill={color} />
    );
    
    const cylinder = (color: string) => (
      <g transform="translate(50, 30) scale(1.2)">
        <rect x="-6" y="-10" width="12" height="25" rx="2" fill={color}/>
        <rect x="-3" y="-13" width="6" height="3" fill={color}/>
        <rect x="-4" y="-15" width="8" height="2" fill={color}/>
      </g>
    );

    const skull = (
      <g transform="translate(50, 30) scale(1.3)">
        <path d="M-8,-6 C-8,-14 8,-14 8,-6 C8,0 5,4 4,8 H-4 C-5,4 -8,0 -8,-6 Z" fill="black"/>
        <rect x="-3" y="8" width="6" height="3" fill="black"/>
        <circle cx="-3" cy="-3" r="2" fill="white"/>
        <circle cx="3" cy="-3" r="2" fill="white"/>
        <path d="M-12,12 L12,-12 M-12,-12 L12,12" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    );

    const oxidizer = (
      <g transform="translate(50, 35) scale(1.2)">
        <circle cx="0" cy="0" r="8" fill="none" stroke="black" strokeWidth="2"/>
        <path d="M0,-8 C-10,-20 -5,-30 0,-35 C5,-30 10,-20 0,-8 Z" fill="black"/>
      </g>
    );

    const trefoil = (
      <g transform="translate(50, 30) scale(1.2)">
        <circle cx="0" cy="0" r="2.5" fill="black"/>
        <path d="M-3,-4 L-8,-12 A12,12 0 0,1 8,-12 L3,-4 A4,4 0 0,0 -3,-4 Z" fill="black"/>
        <path d="M4,2 L12,6 A12,12 0 0,1 4,14 L2,5 A4,4 0 0,0 4,2 Z" fill="black"/>
        <path d="M-4,2 L-12,6 A12,12 0 0,0 -4,14 L-2,5 A4,4 0 0,1 -4,2 Z" fill="black"/>
      </g>
    );

    const corrosive = (
      <g transform="translate(50, 25) scale(1.1)">
        <rect x="-20" y="15" width="15" height="4" fill="white"/>
        <path d="M-15,-5 L-10,10" stroke="white" strokeWidth="2"/>
        <path d="M-12,10 C-15,15 -5,15 -10,10" fill="white"/>
        <path d="M5,15 C5,10 15,10 20,15 C25,20 20,25 10,25 Z" fill="white"/>
        <path d="M15,-5 L10,10" stroke="white" strokeWidth="2"/>
        <path d="M12,10 C15,15 5,15 10,10" fill="white"/>
      </g>
    );

    const biohazard = (
      <g transform="translate(50, 30) scale(1.2)">
        <circle cx="0" cy="0" r="12" fill="none" stroke="black" strokeWidth="1.5"/>
        <path d="M0,-2 v15 M-10,5 a12,12 0 0,0 20,0" fill="none" stroke="black" strokeWidth="2"/>
        <circle cx="0" cy="0" r="3" fill="none" stroke="black" strokeWidth="1.5"/>
      </g>
    );

    const explosion = (
      <g transform="translate(50, 30) scale(1.2)">
        <circle cx="0" cy="0" r="8" fill="black"/>
        <path d="M5,-5 Q10,-10 15,-5" fill="none" stroke="black" strokeWidth="1.5"/>
        <polygon points="15,-5 17,-2 13,-2" fill="black"/>
        <path d="M-12,-12 L-16,-16 M12,-12 L16,-16 M-12,12 L-16,16 M12,12 L16,16 M0,-15 L0,-20 M0,15 L0,20 M-15,0 L-20,0 M15,0 L20,0" stroke="black" strokeWidth="2"/>
      </g>
    );

    switch (type) {
      case 'explosive-1.1':
      case 'explosive-1.4':
      case 'explosive-1.5':
      case 'explosive-1.6':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg={cOrange} />
            {explosion}
            <text {...textStyle} x="50" y="75" fontSize="8">EXPLOSIVE</text>
            <text {...textStyle} x="50" y="92" fontSize="14">1</text>
          </svg>
        );
        break;
      case 'flammable-gas':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg={cRed} border="white" />
            {flame('white')}
            <text {...textStyle} x="50" y="68" fontSize="7" fill="white">FLAMMABLE</text>
            <text {...textStyle} x="50" y="76" fontSize="7" fill="white">GAS</text>
            <text {...textStyle} x="50" y="92" fontSize="14" fill="white">2</text>
          </svg>
        );
        break;
      case 'non-flammable-gas':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg={cGreen} border="white" />
            {cylinder('white')}
            <text {...textStyle} x="50" y="68" fontSize="6" fill="white">NON-FLAMMABLE</text>
            <text {...textStyle} x="50" y="76" fontSize="6" fill="white">NON-TOXIC GAS</text>
            <text {...textStyle} x="50" y="92" fontSize="14" fill="white">2</text>
          </svg>
        );
        break;
      case 'toxic-gas':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg="white" />
            {skull}
            <text {...textStyle} x="50" y="75" fontSize="8">TOXIC GAS</text>
            <text {...textStyle} x="50" y="92" fontSize="14">2</text>
          </svg>
        );
        break;
      case 'flammable-liquid':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg={cRed} border="white" />
            {flame('white')}
            <text {...textStyle} x="50" y="68" fontSize="7" fill="white">FLAMMABLE</text>
            <text {...textStyle} x="50" y="76" fontSize="7" fill="white">LIQUID</text>
            <text {...textStyle} x="50" y="92" fontSize="14" fill="white">3</text>
          </svg>
        );
        break;
      case 'flammable-solid':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <pattern id="red-stripes" width="14.28" height="100" patternUnits="userSpaceOnUse">
                <rect width="7.14" height="100" fill={cRed} />
                <rect x="7.14" width="7.14" height="100" fill="white" />
              </pattern>
            </defs>
            <Diamond stripePattern="red-stripes" />
            {flame('black')}
            <text {...textStyle} x="50" y="68" fontSize="7" fill="black" stroke="white" strokeWidth="0.5">FLAMMABLE</text>
            <text {...textStyle} x="50" y="76" fontSize="7" fill="black" stroke="white" strokeWidth="0.5">SOLID</text>
            <text {...textStyle} x="50" y="92" fontSize="14">4</text>
          </svg>
        );
        break;
      case 'spontaneously-combustible':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond topBg="white" bottomBg={cRed} />
            {flame('black')}
            <text {...textStyle} x="50" y="68" fontSize="6" fill="white">SPONTANEOUSLY</text>
            <text {...textStyle} x="50" y="76" fontSize="6" fill="white">COMBUSTIBLE</text>
            <text {...textStyle} x="50" y="92" fontSize="14" fill="white">4</text>
          </svg>
        );
        break;
      case 'dangerous-when-wet':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg={cBlue} border="white" />
            {flame('white')}
            <text {...textStyle} x="50" y="64" fontSize="6" fill="white">DANGEROUS</text>
            <text {...textStyle} x="50" y="72" fontSize="6" fill="white">WHEN</text>
            <text {...textStyle} x="50" y="80" fontSize="6" fill="white">WET</text>
            <text {...textStyle} x="50" y="92" fontSize="14" fill="white">4</text>
          </svg>
        );
        break;
      case 'oxidizer':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg={cYellow} />
            {oxidizer}
            <text {...textStyle} x="50" y="75" fontSize="8">OXIDIZER</text>
            <text {...textStyle} x="50" y="92" fontSize="14">5.1</text>
          </svg>
        );
        break;
      case 'organic-peroxide':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond topBg={cRed} bottomBg={cYellow} />
            {flame('white')}
            <text {...textStyle} x="50" y="68" fontSize="6">ORGANIC</text>
            <text {...textStyle} x="50" y="76" fontSize="6">PEROXIDE</text>
            <text {...textStyle} x="50" y="92" fontSize="14">5.2</text>
          </svg>
        );
        break;
      case 'toxic':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg="white" />
            {skull}
            <text {...textStyle} x="50" y="75" fontSize="8">TOXIC</text>
            <text {...textStyle} x="50" y="92" fontSize="14">6</text>
          </svg>
        );
        break;
      case 'infectious-substance':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg="white" />
            {biohazard}
            <text {...textStyle} x="50" y="68" fontSize="6">INFECTIOUS</text>
            <text {...textStyle} x="50" y="76" fontSize="6">SUBSTANCE</text>
            <text {...textStyle} x="50" y="92" fontSize="14">6</text>
          </svg>
        );
        break;
      case 'radioactive-i':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg="white" />
            {trefoil}
            <text {...textStyle} x="50" y="75" fontSize="8">RADIOACTIVE I</text>
            <text {...textStyle} x="50" y="92" fontSize="14">7</text>
          </svg>
        );
        break;
      case 'radioactive-ii':
      case 'radioactive-iii':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond topBg={cYellow} bottomBg="white" />
            {trefoil}
            <text {...textStyle} x="50" y="75" fontSize="8">{type === 'radioactive-ii' ? 'RADIOACTIVE II' : 'RADIOACTIVE III'}</text>
            <text {...textStyle} x="50" y="92" fontSize="14">7</text>
          </svg>
        );
        break;
      case 'corrosive':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond topBg="white" bottomBg="black" border="white" />
            {corrosive}
            <text {...textStyle} x="50" y="75" fontSize="8" fill="white">CORROSIVE</text>
            <text {...textStyle} x="50" y="92" fontSize="14" fill="white">8</text>
          </svg>
        );
        break;
      case 'miscellaneous':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <pattern id="black-stripes" width="14.28" height="100" patternUnits="userSpaceOnUse">
                <rect width="7.14" height="100" fill="black" />
                <rect x="7.14" width="7.14" height="100" fill="white" />
              </pattern>
            </defs>
            <Diamond topBg="url(#black-stripes)" bottomBg="white" />
            <text {...textStyle} x="50" y="75" fontSize="8">MISCELLANEOUS</text>
            <text {...textStyle} x="50" y="92" fontSize="14">9</text>
          </svg>
        );
        break;
      case 'environmentally-hazardous':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <Diamond bg="white" />
            <g transform="translate(50, 40) scale(1.2)">
              <path d="M-15,0 L0,-20 L15,0 Z" fill="black"/>
              <path d="M-5,0 v15 h10 v-15 Z" fill="black"/>
              <circle cx="10" cy="10" r="5" fill="black"/>
              <path d="M15,10 l5,-5 v10 z" fill="black"/>
            </g>
          </svg>
        );
        break;
      case 'lithium-battery':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <pattern id="black-stripes-batt" width="14.28" height="100" patternUnits="userSpaceOnUse">
                <rect width="7.14" height="100" fill="black" />
                <rect x="7.14" width="7.14" height="100" fill="white" />
              </pattern>
            </defs>
            <Diamond topBg="url(#black-stripes-batt)" bottomBg="white" />
            <g transform="translate(50, 65) scale(0.8)">
              <rect x="-20" y="-12" width="40" height="24" fill="none" stroke="black" strokeWidth="2"/>
              <rect x="-15" y="-8" width="6" height="16" fill="black"/>
              <rect x="-5" y="-8" width="6" height="16" fill="black"/>
              <rect x="5" y="-8" width="6" height="16" fill="black"/>
              <rect x="15" y="-8" width="6" height="16" fill="black"/>
              <path d="M-25,10 L-10,-15 H-2 L-15,15 Z" fill="black" stroke="white" strokeWidth="1"/>
            </g>
            <text {...textStyle} x="50" y="92" fontSize="14">9</text>
          </svg>
        );
        break;
      case 'cargo-only':
        content = (
          <svg viewBox="0 0 120 80" className="w-full h-full drop-shadow-md">
            <rect x="2" y="2" width="116" height="76" fill={cOrange} stroke="black" strokeWidth="2" />
            <g transform="translate(60, 25) scale(1.2)">
              <path d="M-20,0 h40 m-10,-5 l10,5 l-10,5" stroke="black" strokeWidth="3" fill="none"/>
              <path d="M-15,-5 h15 l5,-5 h5 l-10,5 h10 l2,2 h-30 z" fill="black"/>
            </g>
            <text {...textStyle} x="60" y="55" fontSize="11">CARGO AIRCRAFT ONLY</text>
            <text {...textStyle} x="60" y="68" fontSize="7">FORBIDDEN IN PASSENGER AIRCRAFT</text>
          </svg>
        );
        break;
      case 'orientation':
        content = (
          <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
            <rect x="2" y="2" width="76" height="96" fill="white" stroke={cRed} strokeWidth="4" />
            <g fill={cRed}>
              <path d="M25,40 l15,-20 l15,20 h-10 v35 h-10 v-35 z" />
              <rect x="15" y="80" width="50" height="5" />
            </g>
          </svg>
        );
        break;
      case 'magnetized-material':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <rect x="2" y="2" width="96" height="96" fill={cBlue} stroke="black" strokeWidth="2" />
            <path d="M50,20 a30,30 0 1,0 0,60 a15,15 0 1,1 0,-30 a15,15 0 0,0 0,30" fill="white" />
            <text {...textStyle} x="50" y="80" fontSize="10" fill="white">MAGNETIZED</text>
            <text {...textStyle} x="50" y="92" fontSize="10" fill="white">MATERIAL</text>
          </svg>
        );
        break;
      case 'cryogenic':
        content = (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <rect x="2" y="2" width="96" height="96" fill={cGreen} stroke="black" strokeWidth="2" />
            <g transform="translate(50, 35) scale(1.5)">
              <rect x="-6" y="-10" width="12" height="25" rx="2" fill="white"/>
              <rect x="-3" y="-13" width="6" height="3" fill="white"/>
              <rect x="-4" y="-15" width="8" height="2" fill="white"/>
            </g>
            <text {...textStyle} x="50" y="80" fontSize="10" fill="white">CRYOGENIC</text>
            <text {...textStyle} x="50" y="92" fontSize="10" fill="white">LIQUID</text>
          </svg>
        );
        break;
      default:
        content = (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center text-[10px] font-bold text-gray-500 text-center p-2">
            {type.replace('-', ' ').toUpperCase()}
          </div>
        );
    }

    return content;
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      {renderLabel()}
    </div>
  );
};

export default HazardLabel;
