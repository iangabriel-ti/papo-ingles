"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_NAME } from "@/lib/config";
import { lessonsLeftToday, useProgress, xpToday } from "@/lib/progress";
import { useAuth } from "./AuthProvider";
import { BoltIcon, BookIcon, FlameIcon, MapIcon, PassportIcon, StarIcon, TicketIcon } from "./Icons";
import { Mascot } from "./Mascot";

const NAV = [
  { href: "/aprender", label: "Viagem", Icon: MapIcon },
  { href: "/vocabulario", label: "Palavras", Icon: BookIcon },
  { href: "/perfil", label: "Passaporte", Icon: PassportIcon },
  { href: "/planos", label: "Super", Icon: StarIcon },
];

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mascot size={small ? 32 : 40} />
      <span className={`font-display font-extrabold tracking-tight text-brand-500 ${small ? "text-xl" : "text-2xl"}`}>
        {APP_NAME.toLowerCase()}
        <span className="text-sun-500">.</span>
      </span>
    </span>
  );
}

export function StatsBar() {
  const { progress } = useProgress();
  const left = lessonsLeftToday(progress);
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${progress.streak > 0 ? "bg-sun-100 text-sun-700" : "bg-sand text-muted"}`}
        title="Ofensiva: dias seguidos praticando"
      >
        <FlameIcon size={16} /> {progress.streak}
      </span>
      <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-brand-500" title="XP total">
        <BoltIcon size={16} /> {progress.xp}
      </span>
      {progress.plan === "premium" ? (
        <span className="flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-paper" title="Papo Super">
          <StarIcon size={16} /> Super
        </span>
      ) : (
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${left > 0 ? "bg-sand text-ink" : "bg-bad-soft text-bad"}`}
          title="Lições grátis restantes hoje"
        >
          <TicketIcon size={16} /> {left}
        </span>
      )}
    </div>
  );
}

export function DailyGoalCard() {
  const { progress } = useProgress();
  const done = xpToday(progress);
  const pct = Math.min(100, Math.round((done / progress.dailyGoal) * 100));
  return (
    <div className="card p-5">
      <h3 className="heading text-lg">Meta de hoje</h3>
      <p className="mt-1 text-sm text-muted">
        {pct >= 100 ? "Meta batida! Ótima viagem hoje." : `${done} de ${progress.dailyGoal} XP`}
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-sun-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SuperCard() {
  const { progress } = useProgress();
  if (progress.plan === "premium") return null;
  return (
    <div className="overflow-hidden rounded-3xl bg-brand-500 p-5 text-paper">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Papo Super</p>
      <p className="mt-1 font-display text-xl font-extrabold leading-snug">Viaje sem limites com o Kiko</p>
      <p className="mt-1 text-sm text-brand-100">Lições ilimitadas e conversa livre. 7 dias grátis.</p>
      <Link href="/planos" className="btn btn-primary mt-4 w-full">
        Experimentar
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { progress, loaded } = useProgress();
  const auth = useAuth();
  const needsLogin = auth.enabled && !auth.loading && !auth.userId && !auth.signingOut;
  const ready = loaded && !auth.loading && auth.synced && !needsLogin;

  useEffect(() => {
    if (needsLogin) router.replace(`/entrar?next=${encodeURIComponent(pathname)}`);
    else if (ready && !progress.onboarded) router.replace("/comecar");
  }, [needsLogin, ready, progress.onboarded, router, pathname]);

  if (!ready || !progress.onboarded) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Mascot hat className="animate-bob" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:flex">
      {/* barra lateral (computador) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-1 border-r border-line bg-white/60 px-4 py-6 lg:flex">
        <Link href="/aprender" className="mb-8 px-3">
          <Logo />
        </Link>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors ${
                active ? "bg-brand-500 text-paper" : "text-muted hover:bg-sand hover:text-ink"
              }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </aside>

      <div className="flex min-w-0 flex-1 justify-center gap-10 lg:px-8">
        <div className="w-full max-w-xl pb-28 lg:pb-10">
          {/* barra superior (celular) */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/aprender" aria-label="Início">
              <Mascot size={36} />
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
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t border-line bg-white px-3 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] lg:hidden">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-1.5 text-[11px] ${active ? "font-bold text-brand-500" : "font-medium text-muted"}`}
            >
              <span className={`grid h-8 w-14 place-items-center rounded-full ${active ? "bg-brand-50" : ""}`}>
                <Icon size={22} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
