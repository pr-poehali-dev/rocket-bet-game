interface LeaderEntry {
  rank: number;
  user: string;
  totalWin: number;
  bestMultiplier: number;
  games: number;
}

interface LeaderboardTabProps {
  leaders: LeaderEntry[];
}

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardTab({ leaders }: LeaderboardTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {leaders.slice(0, 3).map((l, idx) => (
          <div
            key={l.rank}
            className={`card-game p-4 flex flex-col items-center gap-1 text-center
              ${idx === 0 ? 'border-primary/40' : idx === 1 ? 'border-muted-foreground/30' : 'border-border'}`}
          >
            <span className="text-2xl">{medals[idx]}</span>
            <span className="font-display text-sm text-foreground truncate w-full text-center">{l.user}</span>
            <span className="font-display text-lg text-accent">{l.totalWin.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">TON выиграно</span>
            <div className="mt-1 px-2 py-0.5 bg-secondary rounded text-[10px] font-display text-primary">
              MAX ×{l.bestMultiplier.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="card-game overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="font-display text-xs tracking-wider text-muted-foreground">ТОП ИГРОКОВ ПО ВЫИГРЫШАМ</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['#', 'ИГРОК', 'ВЫИГРАНО', 'МАКС ×', 'ИГР'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-display tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaders.map((l, idx) => (
              <tr
                key={l.rank}
                className="border-b border-border/30 hover:bg-secondary/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <td className="px-4 py-3 font-display text-xs text-muted-foreground">
                  {idx < 3 ? medals[idx] : `#${l.rank}`}
                </td>
                <td className="px-4 py-3 font-body text-xs text-foreground">{l.user}</td>
                <td className="px-4 py-3 font-display text-xs text-accent">{l.totalWin.toFixed(2)} TON</td>
                <td className="px-4 py-3 font-display text-xs text-primary">×{l.bestMultiplier.toFixed(2)}</td>
                <td className="px-4 py-3 font-display text-xs text-muted-foreground">{l.games}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
