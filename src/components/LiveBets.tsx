interface LiveBet {
  id: string;
  user: string;
  amount: number;
  cashout: number | null;
  profit: number | null;
}

interface LiveBetsProps {
  bets: LiveBet[];
  phase: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
}

export default function LiveBets({ bets, phase, multiplier }: LiveBetsProps) {
  return (
    <div className="card-game flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-display text-sm tracking-wider text-muted-foreground">ИГРОКИ</span>
        <span className="text-xs text-muted-foreground">{bets.length} активных</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {bets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Нет активных ставок
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-[10px] font-display tracking-wider text-muted-foreground">ИГРОК</th>
                <th className="text-right px-2 py-2 text-[10px] font-display tracking-wider text-muted-foreground">СТАВКА</th>
                <th className="text-right px-4 py-2 text-[10px] font-display tracking-wider text-muted-foreground">ВЫВОД</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet, idx) => {
                const cashedOut = bet.cashout !== null;
                const profit = bet.profit;
                return (
                  <tr
                    key={bet.id}
                    className={`border-b border-border/40 transition-colors ${
                      cashedOut ? 'bg-accent/5' : ''
                    }`}
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    <td className="px-4 py-2.5 font-body text-xs text-foreground/80">{bet.user}</td>
                    <td className="px-2 py-2.5 text-right font-display text-xs text-muted-foreground">
                      {bet.amount.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {cashedOut ? (
                        <span className="font-display text-xs text-accent">
                          ×{bet.cashout!.toFixed(2)}
                          <span className="text-accent/70 ml-1">+{profit!.toFixed(2)}</span>
                        </span>
                      ) : phase === 'flying' ? (
                        <span className="font-display text-xs text-primary">
                          ×{multiplier.toFixed(2)}
                        </span>
                      ) : phase === 'crashed' ? (
                        <span className="font-display text-xs text-destructive">—</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
