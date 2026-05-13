import { useEffect, useRef, useState } from 'react';

interface GameChartProps {
  multiplier: number;
  phase: 'waiting' | 'flying' | 'crashed';
  crashAt: number;
}

export default function GameChart({ multiplier, phase, crashAt }: GameChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0 }]);

  useEffect(() => {
    if (phase === 'waiting') {
      setPoints([{ x: 0, y: 0 }]);
      return;
    }
    const progress = Math.min((multiplier - 1) / (crashAt - 1), 1);
    const W = 100, H = 100;
    const x = progress * W;
    const y = H - Math.pow(progress, 0.7) * H * 0.85;
    setPoints(prev => {
      const last = prev[prev.length - 1];
      if (Math.abs(last.x - x) < 0.3) return prev;
      return [...prev.slice(-80), { x, y }];
    });
  }, [multiplier, phase, crashAt]);

  const toSVGPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const toFillPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    const last = pts[pts.length - 1];
    return toSVGPath(pts) + ` L ${last.x} 100 L 0 100 Z`;
  };

  const rocketPt = points[points.length - 1];
  const crashed = phase === 'crashed';

  const lineColor = crashed ? '#ef4444' : phase === 'flying' ? '#22c55e' : '#eab308';
  const fillColor = crashed ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.07)';

  return (
    <div className="relative w-full h-full select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y}
            stroke="hsl(220 14% 16%)" strokeWidth="0.3" strokeDasharray="1,2" />
        ))}
        {[25, 50, 75].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="100"
            stroke="hsl(220 14% 16%)" strokeWidth="0.3" strokeDasharray="1,2" />
        ))}

        {/* Fill area */}
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={toFillPath(points)} fill="url(#fillGrad)" />

        {/* Main curve */}
        <path
          d={toSVGPath(points)}
          fill="none"
          stroke={lineColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Rocket dot */}
        {phase !== 'waiting' && (
          <g transform={`translate(${rocketPt.x}, ${rocketPt.y})`}>
            <circle r="1.5" fill={lineColor} opacity="0.4">
              <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle r="1" fill={lineColor} />
          </g>
        )}
      </svg>

      {/* Rocket emoji overlay */}
      {phase !== 'waiting' && (
        <div
          className="absolute pointer-events-none text-xl transition-all duration-100"
          style={{
            left: `calc(${rocketPt.x}% - 12px)`,
            top: `calc(${rocketPt.y}% - 12px)`,
          }}
        >
          <span
            className={crashed ? 'animate-rocket-crash' : 'animate-rocket-fly'}
            style={{ display: 'inline-block' }}
          >
            🚀
          </span>
        </div>
      )}

      {/* Y-axis labels */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-1 pl-1">
        {['', '2×', '1.5×', '1×'].map((label, i) => (
          <span key={i} className="text-[9px] text-game-dim font-display">{label}</span>
        ))}
      </div>
    </div>
  );
}
