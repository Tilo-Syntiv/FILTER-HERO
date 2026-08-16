/**
 * Labeled sample filter diagram so shoppers understand Width, Length, and Depth
 * before measuring their own filter (Filter King–style education).
 */
export default function FilterSizeDiagram() {
  return (
    <div className="w-full max-w-md mx-auto">
      <svg
        viewBox="0 0 420 320"
        className="w-full h-auto"
        role="img"
        aria-label="Sample air filter showing width, length, and depth measurements"
      >
        <defs>
          <linearGradient id="filterFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8edf4" />
            <stop offset="55%" stopColor="#b8cce0" />
            <stop offset="100%" stopColor="#8eb0d8" />
          </linearGradient>
          <linearGradient id="filterEdge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#203868" />
            <stop offset="100%" stopColor="#141e30" />
          </linearGradient>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="210" cy="278" rx="130" ry="14" fill="#203868" opacity="0.08" />

        {/* 3D filter body */}
        {/* Top face (foreshortened) */}
        <path
          d="M90 95 L250 55 L340 95 L180 145 Z"
          fill="url(#filterEdge)"
          opacity="0.85"
        />
        {/* Right edge (depth) */}
        <path
          d="M340 95 L340 195 L180 245 L180 145 Z"
          fill="#141e30"
        />
        {/* Front face */}
        <path
          d="M90 95 L180 145 L180 245 L90 195 Z"
          fill="url(#filterFace)"
          stroke="#203868"
          strokeWidth="2"
        />
        {/* Pleat lines on front */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x1 = 102 + i * 10;
          const y1 = 108 + i * 5.5;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x1 + 78}
              y2={y1 + 44}
              stroke="#203868"
              strokeWidth="1.5"
              opacity="0.35"
            />
          );
        })}
        {/* Frame outline accent */}
        <path
          d="M90 95 L180 145 L180 245 L90 195 Z"
          fill="none"
          stroke="#203868"
          strokeWidth="3"
        />

        {/* WIDTH label — along bottom of front face */}
        <line x1="95" y1="255" x2="175" y2="255" stroke="#203868" strokeWidth="2" />
        <polygon points="95,255 102,251 102,259" fill="#203868" />
        <polygon points="175,255 168,251 168,259" fill="#203868" />
        <rect x="108" y="262" width="54" height="22" rx="4" fill="#203868" />
        <text
          x="135"
          y="277"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Plus Jakarta Sans, Manrope, sans-serif"
          fontSize="12"
          fontWeight="700"
        >
          Width
        </text>

        {/* LENGTH label — along left/vertical of front face */}
        <line x1="72" y1="105" x2="72" y2="185" stroke="#203868" strokeWidth="2" />
        <polygon points="72,105 68,112 76,112" fill="#203868" />
        <polygon points="72,185 68,178 76,178" fill="#203868" />
        <rect x="18" y="132" width="42" height="28" rx="4" fill="#203868" />
        <text
          x="39"
          y="150"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Plus Jakarta Sans, Manrope, sans-serif"
          fontSize="11"
          fontWeight="700"
        >
          Length
        </text>

        {/* DEPTH label — along thickness edge */}
        <line x1="300" y1="120" x2="355" y2="148" stroke="#8eb0d8" strokeWidth="2.5" />
        <polygon points="300,120 308,120 304,128" fill="#8eb0d8" />
        <polygon points="355,148 348,142 347,151" fill="#8eb0d8" />
        <rect x="318" y="155" width="52" height="22" rx="4" fill="#8eb0d8" />
        <text
          x="344"
          y="170"
          textAnchor="middle"
          fill="#141e30"
          fontFamily="Plus Jakarta Sans, Manrope, sans-serif"
          fontSize="12"
          fontWeight="700"
        >
          Depth
        </text>

        {/* Caption */}
        <text
          x="210"
          y="308"
          textAnchor="middle"
          fill="#4a5f7a"
          fontFamily="Manrope, sans-serif"
          fontSize="11"
        >
          Sample filter — measure your existing filter the same way
        </text>
      </svg>
    </div>
  );
}
