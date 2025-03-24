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

// 주요 국가 면적 데이터 (만약 API에서 제공하지 않을 경우 사용)
const countryAreaData: Record<string, number> = {
  USA: 9833517, // 미국
  CHN: 9596961, // 중국
  RUS: 17098246, // 러시아
  CAN: 9984670, // 캐나다
  BRA: 8515767, // 브라질
  AUS: 7692024, // 호주
  IND: 3287263, // 인도
  ARG: 2780400, // 아르헨티나
  KAZ: 2724900, // 카자흐스탄
  DZA: 2381741, // 알제리
  COD: 2344858, // 콩고민주공화국
  GRL: 2166086, // 그린란드
  SAU: 2149690, // 사우디아라비아
  MEX: 1964375, // 멕시코
  IDN: 1904569, // 인도네시아
  SDN: 1886068, // 수단
  LBY: 1759540, // 리비아
  IRN: 1648195, // 이란
  MNG: 1564110, // 몽골
  PER: 1285216, // 페루
  TCD: 1284000, // 차드
  NER: 1267000, // 니제르
  AGO: 1246700, // 앙골라
  MLI: 1240192, // 말리
  ZAF: 1221037, // 남아프리카공화국
  COL: 1141748, // 콜롬비아
  ETH: 1104300, // 에티오피아
  BOL: 1098581, // 볼리비아
  MRT: 1030700, // 모리타니아
  EGY: 1002450, // 이집트
  TZA: 945087, // 탄자니아
  NGA: 923768, // 나이지리아
  VEN: 916445, // 베네수엘라
  PAK: 881912, // 파키스탄
  NAM: 825615, // 나미비아
  MOZ: 801590, // 모잠비크
  TUR: 783562, // 터키
  CHL: 756102, // 칠레
  ZMB: 752612, // 잠비아
  MMR: 676578, // 미얀마
  AFG: 652230, // 아프가니스탄
  SSD: 644329, // 남수단
  SOM: 637657, // 소말리아
  CAF: 622984, // 중앙아프리카공화국
  UKR: 603500, // 우크라이나
  MDG: 587041, // 마다가스카르
  KEN: 580367, // 케냐
  FRA: 551695, // 프랑스
  YEM: 527968, // 예멘
  THA: 513120, // 태국
  ESP: 505992, // 스페인
  TKM: 488100, // 투르크메니스탄
  CMR: 475442, // 카메룬
  PNG: 462840, // 파푸아뉴기니
  SWE: 450295, // 스웨덴
  UZB: 447400, // 우즈베키스탄
  MAR: 446550, // 모로코
  IRQ: 438317, // 이라크
  PRY: 406752, // 파라과이
  ZWE: 390757, // 짐바브웨
  JPN: 377930, // 일본
  DEU: 357114, // 독일
  COG: 342000, // 콩고
  FIN: 338424, // 핀란드
  VNM: 331212, // 베트남
  MYS: 330803, // 말레이시아
  NOR: 323802, // 노르웨이
  POL: 312679, // 폴란드
  OMN: 309500, // 오만
  ITA: 301336, // 이탈리아
  PHL: 300000, // 필리핀
  ECU: 276841, // 에콰도르
  BFA: 272967, // 부르키나파소
  NZL: 270467, // 뉴질랜드
  GAB: 267668, // 가봉
  GBR: 242900, // 영국
  GIN: 245857, // 기니
  UGA: 241550, // 우간다
  GHA: 238533, // 가나
  ROU: 238391, // 루마니아
  LAO: 236800, // 라오스
  GUY: 214969, // 가이아나
  BLR: 207600, // 벨라루스
  KGZ: 199951, // 키르기스스탄
  SEN: 196722, // 세네갈
  SYR: 185180, // 시리아
  KHM: 181035, // 캄보디아
  URY: 181034, // 우루과이
  TUN: 163610, // 튀니지
  SUR: 163820, // 수리남
  NPL: 147181, // 네팔
  BGD: 147570, // 방글라데시
  TJK: 143100, // 타지키스탄
  GRC: 131957, // 그리스
  KOR: 100210, // 대한민국
  SGP: 728.6, // 싱가포르
  VAT: 0.49, // 바티칸
};

// 주요 국가 인구 데이터 (만약 API에서 제공하지 않을 경우 사용)
const countryPopulationData: Record<string, number> = {
  CHN: 1411778724, // 중국
  IND: 1380004385, // 인도
  USA: 331449281, // 미국
  IDN: 273753191, // 인도네시아
  PAK: 220892340, // 파키스탄
  BRA: 212559417, // 브라질
  NGA: 206139589, // 나이지리아
  BGD: 164689383, // 방글라데시
  RUS: 145934462, // 러시아
  MEX: 128932753, // 멕시코
  JPN: 126476461, // 일본
  ETH: 114963588, // 에티오피아
  PHL: 109581078, // 필리핀
  EGY: 102334404, // 이집트
  VNM: 97338579, // 베트남
  COD: 89561403, // 콩고민주공화국
  TUR: 84339067, // 터키
  IRN: 83992949, // 이란
  DEU: 83783942, // 독일
  THA: 69799978, // 태국
  GBR: 67886011, // 영국
  FRA: 65273511, // 프랑스
  ITA: 60461826, // 이탈리아
  ZAF: 59308690, // 남아프리카공화국
  TZA: 59734218, // 탄자니아
  MMR: 54409800, // 미얀마
  KEN: 53771296, // 케냐
  KOR: 51269185, // 대한민국
  COL: 50882891, // 콜롬비아
  ESP: 46754778, // 스페인
  UGA: 45741007, // 우간다
  ARG: 45195774, // 아르헨티나
  DZA: 43851044, // 알제리
  SDN: 43849260, // 수단
  UKR: 43733762, // 우크라이나
  IRQ: 40222493, // 이라크
  AFG: 38928346, // 아프가니스탄
  POL: 37846611, // 폴란드
  CAN: 37742154, // 캐나다
  MAR: 36910560, // 모로코
  SAU: 34813871, // 사우디아라비아
  UZB: 33469203, // 우즈베키스탄
  PER: 32971854, // 페루
  MYS: 32365999, // 말레이시아
  AGO: 32866272, // 앙골라
  MOZ: 31255435, // 모잠비크
  GHA: 31072940, // 가나
  YEM: 29825964, // 예멘
  NPL: 29136808, // 네팔
  VEN: 28435940, // 베네수엘라
  MDG: 27691018, // 마다가스카르
  CMR: 26545863, // 카메룬
  CIV: 26378274, // 코트디부아르
  PRK: 25778816, // 북한
  AUS: 25499884, // 호주
  NER: 24206644, // 니제르
  TWN: 23816775, // 대만
  LKA: 21413249, // 스리랑카
  BFA: 20903273, // 부르키나파소
  MLI: 20250833, // 말리
  ROU: 19237691, // 루마니아
  MWI: 19129952, // 말라위
  CHL: 19116201, // 칠레
  KAZ: 18776707, // 카자흐스탄
  ZMB: 18383955, // 잠비아
  GTM: 17915568, // 과테말라
  ECU: 17643054, // 에콰도르
  SYR: 17500658, // 시리아
  NLD: 17134872, // 네덜란드
  SEN: 16743927, // 세네갈
  KHM: 16718965, // 캄보디아
  TCD: 16425864, // 차드
  SOM: 15893222, // 소말리아
  ZWE: 14862924, // 짐바브웨
  GIN: 13132795, // 기니
  RWA: 12952218, // 르완다
  BDI: 11890784, // 부룬디
  TUN: 11818619, // 튀니지
  BEL: 11589623, // 벨기에
  BOL: 11673021, // 볼리비아
  CUB: 11326616, // 쿠바
  HTI: 11402528, // 아이티
  JOR: 10203134, // 요르단
  DOM: 10847910, // 도미니카공화국
  SWE: 10099265, // 스웨덴
  CZE: 10708981, // 체코
  GRC: 10423054, // 그리스
  PRT: 10196709, // 포르투갈
  AZE: 10139177, // 아제르바이잔
  HUN: 9660351, // 헝가리
  TJK: 9537645, // 타지키스탄
  BLR: 9449323, // 벨라루스
  ARE: 9890402, // 아랍에미리트
  ISR: 8655535, // 이스라엘
  CHE: 8654622, // 스위스
  TGO: 8278724, // 토고
  HKG: 7496981, // 홍콩
  SLV: 6486205, // 엘살바도르
  SGP: 5850342, // 싱가포르
  NOR: 5421241, // 노르웨이
  NZL: 4822233, // 뉴질랜드
  IRL: 4937786, // 아일랜드
  QAT: 2881053, // 카타르
  VAT: 801, // 바티칸
};

// 모든 국가 정보를 가져오는 함수
async function fetchAllCountries(): Promise<Country[]> {
  try {
    console.log("🌎 국가 데이터 가져오는 중...");
    const response = await fetch(
      `${BASE_URL}/all?fields=name,cca2,cca3,flags,capital,region,subregion,population,area,continents,translations`
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

// 국가 데이터 검증 함수
function validateCountryData(countries: Country[]): { valid: Country[]; invalid: Country[] } {
  const valid: Country[] = [];
  const invalid: Country[] = [];

  for (const country of countries) {
    // 필수 필드 확인
    if (
      country &&
      country.name &&
      country.translations &&
      country.area !== undefined &&
      country.population !== undefined
    ) {
      valid.push(country);
    } else {
      invalid.push(country);
    }
  }

  return { valid, invalid };
}

// 국가별 상세 정보를 가져오는 함수
async function fetchCountryDetails(cca3: string): Promise<Country | null> {
  try {
    console.log(`🔍 ${cca3} 국가의 상세 정보 가져오는 중...`);
    const response = await fetch(`${BASE_URL}/alpha/${cca3}`);
    if (!response.ok) {
      throw new Error(`${cca3} 국가 정보를 불러오는데 실패했습니다.`);
    }
    const data: Country[] = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error(`❌ ${cca3} 국가 정보 가져오기 오류:`, error);
    return null;
  }
}

// 누락된 국가 데이터를 보완하는 확장 함수
function enrichCountryDataWithFallbacks(country: Country): Country {
  // country 객체가 없으면 종료
  if (!country || !country.cca3) return country;

  // 면적 데이터 보완
  if (country.area === undefined && countryAreaData[country.cca3]) {
    country.area = countryAreaData[country.cca3];
    console.log(`📊 ${country.name?.common || country.cca3}: area 값을 백업 데이터로 보완 (${country.area})`);
  }

  // 인구 데이터 보완
  if (country.population === undefined && countryPopulationData[country.cca3]) {
    country.population = countryPopulationData[country.cca3];
    console.log(
      `📊 ${country.name?.common || country.cca3}: population 값을 백업 데이터로 보완 (${country.population})`
    );
  }

  return country;
}

// 불완전한 국가 데이터를 보완하는 함수
async function enrichIncompleteData(countries: Country[]): Promise<Country[]> {
  const enrichedCountries: Country[] = [...countries];
  let enrichedCount = 0;
  let backupDataCount = 0;

  // 불완전한 데이터를 찾아 보완
  for (let i = 0; i < enrichedCountries.length; i++) {
    let country = enrichedCountries[i];

    // 필수 필드가 누락된 경우에만 보완 시도
    if (
      country &&
      country.cca3 &&
      (!country.name || !country.translations || country.area === undefined || country.population === undefined)
    ) {
      // 해당 국가의 상세 정보 가져오기
      const detailedCountry = await fetchCountryDetails(country.cca3);

      if (detailedCountry) {
        // 누락된 필드 보완
        if (!country.name) country.name = detailedCountry.name;
        if (!country.translations) country.translations = detailedCountry.translations;
        if (country.area === undefined) country.area = detailedCountry.area;
        if (country.population === undefined) country.population = detailedCountry.population;

        enrichedCount++;
        console.log(`✅ ${country.name?.common || country.cca3} 국가 데이터 보완 완료`);
      }

      // API로 보완되지 않은 데이터에 대해 백업 데이터로 추가 보완
      const prevArea = country.area;
      const prevPopulation = country.population;

      country = enrichCountryDataWithFallbacks(country);

      if (
        (prevArea === undefined && country.area !== undefined) ||
        (prevPopulation === undefined && country.population !== undefined)
      ) {
        backupDataCount++;
      }
    }

    // 매 10개 국가마다 진행상황 표시
    if ((i + 1) % 10 === 0) {
      console.log(`🔄 데이터 보완 진행 중... ${i + 1}/${enrichedCountries.length} 처리 완료`);
    }
  }

  console.log(`✅ API 호출로 총 ${enrichedCount}개 국가의 데이터를 보완했습니다.`);
  console.log(`✅ 백업 데이터로 총 ${backupDataCount}개 국가의 추가 데이터를 보완했습니다.`);
  return enrichedCountries;
}

// 메인 함수
async function main() {
  try {
    // 모든 국가 데이터 가져오기
    const countries = await fetchAllCountries();

    // 국가 데이터 검증
    const { valid, invalid } = validateCountryData(countries);

    console.log(`✅ 유효한 국가 데이터: ${valid.length}개`);
    console.log(`❌ 불완전한 국가 데이터: ${invalid.length}개`);

    let enrichedCountries = countries;

    if (invalid.length > 0) {
      console.log("⚠️ 다음 국가들의 데이터가 불완전합니다:");
      invalid.forEach((country) => {
        const missing = [];
        if (!country.name) missing.push("name");
        if (!country.translations) missing.push("translations");
        if (country.area === undefined) missing.push("area");
        if (country.population === undefined) missing.push("population");

        console.log(`- ${country?.name?.common || "Unknown"}: 누락된 필드 [${missing.join(", ")}]`);
      });

      // 불완전한 데이터 저장
      saveDataToFile(invalid, "incomplete_countries.json");

      // 불완전한 데이터 보완 시도
      console.log("🔄 불완전한 국가 데이터 보완 시작...");
      enrichedCountries = await enrichIncompleteData(countries);

      // 보완된 데이터 재검증
      const { valid: newValid, invalid: newInvalid } = validateCountryData(enrichedCountries);
      console.log(`✅ 보완 후 유효한 국가 데이터: ${newValid.length}개`);
      console.log(`❌ 보완 후에도 불완전한 국가 데이터: ${newInvalid.length}개`);

      if (newInvalid.length > 0) {
        console.log("⚠️ 다음 국가들의 데이터는 보완 후에도 불완전합니다:");
        newInvalid.forEach((country) => {
          const missing = [];
          if (!country.name) missing.push("name");
          if (!country.translations) missing.push("translations");
          if (country.area === undefined) missing.push("area");
          if (country.population === undefined) missing.push("population");

          console.log(`- ${country?.name?.common || "Unknown"}: 누락된 필드 [${missing.join(", ")}]`);
        });

        // 보완 후에도 불완전한 데이터 저장
        saveDataToFile(newInvalid, "still_incomplete_countries.json");
      }
    }

    // 가져온 데이터 저장
    saveDataToFile(enrichedCountries, "countries.json");

    // 유효한 데이터만 저장
    const { valid: finalValid } = validateCountryData(enrichedCountries);
    saveDataToFile(finalValid, "valid_countries.json");

    console.log("✅ 모든 작업이 완료되었습니다.");
  } catch (error) {
    console.error("❌ 데이터 크롤링 중 오류 발생:", error);
  }
}

// 스크립트 실행
main();
