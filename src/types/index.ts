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
  area?: number; // 면적(km²)
  continents?: string[];
  translations?: {
    [languageCode: string]: {
      official: string;
      common: string;
    };
  };
}

// 간소화된 국가 정보 (UI 표시용)
export interface SimpleCountry {
  name: string;
  capital: string;
  cca3: string;
  flagPng: string;
  latLng: number[];
  continent: string;
  flagEmoji: string;
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
}

// 면적/인구 퀴즈 타입 열거형
export enum AreaPopulationQuizType {
  SINGLE_CHOICE = "SINGLE_CHOICE", // 단일 선택 (가장 큰/작은 국가)
  ORDER_SELECTION = "ORDER_SELECTION", // 순서 선택 (큰/작은 순서대로)
}

// 면적/인구 퀴즈 데이터 타입
export enum AreaPopulationDataType {
  AREA = "AREA", // 면적
  POPULATION = "POPULATION", // 인구
}

// 퀴즈 자동 진행 설정 타입
export enum QuizProgressMode {
  AUTO = "AUTO", // 자동으로 다음 문제로 넘어감
  MANUAL = "MANUAL", // 수동으로 다음 문제 버튼 누름
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

// 면적/인구 퀴즈를 위한 타입 정의
export interface AreaPopulationQuiz {
  question: string; // 질문
  options: string[]; // 국가 이름 (문제 옵션)
  correctAnswer: string | string[]; // 정답 (단일 선택 또는 순서 배열)
  dataType: AreaPopulationDataType; // 면적 또는 인구
  quizType: AreaPopulationQuizType; // 퀴즈 타입 (단일 선택 또는 순서 선택)
  optionDetails?: {
    // 선택지에 대한 추가 정보 (UI 표시용)
    [countryName: string]: {
      area?: number;
      population?: number;
    };
  };
}

// 다국어 명소 이름 인터페이스
export interface LandmarkName {
  en: string;
  ko: string;
}

// 명소 정보 인터페이스
export interface Landmark {
  id: string;
  name: string | LandmarkName;
  imageUrl: string;
  description: string;
  country: {
    name: string;
    code: string; // cca3
  };
  continent: string;
  difficulty: string;
}

/**
 * 명소 퀴즈 인터페이스 - 명소명을 맞추는 퀴즈
 */
export interface LandmarkQuiz {
  id: string;
  imageUrl: string;
  question: string;
  correctLandmark: string;
  landmarkOptions: string[];
  correctAnswer: string;
  countryName: string;
}

// 네비게이션 파라미터 타입
export type RootStackParamList = {
  Home: undefined;
  FlagQuiz: { difficulty?: Difficulty };
  CapitalQuiz: { difficulty?: Difficulty };
  LandmarkQuiz: { difficulty?: Difficulty };
  AreaPopulationQuiz: { difficulty?: Difficulty };
  QuizResult: { result: QuizResult };
  Settings: undefined;
};
