import { GoogleGenAI } from "@google/genai";
import { GameStage } from "../types";

// Initialize Gemini Client
// Note: In a real deployment, ensure process.env.API_KEY is set. 
// If not set, the app should handle it gracefully (we will do this in the UI layer).
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateStorySegment = async (stage: GameStage): Promise<string> => {
  if (!ai) {
    return getFallbackStory(stage);
  }

  const basePrompt = `
    You are the narrator of a cinematic, mysterious, and emotional interactive story akin to the show 'Dark' or '1899'. 
    The user is a female protagonist named "The Guardian". 
    She is traveling through broken timelines to restore reality before the New Year begins.
    Write a short, poetic, deeply emotional, and mysterious paragraph (max 60 words) setting the scene.
    Style: Glassy, Neon, Time-bending, Ethereal.
  `;

  let specificPrompt = "";

  switch (stage) {
    case GameStage.CHAPTER_1_LOGIC:
      specificPrompt = "Scene: She arrives at a frozen clock tower floating in a purple void. Time has stopped. She needs to solve a riddle to restart the gears.";
      break;
    case GameStage.CHAPTER_2_MAZE:
      specificPrompt = "Scene: The clock ticks, but the path ahead is twisted. She enters a neon labyrinth of light and shadow. She must navigate the confusion to find clarity.";
      break;
    case GameStage.CHAPTER_3_MEMORY:
      specificPrompt = "Scene: The labyrinth dissolves. Now she sees floating shards of memories—stickers, emojis, moments. She must match them to make the timeline whole again.";
      break;
    case GameStage.FINALE:
      specificPrompt = "Scene: She has succeeded. The universe is whole. The sky explodes into fireworks. It is a moment of pure joy, love, and a fresh start for the New Year.";
      break;
    default:
      return "The void stares back...";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${basePrompt} \n\n ${specificPrompt}`,
    });
    return response.text || getFallbackStory(stage);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackStory(stage);
  }
};

const getFallbackStory = (stage: GameStage): string => {
  switch (stage) {
    case GameStage.CHAPTER_1_LOGIC:
      return "The Grand Clock stands frozen in a sea of violet stars. The gears screech in silence. Only logic can oil these rusted mechanisms of destiny.";
    case GameStage.CHAPTER_2_MAZE:
      return "The path fractures into neon splinters. A labyrinth of light emerges from the darkness. Trust your intuition to find the way through the chaos.";
    case GameStage.CHAPTER_3_MEMORY:
      return "Reality is putting itself back together, piece by piece. But the memories are scattered like stardust. Find the pairs to bind the timeline.";
    case GameStage.FINALE:
      return "The gears align. The timeline heals. A brilliant light consumes the darkness, heralding a beginning full of hope and magic.";
    default:
      return "Time waits for no one...";
  }
};