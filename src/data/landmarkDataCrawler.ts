/**
 * 명소 데이터 크롤링 스크립트
 * Wikipedia API와 Wikimedia API를 활용하여 세계 유명 명소 데이터를 수집합니다.
 *
 * 사용법:
 * - 코드가 위치한 디렉토리에서 다음 명령어 실행
 * - npx ts-node landmarkDataCrawler.ts
 */

import * as fs from "fs";
import * as path from "path";
import { Country } from "../types";
import countryData from "./countries.json";

// 타입 정의
interface Landmark {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  country: {
    name: string;
    code: string; // cca3
  };
  continent: string;
  difficulty: string;
}

// 유명 명소 목록 (수동으로 구성된 리스트)
// 각 명소에는 명소 이름, 국가 코드(cca3)와 난이도 정보가 포함됨
const LANDMARKS_DATA: { name: string; country: string; difficulty: string }[] = [
  // 쉬움 - 매우 유명한 명소들 (25개)
  { name: "Eiffel Tower", country: "FRA", difficulty: "easy" },
  { name: "Statue of Liberty", country: "USA", difficulty: "easy" },
  { name: "Great Wall of China", country: "CHN", difficulty: "easy" },
  { name: "Taj Mahal", country: "IND", difficulty: "easy" },
  { name: "Pyramids of Giza", country: "EGY", difficulty: "easy" },
  { name: "Colosseum", country: "ITA", difficulty: "easy" },
  { name: "Sydney Opera House", country: "AUS", difficulty: "easy" },
  { name: "Big Ben", country: "GBR", difficulty: "easy" },
  { name: "Christ the Redeemer", country: "BRA", difficulty: "easy" },
  { name: "Machu Picchu", country: "PER", difficulty: "easy" },
  { name: "Leaning Tower of Pisa", country: "ITA", difficulty: "easy" },
  { name: "Sagrada Familia", country: "ESP", difficulty: "easy" },
  { name: "Mount Fuji", country: "JPN", difficulty: "easy" },
  { name: "Burj Khalifa", country: "ARE", difficulty: "easy" },
  { name: "Gyeongbokgung Palace", country: "KOR", difficulty: "easy" },
  { name: "Tower Bridge", country: "GBR", difficulty: "easy" },
  { name: "Grand Canyon", country: "USA", difficulty: "easy" },
  { name: "Niagara Falls", country: "CAN", difficulty: "easy" },
  { name: "Buckingham Palace", country: "GBR", difficulty: "easy" },
  { name: "Brandenburg Gate", country: "DEU", difficulty: "easy" },
  { name: "St. Basil's Cathedral", country: "RUS", difficulty: "easy" },
  { name: "Petronas Towers", country: "MYS", difficulty: "easy" },
  { name: "Acropolis of Athens", country: "GRC", difficulty: "easy" },
  { name: "Notre-Dame Cathedral", country: "FRA", difficulty: "easy" },
  { name: "Golden Gate Bridge", country: "USA", difficulty: "easy" },

  // 보통 - 약간 덜 알려진 명소들 (25개)
  { name: "Angkor Wat", country: "KHM", difficulty: "medium" },
  { name: "Petra", country: "JOR", difficulty: "medium" },
  { name: "Stonehenge", country: "GBR", difficulty: "medium" },
  { name: "Chichen Itza", country: "MEX", difficulty: "medium" },
  { name: "Moai of Easter Island", country: "CHL", difficulty: "medium" },
  { name: "Neuschwanstein Castle", country: "DEU", difficulty: "medium" },
  { name: "Hagia Sophia", country: "TUR", difficulty: "medium" },
  { name: "St. Peter's Basilica", country: "VAT", difficulty: "medium" },
  { name: "Kremlin", country: "RUS", difficulty: "medium" },
  { name: "Victoria Falls", country: "ZWE", difficulty: "medium" },
  { name: "Borobudur", country: "IDN", difficulty: "medium" },
  { name: "Forbidden City", country: "CHN", difficulty: "medium" },
  { name: "Alhambra", country: "ESP", difficulty: "medium" },
  { name: "Dubrovnik Old Town", country: "HRV", difficulty: "medium" },
  { name: "Santorini", country: "GRC", difficulty: "medium" },
  { name: "Yellowstone National Park", country: "USA", difficulty: "medium" },
  { name: "Schönbrunn Palace", country: "AUT", difficulty: "medium" },
  { name: "Potala Palace", country: "CHN", difficulty: "medium" },
  { name: "Wat Phra Kaew", country: "THA", difficulty: "medium" },
  { name: "Blue Mosque", country: "TUR", difficulty: "medium" },
  { name: "Sistine Chapel", country: "VAT", difficulty: "medium" },
  { name: "Versailles Palace", country: "FRA", difficulty: "medium" },
  { name: "Petra Treasury", country: "JOR", difficulty: "medium" },
  { name: "Machu Picchu Citadel", country: "PER", difficulty: "medium" },
  { name: "Cologne Cathedral", country: "DEU", difficulty: "medium" },

  // 어려움 - 비교적 덜 알려진 명소들 (25개)
  { name: "Mont Saint-Michel", country: "FRA", difficulty: "hard" },
  { name: "Cappadocia", country: "TUR", difficulty: "hard" },
  { name: "Terracotta Army", country: "CHN", difficulty: "hard" },
  { name: "Plitvice Lakes", country: "HRV", difficulty: "hard" },
  { name: "Bagan", country: "MMR", difficulty: "hard" },
  { name: "Meteora", country: "GRC", difficulty: "hard" },
  { name: "Antelope Canyon", country: "USA", difficulty: "hard" },
  { name: "Wadden Sea", country: "NLD", difficulty: "hard" },
  { name: "Waitomo Glowworm Caves", country: "NZL", difficulty: "hard" },
  { name: "Pamukkale", country: "TUR", difficulty: "hard" },
  { name: "Jeju Island", country: "KOR", difficulty: "hard" },
  { name: "Zhangjiajie National Forest", country: "CHN", difficulty: "hard" },
  { name: "Trolltunga", country: "NOR", difficulty: "hard" },
  { name: "Preikestolen", country: "NOR", difficulty: "hard" },
  { name: "Salar de Tara", country: "CHL", difficulty: "hard" },
  { name: "Huacachina Oasis", country: "PER", difficulty: "hard" },
  { name: "Deadvlei", country: "NAM", difficulty: "hard" },
  { name: "Fingal's Cave", country: "GBR", difficulty: "hard" },
  { name: "Hang Son Doong Cave", country: "VNM", difficulty: "hard" },
  { name: "Socotra Island", country: "YEM", difficulty: "hard" },
  { name: "Tianmen Mountain", country: "CHN", difficulty: "hard" },
  { name: "Lençóis Maranhenses", country: "BRA", difficulty: "hard" },
  { name: "Chocolate Hills", country: "PHL", difficulty: "hard" },
  { name: "Moraine Lake", country: "CAN", difficulty: "hard" },
  { name: "Giant's Causeway", country: "GBR", difficulty: "hard" },

  // 매우 어려움 - 잘 알려지지 않은 명소들 (25개)
  { name: "Tsingy de Bemaraha", country: "MDG", difficulty: "veryHard" },
  { name: "Sigiriya", country: "LKA", difficulty: "veryHard" },
  { name: "Göbekli Tepe", country: "TUR", difficulty: "veryHard" },
  { name: "Nazca Lines", country: "PER", difficulty: "veryHard" },
  { name: "Salar de Uyuni", country: "BOL", difficulty: "veryHard" },
  { name: "Taos Pueblo", country: "USA", difficulty: "veryHard" },
  { name: "Lake Bled", country: "SVN", difficulty: "veryHard" },
  { name: "Paro Taktsang", country: "BTN", difficulty: "veryHard" },
  { name: "Svalbard Global Seed Vault", country: "NOR", difficulty: "veryHard" },
  { name: "Kyaiktiyo Pagoda", country: "MMR", difficulty: "veryHard" },
  { name: "Avenue of the Baobabs", country: "MDG", difficulty: "veryHard" },
  { name: "Seongsan Ilchulbong", country: "KOR", difficulty: "veryHard" },
  { name: "Darvaza Gas Crater", country: "TKM", difficulty: "veryHard" },
  { name: "Virunga National Park", country: "COD", difficulty: "veryHard" },
  { name: "Zhangjiajie Glass Bridge", country: "CHN", difficulty: "veryHard" },
  { name: "Huacachina Desert Oasis", country: "PER", difficulty: "veryHard" },
  { name: "Devetashka Cave", country: "BGR", difficulty: "veryHard" },
  { name: "Quinta da Regaleira", country: "PRT", difficulty: "veryHard" },
  { name: "Tianzi Mountains", country: "CHN", difficulty: "veryHard" },
  { name: "Marble Caves", country: "CHL", difficulty: "veryHard" },
  { name: "Hang Nga Guesthouse", country: "VNM", difficulty: "veryHard" },
  { name: "Las Lajas Sanctuary", country: "COL", difficulty: "veryHard" },
  { name: "Crooked Forest", country: "POL", difficulty: "veryHard" },
  { name: "Underwater Waterfall", country: "MUS", difficulty: "veryHard" },
  { name: "Tunnel of Love", country: "UKR", difficulty: "veryHard" },
];

// 국가 이름 조회 함수
function getCountryNameByCca3(cca3: string): string | null {
  const countryArray = countryData as any[];
  const country = countryArray.find((c) => c.cca3 === cca3);
  return country ? country.name.common : null;
}

// 위키피디아 API를 통해 이미지 URL 및 설명 가져오기
async function fetchLandmarkData(landmarkName: string): Promise<{ imageUrl: string; description: string }> {
  try {
    // 페이지 정보 가져오기
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(landmarkName)}`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`Wikipedia API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 이미지 URL과 설명 추출
    const imageUrl = data.thumbnail?.source || data.originalimage?.source || "";
    const description = data.extract || "";

    // 이미지가 없으면 Unsplash에서 대체 이미지 가져오기
    if (!imageUrl) {
      return {
        imageUrl: `https://source.unsplash.com/1600x900/?${encodeURIComponent(landmarkName)},landmark`,
        description,
      };
    }

    return { imageUrl, description };
  } catch (error) {
    console.error(`${landmarkName} 데이터 가져오기 실패:`, error);

    // 오류 시 Unsplash 대체 이미지 사용
    return {
      imageUrl: `https://source.unsplash.com/1600x900/?${encodeURIComponent(landmarkName)},landmark`,
      description: `${landmarkName} is a famous landmark.`,
    };
  }
}

// 진행 상태 표시 함수
function showProgress(current: number, total: number): void {
  const percentage = Math.floor((current / total) * 100);
  process.stdout.write(`\r진행 중: ${current}/${total} (${percentage}%)`);
}

// 메인 함수
async function main() {
  console.log("🏛️ 명소 데이터 수집을 시작합니다...");

  const landmarksData: Landmark[] = [];
  let processedCount = 0;

  // 각 명소에 대한 데이터 수집
  for (const landmark of LANDMARKS_DATA) {
    try {
      processedCount++;
      showProgress(processedCount, LANDMARKS_DATA.length);

      // 국가 이름 가져오기
      const countryName = getCountryNameByCca3(landmark.country);

      if (!countryName) {
        console.error(`\n❌ 국가 코드 ${landmark.country}에 해당하는 국가를 찾을 수 없습니다.`);
        continue;
      }

      // 위키피디아에서 명소 데이터 가져오기
      const { imageUrl, description } = await fetchLandmarkData(landmark.name);

      // 국가 정보 얻기
      const countryInfo = (countryData as any[]).find((c) => c.cca3 === landmark.country);
      const continent = countryInfo?.continents?.[0] || "Unknown";

      // 데이터 추가
      landmarksData.push({
        id: `landmark_${processedCount}`,
        name: landmark.name,
        imageUrl,
        description: description.substring(0, 300) + (description.length > 300 ? "..." : ""),
        country: {
          name: countryName,
          code: landmark.country,
        },
        continent,
        difficulty: landmark.difficulty,
      });

      // API 호출 간격 조절 (위키피디아 API 제한 준수)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`\n❌ ${landmark.name} 처리 중 오류 발생:`, error);
    }
  }

  console.log(`\n✅ 총 ${landmarksData.length}개의 명소 데이터 수집 완료`);

  // 결과 파일 저장
  const outputPath = path.join(__dirname, "landmarks.json");
  fs.writeFileSync(outputPath, JSON.stringify(landmarksData, null, 2));
  console.log(`✅ 명소 데이터를 ${outputPath}에 저장했습니다.`);
}

// 스크립트 실행
main().catch((error) => {
  console.error("❌ 명소 데이터 수집 중 오류 발생:", error);
  process.exit(1);
});
