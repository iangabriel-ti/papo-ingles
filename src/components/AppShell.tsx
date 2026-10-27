"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_NAME } from "@/lib/config";
import { lessonsLeftToday, useProgress, xpToday } from "@/lib/progress";
import { Mascot } from "./Mascot";

const NAV = [
  { href: "/aprender", label: "Aprender", icon: "🏠" },
  { href: "/vocabulario", label: "Vocabulário", icon: "📖" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
  { href: "/planos", label: "Super", icon: "⭐" },
];

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mascot size={small ? 32 : 40} />
      <span className={`font-black tracking-tight text-brand-500 ${small ? "text-xl" : "text-2xl"}`}>
        {APP_NAME.toLowerCase()}
      </span>
    </span>
  );
}

export function StatsBar() {
  const { progress } = useProgress();
  return (
    <div className="flex items-center gap-4 text-sm font-extrabold">
      <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-brand-600" title="Seu nível">
        {progress.level ?? "A1"}
      </span>
      <span className={`flex items-center gap-1 ${progress.streak > 0 ? "text-orange-500" : "text-muted"}`} title="Ofensiva: dias seguidos">
        🔥 {progress.streak}
      </span>
      <span className="flex items-center gap-1 text-amber-500" title="XP total">
        ⚡ {progress.xp}
      </span>
      {progress.plan === "premium" ? (
        <span className="rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 px-2.5 py-1 text-xs text-white">SUPER</span>
      ) : (
        <span className="flex items-center gap-1 text-rose-500" title="Lições grátis restantes hoje">
          ❤️ {lessonsLeftToday(progress)}
        </span>
      )}
    </div>
  );
}

function DailyGoalCard() {
  const { progress } = useProgress();
  const done = xpToday(progress);
  const pct = Math.min(100, Math.round((done / progress.dailyGoal) * 100));
  return (
    <div className="card p-5">
      <h3 className="font-extrabold">Meta diária</h3>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl">{pct >= 100 ? "🏆" : "🎯"}</span>
        <div className="flex-1">
          <p className="text-sm text-muted">
            {done} / {progress.dailyGoal} XP
          </p>
          <div className="mt-1 h-3.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SuperCard() {
  const { progress } = useProgress();
  if (progress.plan === "premium") return null;
  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-br from-brand-500 to-fuchsia-500 p-5 text-white">
        <p className="text-xs font-black uppercase tracking-widest opacity-80">Papo Super</p>
        <p className="mt-1 text-lg font-extrabold leading-snug">Lições ilimitadas e conversa livre com o Kiko</p>
        <Link href="/planos" className="btn btn-white mt-4 w-full">
          Experimente
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { progress, loaded } = useProgress();

  useEffect(() => {
    if (loaded && !progress.onboarded) router.replace("/comecar");
  }, [loaded, progress.onboarded, router]);

  if (!loaded || !progress.onboarded) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Mascot className="animate-bob" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:flex">
      {/* barra lateral (computador) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-2 border-r-2 border-line px-4 py-6 lg:flex">
        <Link href="/aprender" className="mb-6 px-3">
          <Logo />
        </Link>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-sm font-extrabold uppercase tracking-wide ${
                active ? "border-brand-200 bg-brand-50 text-brand-600" : "border-transparent text-muted hover:bg-black/[0.04]"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </aside>

      <div className="flex min-w-0 flex-1 justify-center gap-10 lg:px-8">
        <div className="w-full max-w-xl pb-24 lg:pb-10">
          {/* barra superior (celular) */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/aprender">
              <Mascot size={34} />
            </Link>
            <StatsBar />
          </div>
          {children}
        </div>

        {/* coluna da direita (computador) */}
        <aside className="sticky top-0 hidden h-dvh w-80 shrink-0 flex-col gap-5 py-6 xl:flex">
          <div className="flex justify-end">
            <StatsBar />
          </div>
          <DailyGoalCard />
          <SuperCard />
        </aside>
      </div>

      {/* navegação inferior (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t-2 border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`my-2 flex flex-col items-center rounded-xl border-2 px-4 py-1 ${
                active ? "border-brand-200 bg-brand-50" : "border-transparent"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-[10px] font-extrabold uppercase ${active ? "text-brand-600" : "text-muted"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export { DailyGoalCard };
