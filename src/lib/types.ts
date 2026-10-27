import { z } from "zod";

export const TeacherTurnSchema = z.object({
  reply: z.string(),
  translation: z.string(),
  correction: z.object({
    has_issue: z.boolean(),
    corrected: z.string(),
    explanation: z.string(),
  }),
  suggestions: z.array(z.string()),
});
export type TeacherTurn = z.infer<typeof TeacherTurnSchema>;

export const FeedbackSchema = z.object({
  score: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  vocabulary: z.array(z.object({ term: z.string(), meaning: z.string(), example: z.string() })),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export type TranscriptLine = { speaker: "teacher" | "student"; text: string };

export const ExerciseSchema = z.object({
  type: z.enum(["translate", "build_sentence", "fill_blank", "listen", "speak"]),
  prompt: z.string(),
  sentence_en: z.string(),
  translation_pt: z.string(),
  options: z.array(z.string()),
  correct_option: z.number().int(),
  extra_words: z.array(z.string()),
  tip: z.string(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// Normaliza frases para comparar respostas sem ligar para maiúsculas e pontuação.
export function normalizeSentence(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Descarta exercícios que vieram incoerentes, para o aluno nunca ver uma pergunta quebrada.
export function isValidExercise(ex: Exercise) {
  const hasCorrectOption = ex.correct_option >= 0 && ex.correct_option < ex.options.length;
  switch (ex.type) {
    case "translate":
      return ex.sentence_en.length > 0 && ex.options.length >= 2 && hasCorrectOption;
    case "fill_blank":
      return ex.prompt.includes("___") && ex.options.length >= 2 && hasCorrectOption;
    case "listen":
      return (
        ex.options.length >= 2 &&
        hasCorrectOption &&
        normalizeSentence(ex.options[ex.correct_option]) === normalizeSentence(ex.sentence_en)
      );
    case "build_sentence":
      return ex.translation_pt.length > 0 && normalizeSentence(ex.sentence_en).split(" ").length >= 2;
    case "speak":
      return ex.sentence_en.length > 0;
  }
}
