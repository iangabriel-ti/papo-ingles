"use client";

import Link from "next/link";
import { Confetti } from "./Confetti";
import { Mascot } from "./Mascot";

// Peças compartilhadas pelas telas de lição e de conversa.

export function LessonTopBar({ progress, onClose }: { progress: number; onClose?: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5">
      {onClose ? (
        <button onClick={onClose} aria-label="Sair da lição" className="text-2xl font-black text-[#a2a6bf] hover:text-muted">
          ✕
        </button>
      ) : (
        <Link href="/aprender" aria-label="Sair da lição" className="text-2xl font-black text-[#a2a6bf] hover:text-muted">
          ✕
        </Link>
      )}
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className="relative h-full rounded-full bg-ok transition-all duration-500"
          style={{ width: `${Math.max(3, Math.min(100, progress * 100))}%` }}
        >
          <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

export function LoadingLesson({ message }: { message: string }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Mascot mood="thinking" size={140} className="animate-bob mx-auto" />
        <p className="mt-6 text-xl font-extrabold">{message}</p>
        <div className="mt-3 flex justify-center gap-1.5">
          <span className="typing-dot h-2.5 w-2.5 rounded-full bg-brand-300" />
          <span className="typing-dot h-2.5 w-2.5 rounded-full bg-brand-300 [animation-delay:0.15s]" />
          <span className="typing-dot h-2.5 w-2.5 rounded-full bg-brand-300 [animation-delay:0.3s]" />
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
        <p className="mt-6 text-xl font-extrabold">Ops!</p>
        <p className="mt-2 font-semibold text-muted">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          {onRetry && (
            <button onClick={onRetry} className="btn btn-primary">
              Tentar de novo
            </button>
          )}
          <Link href="/aprender" className="btn btn-white">
            Voltar para a trilha
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`animate-pop overflow-hidden rounded-2xl border-2 ${color}`}>
      <p className="px-2 py-1 text-center text-[11px] font-black uppercase tracking-wide text-white">{label}</p>
      <p className="bg-white py-3 text-center text-xl font-black">{value}</p>
    </div>
  );
}

export function CompletionScreen({
  title,
  subtitle,
  tiles,
  children,
  primary,
}: {
  title: string;
  subtitle?: string;
  tiles: { label: string; value: string; color: string }[];
  children?: React.ReactNode;
  primary: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Confetti />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-6 pt-12 text-center">
        <Mascot mood="celebrate" size={150} className="animate-bob" />
        <h1 className="mt-6 text-3xl font-black text-amber-500">{title}</h1>
        {subtitle && <p className="mt-2 font-semibold text-muted">{subtitle}</p>}
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <StatTile key={tile.label} {...tile} />
          ))}
        </div>
        <div className="mt-8 w-full text-left">{children}</div>
      </div>
      <div className="sticky bottom-0 border-t-2 border-line bg-white px-4 py-5">
        <div className="mx-auto flex max-w-lg flex-col gap-3">{primary}</div>
      </div>
    </div>
  );
}
