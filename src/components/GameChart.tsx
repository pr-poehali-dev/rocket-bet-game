import { useEffect, useRef, useState } from 'react';

interface GameChartProps {
  multiplier: number;
  phase: 'waiting' | 'flying' | 'crashed';
  crashAt: number;
  countdown?: number;
}

export default function GameChart({ multiplier, phase, crashAt, countdown = 5 }: GameChartProps) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([{ x: 0, y: 100 }]);
  const rocketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'waiting') {
      setPoints([{ x: 0, y: 100 }]);
      return;
    }
    const progress = Math.min((multiplier - 1) / Math.max(crashAt - 1, 0.01), 1);
    const x = progress * 93;
    const y = 100 - Math.pow(progress, 0.65) * 88;
    setPoints(prev => {
      const last = prev[prev.length - 1];
      if (Math.abs(last.x - x) < 0.15) return prev;
      return [...prev.slice(-150), { x, y }];
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

  // label — чуть выше точки, не вылезает за края
  const labelX = Math.min(Math.max(tip.x, 12), 80);
  const labelY = Math.max(tip.y - 9, 7);

  // Угол направления ракеты по последним двум точкам
  const getRocketAngle = () => {
    if (points.length < 2) return -45;
    const a = points[points.length - 2];
    const b = points[points.length - 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };
  const rocketAngle = getRocketAngle();

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
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

        {/* Fill under curve */}
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

        {/* Pulse ring at tip (flying only) */}
        {phase === 'flying' && (
          <circle cx={tip.x} cy={tip.y} r="2.5" fill={lineColor} opacity="0.2">
            <animate attributeName="r" values="2;5.5;2" dur="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="1.3s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Multiplier label following the tip */}
        {phase === 'flying' && (
          <g transform={`translate(${labelX}, ${labelY})`} style={{ pointerEvents: 'none' }}>
            <rect x="-10" y="-5.5" width="20" height="8" rx="2" ry="2"
              fill="hsl(220 14% 7%)" stroke={lineColor} strokeWidth="0.45" opacity="0.95" />
            <text x="0" y="0.3" textAnchor="middle" dominantBaseline="middle"
              fill={lineColor} fontSize="4.4" fontFamily="Oswald, sans-serif" fontWeight="700"
              vectorEffect="non-scaling-stroke">
              ×{multiplier.toFixed(2)}
            </text>
          </g>
        )}

        {/* Crash label */}
        {phase === 'crashed' && (
          <g transform={`translate(${labelX}, ${labelY})`} style={{ pointerEvents: 'none' }}>
            <rect x="-12" y="-5.5" width="24" height="8" rx="2" ry="2"
              fill="hsl(220 14% 7%)" stroke="#ef4444" strokeWidth="0.45" opacity="0.95" />
            <text x="0" y="0.3" textAnchor="middle" dominantBaseline="middle"
              fill="#ef4444" fontSize="3.8" fontFamily="Oswald, sans-serif" fontWeight="700">
              CRASH ×{multiplier.toFixed(2)}
            </text>
          </g>
        )}
      </svg>

      {/* ── Ракета-эмодзи поверх SVG ── */}
      {phase !== 'waiting' && (
        <div
          ref={rocketRef}
          className="absolute pointer-events-none"
          style={{
            left: `${tip.x}%`,
            top: `${tip.y}%`,
            transform: `translate(-50%, -50%) rotate(${rocketAngle - 45}deg)`,
            transition: 'left 0.1s linear, top 0.1s linear',
            fontSize: '22px',
            lineHeight: 1,
            filter: crashed ? 'grayscale(1) brightness(0.6)' : 'drop-shadow(0 0 6px rgba(34,197,94,0.7))',
          }}
        >
          🚀
        </div>
      )}

      {/* ── Обратный отсчёт по центру поля ── */}
      {phase === 'waiting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
          <span
            key={countdown}
            className="font-display text-7xl text-primary glow-yellow"
            style={{
              animation: 'countPop 0.3s ease-out',
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            {countdown}
          </span>
          <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
            следующий раунд
          </span>
        </div>
      )}

      {/* Y-axis labels */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-1 pl-1">
        {['', '2×', '1.5×', '1×'].map((label, i) => (
          <span key={i} className="text-[9px] text-game-dim font-display">{label}</span>
        ))}
      </div>

      <style>{`
        @keyframes countPop {
          from { transform: scale(1.4); opacity: 0.4; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
