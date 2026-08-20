import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = "phonics_exercise", // 'phonics_exercise' | 'sight_word' | 'sound_breakdown'
      level = 1,
      targetWord,
    } = body;

    const ai = getGeminiClient();

    if (mode === "sound_breakdown" && targetWord) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `You are a phonics reading teacher for 7-year-old Raena.
Break down the word "${targetWord}" phonetically into individual sounds (phonemes), like:
For CAT: /k/ (c) + /æ/ (a) + /t/ (t) -> CAT.
Provide a cheerful rhyme and a fun 1-sentence clue.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonemes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of individual sounds like ['/k/', '/æ/', '/t/']",
              },
              soundOutSpelling: { type: Type.STRING, description: "e.g. 'k - ah - t'" },
              rhymingWords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 simple rhyming words",
              },
              funFact: { type: Type.STRING, description: "Friendly 1-sentence cheer" },
            },
            required: ["word", "phonemes", "soundOutSpelling", "rhymingWords", "funFact"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return NextResponse.json({ success: true, breakdown: parsed });
    }

    if (mode === "sight_word") {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Generate a high-frequency beginner sight word (Dolch Pre-Primer / Primer) suited for 7-year-old Raena.
Provide an example sentence featuring Raena, and scrambled uppercase letters for spelling practice.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              word: { type: Type.STRING, description: "Sight word in UPPERCASE, e.g. 'SEE'" },
              category: { type: Type.STRING, enum: ["pre-primer", "primer", "grade-1"] },
              sentence: { type: Type.STRING, description: "Sentence featuring Raena or animals" },
              audioExample: { type: Type.STRING, description: "Spoken word pronunciation" },
              scrambledLetters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Uppercase letters of the word scrambled",
              },
              emoji: { type: Type.STRING, description: "Matching visual emoji" },
            },
            required: ["id", "word", "category", "sentence", "audioExample", "scrambledLetters", "emoji"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return NextResponse.json({ success: true, sightWord: parsed });
    }

    // Default: generate phonics CVC / Digraph exercise
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate 1 interactive phonics word-building challenge for Raena (Level ${level}: CVC words, short vowels, or simple blends like sh, ch, th).
Target word must be 3-4 letters. One missing letter to fill in, with 3 choices.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            sound: { type: Type.STRING, description: "The key sound being practiced (e.g. 'a', 'sh', 'u')" },
            soundExample: { type: Type.STRING, description: "e.g. 'short /æ/ like in apple'" },
            audioPronunciation: { type: Type.STRING, description: "Phonetic clue like 'ah'" },
            targetWord: { type: Type.STRING, description: "UPPERCASE word e.g. 'BAT'" },
            missingLetterIndex: { type: Type.INTEGER, description: "0-indexed position of missing letter" },
            letterChoices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 3 uppercase letter options (one correct)",
            },
            imageEmoji: { type: Type.STRING, description: "Illustrative emoji" },
            rhymingWords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 simple rhyming words",
            },
            clue: { type: Type.STRING, description: "1-sentence age-appropriate clue" },
          },
          required: [
            "id",
            "sound",
            "soundExample",
            "audioPronunciation",
            "targetWord",
            "missingLetterIndex",
            "letterChoices",
            "imageEmoji",
            "rhymingWords",
            "clue",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, exercise: parsed });
  } catch (error: unknown) {
    console.error("Phonics tutor API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate phonics response",
      },
      { status: 500 }
    );
  }
}
