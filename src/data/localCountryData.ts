/**
 * 로컬 국가 데이터 모듈
 * 저장된 JSON 파일에서 국가 데이터를 불러와 제공합니다.
 */

import { Country } from "../types";
import countryData from "./countries.json";

// TS에게 countries.json을 임포트하는 방법 지정
// 타입 에러를 방지하려면 tsconfig.json에 "resolveJsonModule": true 설정 필요
// 하지만 실용적인 해결책으로 any 타입으로 처리 후 사용시 검증
const rawCountries: any[] = countryData;

// 데이터 검증 함수 (필수 필드가 있는지 확인)
function validateCountryData(data: any): data is Country {
  return (
    data &&
    data.name &&
    typeof data.name.common === "string" &&
    typeof data.cca3 === "string" &&
    data.flags &&
    typeof data.flags.png === "string"
  );
}

// 검증 후 안전하게 Country[] 타입으로 변환
const countries: Country[] = rawCountries.filter(validateCountryData);

/**
 * 모든 국가 데이터를 반환하는 비동기 함수
 * API 호출과 동일한 인터페이스를 유지하기 위해 Promise 반환
 */
export const fetchAllCountries = async (): Promise<Country[]> => {
  try {
    // 비동기 함수처럼 작동하도록 Promise.resolve 사용
    return Promise.resolve(countries);
  } catch (error) {
    console.error("로컬 국가 데이터 로드 오류:", error);
    throw error;
  }
};

/**
 * 대륙별 국가 정보를 가져오는 함수
 * 필터링은 로컬에서 진행
 */
export const fetchCountriesByRegion = async (region: string): Promise<Country[]> => {
  try {
    const filteredCountries = countries.filter(
      (country) => country.region && country.region.toLowerCase() === region.toLowerCase()
    );
    return Promise.resolve(filteredCountries);
  } catch (error) {
    console.error(`${region} 지역 국가 정보 가져오기 오류:`, error);
    throw error;
  }
};

// 데이터 로드 시 검증 결과 로깅
console.log(`로컬 국가 데이터: 총 ${rawCountries.length}개 중 ${countries.length}개 유효함`);

export default countries;
