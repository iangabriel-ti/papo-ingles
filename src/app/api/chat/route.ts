import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAiRequest, refundAiUsage } from "@/lib/account";
import { EFFORT, fallbackOptions, friendlyError, getClient, MODEL, textOf } from "@/lib/claude";
import { isLevel } from "@/lib/levels";
import { CHAT_SCHEMA, chatSystemPrompt, LAST_TURN_NOTE, START_MESSAGE } from "@/lib/prompts";
import { FREE_TALK, getScenario } from "@/lib/scenarios";
import { TeacherTurnSchema } from "@/lib/types";

const MAX_HISTORY = 120;
const MAX_BODY_BYTES = 400_000;

const RequestSchema = z.object({
  scenarioId: z.string(),
  level: z.string().refine(isLevel),
  // Histórico exatamente como a API devolveu. Reenviar sem alterações mantém o
  // cache de prompt funcionando e os blocos de raciocínio válidos.
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.unknown() }))
    .max(MAX_HISTORY),
  userText: z.string().trim().min(1).max(1000).nullable(),
  isLastTurn: z.boolean().default(false),
});

export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Esta conversa ficou longa demais. Finalize e comece outra." }, { status: 413 });
  }
  let json: unknown = null;
  try {
    json = JSON.parse(body);
  } catch {}
  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { scenarioId, level, history, userText, isLastTurn } = parsed.data;

  const scenario = getScenario(scenarioId);
  if (!scenario || !isLevel(level)) {
    return NextResponse.json({ error: "Cenário ou nível inválido." }, { status: 400 });
  }
  if (history.length >= MAX_HISTORY) {
    return NextResponse.json(
      { error: "Esta conversa ficou longa demais. Finalize e comece outra." },
      { status: 400 },
    );
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "A IA ainda não foi configurada (falta a ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  // Abrir a conversa conta como uma lição; cada mensagem conta como uma chamada à IA.
  const usage = { lessons: userText === null ? 1 : 0, calls: 1 };
  const blocked = await guardAiRequest({ ...usage, premiumOnly: scenarioId === FREE_TALK.id });
  if (blocked) return blocked;

  const userMessage: Anthropic.Beta.BetaMessageParam = {
    role: "user",
    content: userText === null ? START_MESSAGE : userText + (isLastTurn ? LAST_TURN_NOTE : ""),
  };
  const messages = [...(history as Anthropic.Beta.BetaMessageParam[]), userMessage];

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      ...fallbackOptions(),
      cache_control: { type: "ephemeral" },
      output_config: {
        effort: EFFORT,
        format: { type: "json_schema", schema: CHAT_SCHEMA },
      },
      system: chatSystemPrompt(scenario, level),
      messages,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Não posso continuar com esse assunto. Vamos voltar ao tema da aula?" },
        { status: 422 },
      );
    }
    if (response.stop_reason === "max_tokens") {
      return NextResponse.json({ error: "A resposta ficou longa demais. Tente de novo." }, { status: 502 });
    }

    const turn = TeacherTurnSchema.safeParse(JSON.parse(textOf(response.content)));
    if (!turn.success) {
      console.error("Unexpected chat output:", textOf(response.content));
      return NextResponse.json({ error: "Resposta inesperada da IA. Tente de novo." }, { status: 502 });
    }

    return NextResponse.json({
      userMessage,
      assistantMessage: { role: "assistant", content: response.content },
      turn: turn.data,
    });
  } catch (error) {
    await refundAiUsage(usage);
    const { message, status } = friendlyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
