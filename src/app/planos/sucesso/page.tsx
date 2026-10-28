"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Confetti } from "@/components/Confetti";
import { Mascot } from "@/components/Mascot";
import { playSound } from "@/lib/sounds";

// Volta do pagamento. O Stripe confirma pelo webhook, que pode levar alguns segundos
// (no Pix, até o banco confirmar), então a página consulta o plano até ele mudar.
export default function CheckoutSuccessPage() {
  const { refreshAccount, userId } = useAuth();
  const [status, setStatus] = useState<"waiting" | "done" | "slow">("waiting");

  useEffect(() => {
    if (!userId) return;
    let stopped = false;
    let tries = 0;
    const check = async () => {
      const account = await refreshAccount();
      if (stopped) return;
      if (account?.entitlement.premium) {
        setStatus("done");
        playSound("complete");
        return;
      }
      tries++;
      if (tries >= 40) setStatus("slow");
      else setTimeout(check, 3000);
    };
    void check();
    return () => {
      stopped = true;
    };
  }, [userId, refreshAccount]);

  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      {status === "done" && <Confetti />}
      <div className="max-w-md">
        <Mascot size={150} mood={status === "done" ? "celebrate" : "thinking"} className="animate-bob mx-auto" />
        {status === "done" ? (
          <>
            <h1 className="mt-6 text-3xl font-black text-amber-500">Bem-vindo ao Super!</h1>
            <p className="mt-2 font-semibold text-muted">Agora suas lições são ilimitadas e a conversa livre está liberada.</p>
          </>
        ) : status === "waiting" ? (
          <>
            <h1 className="mt-6 text-2xl font-black">Confirmando seu pagamento…</h1>
            <p className="mt-2 font-semibold text-muted">Isso leva só alguns segundos. Se você pagou com Pix, pode levar um pouquinho mais.</p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-black">Ainda não recebemos a confirmação</h1>
            <p className="mt-2 font-semibold text-muted">
              Se você já pagou, fique tranquilo: o Super é liberado automaticamente assim que o pagamento for confirmado.
            </p>
          </>
        )}
        <Link href="/aprender" className="btn btn-primary mt-8 w-full">
          Ir para a trilha
        </Link>
      </div>
    </main>
  );
}
