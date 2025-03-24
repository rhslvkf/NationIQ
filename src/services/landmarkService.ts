/**
 * 명소 퀴즈 생성 서비스
 * 로컬 명소 데이터를 활용하여 다양한 명소 퀴즈를 생성합니다.
 */

import { Difficulty, LandmarkQuiz, QuizType } from "../types";
import i18n from "../i18n";
import * as landmarkData from "../data/localLandmarkData";
import difficultyLevels from "../config/difficultyLevels";

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
 * 명소 -> 국가 또는 명소 -> 명소명 퀴즈 생성
 * @param difficulty 난이도
 * @param questionCount 문제 수
 * @param quizType 퀴즈 타입 (LANDMARK_TO_COUNTRY, LANDMARK_TO_NAME, LANDMARK_MIXED)
 */
export const generateLandmarkQuiz = async (
  difficulty: Difficulty,
  questionCount: number = 10,
  quizType: QuizType
): Promise<LandmarkQuiz[]> => {
  try {
    // 난이도에 따른 필터링
    const difficultyString = getDifficultyString(difficulty);
    let landmarks = landmarkData.getLandmarksByDifficulty(difficultyString);

    // 필터링된 명소가 충분하지 않을 경우 다른 난이도의 명소를 추가로 사용
    if (landmarks.length < questionCount) {
      const allLandmarks = landmarkData.getAllLandmarks();
      const remainingLandmarks = allLandmarks.filter((landmark) => landmark.difficulty !== difficultyString);
      landmarks = [...landmarks, ...shuffleArray(remainingLandmarks).slice(0, questionCount - landmarks.length)];
    }

    // 랜덤으로 명소 선택
    const shuffledLandmarks = shuffleArray(landmarks);
    const selectedLandmarks = shuffledLandmarks.slice(0, questionCount);

    // 퀴즈 생성
    const quizzes: LandmarkQuiz[] = [];
    const allLandmarks = landmarkData.getAllLandmarks();

    for (let i = 0; i < selectedLandmarks.length; i++) {
      const landmark = selectedLandmarks[i];

      // 퀴즈 타입 결정 (혼합인 경우 랜덤)
      const currentQuizType =
        quizType === QuizType.LANDMARK_MIXED
          ? Math.random() > 0.5
            ? QuizType.LANDMARK_TO_COUNTRY
            : QuizType.LANDMARK_TO_NAME
          : quizType;

      // 퀴즈 생성
      let question: string;
      let correctAnswer: string;
      let options: string[] = [];

      if (currentQuizType === QuizType.LANDMARK_TO_COUNTRY) {
        // 명소 -> 국가 퀴즈
        question = i18n.t("whichLandmarkCountry", { landmark: landmark.name });
        correctAnswer = landmark.country.name;

        // 정답 외의 3개 국가 선택 (다른 대륙의 국가들을 포함하여 다양성 확보)
        const wrongOptions = shuffleArray(
          allLandmarks.filter((l) => l.country.code !== landmark.country.code).map((l) => l.country.name)
        ).slice(0, 3);

        options = shuffleArray([correctAnswer, ...wrongOptions]);
      } else {
        // 명소 -> 명소명 퀴즈
        question = i18n.t("whichLandmarkName");
        correctAnswer = landmark.name;

        // 정답 외의 3개 명소 선택
        const wrongOptions = shuffleArray(allLandmarks.filter((l) => l.id !== landmark.id).map((l) => l.name)).slice(
          0,
          3
        );

        options = shuffleArray([correctAnswer, ...wrongOptions]);
      }

      quizzes.push({
        id: `landmark_quiz_${i + 1}`,
        question,
        imageUrl: landmark.imageUrl,
        options,
        correctAnswer,
        quizType: currentQuizType,
        landmarkName: landmark.name,
        countryName: landmark.country.name,
      });
    }

    return quizzes;
  } catch (error) {
    console.error("명소 퀴즈 생성 중 오류 발생:", error);
    throw error;
  }
};
