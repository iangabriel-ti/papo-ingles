import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAiRequest, refundAiUsage } from "@/lib/account";
import { EFFORT, fallbackOptions, friendlyError, getClient, MODEL, textOf } from "@/lib/claude";
import { isLevel, LEVEL_INFO } from "@/lib/levels";
import { FEEDBACK_SCHEMA, FEEDBACK_SYSTEM_PROMPT } from "@/lib/prompts";
import { getScenario } from "@/lib/scenarios";
import { FeedbackSchema } from "@/lib/types";

const RequestSchema = z.object({
  scenarioId: z.string(),
  level: z.string().refine(isLevel),
  transcript: z
    .array(z.object({ speaker: z.enum(["teacher", "student"]), text: z.string().max(2000) }))
    .min(2)
    .max(120),
});

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { scenarioId, level, transcript } = parsed.data;
  const scenario = getScenario(scenarioId);
  if (!scenario || !isLevel(level)) {
    return NextResponse.json({ error: "Cenário ou nível inválido." }, { status: 400 });
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "A IA ainda não foi configurada (falta a ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  const usage = { lessons: 0, calls: 1 };
  const blocked = await guardAiRequest(usage);
  if (blocked) return blocked;

  const conversation = transcript
    .map((line) => `${line.speaker === "teacher" ? "Teacher" : "Student"}: ${line.text}`)
    .join("\n");

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      ...fallbackOptions(),
      output_config: {
        effort: EFFORT,
        format: { type: "json_schema", schema: FEEDBACK_SCHEMA },
      },
      system: FEEDBACK_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Student level: ${level} (${LEVEL_INFO[level].name}).\nLesson: ${scenario.title} - ${scenario.goal}.\n\n<conversation>\n${conversation}\n</conversation>`,
        },
      ],
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      return NextResponse.json({ error: "Não consegui gerar o relatório desta sessão." }, { status: 502 });
    }

    const feedback = FeedbackSchema.safeParse(JSON.parse(textOf(response.content)));
    if (!feedback.success) {
      return NextResponse.json({ error: "Resposta inesperada da IA. Tente de novo." }, { status: 502 });
    }
    return NextResponse.json({ feedback: feedback.data });
  } catch (error) {
    await refundAiUsage(usage);
    const { message, status } = friendlyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
