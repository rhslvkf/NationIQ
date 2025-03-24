/**
 * 명소 퀴즈 생성 서비스
 * 로컬 명소 데이터를 활용하여 다양한 명소 퀴즈를 생성합니다.
 */

import { LandmarkQuiz, Difficulty, Landmark, LandmarkName } from "../types";
import landmarks from "../data/localLandmarkData";
import i18n from "../i18n";

// 배열을 무작위로 섞는 유틸리티 함수
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 랜덤 숫자 배열 생성 유틸리티 함수
const getRandomNumbers = (min: number, max: number, count: number): number[] => {
  const numbers: number[] = [];
  const availableNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // 사용 가능한 숫자가 요청된 개수보다 적을 경우 사용 가능한 모든 숫자 반환
  if (availableNumbers.length <= count) {
    return shuffleArray(availableNumbers);
  }

  // 랜덤 숫자 선택
  const shuffled = shuffleArray(availableNumbers);
  return shuffled.slice(0, count);
};

// 난이도 열거형을 문자열로 변환하는 함수
const getDifficultyString = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case Difficulty.EASY:
      return "easy";
    case Difficulty.MEDIUM:
      return "medium";
    case Difficulty.HARD:
      return "hard";
    case Difficulty.VERY_HARD:
      return "veryHard";
    default:
      return "easy";
  }
};

/**
 * 현재 언어에 맞는 명소 이름을 반환하는 함수
 */
const getLandmarkNameByLocale = (name: string | LandmarkName): string => {
  if (typeof name === "string") {
    return name;
  }

  const currentLang = i18n.locale.split("-")[0];
  return currentLang === "ko" ? name.ko : name.en;
};

/**
 * 명소 퀴즈 데이터를 생성합니다.
 * 명소 사진을 보고 해당 명소의 이름을 맞추는 퀴즈입니다.
 *
 * @param difficulty 난이도
 * @param count 문제 개수
 * @returns 생성된 퀴즈 배열
 */
export function generateLandmarkQuiz(difficulty: Difficulty, count: number): LandmarkQuiz[] {
  // 모든 명소 데이터 가져오기
  const allLandmarks: Landmark[] = landmarks;

  // 해당 난이도의 명소 데이터 필터링
  const difficultyStr = getDifficultyString(difficulty);
  const filteredLandmarks = allLandmarks.filter((landmark) => {
    if (difficulty === Difficulty.EASY) {
      return landmark.difficulty === "easy";
    } else if (difficulty === Difficulty.MEDIUM) {
      return landmark.difficulty === "easy" || landmark.difficulty === "medium";
    } else {
      return true; // 어려움 난이도는 모든 명소 포함
    }
  });

  if (filteredLandmarks.length < count) {
    // 충분한 명소 데이터가 없을 경우 있는 만큼만 사용
    count = filteredLandmarks.length;
  }

  // 무작위로 명소 선택
  const selectedIndices = getRandomNumbers(0, filteredLandmarks.length - 1, count);
  const selectedLandmarks = selectedIndices.map((index) => filteredLandmarks[index]);

  // 퀴즈 생성
  const quizzes: LandmarkQuiz[] = selectedLandmarks.map((landmark) => {
    // 현재 언어에 맞는 명소 이름 가져오기
    const landmarkName = getLandmarkNameByLocale(landmark.name);

    // 명소 선택지 준비 (정답 + 3개의 오답)
    const otherLandmarks = filteredLandmarks
      .filter((l) => l.id !== landmark.id)
      .map((l) => getLandmarkNameByLocale(l.name));

    // 랜덤 명소 선택
    const randomLandmarkIndices = getRandomNumbers(0, otherLandmarks.length - 1, 3);
    const wrongLandmarks = randomLandmarkIndices.map((index) => otherLandmarks[index]);
    let landmarkOptions = [landmarkName, ...wrongLandmarks];
    landmarkOptions = shuffleArray(landmarkOptions); // 순서 섞기

    // 퀴즈 질문 생성
    const question = i18n.t("landmarkQuizQuestion");

    return {
      id: landmark.id,
      imageUrl: landmark.imageUrl,
      question: question,
      correctLandmark: landmarkName,
      landmarkOptions: landmarkOptions,
      correctAnswer: landmarkName,
      countryName: landmark.country.name,
    };
  });

  return quizzes;
}
