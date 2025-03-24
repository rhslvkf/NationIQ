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

// 퀴즈 타입 열거형 추가
export enum QuizType {
  COUNTRY_TO_CAPITAL = "COUNTRY_TO_CAPITAL", // 국가 -> 수도
  CAPITAL_TO_COUNTRY = "CAPITAL_TO_COUNTRY", // 수도 -> 국가
  MIXED = "MIXED", // 혼합
  LANDMARK_TO_COUNTRY = "LANDMARK_TO_COUNTRY", // 명소 -> 국가
  LANDMARK_TO_NAME = "LANDMARK_TO_NAME", // 명소 -> 명소명
  LANDMARK_MIXED = "LANDMARK_MIXED", // 명소 혼합
}

// 수도 퀴즈를 위한 타입 정의
export interface CapitalQuiz {
  question: string; // 질문 (국가 이름 또는 수도 이름)
  options: string[]; // 보기 옵션들
  correctAnswer: string; // 정답
  quizType: QuizType; // 퀴즈 타입
  countryName?: string; // 국가 이름 (UI 표시용)
  capitalName?: string; // 수도 이름 (UI 표시용)
}

// 명소 정보 인터페이스
export interface Landmark {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  country: {
    name: string;
    code: string; // cca3
  };
  continent: string;
  difficulty: string;
}

// 명소 퀴즈를 위한 타입 정의
export interface LandmarkQuiz {
  id: string;
  question: string; // 질문
  imageUrl: string; // 명소 이미지 URL
  options: string[]; // 보기 옵션들
  correctAnswer: string; // 정답
  quizType: QuizType; // 퀴즈 타입
  landmarkName: string; // 명소 이름
  countryName: string; // 국가 이름
}

// 네비게이션 파라미터 타입
export type RootStackParamList = {
  Home: undefined;
  FlagQuiz: { difficulty?: Difficulty };
  CapitalQuiz: { difficulty?: Difficulty };
  LandmarkQuiz: { difficulty?: Difficulty };
  QuizResult: { result: QuizResult };
  Settings: undefined;
};
