import { useEffect, useState } from 'react';

interface GameChartProps {
  multiplier: number;
  phase: 'waiting' | 'flying' | 'crashed';
  crashAt: number;
  countdown?: number;
}

export default function GameChart({ multiplier, phase, crashAt, countdown = 5 }: GameChartProps) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([{ x: 50, y: 100 }]);
  const [crashAnim, setCrashAnim] = useState(false);

  useEffect(() => {
    if (phase === 'waiting') {
      setPoints([{ x: 50, y: 100 }]);
      setCrashAnim(false);
      return;
    }
    if (phase === 'crashed') {
      setCrashAnim(true);
      return;
    }
    const progress = Math.min((multiplier - 1) / Math.max(crashAt - 1, 0.01), 1);
    // x: стартует с центра (50), уходит вправо
    const x = 50 + progress * 45;
    // y: стартует снизу (100), летит вверх
    const y = 100 - Math.pow(progress, 0.65) * 92;
    setPoints(prev => {
      const last = prev[prev.length - 1];
      if (Math.abs(last.x - x) < 0.15 && Math.abs(last.y - y) < 0.15) return prev;
      return [...prev.slice(-150), { x, y }];
    });
  }, [multiplier, phase, crashAt]);

  const tip = points[points.length - 1];
  const crashed = phase === 'crashed';
  const lineColor = crashed ? '#ef4444' : phase === 'flying' ? '#22c55e' : '#eab308';

  const toPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const toFill = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    const last = pts[pts.length - 1];
    return toPath(pts) + ` L ${last.x} 100 L ${pts[0].x} 100 Z`;
  };

  // Ракета: вертикально вверх из центра. Y: от 85% (старт) до 8% (максимум)
  const progress = phase === 'flying'
    ? Math.min((multiplier - 1) / Math.max(crashAt - 1, 0.01), 1)
    : phase === 'crashed' ? 1 : 0;

  // Позиция ракеты в процентах от контейнера
  const rocketLeft = 50; // всегда по центру X
  const rocketBottom = 8 + progress * 77; // от 8% снизу до 85%

  // Наклон при крэше
  const crashRotate = crashAnim ? 120 : 0;

  // label над ракетой
  const labelBottom = rocketBottom + 14;

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* SVG кривая — фоновый след */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="fillGrad2" x1="0" y1="0" x2="0" y2="1">
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
        <path d={toFill(points)} fill="url(#fillGrad2)" />

        {/* Trail curve */}
        <path
          d={toPath(points)}
          fill="none"
          stroke={lineColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />

        {/* Pulse at tip */}
        {phase === 'flying' && (
          <circle cx={tip.x} cy={tip.y} r="1.5" fill={lineColor} opacity="0.15">
            <animate attributeName="r" values="1.5;4;1.5" dur="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="1.3s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* ── Ракета — позиционируется через bottom/left в % ── */}
      {phase !== 'waiting' && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${rocketLeft}%`,
            bottom: `${rocketBottom}%`,
            transform: `translateX(-50%) rotate(${crashRotate}deg)`,
            transition: crashAnim
              ? 'transform 0.5s ease-in, opacity 0.5s ease-in'
              : 'bottom 0.1s linear',
            width: '56px',
            height: '56px',
            opacity: crashAnim ? 0.25 : 1,
            filter: crashed
              ? 'grayscale(1) brightness(0.45)'
              : 'drop-shadow(0 0 10px rgba(34,197,94,0.6))',
            zIndex: 10,
          }}
        >
          {/* Android-style rocket SVG */}
          <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
            <path d="M36 6 C22 6 14 22 14 38 L14 52 L36 60 L58 52 L58 38 C58 22 50 6 36 6 Z" fill="#9E9E9E"/>
            <path d="M36 6 C22 6 14 22 14 38 L36 44 L58 38 C58 22 50 6 36 6 Z" fill="#BDBDBD"/>
            <ellipse cx="36" cy="8" rx="8" ry="10" fill="#E53935"/>
            <ellipse cx="36" cy="7" rx="5" ry="7" fill="#EF9A9A"/>
            <circle cx="36" cy="30" r="8" fill="#1565C0"/>
            <circle cx="36" cy="30" r="6" fill="#1E88E5"/>
            <ellipse cx="33" cy="27" rx="2.5" ry="1.5" fill="#90CAF9" opacity="0.8"/>
            <path d="M14 38 L4 54 L18 50 L14 38 Z" fill="#E53935"/>
            <path d="M14 38 L6 52 L18 50 L14 38 Z" fill="#EF5350"/>
            <path d="M58 38 L68 54 L54 50 L58 38 Z" fill="#E53935"/>
            <path d="M58 38 L66 52 L54 50 L58 38 Z" fill="#EF5350"/>
            <rect x="29" y="56" width="14" height="8" rx="3" fill="#616161"/>
            {!crashed && (
              <>
                <ellipse cx="36" cy="68" rx="7" ry="9" fill="#FF6F00" opacity="0.9">
                  <animate attributeName="ry" values="9;12;8;11;9" dur="0.18s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.9;1;0.8;1;0.9" dur="0.18s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="36" cy="66" rx="4" ry="6" fill="#FFCA28">
                  <animate attributeName="ry" values="6;8;5;7;6" dur="0.15s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="36" cy="65" rx="2" ry="3.5" fill="#FFF9C4" opacity="0.9"/>
              </>
            )}
          </svg>
        </div>
      )}

      {/* ── Коэффициент над ракетой ── */}
      {phase === 'flying' && (
        <div
          className="absolute pointer-events-none font-display glow-green text-accent"
          style={{
            left: `${rocketLeft}%`,
            bottom: `${Math.min(labelBottom, 90)}%`,
            transform: 'translateX(-50%)',
            fontSize: '28px',
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            zIndex: 11,
            textShadow: '0 0 20px rgba(34,197,94,0.8)',
          }}
        >
          ×{multiplier.toFixed(2)}
        </div>
      )}

      {/* Crash label */}
      {phase === 'crashed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in" style={{ zIndex: 11 }}>
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-destructive glow-red" style={{ fontSize: '36px', fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>
              CRASH
            </span>
            <span className="font-display text-destructive" style={{ fontSize: '24px', fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>
              ×{multiplier.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* ── Обратный отсчёт ── */}
      {phase === 'waiting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3" style={{ zIndex: 11 }}>
          {/* ракета на старте */}
          <div style={{ width: 64, height: 64, filter: 'drop-shadow(0 0 10px rgba(234,179,8,0.7))' }}>
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
              <path d="M36 6 C22 6 14 22 14 38 L14 52 L36 60 L58 52 L58 38 C58 22 50 6 36 6 Z" fill="#9E9E9E"/>
              <path d="M36 6 C22 6 14 22 14 38 L36 44 L58 38 C58 22 50 6 36 6 Z" fill="#BDBDBD"/>
              <ellipse cx="36" cy="8" rx="8" ry="10" fill="#E53935"/>
              <ellipse cx="36" cy="7" rx="5" ry="7" fill="#EF9A9A"/>
              <circle cx="36" cy="30" r="8" fill="#1565C0"/>
              <circle cx="36" cy="30" r="6" fill="#1E88E5"/>
              <ellipse cx="33" cy="27" rx="2.5" ry="1.5" fill="#90CAF9" opacity="0.8"/>
              <path d="M14 38 L4 54 L18 50 L14 38 Z" fill="#E53935"/>
              <path d="M14 38 L6 52 L18 50 L14 38 Z" fill="#EF5350"/>
              <path d="M58 38 L68 54 L54 50 L58 38 Z" fill="#E53935"/>
              <path d="M58 38 L66 52 L54 50 L58 38 Z" fill="#EF5350"/>
              <rect x="29" y="56" width="14" height="8" rx="3" fill="#616161"/>
            </svg>
          </div>
          <span
            key={countdown}
            className="font-display text-primary glow-yellow"
            style={{
              animation: 'countPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '72px',
              lineHeight: 1,
              letterSpacing: '0.04em',
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
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-1 pl-1" style={{ zIndex: 5 }}>
        {['', '2×', '1.5×', '1×'].map((label, i) => (
          <span key={i} className="text-[9px] text-game-dim font-display">{label}</span>
        ))}
      </div>

      <style>{`
        @keyframes countPop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes flamePulse {
          from { transform: translateX(-50%) scaleY(0.85); }
          to   { transform: translateX(-50%) scaleY(1.15); }
        }
      `}</style>
    </div>
  );
}