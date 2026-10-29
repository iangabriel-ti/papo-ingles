import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAiRequest, refundAiUsage } from "@/lib/account";
import { EFFORT, fallbackOptions, friendlyError, getClient, MODEL, textOf } from "@/lib/claude";
import { LEVEL_INFO } from "@/lib/levels";
import { EXERCISES_SCHEMA, exercisesSystemPrompt } from "@/lib/prompts";
import { getScenario } from "@/lib/scenarios";
import { ExerciseSchema, isValidExercise } from "@/lib/types";

const RequestSchema = z.object({ scenarioId: z.string() });

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  const scenario = parsed.success ? getScenario(parsed.data.scenarioId) : undefined;
  if (!scenario) {
    return NextResponse.json({ error: "Lição inválida." }, { status: 400 });
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
          content: `Lesson topic: ${scenario.title} (${scenario.description})
Situation the student will role-play next: ${scenario.role}; ${scenario.goal}.
Student level: ${scenario.level}. ${LEVEL_INFO[scenario.level].teacherStyle}`,
        },
      ],
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      await refundAiUsage(usage);
      return NextResponse.json({ error: "Não consegui preparar esta lição. Tente de novo." }, { status: 502 });
    }

    const data = z
      .object({ exercises: z.array(ExerciseSchema) })
      .safeParse(JSON.parse(textOf(response.content)));
    const exercises = data.success ? data.data.exercises.filter(isValidExercise) : [];
    if (exercises.length < 5) {
      console.error("Unusable exercises:", textOf(response.content));
      await refundAiUsage(usage);
      return NextResponse.json({ error: "Não consegui preparar esta lição. Tente de novo." }, { status: 502 });
    }
    return NextResponse.json({ exercises });
  } catch (error) {
    await refundAiUsage(usage);
    const { message, status } = friendlyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
