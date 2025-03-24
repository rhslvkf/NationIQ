import { Country, Difficulty, Question, QuizType, CapitalQuiz } from "../types";
import i18n from "../i18n";
import difficultyLevels from "../config/difficultyLevels";
import capitalTranslations from "../config/capitalTranslations";
// API 대신 로컬 데이터 모듈을 import
import { fetchAllCountries, fetchCountriesByRegion } from "../data/localCountryData";

// API URL 관련 코드는 더 이상 필요 없음
// const BASE_URL = "https://restcountries.com/v3.1";

// 로컬 데이터 모듈에서 이미 fetchAllCountries와 fetchCountriesByRegion 함수를 제공하므로
// 여기서 함수 정의를 제거하고 import 사용

// 언어 코드를 API 형식에 맞게 변환
const getLanguageCodeForAPI = (locale: string): string => {
  // i18n-js의 locale과 API에서 사용하는 언어 코드 매핑
  const localeMapping: Record<string, string> = {
    en: "eng", // 영어
    ko: "kor", // 한국어
    // 다른 언어 추가 가능
  };

  return localeMapping[locale] || "eng"; // 기본값은 영어
};

// 국가명 번역 가져오기
const getTranslatedCountryName = (country: Country, locale: string): string => {
  const apiLangCode = getLanguageCodeForAPI(locale);

  // 해당 언어의 번역이 있으면 사용
  if (country.translations && country.translations[apiLangCode]) {
    return country.translations[apiLangCode].common;
  }

  // 번역이 없으면 기본 이름 반환
  return country.name.common;
};

// 수도명 번역 가져오기
const getTranslatedCapitalName = (capitalName: string, locale: string): string => {
  // capitalTranslations에서 해당 수도 정보 찾기
  const capitalInfo = capitalTranslations[capitalName as keyof typeof capitalTranslations];

  // 해당 언어의 번역이 있으면 사용
  if (capitalInfo && capitalInfo[locale as keyof typeof capitalInfo]) {
    return capitalInfo[locale as keyof typeof capitalInfo];
  }

  // 번역이 없으면 기본 이름 반환
  return capitalName;
};

// 배열을 무작위로 섞는 유틸리티 함수
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 정답 외에 무작위 국가 선택
const getRandomCountries = (countries: Country[], excludeCountry: string, count: number): Country[] => {
  const filteredCountries = countries.filter((c) => c.name.common !== excludeCountry);
  return shuffleArray(filteredCountries).slice(0, count);
};

// 난이도에 따라 국기 퀴즈 문제 생성 (로직은 유지, API 호출만 로컬 데이터로 변경)
export const generateFlagQuiz = async (difficulty: Difficulty, count: number = 10): Promise<Question[]> => {
  try {
    let countries = await fetchAllCountries();
    const currentLocale = i18n.locale; // 현재 설정된 언어

    // 국가 이름이 최소 3글자 이상인 것만 선택 (보다 유의미한 퀴즈를 위해)
    countries = countries.filter(
      (country) => country.name.common.length >= 3 && country.flags.png && !country.name.common.includes(".")
    );

    // 난이도에 따른 국가 필터링
    let filteredCountries: Country[] = [];

    switch (difficulty) {
      case Difficulty.EASY:
        // 쉬움: difficultyLevels의 easy 배열에 포함된 국가들
        filteredCountries = countries.filter((country) => difficultyLevels.easy.includes(country.cca3));
        break;

      case Difficulty.MEDIUM:
        // 보통: difficultyLevels의 medium 배열에 포함된 국가들
        filteredCountries = countries.filter((country) => difficultyLevels.medium.includes(country.cca3));
        break;

      case Difficulty.HARD:
        // 어려움: difficultyLevels의 hard 배열에 포함된 국가들
        filteredCountries = countries.filter((country) => difficultyLevels.hard.includes(country.cca3));
        break;

      case Difficulty.VERY_HARD:
        // 매우 어려움: difficultyLevels의 veryHard 배열에 포함된 국가들
        filteredCountries = countries.filter((country) => difficultyLevels.veryHard.includes(country.cca3));
        break;

      default:
        filteredCountries = countries;
    }

    // 선택된 국가가 충분하지 않으면 일반 국가 목록에서 추가
    if (filteredCountries.length < count) {
      const remainingCountries = countries.filter((country) => !filteredCountries.includes(country));
      filteredCountries = [
        ...filteredCountries,
        ...shuffleArray(remainingCountries).slice(0, count - filteredCountries.length),
      ];
    }

    // 랜덤으로 count 수만큼 국가 선택
    const shuffledCountries = shuffleArray(filteredCountries);
    const selectedCountries = shuffledCountries.slice(0, count);

    // 문제 생성
    const questions: Question[] = selectedCountries.map((country, index) => {
      // 정답 외에 3개의 임의 선택지 추가 (총 4개 선택지)
      const correctAnswer = country.name.common;
      const otherCountries = getRandomCountries(countries, correctAnswer, 3);

      // 기본 영어 선택지
      const englishOptions = shuffleArray([correctAnswer, ...otherCountries.map((c) => c.name.common)]);

      // 현재 언어에 맞는 번역된 선택지
      const translatedOptions = englishOptions.map((option) => {
        const targetCountry = option === correctAnswer ? country : otherCountries.find((c) => c.name.common === option);

        return targetCountry ? getTranslatedCountryName(targetCountry, currentLocale) : option;
      });

      // 영어와 현재 언어가 같으면 번역된 선택지를 사용하지 않음
      const useTranslated = currentLocale !== "en";

      return {
        id: `${index + 1}`,
        flag: country.flags.png,
        options: useTranslated ? translatedOptions : englishOptions,
        correctAnswer: useTranslated ? getTranslatedCountryName(country, currentLocale) : correctAnswer,
      };
    });

    return questions;
  } catch (error) {
    console.error("퀴즈 생성 오류:", error);
    throw error;
  }
};

// 수도 퀴즈 생성 함수 (API 호출을 로컬 데이터로 변경)
export const generateCapitalQuiz = async (
  difficulty: Difficulty,
  questionCount: number,
  quizType: QuizType
): Promise<CapitalQuiz[]> => {
  try {
    // 로컬 데이터에서 국가 정보 가져오기
    const countries = await fetchAllCountries();
    const currentLocale = i18n.locale; // 현재 설정된 언어

    // 수도가 있는 국가만 필터링
    const countriesWithCapitals = countries.filter(
      (country) => country.capital && country.capital.length > 0 && country.capital[0].trim() !== ""
    );

    // 난이도에 따른 국가 필터링
    let filteredCountries: Country[] = [];

    switch (difficulty) {
      case Difficulty.EASY:
        // 쉬움: difficultyLevels의 easy 배열에 포함된 국가들
        filteredCountries = countriesWithCapitals.filter((country) => difficultyLevels.easy.includes(country.cca3));
        break;

      case Difficulty.MEDIUM:
        // 보통: difficultyLevels의 medium 배열에 포함된 국가들
        filteredCountries = countriesWithCapitals.filter((country) => difficultyLevels.medium.includes(country.cca3));
        break;

      case Difficulty.HARD:
        // 어려움: difficultyLevels의 hard 배열에 포함된 국가들
        filteredCountries = countriesWithCapitals.filter((country) => difficultyLevels.hard.includes(country.cca3));
        break;

      case Difficulty.VERY_HARD:
        // 매우 어려움: difficultyLevels의 veryHard 배열에 포함된 국가들
        filteredCountries = countriesWithCapitals.filter((country) => difficultyLevels.veryHard.includes(country.cca3));
        break;

      default:
        filteredCountries = countriesWithCapitals;
    }

    // 선택된 국가가 충분하지 않으면 일반 국가 목록에서 추가
    if (filteredCountries.length < questionCount) {
      const remainingCountries = countriesWithCapitals.filter((country) => !filteredCountries.includes(country));
      filteredCountries = [
        ...filteredCountries,
        ...shuffleArray(remainingCountries).slice(0, questionCount - filteredCountries.length),
      ];
    }

    // 랜덤으로 count 수만큼 국가 선택
    const shuffledCountries = shuffleArray(filteredCountries);
    const selectedCountries = shuffledCountries.slice(0, questionCount);

    // 퀴즈 타입 처리
    let quizzes: CapitalQuiz[] = [];

    for (let i = 0; i < selectedCountries.length; i++) {
      const country = selectedCountries[i];

      // 사용할 퀴즈 타입 결정 (mixed인 경우 랜덤)
      const currentQuizType =
        quizType === QuizType.MIXED
          ? Math.random() > 0.5
            ? QuizType.COUNTRY_TO_CAPITAL
            : QuizType.CAPITAL_TO_COUNTRY
          : quizType;

      // 국가명과 수도명 (번역 적용)
      const countryName = getTranslatedCountryName(country, currentLocale);
      const rawCapitalName = country.capital![0]; // 이미 capital이 있는 국가만 필터링함
      const capitalName = getTranslatedCapitalName(rawCapitalName, currentLocale);

      // 질문 및 정답 설정
      let question: string;
      let correctAnswer: string;
      let optionPool: string[] = [];

      if (currentQuizType === QuizType.COUNTRY_TO_CAPITAL) {
        // 국가 -> 수도 문제
        question = countryName;
        correctAnswer = capitalName;
        optionPool = countriesWithCapitals
          .filter((c) => c.name.common !== country.name.common)
          .map((c) => getTranslatedCapitalName(c.capital![0], currentLocale))
          .filter(Boolean);
      } else {
        // 수도 -> 국가 문제
        question = capitalName;
        correctAnswer = countryName;
        optionPool = countriesWithCapitals
          .filter((c) => c.capital && c.capital[0] !== rawCapitalName)
          .map((c) => getTranslatedCountryName(c, currentLocale));
      }

      // 랜덤하게 3개 오답 선택
      const wrongOptions = shuffleArray(optionPool).slice(0, 3);

      // 정답과 오답 합치고 다시 섞기
      const options = shuffleArray([correctAnswer, ...wrongOptions]);

      quizzes.push({
        question,
        options,
        correctAnswer,
        quizType: currentQuizType,
        countryName,
        capitalName,
      });
    }

    return quizzes;
  } catch (error) {
    console.error("수도 퀴즈 생성 중 오류 발생:", error);
    throw error;
  }
};
