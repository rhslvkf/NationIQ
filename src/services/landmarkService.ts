/**
 * 명소 퀴즈 생성 서비스
 * 로컬 명소 데이터를 활용하여 다양한 명소 퀴즈를 생성합니다.
 */

import { LandmarkQuiz, Difficulty } from "../types";
import { localLandmarkData } from "../data/localLandmarkData";
import i18n from "../i18n";
import { getRandomNumbers } from "../utils/random";

// 배열을 무작위로 섞는 유틸리티 함수
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
 * 명소 퀴즈 데이터를 생성합니다.
 * 명소 사진을 보고 해당 명소가 위치한 국가와 명소 이름을 모두 맞추는 퀴즈입니다.
 *
 * @param difficulty 난이도
 * @param count 문제 개수
 * @returns 생성된 퀴즈 배열
 */
export function generateLandmarkQuiz(difficulty: Difficulty, count: number): LandmarkQuiz[] {
  // 해당 난이도의 명소 데이터 필터링
  const filteredLandmarks = localLandmarkData.filter((landmark) => {
    if (difficulty === "easy") {
      return landmark.difficulty === "easy";
    } else if (difficulty === "medium") {
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

  // 국가 목록 준비 (선택지로 사용)
  const allCountries = [...new Set(localLandmarkData.map((landmark) => landmark.country))];

  // 퀴즈 생성
  const quizzes: LandmarkQuiz[] = selectedLandmarks.map((landmark) => {
    // 현재 언어에 맞는 명소명과 국가명 설정
    const currentLang = i18n.locale.split("-")[0];
    const landmarkName = currentLang === "ko" ? landmark.nameKo : landmark.nameEn;
    const countryName = currentLang === "ko" ? landmark.countryKo : landmark.countryEn;

    // 현재 언어에 맞는 설명 설정
    const description = currentLang === "ko" ? landmark.descriptionKo : landmark.descriptionEn;

    // 현재 언어에 맞는 명소 목록 생성 (선택지로 사용)
    const allLandmarkNames = [
      ...new Set(localLandmarkData.map((item) => (currentLang === "ko" ? item.nameKo : item.nameEn))),
    ];

    // 국가 선택지 생성 (정답 + 3개의 오답)
    let countryOptions = [countryName];

    // 현재 언어에 맞는 국가 목록 (선택지로 사용)
    const otherCountries = [
      ...new Set(localLandmarkData.map((item) => (currentLang === "ko" ? item.countryKo : item.countryEn))),
    ].filter((c) => c !== countryName);

    // 무작위로 3개의 다른 국가 선택
    const randomCountryIndices = getRandomNumbers(0, otherCountries.length - 1, 3);
    const wrongCountries = randomCountryIndices.map((index) => otherCountries[index]);
    countryOptions = [...countryOptions, ...wrongCountries];

    // 선택지 순서 섞기
    countryOptions = countryOptions.sort(() => Math.random() - 0.5);

    // 명소 이름 선택지 생성 (정답 + 3개의 오답)
    let landmarkOptions = [landmarkName];

    // 정답이 아닌 다른 명소들
    const otherLandmarks = allLandmarkNames.filter((name) => name !== landmarkName);

    // 무작위로 3개의 다른 명소 선택
    const randomLandmarkIndices = getRandomNumbers(0, otherLandmarks.length - 1, 3);
    const wrongLandmarks = randomLandmarkIndices.map((index) => otherLandmarks[index]);
    landmarkOptions = [...landmarkOptions, ...wrongLandmarks];

    // 선택지 순서 섞기
    landmarkOptions = landmarkOptions.sort(() => Math.random() - 0.5);

    // 언어에 맞는 질문 생성
    const question = i18n.t("landmarkQuizQuestion");

    return {
      id: landmark.id,
      imageUrl: landmark.imageUrl,
      landmarkName: landmarkName,
      countryName: countryName,
      description: description,
      question: question,
      countryOptions: countryOptions,
      landmarkOptions: landmarkOptions,
      correctCountry: countryName,
      correctLandmark: landmarkName,
      difficulty: landmark.difficulty,
    };
  });

  return quizzes;
}
