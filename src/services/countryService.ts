import {
  Country,
  Difficulty,
  Question,
  QuizType,
  CapitalQuiz,
  AreaPopulationQuiz,
  AreaPopulationQuizType,
  AreaPopulationDataType,
} from "../types";
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
  // country가 undefined인 경우 처리
  if (!country || !country.name) {
    console.warn("유효하지 않은 국가 데이터:", country);
    return "알 수 없는 국가";
  }

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

// 면적/인구 퀴즈 생성 함수
export const generateAreaPopulationQuiz = async (
  difficulty: Difficulty,
  questionCount: number,
  quizType: AreaPopulationQuizType
): Promise<AreaPopulationQuiz[]> => {
  try {
    // 로컬 데이터에서 국가 정보 가져오기
    const countries = await fetchAllCountries();
    const currentLocale = i18n.locale; // 현재 설정된 언어

    // 난이도에 맞는 국가 코드(cca3) 목록 가져오기
    let difficultyCountryCodes: string[] = [];

    switch (difficulty) {
      case Difficulty.EASY:
        difficultyCountryCodes = difficultyLevels.easy;
        break;
      case Difficulty.MEDIUM:
        difficultyCountryCodes = difficultyLevels.medium;
        break;
      case Difficulty.HARD:
        difficultyCountryCodes = difficultyLevels.hard;
        break;
      case Difficulty.VERY_HARD:
        difficultyCountryCodes = difficultyLevels.veryHard;
        break;
      default:
        // 기본값으로 모든 난이도 포함
        difficultyCountryCodes = [
          ...difficultyLevels.easy,
          ...difficultyLevels.medium,
          ...difficultyLevels.hard,
          ...difficultyLevels.veryHard,
        ];
    }

    // 난이도에 맞는 국가 중 필요한 정보(면적, 인구, 이름, 번역)가 있는 국가만 필터링
    let validCountriesForDifficulty = countries.filter(
      (country) =>
        difficultyCountryCodes.includes(country.cca3) &&
        country.area !== undefined &&
        country.population !== undefined &&
        country.name !== undefined &&
        country.translations !== undefined
    );

    // 선택된 난이도에 국가가 충분하지 않으면 다른 난이도에서 추가
    if (validCountriesForDifficulty.length < questionCount * 4) {
      console.warn(`${difficulty} 난이도에 충분한 국가 데이터가 없어 다른 난이도의 국가를 추가합니다.`);

      // 다른 난이도의 국가 코드
      let otherDifficultyCountryCodes: string[] = [];

      // 현재 난이도보다 낮은 난이도부터 채우기
      if (difficulty === Difficulty.VERY_HARD) {
        otherDifficultyCountryCodes.push(...difficultyLevels.hard);
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.medium);
        }
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.easy);
        }
      } else if (difficulty === Difficulty.HARD) {
        otherDifficultyCountryCodes.push(...difficultyLevels.medium);
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.easy);
        }
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.veryHard);
        }
      } else if (difficulty === Difficulty.MEDIUM) {
        otherDifficultyCountryCodes.push(...difficultyLevels.easy);
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.hard);
        }
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.veryHard);
        }
      } else if (difficulty === Difficulty.EASY) {
        otherDifficultyCountryCodes.push(...difficultyLevels.medium);
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.hard);
        }
        if (validCountriesForDifficulty.length + otherDifficultyCountryCodes.length < questionCount * 4) {
          otherDifficultyCountryCodes.push(...difficultyLevels.veryHard);
        }
      }

      // 다른 난이도에서 추가 국가 필터링
      const remainingValidCountries = countries.filter(
        (country) =>
          otherDifficultyCountryCodes.includes(country.cca3) &&
          !validCountriesForDifficulty.some((c) => c.cca3 === country.cca3) &&
          country.area !== undefined &&
          country.population !== undefined &&
          country.name !== undefined &&
          country.translations !== undefined
      );

      // 국가 데이터 추가
      validCountriesForDifficulty = [
        ...validCountriesForDifficulty,
        ...shuffleArray(remainingValidCountries).slice(0, questionCount * 4 - validCountriesForDifficulty.length),
      ];
    }

    // 여전히 충분한 국가가 없으면 오류 발생
    if (validCountriesForDifficulty.length < 4) {
      throw new Error("충분한 국가 데이터가 없어 퀴즈를 생성할 수 없습니다.");
    }

    // 국가 데이터 섞기
    const shuffledCountries = shuffleArray(validCountriesForDifficulty);

    const quizzes: AreaPopulationQuiz[] = [];

    for (let i = 0; i < questionCount; i++) {
      // 각 퀴즈에 사용할 4개의 국가 선택 (같은 난이도 내에서만)
      const quizCountries = shuffledCountries.slice(i * 4, i * 4 + 4);

      // 선택된 국가가 4개 미만이면 중복 허용하여 더 채우기
      if (quizCountries.length < 4) {
        const additionalCountries = shuffleArray(validCountriesForDifficulty)
          .filter((country) => !quizCountries.includes(country))
          .slice(0, 4 - quizCountries.length);

        quizCountries.push(...additionalCountries);
      }

      // 여전히 4개 미만이면 오류 발생
      if (quizCountries.length < 4) {
        throw new Error("충분한 국가 데이터가 없어 퀴즈를 생성할 수 없습니다.");
      }

      // 면적과 인구 중 랜덤으로 선택
      const dataType = Math.random() > 0.5 ? AreaPopulationDataType.AREA : AreaPopulationDataType.POPULATION;

      // 각 국가가 필요한 모든 속성을 가지고 있는지 재확인
      const validSelectedCountries = quizCountries.filter(
        (country) =>
          country &&
          country.name &&
          country.translations &&
          country.area !== undefined &&
          country.population !== undefined
      );

      if (validSelectedCountries.length < 4) {
        console.error(
          "선택된 국가 중 일부에 필요한 데이터가 없습니다:",
          quizCountries.filter((c) => !validSelectedCountries.includes(c))
        );
        throw new Error("일부 국가 데이터가 불완전하여 퀴즈를 생성할 수 없습니다.");
      }

      // 선택된 국가들의 번역된 이름
      const countryOptions = validSelectedCountries.map((country) => {
        try {
          return getTranslatedCountryName(country, currentLocale);
        } catch (error) {
          console.error("국가명 번역 중 오류 발생:", error, country);
          return country.name.common || "알 수 없는 국가";
        }
      });

      // 옵션 상세 정보를 위한 객체 (UI 표시용)
      const optionDetails: AreaPopulationQuiz["optionDetails"] = {};

      // 각 국가의 면적 또는 인구 데이터 저장
      validSelectedCountries.forEach((country) => {
        const countryName = getTranslatedCountryName(country, currentLocale);
        optionDetails[countryName] = {
          area: country.area,
          population: country.population,
        };
      });

      if (quizType === AreaPopulationQuizType.SINGLE_CHOICE) {
        // 단일 선택 퀴즈 생성
        let question = "";
        let correctAnswer = "";

        if (dataType === AreaPopulationDataType.AREA) {
          // 면적 관련 문제 생성
          const questionType = Math.floor(Math.random() * 5); // 0-4

          // 면적 순으로 정렬
          const sortedByArea = [...validSelectedCountries].sort((a, b) => (b.area || 0) - (a.area || 0));

          switch (questionType) {
            case 0: // 가장 넓은 국가
              question = i18n.t("largestArea");
              correctAnswer = getTranslatedCountryName(sortedByArea[0], currentLocale);
              break;
            case 1: // 가장 작은 국가
              question = i18n.t("smallestArea");
              correctAnswer = getTranslatedCountryName(sortedByArea[3], currentLocale);
              break;
            case 2: // 두 번째로 넓은 국가
              question = i18n.t("secondLargestArea");
              correctAnswer = getTranslatedCountryName(sortedByArea[1], currentLocale);
              break;
            case 3: // 세 번째로 넓은 국가
              question = i18n.t("thirdLargestArea");
              correctAnswer = getTranslatedCountryName(sortedByArea[2], currentLocale);
              break;
            default: // 기본값: 가장 넓은 국가
              question = i18n.t("largestArea");
              correctAnswer = getTranslatedCountryName(sortedByArea[0], currentLocale);
          }
        } else {
          // 인구 관련 문제 생성
          const questionType = Math.floor(Math.random() * 5); // 0-4

          // 인구 순으로 정렬
          const sortedByPopulation = [...validSelectedCountries].sort(
            (a, b) => (b.population || 0) - (a.population || 0)
          );

          switch (questionType) {
            case 0: // 가장 인구가 많은 국가
              question = i18n.t("largestPopulation");
              correctAnswer = getTranslatedCountryName(sortedByPopulation[0], currentLocale);
              break;
            case 1: // 가장 인구가 적은 국가
              question = i18n.t("smallestPopulation");
              correctAnswer = getTranslatedCountryName(sortedByPopulation[3], currentLocale);
              break;
            case 2: // 두 번째로 인구가 많은 국가
              question = i18n.t("secondLargestPopulation");
              correctAnswer = getTranslatedCountryName(sortedByPopulation[1], currentLocale);
              break;
            case 3: // 세 번째로 인구가 많은 국가
              question = i18n.t("thirdLargestPopulation");
              correctAnswer = getTranslatedCountryName(sortedByPopulation[2], currentLocale);
              break;
            default: // 기본값: 가장 인구가 많은 국가
              question = i18n.t("largestPopulation");
              correctAnswer = getTranslatedCountryName(sortedByPopulation[0], currentLocale);
          }
        }

        quizzes.push({
          question,
          options: countryOptions,
          correctAnswer,
          dataType,
          quizType,
          optionDetails,
        });
      } else if (quizType === AreaPopulationQuizType.ORDER_SELECTION) {
        // 순서 선택 퀴즈 생성
        let question = "";
        let correctAnswers: string[] = [];

        if (dataType === AreaPopulationDataType.AREA) {
          // 면적 순서 문제
          question = i18n.t("orderByArea");

          // 면적 기준으로 정렬된 국가 이름 (내림차순)
          correctAnswers = [...validSelectedCountries]
            .sort((a, b) => (b.area || 0) - (a.area || 0))
            .map((country) => getTranslatedCountryName(country, currentLocale));
        } else {
          // 인구 순서 문제
          question = i18n.t("orderByPopulation");

          // 인구 기준으로 정렬된 국가 이름 (내림차순)
          correctAnswers = [...validSelectedCountries]
            .sort((a, b) => (b.population || 0) - (a.population || 0))
            .map((country) => getTranslatedCountryName(country, currentLocale));
        }

        quizzes.push({
          question,
          options: countryOptions,
          correctAnswer: correctAnswers,
          dataType,
          quizType,
          optionDetails,
        });
      }
    }

    return quizzes;
  } catch (error) {
    console.error("면적/인구 퀴즈 생성 오류:", error);
    throw error;
  }
};
