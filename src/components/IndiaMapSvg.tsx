import React from 'react';
import indiaMapData from '../data/india-map-data.json';

type StateMeta = {
  code: string;
  name: string;
};

type IndiaMapSvgProps = {
  activeCode?: string | null;
  hoveredCode?: string | null;
  filteredCodes?: string[] | null;
  stateMeta?: StateMeta[];
  onSelect?: (code: string) => void;
  onHover?: (code: string | null) => void;
  onLeave?: () => void;
  className?: string;
};

const SHORT_NAMES: Record<string, string> = {
  'Andaman and Nicobar Islands': 'AN',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY',
  'Chandigarh': 'CH',
  'Chhattisgarh': 'CG',
  'Arunachal Pradesh': 'AR',
  'Andhra Pradesh': 'AP',
  'Madhya Pradesh': 'MP',
  'Tamil Nadu': 'TN',
  'Uttar Pradesh': 'UP',
  'West Bengal': 'WB',
  'Uttarakhand': 'UK',
  'Himachal Pradesh': 'HP',
  'Jammu and Kashmir': 'J&K',
  'Telangana': 'TG',
  'Delhi': 'DL',
  'Sikkim': 'SK',
  'Goa': 'GA',
};

export function IndiaMapSvg({
  activeCode,
  hoveredCode,
  filteredCodes,
  onSelect,
  onHover,
  onLeave,
  className
}: IndiaMapSvgProps) {
  const isFiltered = filteredCodes && filteredCodes.length > 0;

  return (
    <svg
      viewBox={indiaMapData.viewBox}
      className={`w-full h-auto ${className ?? ''}`}
      role="img"
      aria-label="Map of India"
      preserveAspectRatio="xMidYMid meet"
      onPointerLeave={onLeave}
      style={{ touchAction: 'manipulation' }}
    >
      <g>
        {indiaMapData.locations.map((loc: any) => {
          const { code, name, path, centroid } = loc;
          const isActive = activeCode === code;
          const isHovered = hoveredCode === code;
          const isMatch = !isFiltered || (filteredCodes && filteredCodes.includes(code));

          return (
            <React.Fragment key={code}>
              <path
                d={path}
                data-code={code}
                className={`cursor-pointer stroke-white transition-all duration-300 ${isActive
                  ? 'fill-blue-600'
                  : isHovered
                    ? 'fill-blue-400'
                    : 'fill-blue-200'
                  } ${!isMatch ? 'opacity-20 grayscale-[0.5]' : 'opacity-100'}`}
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
                onClick={() => onSelect?.(code)}
                onPointerEnter={() => onHover?.(code)}
                role="button"
                tabIndex={0}
                aria-label={name || code}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect?.(code);
                  }
                }}
              >
                {name && <title>{name}</title>}
              </path>
              {centroid && isMatch && (
                <text
                  x={centroid.x}
                  y={centroid.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  className="fill-slate-800 font-bold select-none tracking-tighter transition-opacity duration-300"
                  style={{ fontSize: '6px' }}
                >
                  {SHORT_NAMES[name] || name}
                </text>
              )}
            </React.Fragment>
          );
        })}
      </g>
    </svg>
  );
}
