import React from 'react';

interface HazardLabelProps {
  type: string;
}

const HazardLabel: React.FC<HazardLabelProps> = ({ type }) => {
  const renderLabel = () => {
    let bg = <polygon points="50,2 98,50 50,98 2,50" fill="white" />;
    let border = <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="black" strokeWidth="1.5" />;
    let symbol = null;
    let text = "";
    let number = "";
    let textColor = "black";
    let numberColor = "black";

    const flameWhite = <path d="M50,12 c-5,10 -15,15 -15,25 c0,10 8,15 15,15 c7,0 15,-5 15,-15 c0,-10 -10,-15 -15,-25 z M50,25 c3,5 5,8 5,12 c0,3 -2,5 -5,5 c-3,0 -5,-2 -5,-5 c0,-4 2,-7 5,-12 z" fill="white" />;
    const flameBlack = <path d="M50,12 c-5,10 -15,15 -15,25 c0,10 8,15 15,15 c7,0 15,-5 15,-15 c0,-10 -10,-15 -15,-25 z M50,25 c3,5 5,8 5,12 c0,3 -2,5 -5,5 c-3,0 -5,-2 -5,-5 c0,-4 2,-7 5,-12 z" fill="black" />;
    const explosion = <g fill="black"><circle cx="50" cy="35" r="8"/><path d="M50,15 l2,10 l-4,0 z M65,20 l-8,6 l2,-4 z M35,20 l8,6 l-2,-4 z M70,35 l-10,2 l0,-4 z M30,35 l10,2 l0,-4 z M65,50 l-8,-6 l2,4 z M35,50 l8,-6 l-2,4 z M50,55 l2,-10 l-4,0 z"/></g>;
    const cylinderWhite = <path d="M40,15 h20 v5 h-20 z M35,20 h30 v30 h-30 z M45,10 h10 v5 h-10 z" fill="white" />;
    const cylinderBlack = <path d="M40,15 h20 v5 h-20 z M35,20 h30 v30 h-30 z M45,10 h10 v5 h-10 z" fill="black" />;
    const skull = <g fill="black"><circle cx="50" cy="25" r="10"/><path d="M45,35 h10 v5 h-10 z M30,45 l15,-10 l5,5 l-15,10 z M70,45 l-15,-10 l-5,5 l15,10 z M30,15 l15,10 l5,-5 l-15,-10 z M70,15 l-15,10 l-5,-5 l15,-10 z"/></g>;
    const oxidizer = <g fill="black"><circle cx="50" cy="35" r="10" fill="none" stroke="black" strokeWidth="3"/><path d="M50,15 c-3,5 -8,8 -8,12 c0,5 4,8 8,8 c4,0 8,-3 8,-8 c0,-4 -5,-7 -8,-12 z"/></g>;
    const biohazard = <g fill="black" stroke="black" strokeWidth="2"><circle cx="50" cy="30" r="12" fill="none"/><circle cx="40" cy="45" r="12" fill="none"/><circle cx="60" cy="45" r="12" fill="none"/><circle cx="50" cy="38" r="4"/></g>;
    const trefoil = <g fill="black"><circle cx="50" cy="30" r="4"/><path d="M50,24 l-8,-12 a20,20 0 0,1 16,0 z M44,34 l-12,8 a20,20 0 0,1 -4,-15 z M56,34 l12,8 a20,20 0 0,0 4,-15 z"/></g>;
    const corrosive = <g><path d="M20,20 h60 v30 h-60 z" fill="white"/><path d="M20,50 h60 v30 h-60 z" fill="black"/><path d="M30,30 l5,15 h-10 z M70,30 l5,15 h-10 z" fill="black"/><path d="M30,45 c-5,10 10,10 5,20 M70,45 c-5,10 10,10 5,20" stroke="white" strokeWidth="2" fill="none"/></g>;

    switch (type) {
      case 'explosive-1.1':
      case 'explosive-1.4':
      case 'explosive-1.5':
      case 'explosive-1.6':
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="#FF8C00" />;
        symbol = explosion;
        text = "EXPLOSIVES";
        number = "1";
        break;
      case 'flammable-gas':
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="#E70000" />;
        symbol = flameWhite;
        text = "FLAMMABLE GAS";
        number = "2";
        textColor = "white";
        numberColor = "white";
        border = <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="white" strokeWidth="1.5" />;
        break;
      case 'non-flammable-gas':
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="#28A745" />;
        symbol = cylinderWhite;
        text = "NON-FLAMMABLE GAS";
        number = "2";
        textColor = "white";
        numberColor = "white";
        border = <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="white" strokeWidth="1.5" />;
        break;
      case 'toxic-gas':
        symbol = skull;
        text = "TOXIC GAS";
        number = "2";
        break;
      case 'flammable-liquid':
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="#E70000" />;
        symbol = flameWhite;
        text = "FLAMMABLE LIQUID";
        number = "3";
        textColor = "white";
        numberColor = "white";
        border = <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="white" strokeWidth="1.5" />;
        break;
      case 'flammable-solid':
        bg = <g>
          <polygon points="50,2 98,50 50,98 2,50" fill="white" />
          <path d="M50,2 L98,50 L50,98 L2,50 Z" fill="url(#red-stripes)" />
        </g>;
        symbol = flameBlack;
        text = "FLAMMABLE SOLID";
        number = "4";
        break;
      case 'spontaneously-combustible':
        bg = <g>
          <polygon points="50,2 98,50 2,50" fill="white" />
          <polygon points="2,50 98,50 50,98" fill="#E70000" />
        </g>;
        symbol = flameBlack;
        text = "SPONTANEOUSLY COMBUSTIBLE";
        number = "4";
        break;
      case 'dangerous-when-wet':
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="#0052A4" />;
        symbol = flameWhite;
        text = "DANGEROUS WHEN WET";
        number = "4";
        textColor = "white";
        numberColor = "white";
        border = <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="white" strokeWidth="1.5" />;
        break;
      case 'oxidizer':
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="#FFD700" />;
        symbol = oxidizer;
        text = "OXIDIZER";
        number = "5.1";
        break;
      case 'organic-peroxide':
        bg = <g>
          <polygon points="50,2 98,50 2,50" fill="#E70000" />
          <polygon points="2,50 98,50 50,98" fill="#FFD700" />
        </g>;
        symbol = flameWhite;
        text = "ORGANIC PEROXIDE";
        number = "5.2";
        break;
      case 'toxic':
        symbol = skull;
        text = "TOXIC";
        number = "6";
        break;
      case 'infectious-substance':
        symbol = biohazard;
        text = "INFECTIOUS SUBSTANCE";
        number = "6";
        break;
      case 'radioactive-i':
        symbol = trefoil;
        text = "RADIOACTIVE I";
        number = "7";
        break;
      case 'radioactive-ii':
      case 'radioactive-iii':
        bg = <g>
          <polygon points="50,2 98,50 2,50" fill="#FFD700" />
          <polygon points="2,50 98,50 50,98" fill="white" />
        </g>;
        symbol = trefoil;
        text = type === 'radioactive-ii' ? "RADIOACTIVE II" : "RADIOACTIVE III";
        number = "7";
        break;
      case 'corrosive':
        bg = <g>
          <polygon points="50,2 98,50 2,50" fill="white" />
          <polygon points="2,50 98,50 50,98" fill="black" />
        </g>;
        symbol = corrosive;
        text = "CORROSIVE";
        number = "8";
        textColor = "white";
        numberColor = "white";
        border = <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="white" strokeWidth="1.5" />;
        break;
      case 'miscellaneous':
        bg = <g>
          <polygon points="50,2 98,50 50,98 2,50" fill="white" />
          <path d="M50,2 L98,50 L2,50 Z" fill="url(#black-stripes)" />
        </g>;
        text = "MISCELLANEOUS";
        number = "9";
        break;
      case 'cargo-only':
        // Handling label: Rectangle, orange background, black text and symbol
        return (
          <svg viewBox="0 0 120 80" className="w-full h-full drop-shadow-sm">
            <rect x="2" y="2" width="116" height="76" fill="#FF8C00" stroke="black" strokeWidth="2" />
            <text x="60" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="black">CARGO</text>
            <text x="60" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill="black">AIRCRAFT</text>
            <text x="60" y="70" textAnchor="middle" fontSize="16" fontWeight="bold" fill="black">ONLY</text>
          </svg>
        );
      case 'orientation':
        // Handling label: Rectangle, red border, arrows
        return (
          <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-sm">
            <rect x="2" y="2" width="76" height="96" fill="white" stroke="red" strokeWidth="4" />
            <path d="M40,15 l20,20 h-10 v50 h-20 v-50 h-10 z" fill="red" />
            <path d="M20,85 h40" stroke="red" strokeWidth="4" />
          </svg>
        );
      case 'magnetized-material':
        // Handling label: Rectangle, blue background
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <rect x="2" y="2" width="96" height="96" fill="#0052A4" stroke="black" strokeWidth="2" />
            <path d="M50,20 a30,30 0 1,0 0,60 a15,15 0 1,1 0,-30 a15,15 0 0,0 0,30" fill="white" />
            <text x="50" y="80" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">MAGNETIZED</text>
            <text x="50" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">MATERIAL</text>
          </svg>
        );
      case 'lithium-battery':
        // Handling label: Rectangle, red dashed border
        return (
          <svg viewBox="0 0 120 80" className="w-full h-full drop-shadow-sm">
            <rect x="2" y="2" width="116" height="76" fill="white" stroke="red" strokeWidth="4" strokeDasharray="8,4" />
            <rect x="20" y="15" width="80" height="30" fill="black" />
            <rect x="25" y="20" width="70" height="20" fill="white" />
            <path d="M30,30 h15 l5,-5 v-5 h10 v5 l5,5 h15 l5,-15 h-60 z" fill="red" />
            <text x="60" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black">LITHIUM BATTERY</text>
          </svg>
        );
      case 'cryogenic':
        // Handling label: Rectangle, green background
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <rect x="2" y="2" width="96" height="96" fill="#28A745" stroke="black" strokeWidth="2" />
            <path d="M50,15 L20,45 L50,75 L80,45 Z" fill="white" />
            <text x="50" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">CRYOGENIC</text>
            <text x="50" y="95" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">LIQUID</text>
          </svg>
        );
      case 'environmentally-hazardous':
        // Diamond, white background, dead tree and fish
        bg = <polygon points="50,2 98,50 50,98 2,50" fill="white" />;
        symbol = <g fill="black"><path d="M30,40 l5,-15 l5,15 z M70,40 l-5,-15 l-5,15 z M20,50 h60 v5 h-60 z"/></g>;
        text = "";
        number = "";
        break;
      default:
        return <div className="w-full h-full bg-gray-200 border border-black flex items-center justify-center text-xs text-center p-2">{type.replace('-', ' ')}</div>;
    }

    // Split text into lines if it's too long
    const words = text.split(' ');
    let line1 = text;
    let line2 = "";
    if (words.length > 1 && text.length > 12) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(' ');
      line2 = words.slice(mid).join(' ');
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <defs>
          <pattern id="red-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
            <rect width="5" height="10" fill="#E70000" />
          </pattern>
          <pattern id="black-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
            <rect width="5" height="10" fill="black" />
          </pattern>
        </defs>
        {bg}
        {border}
        {symbol}
        {line2 ? (
          <>
            <text x="50" y="65" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} fontFamily="Arial, sans-serif">{line1}</text>
            <text x="50" y="73" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} fontFamily="Arial, sans-serif">{line2}</text>
          </>
        ) : (
          <text x="50" y="70" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor} fontFamily="Arial, sans-serif">{line1}</text>
        )}
        <text x="50" y="92" textAnchor="middle" fontSize="14" fontWeight="bold" fill={numberColor} fontFamily="Arial, sans-serif">{number}</text>
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {renderLabel()}
    </div>
  );
};

export default HazardLabel;
