import { Country, Difficulty, Question } from "../types";
import i18n from "../i18n";

// API URL
const BASE_URL = "https://restcountries.com/v3.1";

// 모든 국가 정보를 가져오는 함수
export const fetchAllCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/all?fields=name,cca2,cca3,flags,capital,region,subregion,population,continents,translations`
    );
    if (!response.ok) {
      throw new Error("국가 정보를 불러오는데 실패했습니다.");
    }
    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    console.error("국가 정보 가져오기 오류:", error);
    throw error;
  }
};

// 대륙별 국가 정보를 가져오는 함수
export const fetchCountriesByRegion = async (region: string): Promise<Country[]> => {
  try {
    const response = await fetch(`${BASE_URL}/region/${region}?fields=name,flags,population,translations`);
    if (!response.ok) {
      throw new Error(`${region} 지역의 국가 정보를 불러오는데 실패했습니다.`);
    }
    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    console.error(`${region} 지역 국가 정보 가져오기 오류:`, error);
    throw error;
  }
};

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

// 난이도에 따라 퀴즈 문제 생성
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
        // 쉬움: 인구가 많은 유명한 국가들 (상위 40개국)
        filteredCountries = countries.sort((a, b) => b.population - a.population).slice(0, 40);
        break;

      case Difficulty.MEDIUM:
        // 중간: 인구 기준 중간 범위의 국가들 (40-120위)
        filteredCountries = countries.sort((a, b) => b.population - a.population).slice(40, 120);
        break;

      case Difficulty.HARD:
        // 어려움: 인구가 적거나 덜 알려진 국가들 (120위 이하)
        filteredCountries = countries.sort((a, b) => b.population - a.population).slice(120);
        break;

      default:
        filteredCountries = countries;
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

// 배열을 무작위로 섞는 유틸리티 함수
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 정답 외에 무작위 국가 선택
const getRandomCountries = (countries: Country[], excludeCountry: string, count: number): Country[] => {
  const filteredCountries = countries.filter((c) => c.name.common !== excludeCountry);
  return shuffleArray(filteredCountries).slice(0, count);
};
