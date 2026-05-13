import Icon from '@/components/ui/icon';

interface HistoryEntry {
  id: string;
  round: number;
  bet: number;
  cashout: number | null;
  crashAt: number;
  profit: number;
  time: string;
}

interface HistoryTabProps {
  history: HistoryEntry[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  const totalProfit = history.reduce((s, h) => s + h.profit, 0);
  const wins = history.filter(h => h.profit > 0).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'ВСЕГО ИГР', value: String(history.length), icon: 'Hash' },
          {
            label: 'ПОБЕД',
            value: `${wins} (${history.length ? Math.round(wins / history.length * 100) : 0}%)`,
            icon: 'TrendingUp'
          },
          {
            label: 'ИТОГО P/L',
            value: `${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)} TON`,
            icon: 'DollarSign',
            color: totalProfit >= 0 ? 'text-accent' : 'text-destructive'
          },
        ].map(stat => (
          <div key={stat.label} className="card-game p-3 flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-wider text-muted-foreground">{stat.label}</span>
            <span className={`font-display text-base ${stat.color || 'text-foreground'}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-game overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['#РАУНД', 'СТАВКА', 'ВЫВОД', 'КРЭШ', 'P/L'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-display tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    Нет истории ставок
                  </td>
                </tr>
              ) : (
                history.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border/30 hover:bg-secondary/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    <td className="px-4 py-3 font-display text-xs text-muted-foreground">#{entry.round}</td>
                    <td className="px-4 py-3 font-display text-xs">{entry.bet.toFixed(2)} TON</td>
                    <td className="px-4 py-3 font-display text-xs">
                      {entry.cashout ? (
                        <span className="text-accent">×{entry.cashout.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-display text-xs">
                      <span className={entry.crashAt < 1.5 ? 'text-destructive' : entry.crashAt < 3 ? 'text-primary' : 'text-accent'}>
                        ×{entry.crashAt.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-display text-xs">
                      <span className={entry.profit >= 0 ? 'text-accent' : 'text-destructive'}>
                        {entry.profit >= 0 ? '+' : ''}{entry.profit.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
