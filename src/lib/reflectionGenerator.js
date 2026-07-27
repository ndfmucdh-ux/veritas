import { base44 } from "@/api/base44Client";

/**
 * THE single shared LLM generator for the reader page.
 * Both GuidedReflection AND DevotionalPanel (mood panel) call invokeReflection —
 * there is no separate generation path anywhere else.
 */
export const invokeReflection = (params) => base44.integrations.Core.InvokeLLM(params);

export const langInstruction = (isEs) =>
  isEs ? "Respond entirely in Spanish." : "Respond in English.";

// Used by GuidedReflection — plain-text single question.
export async function generateGuidedQuestion({ book, chapter, verses, isEs }) {
  const sampleText = (verses || []).slice(0, 6).map(v => `${v.verse}. ${v.text}`).join(" ");
  const prompt = `${langInstruction(isEs)} You are a gentle spiritual guide. Based on this passage from ${book} chapter ${chapter}:\n\n"${sampleText}"\n\nGenerate ONE single short, personal, reflective question (max 25 words) that helps the reader apply this scripture to their daily life. Return only the question, nothing else.`;
  const result = await invokeReflection({ prompt });
  return typeof result === "string" ? result.trim() : null;
}

// Used by DevotionalPanel — same invokeReflection call, same prompt style,
// with the selected mood woven into the prompt and a structured response.
export async function generateMoodDevotional({ verseRef, verseText, translation, moodContext, isEs }) {
  const prompt = `${langInstruction(isEs)} You are a gentle spiritual guide writing a brief, mood-aware devotional.

Verse: ${verseRef} (${translation})
"${verseText}"

The reader's current mood: ${moodContext}.

Write a warm, personal devotional specific to BOTH this verse and this mood:
- title: a short evocative title (max 6 words)
- reflection: 2-3 sentences explaining the verse's meaning for someone in this mood
- insights: 2-3 short key insights (each under 20 words)
- application: one practical action for today (1-2 sentences)
- prayer: a brief closing prayer (1-2 sentences)`;

  const result = await invokeReflection({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        reflection: { type: "string" },
        insights: { type: "array", items: { type: "string" } },
        application: { type: "string" },
        prayer: { type: "string" },
      },
      required: ["title", "reflection"],
    },
  });

  if (result && typeof result === "object" && result.reflection) return result;
  throw new Error(`Malformed LLM response: ${JSON.stringify(result)?.slice(0, 200)}`);
}