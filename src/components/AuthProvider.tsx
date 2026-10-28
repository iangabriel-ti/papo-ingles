"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authEnabled } from "@/lib/env";
import {
  CHANGE_EVENT,
  EMPTY_PROGRESS,
  loadProgress,
  normalizeProgress,
  resetProgress,
  saveProgress,
  today,
  type Progress,
} from "@/lib/progress";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export type Account = {
  user: { id: string; email: string | null };
  entitlement: {
    premium: boolean;
    premiumUntil: string | null;
    source: "subscription" | "pix" | null;
    subscriptionStatus: string | null;
  };
  hasStripeCustomer: boolean;
  lessonsToday: number;
  billing: { enabled: boolean; pix: boolean };
};

type AuthState = {
  enabled: boolean;
  loading: boolean; // ainda verificando o login
  userId: string | null;
  signingOut: boolean;
  synced: boolean; // progresso do servidor já carregado
  account: Account | null;
  refreshAccount: () => Promise<Account | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  enabled: false,
  loading: false,
  userId: null,
  signingOut: false,
  synced: true,
  account: null,
  refreshAccount: async () => null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Aplica no progresso local o plano e o uso de hoje que vieram do servidor.
function withAccount(p: Progress, account: Account): Progress {
  return {
    ...p,
    ownerId: account.user.id,
    plan: account.entitlement.premium ? "premium" : "free",
    lessonsToday: { day: today(), count: Math.max(account.lessonsToday, p.lessonsToday.day === today() ? p.lessonsToday.count : 0) },
  };
}

async function pushProgress(progress: Progress) {
  await fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  }).catch(() => {});
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(authEnabled);
  const [synced, setSynced] = useState(!authEnabled);
  const [account, setAccount] = useState<Account | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const syncedUser = useRef<string | null>(null);

  const refreshAccount = useCallback(async () => {
    const res = await fetch("/api/me", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) {
      setAccount(null);
      return null;
    }
    const data = (await res.json()) as Account;
    setAccount(data);
    saveProgress(withAccount(loadProgress(), data));
    return data;
  }, []);

  // Ao entrar: junta o progresso do servidor com o do navegador.
  const syncProgress = useCallback(
    async (userId: string) => {
      if (syncedUser.current === userId) return;
      syncedUser.current = userId;
      setSynced(false);

      const accountData = await refreshAccount();
      const res = await fetch("/api/progress", { cache: "no-store" }).catch(() => null);
      const remote = res?.ok ? ((await res.json()).progress as Partial<Progress> | null) : null;

      let local = loadProgress();
      // Progresso de outra conta neste navegador: descarta.
      if (local.ownerId && local.ownerId !== userId) local = EMPTY_PROGRESS;

      // O servidor vale, a não ser que esteja vazio e o visitante já tenha começado aqui.
      const useRemote = remote && (remote.onboarded || !local.onboarded);
      let merged = useRemote ? normalizeProgress(remote) : local;
      merged = accountData ? withAccount(merged, accountData) : { ...merged, ownerId: userId };

      saveProgress(merged);
      if (!useRemote) await pushProgress(merged);
      setSynced(true);
    },
    [refreshAccount],
  );

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setLoading(false);
      if (data.user) void syncProgress(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserId(session.user.id);
        void syncProgress(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        setUserId(null);
        syncedUser.current = null;
        setAccount(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [syncProgress]);

  // Salva no servidor alguns segundos depois de cada mudança.
  useEffect(() => {
    if (!authEnabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      const progress = loadProgress();
      if (!synced || !progress.ownerId || progress.ownerId !== syncedUser.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => void pushProgress(loadProgress()), 1500);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, [synced]);

  // Sai da conta e volta para a página inicial.
  const signOut = useCallback(async () => {
    setSigningOut(true);
    await getSupabaseBrowser()?.auth.signOut();
    syncedUser.current = null;
    resetProgress();
    window.location.assign("/");
  }, []);

  return (
    <AuthContext.Provider value={{ enabled: authEnabled, loading, userId, signingOut, synced, account, refreshAccount, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
