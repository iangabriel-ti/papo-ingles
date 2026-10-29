"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { CloseIcon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { googleLoginEnabled } from "@/lib/env";
import { loadProgress } from "@/lib/progress";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Mode = "signup" | "login" | "forgot";

// Traduz as mensagens de erro mais comuns do Supabase.
function translateError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Este e-mail já tem conta. Entre com sua senha.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.";
  if (m.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Espere um pouco e tente de novo.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Esse e-mail não parece válido.";
  return "Não deu certo. Confira os dados e tente de novo.";
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/aprender";
  const [mode, setMode] = useState<Mode>(params.get("modo") === "entrar" ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("erro") ? "O link expirou ou já foi usado. Tente de novo." : null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [startedAsGuest, setStartedAsGuest] = useState(false);

  useEffect(() => {
    setStartedAsGuest(loadProgress().onboarded);
  }, []);

  // Já está logado: segue para o destino.
  useEffect(() => {
    if (auth.userId && auth.synced) router.replace(next);
  }, [auth.userId, auth.synced, next, router]);

  const supabase = getSupabaseBrowser();
  const callback = (path: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callback(next) },
        });
        if (error) throw error;
        if (!data.session) setSentTo(email);
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback("/redefinir-senha") });
        if (error) throw error;
        setSentTo(email);
      }
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ""));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (!supabase) return;
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) setError(translateError(error.message));
  };

  if (!auth.enabled) {
    return (
      <div className="text-center">
        <Mascot size={120} className="mx-auto" />
        <p className="heading mt-6 text-xl">Login desativado</p>
        <p className="mt-2 font-semibold text-muted">
          Este servidor está em modo demonstração (o Supabase ainda não foi configurado). Seu progresso fica salvo neste navegador.
        </p>
        <Link href="/aprender" className="btn btn-primary mt-8 w-full">
          Continuar
        </Link>
      </div>
    );
  }

  if (sentTo) {
    return (
      <div className="text-center">
        <Mascot size={130} mood="celebrate" className="mx-auto" />
        <p className="heading mt-6 text-2xl">Confira seu e-mail!</p>
        <p className="mt-3 font-semibold text-muted">
          {mode === "forgot" ? "Mandamos um link para criar uma nova senha para " : "Mandamos um link de confirmação para "}
          <span className="font-semibold text-ink">{sentTo}</span>. Abra o e-mail e toque no link para continuar.
        </p>
        <button onClick={() => { setSentTo(null); setMode("login"); }} className="btn btn-white mt-8 w-full">
          Voltar
        </button>
      </div>
    );
  }

  const titles: Record<Mode, string> = {
    signup: startedAsGuest ? "Crie seu perfil para salvar seu progresso" : "Crie sua conta",
    login: "Entrar",
    forgot: "Esqueceu a senha?",
  };

  return (
    <div>
      <Mascot hat size={96} mood={mode === "forgot" ? "thinking" : "happy"} className="mx-auto" />
      <h1 className="heading mt-4 text-center text-2xl">{titles[mode]}</h1>
      {mode === "forgot" && (
        <p className="mt-2 text-center font-semibold text-muted">Digite seu e-mail e mandamos um link para criar uma senha nova.</p>
      )}

      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none focus:border-brand-300"
        />
        {mode !== "forgot" && (
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Crie uma senha (mínimo 6 caracteres)" : "Senha"}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none focus:border-brand-300"
          />
        )}
        {error && <p className="text-sm font-bold text-bad">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full py-4">
          {busy ? "Aguarde…" : mode === "signup" ? "Criar conta" : mode === "login" ? "Entrar" : "Enviar link"}
        </button>
      </form>

      {mode !== "forgot" && googleLoginEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-muted">
            <span className="h-0.5 flex-1 bg-line" /> ou <span className="h-0.5 flex-1 bg-line" />
          </div>
          <button onClick={google} className="btn btn-white w-full text-ink">
            <GoogleIcon /> Continuar com o Google
          </button>
        </>
      )}

      <div className="mt-8 space-y-2 text-center text-sm font-bold">
        {mode === "signup" && (
          <p className="text-muted">
            Já tem conta?{" "}
            <button onClick={() => setMode("login")} className="text-brand-600 hover:underline">
              Entrar
            </button>
          </p>
        )}
        {mode === "login" && (
          <>
            <p>
              <button onClick={() => setMode("forgot")} className="text-brand-600 hover:underline">
                Esqueci minha senha
              </button>
            </p>
            <p className="text-muted">
              Ainda não tem conta?{" "}
              <button onClick={() => setMode("signup")} className="text-brand-600 hover:underline">
                Criar conta
              </button>
            </p>
          </>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-brand-600 hover:underline">
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-md items-center px-5 pt-5">
        <Link
          href="/"
          aria-label="Voltar ao início"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-muted hover:text-ink"
        >
          <CloseIcon size={18} />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-12 pt-4">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
