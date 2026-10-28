import { NextResponse } from "next/server";
import { authEnabled } from "@/lib/env";
import { getSupabaseServer } from "@/lib/supabase/server";

const MAX_BYTES = 500_000;

// Lê e salva o progresso do aluno (com as regras de acesso do banco: cada um só vê o seu).
export async function GET() {
  if (!authEnabled) return NextResponse.json({ error: "Login desativado." }, { status: 503 });
  const supabase = await getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data, error } = await supabase.from("progress").select("data, updated_at").eq("user_id", auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Falha ao carregar o progresso." }, { status: 500 });
  return NextResponse.json({ progress: data?.data ?? null, updatedAt: data?.updated_at ?? null });
}

export async function PUT(request: Request) {
  if (!authEnabled) return NextResponse.json({ error: "Login desativado." }, { status: 503 });
  const supabase = await getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.text();
  if (body.length > MAX_BYTES) return NextResponse.json({ error: "Progresso grande demais." }, { status: 413 });
  let progress: Record<string, unknown>;
  try {
    progress = JSON.parse(body).progress;
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: auth.user.id, data: progress, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "Falha ao salvar o progresso." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
