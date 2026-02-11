export enum DifficultyLevel {
  ALL = -1,
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

export interface IDifficult {
  id: string;
  label: string;
  identifier: DifficultyLevel;
}

export const DIFFICULTY_LEVELS: IDifficult[] = [
  { id: 'all', label: 'Todos', identifier: DifficultyLevel.ALL },
  { id: 'easy', label: 'Fácil', identifier: DifficultyLevel.EASY },
  { id: 'medium', label: 'Medio', identifier: DifficultyLevel.MEDIUM },
  { id: 'hard', label: 'Difícil', identifier: DifficultyLevel.HARD },
];