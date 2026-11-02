export type HouseId = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

export interface HouseConfig {
  id: HouseId;
  name: string;
  latinMotto: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  animal: string;
  animalIcon: string;
  exitTile: number;        // Exit onto main board (5, 22, 39, 56)
  corridorEntryTile: number; // Tile from which piece enters final corridor (68, 17, 34, 51)
  corner: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';
  defaultCharacter: string;
}

export const HOUSES: Record<HouseId, HouseConfig> = {
  gryffindor: {
    id: 'gryffindor',
    name: 'Gryffindor',
    latinMotto: 'Fortitudo et Virtus',
    primaryColor: '#8a111e',
    secondaryColor: '#d4af37',
    accentColor: '#f7d070',
    bgGradient: 'from-amber-950 via-red-950 to-stone-950',
    animal: 'León',
    animalIcon: '🦁',
    exitTile: 5,
    corridorEntryTile: 68,
    corner: 'top-left',
    defaultCharacter: 'Harry Potter'
  },
  slytherin: {
    id: 'slytherin',
    name: 'Slytherin',
    latinMotto: 'Astutia et Ambitio',
    primaryColor: '#165b33',
    secondaryColor: '#c0c0c0',
    accentColor: '#4ade80',
    bgGradient: 'from-emerald-950 via-teal-950 to-stone-950',
    animal: 'Serpiente',
    animalIcon: '🐍',
    exitTile: 22,
    corridorEntryTile: 17,
    corner: 'top-right',
    defaultCharacter: 'Draco Malfoy'
  },
  ravenclaw: {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    latinMotto: 'Sapientia et Ingenium',
    primaryColor: '#1e3a8a',
    secondaryColor: '#cd7f32',
    accentColor: '#60a5fa',
    bgGradient: 'from-blue-950 via-indigo-950 to-stone-950',
    animal: 'Águila',
    animalIcon: '🦅',
    exitTile: 39,
    corridorEntryTile: 34,
    corner: 'bottom-right',
    defaultCharacter: 'Luna Lovegood'
  },
  hufflepuff: {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    latinMotto: 'Iustitia et Fidelitas',
    primaryColor: '#c49a15',
    secondaryColor: '#1c1917',
    accentColor: '#fde047',
    bgGradient: 'from-yellow-950 via-amber-950 to-stone-950',
    animal: 'Tejón',
    animalIcon: '🦡',
    exitTile: 56,
    corridorEntryTile: 51,
    corner: 'bottom-left',
    defaultCharacter: 'Cedric Diggory'
  }
};

export const HOUSE_ORDER: HouseId[] = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];

export const SAFE_TILES: number[] = [5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68];

export interface Token {
  id: number; // 0, 1, 2, 3
  house: HouseId;
  state: 'home' | 'board' | 'corridor' | 'goal';
  position: number; // For 'home': 0..3; For 'board': 1..68; For 'corridor': 1..7; For 'goal': 8
}

export type PlayerType = 'human' | 'bot';
export type BotDifficulty = 'novato' | 'prefecto' | 'auror';

export interface Player {
  house: HouseId;
  name: string;
  type: PlayerType;
  difficulty?: BotDifficulty;
  isActive: boolean;
  tokens: Token[];
  consecutiveSixes: number;
}

export interface DiceState {
  count: 1 | 2;
  values: number[]; // e.g. [5] or [4, 6]
  used: boolean[];  // tracking which die value was used in current turn
  isRolling: boolean;
  canRoll: boolean;
  hasRolled: boolean;
  pendingBonus: number | null; // e.g. 20 for capture, 10 for goal
}

export interface GameSettings {
  diceCount: 1 | 2;
  soundEnabled: boolean;
  animationSpeed: 'normal' | 'fast';
  exactGoalNeeded: boolean;
  autoPass: boolean;
}

export interface MoveOption {
  tokenId: number;
  dieValue: number;
  dieIndex: number;
  fromState: 'home' | 'board' | 'corridor';
  fromPosition: number;
  toState: 'board' | 'corridor' | 'goal';
  toPosition: number;
  isCapture: boolean;
  capturedToken?: { house: HouseId; tokenId: number };
  isEnteringGoal: boolean;
}

export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  text: string;
  house: HouseId;
  type: 'roll' | 'move' | 'capture' | 'goal' | 'extra_turn' | 'penalty' | 'start';
}

export interface GameState {
  id: string;
  players: Player[];
  currentTurnIndex: number;
  dice: DiceState;
  settings: GameSettings;
  history: GameHistoryEntry[];
  winner: HouseId | null;
  status: 'setup' | 'playing' | 'paused' | 'game_over';
  selectedTokenId: number | null;
  lastCapturedHouse: HouseId | null;
}
