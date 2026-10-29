"use client";

import { DAILY_GOALS } from "@/lib/config";

// Estimativa a partir do ritmo do próprio app: uma parada (lição + conversa) leva
// cerca de 10 minutos e acrescenta umas 5 palavras ou expressões ao caderno.
const MINUTES_PER_STOP = 10;
const WORDS_PER_STOP = 5;
const DAYS = 90;

export function goalProjection(minutes: number) {
  const stopsPerMonth = Math.round((minutes * 30) / MINUTES_PER_STOP);
  return {
    minutesPerMonth: minutes * 30,
    stopsPerMonth,
    wordsIn3Months: Math.round(((minutes * DAYS) / MINUTES_PER_STOP) * WORDS_PER_STOP),
    hoursIn3Months: Math.round((minutes * DAYS) / 60),
  };
}

const W = 320;
const H = 168;
const BASE = 132; // linha de base das barras
const TOP = 28; // espaço para os números acima das barras
const BAR_W = 46;
const SELECTED = "#ff7a45";
const OTHER = "#3a7fb2";

// Barra com o topo arredondado e a base reta, presa à linha de base.
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return "";
  const rr = Math.min(r, h);
  return `M${x},${BASE} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${BASE} Z`;
}

export function GoalChart({ selectedXp, onSelect }: { selectedXp: number; onSelect: (xp: number) => void }) {
  const data = DAILY_GOALS.map((g) => ({ ...g, words: goalProjection(g.minutes).wordsIn3Months }));
  const max = Math.max(...data.map((d) => d.words));
  const slot = W / data.length;
  const selected = data.find((d) => d.xp === selectedXp) ?? data[1];
  const proj = goalProjection(selected.minutes);

  return (
    <figure className="card animate-pop m-0 p-5">
      <figcaption>
        <p className="text-xs font-bold uppercase tracking-widest text-sun-700">Sua projeção</p>
        <p className="mt-1 font-display text-lg font-extrabold text-brand-500">Palavras novas em 3 meses</p>
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={`Palavras novas em 3 meses: ${data.map((d) => `${d.minutes} minutos por dia, cerca de ${d.words}`).join("; ")}.`}>
        <line x1="0" x2={W} y1={BASE} y2={BASE} stroke="#eadfcd" strokeWidth="1" />
        {data.map((d, i) => {
          const h = ((BASE - TOP) * d.words) / max;
          const x = i * slot + (slot - BAR_W) / 2;
          const y = BASE - h;
          const isSelected = d.xp === selected.xp;
          return (
            <g key={d.xp} onClick={() => onSelect(d.xp)} className="cursor-pointer">
              <title>{`${d.minutes} min por dia: cerca de ${d.words} palavras em 3 meses`}</title>
              {/* área de toque maior que a barra */}
              <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" />
              <path d={barPath(x, y, BAR_W, h)} fill={isSelected ? SELECTED : OTHER} style={{ transition: "fill .2s" }} />
              <text
                x={x + BAR_W / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="13"
                fontWeight={isSelected ? 800 : 600}
                fill={isSelected ? "#10263a" : "#5b6b78"}
              >
                ~{d.words}
              </text>
              <text x={x + BAR_W / 2} y={BASE + 20} textAnchor="middle" fontSize="12" fontWeight={isSelected ? 800 : 600} fill={isSelected ? "#10263a" : "#5b6b78"}>
                {d.minutes} min
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-sand px-2 py-3">
          <p className="font-display text-xl font-extrabold text-ink">{proj.minutesPerMonth}</p>
          <p className="text-xs font-semibold text-muted">min de prática por mês</p>
        </div>
        <div className="rounded-2xl bg-sand px-2 py-3">
          <p className="font-display text-xl font-extrabold text-ink">~{proj.stopsPerMonth}</p>
          <p className="text-xs font-semibold text-muted">conversas por mês</p>
        </div>
        <div className="rounded-2xl bg-sand px-2 py-3">
          <p className="font-display text-xl font-extrabold text-ink">{proj.hoursIn3Months}h</p>
          <p className="text-xs font-semibold text-muted">de inglês em 3 meses</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Estudar um pouco todo dia fixa mais do que estudar muito de uma vez só. Escolha um ritmo que caiba na sua rotina.
      </p>
      <p className="mt-2 text-xs text-muted">
        Estimativa com base no ritmo do app: cada parada leva cerca de {MINUTES_PER_STOP} minutos e ensina umas {WORDS_PER_STOP} palavras
        ou expressões novas.
      </p>
    </figure>
  );
}
