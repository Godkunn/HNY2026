export enum GameStage {
  INTRO = 'INTRO',
  CHAPTER_1_LOGIC = 'CHAPTER_1_LOGIC', // The Broken Clock
  CHAPTER_2_MAZE = 'CHAPTER_2_MAZE',   // The Void Labyrinth
  CHAPTER_3_MEMORY = 'CHAPTER_3_MEMORY', // The Fragmented Memories
  FINALE = 'FINALE'                    // New Year Celebration
}

export interface StoryContent {
  text: string;
  imageKeyword: string;
}

export type PuzzleStatus = 'PENDING' | 'SOLVED' | 'FAILED';

export interface GridPosition {
  x: number;
  y: number;
}