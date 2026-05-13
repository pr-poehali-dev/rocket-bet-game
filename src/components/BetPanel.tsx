import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface BetPanelProps {
  balance: number;
  phase: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
  activeBet: { amount: number; autoCashout: number | null } | null;
  onBet: (amount: number, autoCashout: number | null) => void;
  onCashout: () => void;
}

const QUICK_AMOUNTS = [0.5, 1, 2, 5];

export default function BetPanel({ balance, phase, multiplier, activeBet, onBet, onCashout }: BetPanelProps) {
  const [amount, setAmount] = useState('1');
  const [autoCashout, setAutoCashout] = useState('');
  const [tab, setTab] = useState<'manual' | 'auto'>('manual');

  const canBet = phase === 'waiting' && !activeBet;
  const canCashout = phase === 'flying' && !!activeBet;
  const potentialWin = activeBet ? activeBet.amount * multiplier : parseFloat(amount || '0') * multiplier;

  const handleBet = () => {
    const a = parseFloat(amount);
    const ac = autoCashout ? parseFloat(autoCashout) : null;
    if (!isNaN(a) && a > 0) onBet(a, ac);
  };

  return (
    <div className="card-game p-4 flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg">
        {(['manual', 'auto'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-xs font-display tracking-wide rounded-md transition-all ${
              tab === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'manual' ? 'РУЧНАЯ' : 'АВТО'}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div>
        <label className="text-[11px] text-muted-foreground font-display tracking-wider uppercase mb-1.5 block">
          Ставка (TON)
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={!!activeBet}
            min="0.1"
            step="0.1"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-lg font-display text-foreground
              focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">TON</span>
        </div>
        {/* Quick amounts */}
        <div className="flex gap-1.5 mt-2">
          {QUICK_AMOUNTS.map(qa => (
            <button
              key={qa}
              disabled={!!activeBet}
              onClick={() => setAmount(String(qa))}
              className="flex-1 py-1 text-xs font-display bg-secondary hover:bg-border rounded text-muted-foreground
                hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {qa}
            </button>
          ))}
          <button
            disabled={!!activeBet}
            onClick={() => setAmount(String(Math.floor(balance * 10) / 10))}
            className="flex-1 py-1 text-xs font-display bg-secondary hover:bg-border rounded text-muted-foreground
              hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Auto cashout (only in auto tab) */}
      {tab === 'auto' && (
        <div>
          <label className="text-[11px] text-muted-foreground font-display tracking-wider uppercase mb-1.5 block">
            Авто-вывод при ×
          </label>
          <input
            type="number"
            value={autoCashout}
            onChange={e => setAutoCashout(e.target.value)}
            disabled={!!activeBet}
            min="1.1"
            step="0.1"
            placeholder="1.50"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 font-display text-foreground
              focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Potential win */}
      {(phase === 'flying' && activeBet) && (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/10 border border-accent/20">
          <span className="text-xs text-muted-foreground font-display tracking-wide">ТЕКУЩИЙ ВЫИГРЫШ</span>
          <span className="font-display text-lg text-accent glow-green">
            {potentialWin.toFixed(2)} TON
          </span>
        </div>
      )}

      {/* Main button */}
      {canCashout ? (
        <button
          onClick={onCashout}
          className="w-full py-4 rounded-xl font-display text-lg tracking-wide
            bg-accent text-accent-foreground hover:opacity-90 transition-all
            shadow-lg shadow-accent/20 animate-pulse"
        >
          ВЫВЕСТИ {(activeBet!.amount * multiplier).toFixed(2)} TON
        </button>
      ) : (
        <button
          onClick={handleBet}
          disabled={!canBet || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="w-full py-4 rounded-xl font-display text-lg tracking-wide
            bg-primary text-primary-foreground hover:opacity-90 transition-all
            shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {phase === 'flying' ? 'ЖДИ СЛЕДУЮЩЕГО РАУНДА' : activeBet ? 'СТАВКА ПРИНЯТА ✓' : 'СДЕЛАТЬ СТАВКУ'}
        </button>
      )}

      {/* Balance */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon name="Wallet" size={13} />
          <span className="text-xs font-display tracking-wide">БАЛАНС</span>
        </div>
        <span className="font-display text-sm text-foreground">{balance.toFixed(2)} TON</span>
      </div>
    </div>
  );
}
