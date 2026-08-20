import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      theme = "Adventure in Sparkle Meadow",
      storyTitle = "The Mystery of the Flying Tea Party",
      chapterNumber = 1,
      raenaInput = "",
      storyHistory = [],
    } = body;

    const ai = getGeminiClient();

    const historyContext = Array.isArray(storyHistory)
      ? storyHistory
          .map(
            (c: { chapterNumber?: number; storyStarter?: string; weavedNarrative?: string }) =>
              `Chapter ${c.chapterNumber}: ${c.weavedNarrative || c.storyStarter}`
          )
          .join("\n")
      : "";

    const systemPrompt = `You are an imaginative children's book co-author and kind writing mentor for 7-year-old Raena.
She has not started formal school and is just learning to express ideas in words and sentences.
When Raena gives you an idea or sentence:
1. GENTLE CORRECTION: If there are spelling or grammar mistakes, provide an ultra-gentle, loving praise with a small friendly correction (e.g. "I love your idea about the 'pup'! In our story book, we spell it p-u-p-p-y 🐶"). If her sentence is already great, praise her creativity.
2. WEAVED NARRATIVE: Seamlessly incorporate her idea into a 3-4 sentence magical, vivid story paragraph written at an accessible 1st-grade reading level.
3. NEXT PROMPT: Ask a clear, exciting "What happens next?" question with 4 suggested phrase chips to help her write her next contribution.
4. COMPREHENSION: Provide a fun 1-question multiple-choice check to reinforce reading retention.`;

    const promptText = `Story Title: "${storyTitle}" (Theme: ${theme})
Previous Story Context:
${historyContext || "Beginning of the adventure"}

Raena's input for Chapter ${chapterNumber}: "${raenaInput || "I want to start the adventure!"}"

Please generate the next chapter continuation, gentle feedback on Raena's sentence, and the next interactive prompt.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapterNumber: { type: Type.INTEGER },
            visualEmoji: { type: Type.STRING, description: "Matching story scene emoji" },
            imagePromptDescription: { type: Type.STRING, description: "Vivid illustration description" },
            gentleCorrection: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                corrected: { type: Type.STRING },
                encouragement: { type: Type.STRING },
              },
              required: ["original", "corrected", "encouragement"],
            },
            weavedNarrative: {
              type: Type.STRING,
              description: "The 3-4 sentence unfolding story incorporating Raena's words",
            },
            nextPrompt: {
              type: Type.STRING,
              description: "Exciting question asking what Raena wants to do next",
            },
            suggestedWords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 simple suggested phrase options for Raena to click or build from",
            },
            comprehensionQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer"],
            },
          },
          required: [
            "chapterNumber",
            "visualEmoji",
            "imagePromptDescription",
            "gentleCorrection",
            "weavedNarrative",
            "nextPrompt",
            "suggestedWords",
            "comprehensionQuestion",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, chapter: parsed });
  } catch (error: unknown) {
    console.error("Story weave API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to weave story",
      },
      { status: 500 }
    );
  }
}
