import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAiRequest, refundAiUsage } from "@/lib/account";
import { EFFORT, fallbackOptions, friendlyError, getClient, MODEL, textOf } from "@/lib/claude";
import { isLevel, LEVEL_INFO } from "@/lib/levels";
import { EXERCISES_SCHEMA, exercisesSystemPrompt } from "@/lib/prompts";
import { ExerciseSchema, isValidExercise } from "@/lib/types";

const text = (max: number) => z.string().trim().max(max);

const RequestSchema = z.object({
  level: z.string().refine(isLevel),
  words: z.array(z.object({ term: text(120).min(1), meaning: text(200) })).max(12),
  mistakes: z.array(z.object({ said: text(300), correct: text(300).min(1), explanation: text(400) })).max(8),
});

// Revisão do dia: exercícios montados com as palavras e os erros do próprio aluno.
export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isLevel(parsed.data.level)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { level, words, mistakes } = parsed.data;
  if (words.length + mistakes.length < 3) {
    return NextResponse.json({ error: "Ainda não há material para revisar. Complete uma conversa primeiro." }, { status: 400 });
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "A IA ainda não foi configurada (falta a ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  const usage = { lessons: 1, calls: 1 };
  const blocked = await guardAiRequest(usage);
  if (blocked) return blocked;

  const wordList = words.map((w) => `- ${w.term}${w.meaning ? ` (${w.meaning})` : ""}`).join("\n");
  const mistakeList = mistakes
    .map((m) => `- Correct form: "${m.correct}"${m.said ? ` | the student said: "${m.said}"` : ""}${m.explanation ? ` | note: ${m.explanation}` : ""}`)
    .join("\n");

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      ...fallbackOptions(),
      cache_control: { type: "ephemeral" },
      output_config: {
        effort: EFFORT,
        format: { type: "json_schema", schema: EXERCISES_SCHEMA },
      },
      system: exercisesSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `This is the student's personalized daily review, not a new topic. Build every exercise around the items below so the student practices exactly these words and fixes exactly these past mistakes. Use each past mistake at least once (preferably in "build_sentence", "fill_blank" or "speak", so the student produces the correct form), and each word at least once if possible.

Student level: ${level}. ${LEVEL_INFO[level].teacherStyle}

<words_to_review>
${wordList || "(none)"}
</words_to_review>

<past_mistakes>
${mistakeList || "(none)"}
</past_mistakes>`,
        },
      ],
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      await refundAiUsage(usage);
      return NextResponse.json({ error: "Não consegui preparar sua revisão. Tente de novo." }, { status: 502 });
    }

    const data = z.object({ exercises: z.array(ExerciseSchema) }).safeParse(JSON.parse(textOf(response.content)));
    const exercises = data.success ? data.data.exercises.filter(isValidExercise) : [];
    if (exercises.length < 5) {
      console.error("Unusable review exercises:", textOf(response.content));
      await refundAiUsage(usage);
      return NextResponse.json({ error: "Não consegui preparar sua revisão. Tente de novo." }, { status: 502 });
    }
    return NextResponse.json({ exercises });
  } catch (error) {
    await refundAiUsage(usage);
    const { message, status } = friendlyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
