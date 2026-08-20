import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentProfile, sessionLogs, mode = "insights" } = body;

    const ai = getGeminiClient();

    if (mode === "generate_worksheet") {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `You are an early childhood curriculum specialist creating a printable offline practice worksheet for 7-year-old Raena.
Profile: Math Level ${studentProfile?.levelMath || 1}, Phonics Level ${studentProfile?.levelPhonics || 1}, Sight Words Level ${studentProfile?.levelSightWords || 1}.
Generate a fun, beautifully formatted 1-page printable worksheet with:
1. Title and header ("Raena's Daily Sunshine Worksheet")
2. Section A: 3 Visual Math Problems (with emojis for tracing/counting)
3. Section B: 3 Phonics & Missing Letter exercises (e.g. C_T, P_G, S_N)
4. Section C: 2 Sight Word Tracing & Rainbow Writing Prompts
5. Section D: 1 Creative Drawing & Sentence Prompt`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              worksheetTitle: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              mathSection: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    problemNumber: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    visualAid: { type: Type.STRING },
                    blankLine: { type: Type.STRING },
                  },
                  required: ["problemNumber", "question", "visualAid", "blankLine"],
                },
              },
              phonicsSection: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    wordWithBlank: { type: Type.STRING },
                    clue: { type: Type.STRING },
                    choices: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["wordWithBlank", "clue", "choices"],
                },
              },
              sightWordsSection: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    traceGuide: { type: Type.STRING },
                    sentence: { type: Type.STRING },
                  },
                  required: ["word", "traceGuide", "sentence"],
                },
              },
              creativeSection: {
                type: Type.OBJECT,
                properties: {
                  prompt: { type: Type.STRING },
                  starterSentence: { type: Type.STRING },
                },
                required: ["prompt", "starterSentence"],
              },
            },
            required: ["worksheetTitle", "subtitle", "mathSection", "phonicsSection", "sightWordsSection", "creativeSection"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return NextResponse.json({ success: true, worksheet: parsed });
    }

    // Default: generate pedagogical diagnostic report for parents
    const logSummary = Array.isArray(sessionLogs)
      ? sessionLogs
          .slice(0, 10)
          .map(
            (l: { subject: string; durationSeconds: number; problemsCorrect: number; problemsAttempted: number }) =>
              `- ${l.subject}: ${l.problemsCorrect}/${l.problemsAttempted} correct (${Math.round(l.durationSeconds / 60)} min)`
          )
          .join("\n")
      : "No previous logs yet.";

    const promptText = `Analyze learning progress for 7-year-old Raena (starting without formal schooling):
Profile:
- Age: 7
- Total Stars: ${studentProfile?.totalStars || 0}
- Daily Streak: ${studentProfile?.currentStreak || 1} days
- Math Level: ${studentProfile?.levelMath || 1}
- Phonics Level: ${studentProfile?.levelPhonics || 1}
- Sight Words Level: ${studentProfile?.levelSightWords || 1}
- Storytelling Level: ${studentProfile?.levelStorytelling || 1}
- Recent Learning Activity:
${logSummary}

Provide a reassuring, deeply professional developmental evaluation for Raena's parents, including key strengths, developmental milestones achieved, specific focus recommendations for tomorrow's 2-hour session, and estimated readiness for 1st grade foundational benchmarks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallAssessment: { type: Type.STRING, description: "Warm, professional 2-3 sentence overview" },
            milestonesAchieved: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 specific skills Raena has mastered",
            },
            nextFocusAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 actionable recommendations for the parent / AI tutor",
            },
            twoHourDailyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeBlock: { type: Type.STRING, description: "e.g. '30 Minutes'" },
                  subject: { type: Type.STRING },
                  activityDescription: { type: Type.STRING },
                  pedagogicalGoal: { type: Type.STRING },
                },
                required: ["timeBlock", "subject", "activityDescription", "pedagogicalGoal"],
              },
            },
            gradeReadinessScore: { type: Type.INTEGER, description: "Percentage readiness (e.g. 78)" },
            encouragingNoteToParents: { type: Type.STRING },
          },
          required: [
            "overallAssessment",
            "milestonesAchieved",
            "nextFocusAreas",
            "twoHourDailyPlan",
            "gradeReadinessScore",
            "encouragingNoteToParents",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, insights: parsed });
  } catch (error: unknown) {
    console.error("Parent insights API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate parent insights",
      },
      { status: 500 }
    );
  }
}
