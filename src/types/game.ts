export interface GameCardItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string; // Emoji or visual icon
  tag: string; // E.g., 'Kỹ thuật', 'Biện pháp'
  targetId: string; // Matching target ID
  score: number;
  explanation: string;
}

export interface GameTargetItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  hint: string;
  color?: string;
}

export interface GameRound {
  id: number;
  title: string;
  topic: string;
  instruction: string;
  description: string;
  cards: GameCardItem[];
  targets: GameTargetItem[];
}

export interface GameData {
  title: string;
  grade: string;
  subject: string;
  topic: string;
  description: string;
  rounds: GameRound[];
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandPoint {
  x: number; // Screen pixel x
  y: number; // Screen pixel y
}

export interface HandTrackingState {
  isSupported: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  isHandPresent: boolean;
  landmarks: NormalizedLandmark[] | null;
  cursor: HandPoint; // Smooth index tip
  thumbTip: HandPoint; // Smooth thumb tip
  pinchDistance: number;
  isPinching: boolean;
  error: string | null;
}

export interface DraggedCardState {
  cardId: string;
  offsetX: number; // cursor to card left
  offsetY: number; // cursor to card top
  currentX: number; // current left
  currentY: number; // current top
  isPinchSource: boolean; // true = hand pinch, false = mouse drag
}

export interface FloatingScore {
  id: string;
  x: number;
  y: number;
  text: string;
}
