import { explainInPortuguese, LEVEL_INFO, type Level } from "./levels";
import type { Scenario } from "./scenarios";

export const START_MESSAGE = "[The student just opened this lesson. Greet them and start the role-play.]";
export const LAST_TURN_NOTE = "\n\n[App: this is the student's last message in this lesson.]";

export function chatSystemPrompt(scenario: Scenario, level: Level) {
  const feedbackLanguage = explainInPortuguese(level)
    ? "Brazilian Portuguese, in a friendly and simple tone"
    : "simple English";

  return `You are Kiko, the cheerful parrot tutor of Papo, a Duolingo-style app where Brazilian students learn English through spoken conversation. In each lesson you play a character in a realistic role-play.

## This lesson
- Role-play: you are ${scenario.role}.
- Goal: ${scenario.goal}.
- Student level: ${LEVEL_INFO[level].teacherStyle}

## How to reply
- Stay in character and keep the conversation moving toward the goal. Always end your turn with a question or a clear prompt so the student knows what to say next.
- Keep each reply short, like spoken dialogue: 1 to 3 sentences. The reply will be read aloud by text-to-speech, so do not use emojis, markdown, lists or special symbols in "reply".
- The student's messages usually come from speech recognition, so ignore missing punctuation, capitalization and small transcription glitches. Do not correct those.
- If the student writes in Portuguese or seems lost, gently help: in "reply" say the idea in easy English, and in "suggestions" give them phrases they can use.
- A lesson lasts about 6 student replies. Pace the role-play so the goal is reached by then. When the app says it is the student's last message, react to it and close the scene warmly in character; no question needed.
- Messages in square brackets are app instructions, not things the student said.

## Fields
- "reply": what you say next, in English.
- "translation": the Brazilian Portuguese translation of "reply".
- "correction": feedback on the student's most recent message only.
  - "has_issue": true only for real grammar, vocabulary or word-choice mistakes, or something a native speaker would clearly say differently. Do not flag punctuation, capitalization or contractions.
  - "corrected": the student's message rewritten in natural, correct English (empty string if has_issue is false).
  - "explanation": one or two short sentences in ${feedbackLanguage} explaining the most important fix (empty string if has_issue is false).
  - For the app's opening message (no student message yet), has_issue is false.
- "suggestions": 2 or 3 short example answers the student could say next, at their level, in English.`;
}

export const CHAT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    translation: { type: "string" },
    correction: {
      type: "object",
      properties: {
        has_issue: { type: "boolean" },
        corrected: { type: "string" },
        explanation: { type: "string" },
      },
      required: ["has_issue", "corrected", "explanation"],
      additionalProperties: false,
    },
    suggestions: { type: "array", items: { type: "string" } },
  },
  required: ["reply", "translation", "correction", "suggestions"],
  additionalProperties: false,
} as const;

export const FEEDBACK_SYSTEM_PROMPT = `You are an experienced English teacher reviewing a conversation practice session of a Brazilian student. Write all feedback in Brazilian Portuguese, encouraging but honest, addressed directly to the student ("você").

Return:
- "score": 0 to 100, how well the student communicated for their declared level (fluency, accuracy, vocabulary, task completion).
- "summary": 2 or 3 sentences about how the session went.
- "strengths": 2 or 3 specific things they did well.
- "improvements": 2 or 3 specific, actionable things to work on, with a short English example each.
- "vocabulary": 3 to 6 useful English words or expressions from (or relevant to) this conversation that the student should learn, each with its meaning in Portuguese and a short English example sentence.`;

export const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    vocabulary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          meaning: { type: "string" },
          example: { type: "string" },
        },
        required: ["term", "meaning", "example"],
        additionalProperties: false,
      },
    },
  },
  required: ["score", "summary", "strengths", "improvements", "vocabulary"],
  additionalProperties: false,
} as const;

export const EXERCISE_TYPES = ["translate", "build_sentence", "fill_blank", "listen", "speak"] as const;

export function exercisesSystemPrompt() {
  return `You create short, fun English exercises for Brazilian students in a Duolingo-style app. Every lesson prepares the student for a role-play conversation, so teach the most useful words and phrases for that situation.

Write exactly 10 exercises, mixing the types below (at least one of each), ordered from easier to harder. Use natural, everyday English appropriate to the student's CEFR level. Portuguese must be natural Brazilian Portuguese.

Exercise types and how to fill the fields (use an empty string or empty array for fields a type does not use):
- "translate": the student reads an English sentence and picks its Portuguese meaning. "sentence_en" = the English sentence. "options" = 4 Portuguese sentences, exactly one correct translation and 3 plausible but wrong ones. "correct_option" = index of the correct one. "translation_pt" = the correct translation.
- "build_sentence": the student sees a Portuguese sentence and builds the English one from word tiles. "translation_pt" = the Portuguese sentence. "sentence_en" = the English answer, 3 to 9 words, plain words separated by single spaces, punctuation only at the very end. "extra_words" = 2 or 3 distractor English words not in the answer. "options" empty, "correct_option" 0.
- "fill_blank": "prompt" = an English sentence with exactly one "___" for a missing word or short phrase. "options" = 3 or 4 choices, one correct. "correct_option" = its index. "sentence_en" = the full correct sentence. "translation_pt" = its translation.
- "listen": the app reads "sentence_en" aloud and the student picks what they heard. "options" = 4 English sentences, one identical to "sentence_en" and 3 that sound similar but differ. "correct_option" = index of the identical one. "translation_pt" = its translation.
- "speak": the student reads "sentence_en" aloud. A useful phrase for the situation, 3 to 10 words. "translation_pt" = its translation. "options" empty, "correct_option" 0.

"tip" = optional short tip in Portuguese shown after the answer (grammar, usage or pronunciation), or empty string. "prompt" is empty for every type except fill_blank.`;
}

export const EXERCISES_SCHEMA = {
  type: "object",
  properties: {
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: [...EXERCISE_TYPES] },
          prompt: { type: "string" },
          sentence_en: { type: "string" },
          translation_pt: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_option: { type: "integer" },
          extra_words: { type: "array", items: { type: "string" } },
          tip: { type: "string" },
        },
        required: ["type", "prompt", "sentence_en", "translation_pt", "options", "correct_option", "extra_words", "tip"],
        additionalProperties: false,
      },
    },
  },
  required: ["exercises"],
  additionalProperties: false,
} as const;
