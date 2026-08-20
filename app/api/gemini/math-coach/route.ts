import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      level = 1,
      mode = "generate_problem", // 'generate_problem' | 'explain_step_by_step'
      currentProblem,
      wrongAnswerGiven,
    } = body;

    const ai = getGeminiClient();

    if (mode === "explain_step_by_step" && currentProblem) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `You are Barnaby the friendly Math Tutor for Raena, a sweet 7-year-old girl who has not started formal school yet and is learning basic math visually.
The current math problem is: "${currentProblem.prompt}". Correct answer is ${currentProblem.correctAnswer}.
Raena tried answering ${wrongAnswerGiven !== undefined ? wrongAnswerGiven : "and is stuck"}.
Explain the solution step-by-step in super simple, warm, joyful words suitable for a 7-year-old. Use emojis for counting (e.g. 🍎, ⭐, 🐶).
Break it down into 3-4 friendly mini steps that she can count along with. Provide encouraging words.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              gentleEncouragement: {
                type: Type.STRING,
                description: "Warm, encouraging message celebrating her effort",
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 step by step visual counting lines",
              },
              interactivePrompt: {
                type: Type.STRING,
                description: "A fun wrap-up question asking Raena to tap the correct number",
              },
            },
            required: ["gentleEncouragement", "steps", "interactivePrompt"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return NextResponse.json({ success: true, explanation: parsed });
    }

    // Default: generate dynamic adaptive problem
    const systemPrompt = `You are an expert early childhood math educator designing gamified math challenges for Raena, a 7-year-old beginner.
Her current math level is ${level} (where Level 1 is Counting 1-10, Level 2 is Addition within 10, Level 3 is Subtraction within 10, Level 4 is Numbers to 20 & Ten-Frames, Level 5 is Early Equal Groups / Multiplication Concepts).
Create an engaging, real-world story problem with cute emojis (fruits, animals, stars, toys, flowers).
Always ensure numbers are strictly positive integers suitable for a 7yo. Provide 3 multiple choice options (one correct, two close distractors).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate 1 adaptive math challenge for Level ${level}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            level: { type: Type.INTEGER },
            type: {
              type: Type.STRING,
              enum: ["counting", "addition", "subtraction", "ten_frame", "early_mult", "comparing"],
            },
            prompt: { type: Type.STRING, description: "Engaging 1-sentence story question" },
            visualEmoji: { type: Type.STRING, description: "Emoji icon used for counters, e.g. 🍓, 🐱, 🎈" },
            visualCountA: { type: Type.INTEGER, description: "Count of first group of items (1 to 10)" },
            visualCountB: { type: Type.INTEGER, description: "Count of second group (if addition/subtraction/mult) or 0" },
            options: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "Array of 3 integer options containing the correct answer",
            },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING, description: "Warm 1-sentence explanation" },
            stepByStep: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 short bullet steps to solve",
            },
            manipulativeType: {
              type: Type.STRING,
              enum: ["objects", "ten_frame", "number_line", "groups"],
            },
          },
          required: [
            "id",
            "level",
            "type",
            "prompt",
            "visualEmoji",
            "visualCountA",
            "options",
            "correctAnswer",
            "explanation",
            "stepByStep",
            "manipulativeType",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, problem: parsed });
  } catch (error: unknown) {
    console.error("Math coach API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate math coach response",
      },
      { status: 500 }
    );
  }
}
