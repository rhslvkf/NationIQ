/**
 * 국가 데이터 크롤링 스크립트
 * API에서 국가 데이터를 가져와 로컬 파일로 저장합니다.
 *
 * 사용법:
 * - 코드가 위치한 디렉토리에서 다음 명령어 실행
 * - npx ts-node countryDataCrawler.ts
 */

import * as fs from "fs";
import * as path from "path";
import { Country } from "../types";

// API URL
const BASE_URL = "https://restcountries.com/v3.1";

// 모든 국가 정보를 가져오는 함수
async function fetchAllCountries(): Promise<Country[]> {
  try {
    console.log("🌎 국가 데이터 가져오는 중...");
    const response = await fetch(
      `${BASE_URL}/all?fields=name,cca2,cca3,flags,capital,region,subregion,population,continents,translations`
    );
    if (!response.ok) {
      throw new Error("국가 정보를 불러오는데 실패했습니다.");
    }
    const data: Country[] = await response.json();
    console.log(`✅ ${data.length}개 국가 데이터 가져오기 성공`);
    return data;
  } catch (error) {
    console.error("❌ 국가 정보 가져오기 오류:", error);
    throw error;
  }
}

// 데이터를 저장하는 함수
function saveDataToFile(data: any, fileName: string): void {
  const filePath = path.join(__dirname, fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ 데이터를 ${filePath}에 저장했습니다.`);
  } catch (error) {
    console.error(`❌ 파일 저장 오류 (${fileName}):`, error);
  }
}

// 메인 함수
async function main() {
  try {
    // 모든 국가 데이터 가져오기
    const countries = await fetchAllCountries();

    // 가져온 데이터 저장
    saveDataToFile(countries, "countries.json");

    console.log("✅ 모든 작업이 완료되었습니다.");
  } catch (error) {
    console.error("❌ 데이터 크롤링 중 오류 발생:", error);
  }
}

// 스크립트 실행
main();
