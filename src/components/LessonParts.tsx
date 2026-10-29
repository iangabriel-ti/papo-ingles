"use client";

import Link from "next/link";
import { Confetti } from "./Confetti";
import { CloseIcon } from "./Icons";
import { Mascot } from "./Mascot";

// Peças compartilhadas pelas telas de lição e de conversa.

export function LessonTopBar({ progress, onClose }: { progress: number; onClose?: () => void }) {
  const closeClass =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:text-ink";
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5">
      {onClose ? (
        <button onClick={onClose} aria-label="Sair" className={closeClass}>
          <CloseIcon size={18} />
        </button>
      ) : (
        <Link href="/aprender" aria-label="Sair da lição" className={closeClass}>
          <CloseIcon size={18} />
        </Link>
      )}
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-sun-500 transition-all duration-500"
          style={{ width: `${Math.max(3, Math.min(100, progress * 100))}%` }}
        />
      </div>
    </div>
  );
}

export function LoadingLesson({ message }: { message: string }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Mascot hat mood="thinking" size={140} className="animate-bob mx-auto" />
        <p className="heading mt-6 text-2xl">{message}</p>
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="typing-dot h-2.5 w-2.5 rounded-full bg-sun-500" />
          <span className="typing-dot h-2.5 w-2.5 rounded-full bg-sun-500 [animation-delay:0.15s]" />
          <span className="typing-dot h-2.5 w-2.5 rounded-full bg-sun-500 [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <Mascot mood="sad" size={130} className="mx-auto" />
        <p className="heading mt-6 text-2xl">Turbulência no caminho</p>
        <p className="mt-2 text-muted">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          {onRetry && (
            <button onClick={onRetry} className="btn btn-primary">
              Tentar de novo
            </button>
          )}
          <Link href="/aprender" className="btn btn-white">
            Voltar para a viagem
          </Link>
        </div>
      </div>
    </div>
  );
}

export type StatTone = "sun" | "ok" | "sky";

const TONES: Record<StatTone, string> = {
  sun: "text-sun-700",
  ok: "text-ok-dark",
  sky: "text-brand-500",
};

export function StatTile({ label, value, tone }: { label: string; value: string; tone: StatTone }) {
  return (
    <div className="animate-pop card px-2 py-4 text-center">
      <p className={`font-display text-2xl font-extrabold ${TONES[tone]}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

export function CompletionScreen({
  title,
  subtitle,
  stampCode,
  tiles,
  children,
  primary,
}: {
  title: string;
  subtitle?: string;
  stampCode?: string;
  tiles: { label: string; value: string; tone: StatTone }[];
  children?: React.ReactNode;
  primary: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Confetti />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-6 pt-12 text-center">
        <div className="relative">
          <Mascot hat mood="celebrate" size={150} className="animate-bob" />
          {stampCode && (
            <span className="animate-stamp stamp absolute -right-10 top-2 h-20 w-20 border-[3px] border-ok bg-paper/90 text-xl text-ok">
              {stampCode}
            </span>
          )}
        </div>
        <h1 className="heading mt-6 text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <StatTile key={tile.label} {...tile} />
          ))}
        </div>
        <div className="mt-8 w-full text-left">{children}</div>
      </div>
      <div className="sticky bottom-0 border-t border-line bg-paper px-4 py-5">
        <div className="mx-auto flex max-w-lg flex-col gap-3">{primary}</div>
      </div>
    </div>
  );
}
