"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { XP_CONVERSATION, XP_EXERCISE_LESSON } from "@/lib/config";
import { LEVEL_INFO } from "@/lib/levels";
import { nodeHref, nodeStatuses, PATH, type NodeStatus, type PathNode } from "@/lib/path";
import { lessonsLeftToday, useProgress } from "@/lib/progress";
import { FREE_TALK, UNITS } from "@/lib/scenarios";

// Deslocamento horizontal de cada etapa, formando o zigue-zague da trilha.
const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];

function NodeButton({
  node,
  status,
  index,
  selected,
  onSelect,
}: {
  node: PathNode;
  status: NodeStatus;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { color } = node.unit;
  const isConversation = node.kind === "conversation";
  const active = status !== "locked";
  const colors = active
    ? `${color.bg} ${color.border} text-white`
    : "bg-line border-[#c9ccdb] text-[#a2a6bf]";

  return (
    <div className="relative flex justify-center" style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` }}>
      {status === "current" && !selected && (
        <div className="animate-bob absolute -top-11 z-10 whitespace-nowrap rounded-xl border-2 border-line bg-white px-3 py-1.5 text-sm font-black uppercase text-brand-500">
          Começar
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-white" />
        </div>
      )}
      <button
        onClick={onSelect}
        aria-label={`${isConversation ? "Conversa" : "Lição"}: ${node.scenario.title}`}
        className={`relative grid h-[72px] w-[78px] place-items-center rounded-[50%] border-b-[7px] text-3xl transition-transform active:translate-y-[4px] active:border-b-[3px] ${colors} ${
          status === "current" ? "ring-8 ring-black/5" : ""
        }`}
      >
        <span className={active ? "" : "opacity-50 grayscale"}>
          {status === "done" ? "✓" : isConversation ? "🎙️" : node.scenario.emoji}
        </span>
        {status === "done" && (
          <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-amber-400 text-sm">
            👑
          </span>
        )}
      </button>
    </div>
  );
}

function NodePopover({ node, status, onClose }: { node: PathNode; status: NodeStatus; onClose: () => void }) {
  const { progress } = useProgress();
  const ref = useRef<HTMLDivElement>(null);
  const noLessonsLeft = lessonsLeftToday(progress) === 0;
  const isConversation = node.kind === "conversation";
  const best = progress.completed[node.id]?.bestScore;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("click", close), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", close);
    };
  }, [onClose]);

  const locked = status === "locked";

  return (
    <div ref={ref} className="animate-pop relative z-20 mx-auto mt-3 w-72">
      <div
        className={`rounded-2xl p-4 ${locked ? "border-2 border-line bg-[#f7f7fa]" : `${node.unit.color.bg} text-white`}`}
      >
        <p className="text-lg font-black">
          {isConversation ? "Conversa: " : ""}
          {node.scenario.title}
        </p>
        <p className={`mt-1 text-sm font-semibold ${locked ? "text-muted" : "text-white/90"}`}>
          {locked
            ? "Complete todas as etapas anteriores para liberar esta."
            : isConversation
              ? `Converse por voz com o Kiko. ${node.scenario.description}`
              : `Exercícios rápidos para aprender as palavras e frases deste tema.`}
        </p>
        {best !== undefined && !locked && (
          <p className="mt-2 text-xs font-extrabold uppercase opacity-90">Sua melhor nota: {best}%</p>
        )}
        {!locked &&
          (noLessonsLeft ? (
            <Link href="/planos" className="btn btn-white mt-4 w-full">
              Sem lições grátis hoje · Ver Super
            </Link>
          ) : (
            <Link href={nodeHref(node)} className="btn btn-white mt-4 w-full">
              {status === "done" ? "Praticar de novo" : "Começar"} +{isConversation ? XP_CONVERSATION : XP_EXERCISE_LESSON} XP
            </Link>
          ))}
      </div>
    </div>
  );
}

export default function LearnPage() {
  const { progress, loaded } = useProgress();
  const statuses = nodeStatuses(progress);
  const [selected, setSelected] = useState<string | null>(null);

  // Rola a trilha até a etapa atual ao abrir a página.
  useEffect(() => {
    if (loaded) document.getElementById("current-node")?.scrollIntoView({ block: "center" });
  }, [loaded]);

  return (
    <div className="px-4 pt-6">
      {progress.plan === "premium" && (
        <Link href={`/conversa/${FREE_TALK.id}`} className="card mb-8 flex items-center gap-4 p-4 hover:bg-black/[0.02]">
          <span className="text-3xl">{FREE_TALK.emoji}</span>
          <span className="flex-1">
            <span className="block font-extrabold">Conversa livre</span>
            <span className="block text-sm text-muted">Fale sobre qualquer assunto com o Kiko</span>
          </span>
          <span className="rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 px-2 py-0.5 text-xs font-black text-white">SUPER</span>
        </Link>
      )}

      {UNITS.map((unit) => {
        const nodes = PATH.filter((n) => n.unit.level === unit.level);
        return (
          <section key={unit.level} className="mb-14">
            <div className={`sticky top-[62px] z-10 rounded-2xl border-b-4 ${unit.color.bg} ${unit.color.border} px-5 py-4 text-white lg:top-4`}>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">
                {unit.level} · {LEVEL_INFO[unit.level].name}
              </p>
              <h2 className="text-xl font-black">{unit.title}</h2>
              <p className="text-sm font-semibold opacity-90">{unit.subtitle}</p>
            </div>

            <div className="relative mt-14 flex flex-col gap-7">
              {nodes.map((node, i) => {
                const status = statuses.get(node.id) ?? "locked";
                return (
                  <div key={node.id} id={status === "current" ? "current-node" : undefined}>
                    <NodeButton
                      node={node}
                      status={status}
                      index={i}
                      selected={selected === node.id}
                      onSelect={() => setSelected(selected === node.id ? null : node.id)}
                    />
                    {selected === node.id && (
                      <NodePopover node={node} status={status} onClose={() => setSelected(null)} />
                    )}
                  </div>
                );
              })}
              <Mascot
                size={110}
                mood={nodes.every((n) => statuses.get(n.id) === "done") ? "celebrate" : "happy"}
                className="pointer-events-none absolute right-0 top-1/3 hidden opacity-90 sm:block"
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
