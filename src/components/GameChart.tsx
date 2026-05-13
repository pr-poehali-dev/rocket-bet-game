import { useEffect, useState } from 'react';

interface GameChartProps {
  multiplier: number;
  phase: 'waiting' | 'flying' | 'crashed';
  crashAt: number;
}

export default function GameChart({ multiplier, phase, crashAt }: GameChartProps) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([{ x: 0, y: 100 }]);

  useEffect(() => {
    if (phase === 'waiting') {
      setPoints([{ x: 0, y: 100 }]);
      return;
    }
    const progress = Math.min((multiplier - 1) / Math.max(crashAt - 1, 0.01), 1);
    const x = progress * 95;
    const y = 100 - Math.pow(progress, 0.65) * 88;
    setPoints(prev => {
      const last = prev[prev.length - 1];
      if (Math.abs(last.x - x) < 0.2) return prev;
      return [...prev.slice(-120), { x, y }];
    });
  }, [multiplier, phase, crashAt]);

  const toPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const toFill = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    const last = pts[pts.length - 1];
    return toPath(pts) + ` L ${last.x} 100 L 0 100 Z`;
  };

  const tip = points[points.length - 1];
  const crashed = phase === 'crashed';
  const lineColor = crashed ? '#ef4444' : phase === 'flying' ? '#22c55e' : '#eab308';

  // label positioning: keep it inside the SVG box
  const labelX = Math.min(Math.max(tip.x, 10), 82);
  const labelY = Math.max(tip.y - 7, 8);

  return (
    <div className="relative w-full h-full select-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[25, 50, 75].map(v => (
          <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v}
            stroke="hsl(220 14% 16%)" strokeWidth="0.3" strokeDasharray="1,2" />
        ))}
        {[25, 50, 75].map(v => (
          <line key={`g${v}`} x1={v} y1="0" x2={v} y2="100"
            stroke="hsl(220 14% 16%)" strokeWidth="0.3" strokeDasharray="1,2" />
        ))}

        {/* Fill */}
        <path d={toFill(points)} fill="url(#fillGrad)" />

        {/* Curve */}
        <path
          d={toPath(points)}
          fill="none"
          stroke={lineColor}
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Tip dot + pulse */}
        {phase !== 'waiting' && (
          <g transform={`translate(${tip.x}, ${tip.y})`}>
            <circle r="2.5" fill={lineColor} opacity="0.25">
              {!crashed && (
                <>
                  <animate attributeName="r" values="2.5;5;2.5" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="1.4s" repeatCount="indefinite" />
                </>
              )}
            </circle>
            <circle r="1.6" fill={lineColor} />
          </g>
        )}

        {/* Multiplier label pinned to tip — inside SVG so it follows the curve */}
        {phase === 'flying' && (
          <g transform={`translate(${labelX}, ${labelY})`} style={{ pointerEvents: 'none' }}>
            {/* background pill */}
            <rect
              x="-9" y="-5.5" width="18" height="8"
              rx="2" ry="2"
              fill="hsl(220 14% 9%)"
              stroke={lineColor}
              strokeWidth="0.4"
              opacity="0.92"
            />
            <text
              x="0" y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={lineColor}
              fontSize="4.2"
              fontFamily="Oswald, sans-serif"
              fontWeight="600"
              vectorEffect="non-scaling-stroke"
            >
              ×{multiplier.toFixed(2)}
            </text>
          </g>
        )}

        {phase === 'crashed' && (
          <g transform={`translate(${labelX}, ${labelY})`} style={{ pointerEvents: 'none' }}>
            <rect x="-10" y="-5.5" width="20" height="8" rx="2" ry="2"
              fill="hsl(220 14% 9%)" stroke="#ef4444" strokeWidth="0.4" opacity="0.92" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle"
              fill="#ef4444" fontSize="3.8" fontFamily="Oswald, sans-serif" fontWeight="600">
              CRASH ×{multiplier.toFixed(2)}
            </text>
          </g>
        )}
      </svg>

      {/* Y-axis labels */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-1 pl-1">
        {['', '2×', '1.5×', '1×'].map((label, i) => (
          <span key={i} className="text-[9px] text-game-dim font-display">{label}</span>
        ))}
      </div>
    </div>
  );
}
