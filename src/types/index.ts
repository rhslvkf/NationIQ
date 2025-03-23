// 난이도 정의
export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  VERY_HARD = "veryHard",
}

// 국가 정보 인터페이스
export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  cca2: string; // ISO 3166-1 alpha-2 코드
  cca3: string; // ISO 3166-1 alpha-3 코드
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region?: string;
  subregion?: string;
  population: number;
  continents?: string[];
  translations?: {
    [languageCode: string]: {
      official: string;
      common: string;
    };
  };
}

// 퀴즈 문제 인터페이스
export interface Question {
  id: string;
  flag: string;
  options: string[];
  correctAnswer: string;
  translatedOptions?: Record<string, string[]>; // 다국어 선택지
}

// 퀴즈 결과 인터페이스
export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  difficulty: Difficulty;
}

// 네비게이션 파라미터 타입
export type RootStackParamList = {
  Home: undefined;
  FlagQuiz: { difficulty: Difficulty };
  QuizResult: { result: QuizResult };
  Settings: undefined;
};
