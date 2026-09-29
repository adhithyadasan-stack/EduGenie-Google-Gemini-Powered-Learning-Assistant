export type ActionType = 'explain' | 'summarize' | 'quiz';

export type GradeLevel = 'Elementary School' | 'Middle School' | 'High School' | 'College / Advanced' | 'General Student';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
  gradeLevel?: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  type: ActionType;
  gradeLevel: GradeLevel;
  timestamp: number;
  content: string | QuizData;
}
