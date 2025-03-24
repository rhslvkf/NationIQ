/**
 * 로컬 명소 데이터 모듈
 * 저장된 JSON 파일에서 명소 데이터를 불러와 제공합니다.
 */

import { Landmark, LandmarkName } from "../types";
import landmarkData from "./landmarks.json";

// 타입 검증을 통한 안전한 데이터 로드
const rawLandmarks: any[] = landmarkData;

// 명소 이름 검증 함수 (문자열 또는 다국어 객체인지 확인)
function validateLandmarkName(name: any): name is string | LandmarkName {
  if (typeof name === "string") return true;

  return name && typeof name === "object" && typeof name.en === "string" && typeof name.ko === "string";
}

// 데이터 검증 함수 (필수 필드가 있는지 확인)
function validateLandmarkData(data: any): data is Landmark {
  return (
    data &&
    typeof data.id === "string" &&
    validateLandmarkName(data.name) &&
    typeof data.imageUrl === "string" &&
    data.country &&
    typeof data.country.name === "string" &&
    typeof data.country.code === "string" &&
    typeof data.difficulty === "string"
  );
}

// 검증 후 안전하게 Landmark[] 타입으로 변환
const landmarks: Landmark[] = rawLandmarks.filter(validateLandmarkData);

/**
 * 모든 명소 데이터를 반환하는 함수
 */
export const getAllLandmarks = (): Landmark[] => {
  return landmarks;
};

/**
 * 난이도별 명소 데이터를 반환하는 함수
 */
export const getLandmarksByDifficulty = (difficulty: string): Landmark[] => {
  return landmarks.filter((landmark) => landmark.difficulty === difficulty);
};

/**
 * 대륙별 명소 데이터를 반환하는 함수
 */
export const getLandmarksByContinent = (continent: string): Landmark[] => {
  return landmarks.filter((landmark) => landmark.continent === continent);
};

/**
 * 국가별 명소 데이터를 반환하는 함수
 */
export const getLandmarksByCountry = (countryCode: string): Landmark[] => {
  return landmarks.filter((landmark) => landmark.country.code === countryCode);
};

/**
 * ID로 특정 명소 데이터를 반환하는 함수
 */
export const getLandmarkById = (id: string): Landmark | undefined => {
  return landmarks.find((landmark) => landmark.id === id);
};

/**
 * 이름으로 특정 명소 데이터를 반환하는 함수
 * 다국어 명소 이름을 지원합니다.
 */
export const getLandmarkByName = (name: string): Landmark | undefined => {
  return landmarks.find((landmark) => {
    if (typeof landmark.name === "string") {
      return landmark.name.toLowerCase() === name.toLowerCase();
    } else {
      return (
        landmark.name.en.toLowerCase() === name.toLowerCase() || landmark.name.ko.toLowerCase() === name.toLowerCase()
      );
    }
  });
};

// 데이터 로드 시 검증 결과 로깅
console.log(`로컬 명소 데이터: 총 ${rawLandmarks.length}개 중 ${landmarks.length}개 유효함`);

export default landmarks;
