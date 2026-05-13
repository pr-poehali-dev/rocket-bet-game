import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface WalletTabProps {
  balance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number, address: string) => void;
}

const TX_HISTORY = [
  { id: '1', type: 'deposit', amount: 10, time: '13.05.2026, 14:32', status: 'success' },
  { id: '2', type: 'win', amount: 4.75, time: '13.05.2026, 13:18', status: 'success' },
  { id: '3', type: 'bet', amount: -2, time: '13.05.2026, 13:18', status: 'success' },
  { id: '4', type: 'withdraw', amount: -5, time: '12.05.2026, 22:05', status: 'success' },
  { id: '5', type: 'deposit', amount: 5, time: '12.05.2026, 19:44', status: 'success' },
];

export default function WalletTab({ balance, onDeposit, onWithdraw }: WalletTabProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleAction = () => {
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return;
    if (tab === 'deposit') onDeposit(a);
    else onWithdraw(a, address);
    setAmount('');
    setAddress('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Balance card */}
      <div className="card-game p-6 flex flex-col gap-1 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10 text-7xl select-none font-display">TON</div>
        <span className="text-xs font-display tracking-wider text-muted-foreground">ВАШ БАЛАНС</span>
        <div className="flex items-end gap-3">
          <span className="font-display text-4xl text-foreground">{balance.toFixed(2)}</span>
          <span className="font-display text-lg text-muted-foreground mb-1">TON</span>
        </div>
        <span className="text-xs text-muted-foreground">≈ ${(balance * 5.3).toFixed(2)} USD</span>
      </div>

      {/* Deposit / Withdraw */}
      <div className="card-game p-4 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {(['deposit', 'withdraw'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-display tracking-wide rounded-md transition-all ${
                tab === t
                  ? t === 'deposit'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-destructive text-destructive-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'deposit' ? 'ПОПОЛНИТЬ' : 'ВЫВЕСТИ'}
            </button>
          ))}
        </div>

        <div>
          <label className="text-[11px] font-display tracking-wider text-muted-foreground uppercase mb-1.5 block">
            Сумма (TON)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder="0.00"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 font-display text-lg text-foreground
                focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">TON</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[1, 5, 10, 25].map(q => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="flex-1 py-1 text-xs font-display bg-secondary hover:bg-border rounded text-muted-foreground hover:text-foreground transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {tab === 'withdraw' && (
          <div>
            <label className="text-[11px] font-display tracking-wider text-muted-foreground uppercase mb-1.5 block">
              TON-адрес кошелька
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="UQ..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-body text-foreground
                focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full py-3.5 rounded-xl font-display tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed
            ${tab === 'deposit'
              ? 'bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20'
              : 'bg-destructive text-destructive-foreground hover:opacity-90'
            }`}
        >
          {tab === 'deposit' ? 'ПОПОЛНИТЬ ЧЕРЕЗ TON WALLET' : 'ВЫВЕСТИ СРЕДСТВА'}
        </button>

        {tab === 'deposit' && (
          <p className="text-xs text-muted-foreground text-center">
            Минимальное пополнение: 0.5 TON · Зачисление в течение 1 минуты
          </p>
        )}
        {tab === 'withdraw' && (
          <p className="text-xs text-muted-foreground text-center">
            Минимальный вывод: 1 TON · Комиссия сети: 0.05 TON
          </p>
        )}
      </div>

      {/* Transaction history */}
      <div className="card-game overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="font-display text-xs tracking-wider text-muted-foreground">ИСТОРИЯ ТРАНЗАКЦИЙ</span>
        </div>
        <div className="divide-y divide-border/30">
          {TX_HISTORY.map(tx => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${tx.type === 'deposit' ? 'bg-accent/10' : tx.type === 'win' ? 'bg-primary/10' : 'bg-secondary'}`}>
                  <Icon
                    name={tx.type === 'deposit' ? 'ArrowDownLeft' : tx.type === 'win' ? 'TrendingUp' : tx.type === 'withdraw' ? 'ArrowUpRight' : 'Minus'}
                    size={14}
                    className={tx.type === 'deposit' ? 'text-accent' : tx.type === 'win' ? 'text-primary' : 'text-muted-foreground'}
                  />
                </div>
                <div>
                  <div className="text-xs font-body text-foreground">
                    {tx.type === 'deposit' ? 'Пополнение'
                      : tx.type === 'win' ? 'Выигрыш'
                      : tx.type === 'bet' ? 'Ставка'
                      : 'Вывод'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{tx.time}</div>
                </div>
              </div>
              <span className={`font-display text-sm ${tx.amount > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} TON
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
