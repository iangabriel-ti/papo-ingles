"use client";

// Ações de pagamento chamadas pelas telas.

export type CheckoutPlan = "monthly" | "yearly";

export async function startCheckout(plan: CheckoutPlan, method: "card" | "pix" = "card") {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, method }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = `/entrar?next=${encodeURIComponent("/planos")}`;
    return null;
  }
  if (!res.ok || !data.url) return (data.error as string) ?? "Não consegui abrir o pagamento.";
  window.location.href = data.url;
  return null;
}

export async function openBillingPortal() {
  const res = await fetch("/api/portal", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) return (data.error as string) ?? "Não consegui abrir o portal.";
  window.location.href = data.url;
  return null;
}

export function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "";
}
