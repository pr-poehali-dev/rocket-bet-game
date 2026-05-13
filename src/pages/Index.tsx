import { useState, useEffect, useRef, useCallback } from 'react';
import GameChart from '@/components/GameChart';
import BetPanel from '@/components/BetPanel';
import LiveBets from '@/components/LiveBets';
import HistoryTab from '@/components/HistoryTab';
import LeaderboardTab from '@/components/LeaderboardTab';
import WalletTab from '@/components/WalletTab';
import HowToPlayTab from '@/components/HowToPlayTab';
import Icon from '@/components/ui/icon';

type Phase = 'waiting' | 'flying' | 'crashed';

interface LiveBet {
  id: string;
  user: string;
  amount: number;
  cashout: number | null;
  profit: number | null;
}

interface HistoryEntry {
  id: string;
  round: number;
  bet: number;
  cashout: number | null;
  crashAt: number;
  profit: number;
  time: string;
}

interface LeaderEntry {
  rank: number;
  user: string;
  totalWin: number;
  bestMultiplier: number;
  games: number;
}

const FAKE_USERS = ['Alex_K', 'moon_rider', 'TON_whale', 'crypto_fox', 'BetKing', 'stargazer', 'hodler99', 'velvet_v'];

const generateCrashPoint = () => {
  const r = Math.random();
  if (r < 0.3) return 1 + Math.random() * 0.4;
  if (r < 0.6) return 1.5 + Math.random() * 1.5;
  if (r < 0.85) return 3 + Math.random() * 7;
  return 10 + Math.random() * 40;
};

const generateLeaders = (): LeaderEntry[] =>
  FAKE_USERS.slice(0, 8).map((u, i) => ({
    rank: i + 1,
    user: u,
    totalWin: Math.round((200 - i * 18 + Math.random() * 20) * 100) / 100,
    bestMultiplier: Math.round((50 - i * 4 + Math.random() * 5) * 100) / 100,
    games: Math.floor(200 - i * 15 + Math.random() * 30),
  }));

const generateLiveBets = (): LiveBet[] =>
  FAKE_USERS.slice(0, 5).map((u, i) => ({
    id: `bot-${i}`,
    user: u,
    amount: Math.round((0.5 + Math.random() * 5) * 10) / 10,
    cashout: null,
    profit: null,
  }));

type TabId = 'game' | 'history' | 'leaderboard' | 'wallet' | 'how';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'game', label: 'ИГРА', icon: 'Rocket' },
  { id: 'history', label: 'ИСТОРИЯ', icon: 'Clock' },
  { id: 'leaderboard', label: 'ТОП', icon: 'Trophy' },
  { id: 'wallet', label: 'КОШЕЛЁК', icon: 'Wallet' },
  { id: 'how', label: 'ПРАВИЛА', icon: 'BookOpen' },
];

const RECENT_CRASHES = [14.2, 1.03, 3.78, 22.5, 1.24, 8.91, 1.01, 5.44, 2.13, 67.3];

export default function Index() {
  const [tab, setTab] = useState<TabId>('game');
  const [phase, setPhase] = useState<Phase>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashAt, setCrashAt] = useState(2.0);
  const [countdown, setCountdown] = useState(5);
  const [balance, setBalance] = useState(25.0);
  const [activeBet, setActiveBet] = useState<{ amount: number; autoCashout: number | null } | null>(null);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [leaders] = useState<LeaderEntry[]>(generateLeaders());
  const [recentCrashes, setRecentCrashes] = useState<number[]>(RECENT_CRASHES);
  const [round, setRound] = useState(1042);
  const [flashKey, setFlashKey] = useState(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashAtRef = useRef<number>(2.0);
  const activeBetRef = useRef(activeBet);
  const roundRef = useRef(round);

  useEffect(() => { activeBetRef.current = activeBet; }, [activeBet]);
  useEffect(() => { roundRef.current = round; }, [round]);

  const startFlying = useCallback(() => {
    setPhase('flying');
    startTimeRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = Math.pow(Math.E, 0.07 * elapsed);
      setMultiplier(m);

      if (m >= crashAtRef.current) {
        if (tickRef.current) clearInterval(tickRef.current);
        const cp = crashAtRef.current;
        setPhase('crashed');
        setMultiplier(cp);
        setRound(r => r + 1);
        setRecentCrashes(prev => [cp, ...prev.slice(0, 9)]);
        setFlashKey(k => k + 1);

        const ab = activeBetRef.current;
        if (ab) {
          setHistory(prev => [{
            id: Date.now().toString(),
            round: roundRef.current,
            bet: ab.amount,
            cashout: null,
            crashAt: cp,
            profit: -ab.amount,
            time: new Date().toLocaleString('ru-RU'),
          }, ...prev.slice(0, 49)]);
          setActiveBet(null);
        }
        return;
      }

      // Auto-cashout bots
      setLiveBets(prev => prev.map(bet => {
        if (bet.cashout === null && Math.random() < 0.008 && m > 1.2) {
          return { ...bet, cashout: m, profit: bet.amount * m - bet.amount };
        }
        return bet;
      }));

      // Player auto-cashout
      const ab = activeBetRef.current;
      if (ab?.autoCashout && m >= ab.autoCashout) {
        if (tickRef.current) clearInterval(tickRef.current);
        const winAmount = ab.amount * m;
        setBalance(b => Math.round((b + winAmount) * 100) / 100);
        setHistory(prev => [{
          id: Date.now().toString(),
          round: roundRef.current,
          bet: ab.amount,
          cashout: m,
          crashAt: crashAtRef.current,
          profit: winAmount - ab.amount,
          time: new Date().toLocaleString('ru-RU'),
        }, ...prev.slice(0, 49)]);
        setActiveBet(null);
        startTimeRef.current = Date.now() - (Math.log(m) / 0.07) * 1000;
        // restart interval without auto-cashout trigger
        tickRef.current = setInterval(() => {
          const e2 = (Date.now() - startTimeRef.current) / 1000;
          const m2 = Math.pow(Math.E, 0.07 * e2);
          setMultiplier(m2);
          if (m2 >= crashAtRef.current) {
            if (tickRef.current) clearInterval(tickRef.current);
            const cp = crashAtRef.current;
            setPhase('crashed');
            setMultiplier(cp);
            setRound(r => r + 1);
            setRecentCrashes(prev2 => [cp, ...prev2.slice(0, 9)]);
            setFlashKey(k => k + 1);
          }
        }, 100);
      }
    }, 100);
  }, []);

  const startWaiting = useCallback(() => {
    setPhase('waiting');
    setMultiplier(1.0);
    setCountdown(5);
    const newCrash = generateCrashPoint();
    setCrashAt(newCrash);
    crashAtRef.current = newCrash;
    setLiveBets(generateLiveBets());

    let c = 5;
    const cdTick = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cdTick);
        startFlying();
      }
    }, 1000);
  }, [startFlying]);

  // Auto-restart after crash
  useEffect(() => {
    if (phase === 'crashed') {
      const t = setTimeout(startWaiting, 3000);
      return () => clearTimeout(t);
    }
  }, [phase, startWaiting]);

  const handleCashout = () => {
    const ab = activeBetRef.current;
    if (!ab || phase !== 'flying') return;
    if (tickRef.current) clearInterval(tickRef.current);
    const m = multiplier;
    const winAmount = ab.amount * m;
    setBalance(b => Math.round((b + winAmount) * 100) / 100);
    setHistory(prev => [{
      id: Date.now().toString(),
      round: roundRef.current,
      bet: ab.amount,
      cashout: m,
      crashAt: crashAtRef.current,
      profit: winAmount - ab.amount,
      time: new Date().toLocaleString('ru-RU'),
    }, ...prev.slice(0, 49)]);
    setActiveBet(null);
    startTimeRef.current = Date.now() - (Math.log(m) / 0.07) * 1000;
    tickRef.current = setInterval(() => {
      const e2 = (Date.now() - startTimeRef.current) / 1000;
      const m2 = Math.pow(Math.E, 0.07 * e2);
      setMultiplier(m2);
      if (m2 >= crashAtRef.current) {
        if (tickRef.current) clearInterval(tickRef.current);
        const cp = crashAtRef.current;
        setPhase('crashed');
        setMultiplier(cp);
        setRound(r => r + 1);
        setRecentCrashes(prev => [cp, ...prev.slice(0, 9)]);
        setFlashKey(k => k + 1);
      }
    }, 100);
  };

  const handleBet = (amount: number, autoCashout: number | null) => {
    if (phase !== 'waiting' || activeBet) return;
    if (amount > balance) return;
    setBalance(b => Math.round((b - amount) * 100) / 100);
    setActiveBet({ amount, autoCashout });
    setLiveBets(prev => [
      { id: 'player', user: 'Вы', amount, cashout: null, profit: null },
      ...prev,
    ]);
  };

  const handleDeposit = (amount: number) => {
    setBalance(b => Math.round((b + amount) * 100) / 100);
  };

  const handleWithdraw = (amount: number) => {
    if (amount > balance) return;
    setBalance(b => Math.round((b - amount) * 100) / 100);
  };

  useEffect(() => {
    startWaiting();
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const crashColor = (v: number) =>
    v < 1.5 ? 'text-destructive' : v < 3 ? 'text-muted-foreground' : v < 10 ? 'text-primary' : 'text-accent';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-display text-xl tracking-widest text-foreground">BITCRASH</span>
          <span className="text-[10px] text-muted-foreground font-display tracking-wider ml-1 hidden sm:block">TON</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 overflow-hidden max-w-xs">
          {recentCrashes.slice(0, 7).map((c, i) => (
            <span key={i} className={`text-[11px] font-display px-2 py-0.5 rounded bg-secondary ${crashColor(c)}`}>
              ×{c.toFixed(2)}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground font-display text-xs">BAL</span>
            <span className="font-display text-foreground">{balance.toFixed(2)}</span>
            <span className="text-muted-foreground text-xs">TON</span>
          </div>
          <button
            onClick={() => setTab('wallet')}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-display tracking-wide hover:opacity-90 transition-all"
          >
            + ДЕПОЗИТ
          </button>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="border-b border-border px-2 flex gap-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-display tracking-wider whitespace-nowrap transition-all border-b-2
              ${tab === t.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <Icon name={t.icon} fallback="Circle" size={13} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        {tab === 'game' && (
          <div className="flex flex-col gap-4">
            {/* Main game area: chart + controls side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chart window */}
              <div className="lg:col-span-2 card-game p-4 flex flex-col" style={{ height: '380px' }}>
                {/* Chart header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-display tracking-wider text-muted-foreground">РАУНД #{round}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      phase === 'flying' ? 'bg-accent animate-pulse' :
                      phase === 'waiting' ? 'bg-primary animate-blink' : 'bg-destructive'
                    }`} />
                  </div>

                  <div className="text-center" key={flashKey}>
                    {phase === 'waiting' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-display text-sm">СТАРТ ЧЕРЕЗ</span>
                        <span className="font-display text-3xl text-primary glow-yellow">{countdown}</span>
                      </div>
                    ) : phase === 'crashed' ? (
                      <div className="animate-fade-in">
                        <span className="font-display text-muted-foreground text-sm mr-2">КРЭШ НА</span>
                        <span className="font-display text-3xl text-destructive glow-red">×{multiplier.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-display text-5xl multiplier glow-green text-accent">
                        ×{multiplier.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    {activeBet && phase === 'flying' ? (
                      <div>
                        <div className="text-[10px] text-muted-foreground font-display">СТАВКА</div>
                        <div className="font-display text-sm text-primary">{activeBet.amount} TON</div>
                      </div>
                    ) : (
                      <div className="text-[10px] font-display text-muted-foreground">
                        {phase === 'waiting' ? `КРЭШ ~×${crashAt.toFixed(2)}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 relative">
                  <GameChart multiplier={multiplier} phase={phase} crashAt={crashAt} />
                </div>
              </div>

              {/* Bet panel — right column */}
              <div className="lg:col-span-1">
                <BetPanel
                  balance={balance}
                  phase={phase}
                  multiplier={multiplier}
                  activeBet={activeBet}
                  onBet={handleBet}
                  onCashout={handleCashout}
                />
              </div>
            </div>

            {/* Live bets below chart */}
            <div style={{ height: '240px' }}>
              <LiveBets bets={liveBets} phase={phase} multiplier={multiplier} />
            </div>

            {/* Mobile recent crashes */}
            <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-muted-foreground font-display tracking-wider flex-shrink-0">ИСТОРИЯ:</span>
              {recentCrashes.slice(0, 8).map((c, i) => (
                <span key={i} className={`text-[11px] font-display px-2 py-0.5 rounded bg-secondary flex-shrink-0 ${crashColor(c)}`}>
                  ×{c.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'history' && <HistoryTab history={history} />}
        {tab === 'leaderboard' && <LeaderboardTab leaders={leaders} />}
        {tab === 'wallet' && (
          <WalletTab balance={balance} onDeposit={handleDeposit} onWithdraw={handleWithdraw} />
        )}
        {tab === 'how' && <HowToPlayTab />}
      </main>

      <footer className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-display tracking-wide">MOONSHOT © 2026</span>
        <span>Игра 18+ · Провабли честная</span>
      </footer>
    </div>
  );
}