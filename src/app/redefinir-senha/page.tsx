"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mascot } from "@/components/Mascot";
import { getSupabaseBrowser } from "@/lib/supabase/client";

// O aluno chega aqui pelo link do e-mail "esqueci minha senha", já logado.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError("Não consegui trocar a senha. Peça um novo link e tente de novo.");
    else router.replace("/aprender");
  };

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-16">
      <Mascot size={96} mood="thinking" className="mx-auto" />
      <h1 className="heading mt-4 text-center text-2xl">Crie uma senha nova</h1>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova senha (mínimo 6 caracteres)"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none focus:border-brand-300"
        />
        {error && <p className="text-sm font-bold text-bad">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full py-4">
          {busy ? "Salvando…" : "Salvar senha"}
        </button>
      </form>
    </main>
  );
}
