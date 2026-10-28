"use client";

import { useCallback, useEffect, useState } from "react";
import { FREE_DAILY_LESSONS } from "./config";
import { isLevel, type Level } from "./levels";
import type { Feedback } from "./types";

// Progresso do aluno salvo no navegador. Na fase 2 (login + assinatura)
// isso passa a ser salvo no banco de dados.

export type SessionRecord = {
  id: string;
  nodeId: string;
  scenarioId: string;
  kind: "exercises" | "conversation";
  date: string; // ISO
  score: number | null; // 0-100
  xp: number;
};

export type VocabularyItem = Feedback["vocabulary"][number] & { addedAt: string };

export type Progress = {
  ownerId: string | null; // conta dona deste progresso (null = visitante sem login)
  onboarded: boolean;
  name: string;
  motivation: string | null;
  dailyGoal: number; // XP por dia
  level: Level | null;
  plan: "free" | "premium";
  xp: number;
  xpByDay: Record<string, number>;
  streak: number;
  bestStreak: number;
  lastPracticeDay: string | null; // YYYY-MM-DD
  lessonsToday: { day: string; count: number };
  completed: Record<string, { bestScore: number; times: number }>;
  sessions: SessionRecord[];
  vocabulary: VocabularyItem[];
  settings: { autoPlayAudio: boolean; sounds: boolean };
};

const STORAGE_KEY = "papo-progress-v2";
export const CHANGE_EVENT = "papo-progress-change";

export const EMPTY_PROGRESS: Progress = {
  ownerId: null,
  onboarded: false,
  name: "",
  motivation: null,
  dailyGoal: 40,
  level: null,
  plan: "free",
  xp: 0,
  xpByDay: {},
  streak: 0,
  bestStreak: 0,
  lastPracticeDay: null,
  lessonsToday: { day: "", count: 0 },
  completed: {},
  sessions: [],
  vocabulary: [],
  settings: { autoPlayAudio: true, sounds: true },
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function today() {
  return dayKey(new Date());
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
}

// Completa um progresso salvo (no navegador ou no servidor) com os campos novos.
export function normalizeProgress(stored: Partial<Progress>): Progress {
  const data: Progress = {
    ...EMPTY_PROGRESS,
    ...stored,
    settings: { ...EMPTY_PROGRESS.settings, ...stored.settings },
  };
  if (!isLevel(data.level)) data.level = null;
  // A ofensiva zera se o aluno pulou um dia.
  if (data.lastPracticeDay && data.lastPracticeDay !== today() && data.lastPracticeDay !== daysAgo(1)) {
    data.streak = 0;
  }
  return data;
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Navegação anônima ou armazenamento bloqueado: o app segue funcionando sem salvar.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => setProgress(loadProgress());
    sync();
    setLoaded(true);
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((change: (current: Progress) => Progress) => {
    const next = change(loadProgress());
    saveProgress(next);
    setProgress(next);
  }, []);

  return { progress, loaded, update };
}

export function xpToday(p: Progress) {
  return p.xpByDay[today()] ?? 0;
}

export function lessonsLeftToday(p: Progress) {
  if (p.plan === "premium") return Infinity;
  const used = p.lessonsToday.day === today() ? p.lessonsToday.count : 0;
  return Math.max(0, FREE_DAILY_LESSONS - used);
}

export function withLessonStarted(p: Progress): Progress {
  const day = today();
  const count = p.lessonsToday.day === day ? p.lessonsToday.count : 0;
  return { ...p, lessonsToday: { day, count: count + 1 } };
}

// Concluir uma atividade dá XP, conta para a meta do dia e mantém a ofensiva.
export function withActivityCompleted(
  p: Progress,
  session: SessionRecord,
  newWords: Feedback["vocabulary"] = [],
): Progress {
  const day = today();
  const streak = p.lastPracticeDay === day ? p.streak : p.lastPracticeDay === daysAgo(1) ? p.streak + 1 : 1;

  const recentDays = Object.entries(p.xpByDay)
    .filter(([d]) => d >= daysAgo(60))
    .reduce<Record<string, number>>((acc, [d, xp]) => ({ ...acc, [d]: xp }), {});

  const previous = p.completed[session.nodeId];
  const known = new Set(p.vocabulary.map((v) => v.term.toLowerCase()));
  const words = newWords
    .filter((v) => !known.has(v.term.toLowerCase()))
    .map((v) => ({ ...v, addedAt: session.date }));

  return {
    ...p,
    xp: p.xp + session.xp,
    xpByDay: { ...recentDays, [day]: (recentDays[day] ?? 0) + session.xp },
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastPracticeDay: day,
    completed: {
      ...p.completed,
      [session.nodeId]: {
        bestScore: Math.max(previous?.bestScore ?? 0, session.score ?? 0),
        times: (previous?.times ?? 0) + 1,
      },
    },
    sessions: [session, ...p.sessions].slice(0, 200),
    vocabulary: [...words, ...p.vocabulary].slice(0, 1000),
  };
}
