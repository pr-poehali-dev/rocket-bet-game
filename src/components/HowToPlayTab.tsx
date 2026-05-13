import Icon from '@/components/ui/icon';

const STEPS = [
  {
    icon: 'Wallet',
    title: 'Пополни баланс',
    desc: 'Пополни кошелёк через TON Wallet. Минимальная ставка — 0.1 TON.',
  },
  {
    icon: 'Target',
    title: 'Сделай ставку',
    desc: 'Выбери сумму и нажми «Сделать ставку» до начала раунда. Можно поставить авто-вывод.',
  },
  {
    icon: 'Rocket',
    title: 'Следи за ракетой',
    desc: 'Коэффициент растёт пока ракета летит. Чем выше — тем больше выигрыш.',
  },
  {
    icon: 'Zap',
    title: 'Выводи вовремя',
    desc: 'Нажми «Вывести» до крэша. Если ракета упадёт раньше — ставка сгорает.',
  },
];

const FAQ = [
  {
    q: 'Как формируется коэффициент крэша?',
    a: 'Каждый раунд использует провабли-честный алгоритм. Hash раунда публикуется до начала — ты можешь сам верифицировать результат.',
  },
  {
    q: 'Какая комиссия платформы?',
    a: 'Платформа берёт 1% от каждой выигрышной ставки. Никаких скрытых комиссий.',
  },
  {
    q: 'Как быстро приходит вывод?',
    a: 'Вывод обрабатывается мгновенно. Время зачисления зависит от сети TON — обычно менее 30 секунд.',
  },
  {
    q: 'Есть ли максимальная ставка?',
    a: 'Максимальная ставка за раунд — 100 TON. Максимальный выигрыш — 1000 TON.',
  },
];

export default function HowToPlayTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* How it works */}
      <div className="card-game p-5 flex flex-col gap-5">
        <h2 className="font-display text-lg tracking-wider">КАК ЭТО РАБОТАЕТ</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon name={step.icon} fallback="Star" size={18} className="text-primary" />
              </div>
              <div>
                <div className="font-display text-sm text-foreground mb-1">{step.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multiplier examples */}
      <div className="card-game p-5 flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wider">ПРИМЕРЫ ВЫИГРЫШЕЙ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['СТАВКА', 'КОЭФФ', 'ВЫИГРЫШ', 'ПРИБЫЛЬ'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-display tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { bet: 1, mult: 1.5, win: 1.5, profit: 0.5 },
                { bet: 2, mult: 3.0, win: 6.0, profit: 4.0 },
                { bet: 5, mult: 10.0, win: 50.0, profit: 45.0 },
                { bet: 1, mult: 0, win: 0, profit: -1 },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border/30">
                  <td className="px-3 py-3 font-display text-xs">{row.bet} TON</td>
                  <td className="px-3 py-3 font-display text-xs">
                    {row.mult > 0 ? (
                      <span className={row.mult >= 5 ? 'text-accent' : row.mult >= 2 ? 'text-primary' : 'text-muted-foreground'}>
                        ×{row.mult.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-destructive">КРЭШ</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-display text-xs">{row.win > 0 ? `${row.win.toFixed(1)} TON` : '—'}</td>
                  <td className="px-3 py-3 font-display text-xs">
                    <span className={row.profit > 0 ? 'text-accent' : 'text-destructive'}>
                      {row.profit > 0 ? '+' : ''}{row.profit.toFixed(1)} TON
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="card-game p-5 flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wider">ЧАСТЫЕ ВОПРОСЫ</h2>
        <div className="flex flex-col gap-4">
          {FAQ.map((item, idx) => (
            <div key={idx} className="border-b border-border/40 pb-4 last:border-0 last:pb-0 animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="font-display text-sm text-foreground mb-1.5">{item.q}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" size={16} className="text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Игра может вызывать зависимость. Играй ответственно. Устанавливай лимиты.
            Минимальный возраст: 18 лет. Статистика не гарантирует будущих результатов.
          </p>
        </div>
      </div>
    </div>
  );
}