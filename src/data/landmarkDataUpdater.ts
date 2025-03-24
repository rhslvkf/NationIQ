/**
 * 명소 데이터에 한국어 이름을 추가하는 스크립트
 *
 * 사용법:
 * - npx ts-node src/data/landmarkDataUpdater.ts
 */

import * as fs from "fs";
import * as path from "path";
import { Landmark, LandmarkName } from "../types";

// 자주 사용되는 명소의 한국어 이름 매핑
const koreanNameMap: Record<string, string> = {
  // 쉬움 (Easy)
  "Eiffel Tower": "에펠탑",
  "Statue of Liberty": "자유의 여신상",
  "Great Wall of China": "만리장성",
  "Taj Mahal": "타지마할",
  "Pyramids of Giza": "기자의 피라미드",
  Colosseum: "콜로세움",
  "Sydney Opera House": "시드니 오페라 하우스",
  "Big Ben": "빅벤",
  "Christ the Redeemer": "거대한 예수상",
  "Machu Picchu": "마추픽추",
  "Leaning Tower of Pisa": "피사의 사탑",
  "Sagrada Familia": "사그라다 파밀리아",
  "Mount Fuji": "후지산",
  "Burj Khalifa": "부르즈 할리파",
  "Gyeongbokgung Palace": "경복궁",
  "Tower Bridge": "타워 브리지",
  "Grand Canyon": "그랜드 캐니언",
  "Niagara Falls": "나이아가라 폭포",
  "Buckingham Palace": "버킹엄 궁전",
  "Brandenburg Gate": "브란덴부르크 문",
  "St. Basil's Cathedral": "성 바실리 대성당",
  "Petronas Towers": "페트로나스 트윈 타워",
  "Acropolis of Athens": "아테네 아크로폴리스",
  "Notre-Dame Cathedral": "노트르담 대성당",
  "Golden Gate Bridge": "금문교",

  // 보통 (Medium)
  "Angkor Wat": "앙코르 와트",
  Petra: "페트라",
  Stonehenge: "스톤헨지",
  "Chichen Itza": "치첸이트사",
  "Moai of Easter Island": "이스터 섬의 모아이",
  "Neuschwanstein Castle": "노이슈반슈타인 성",
  "Hagia Sophia": "아야 소피아",
  "St. Peter's Basilica": "성 베드로 대성당",
  Kremlin: "크렘린",
  "Victoria Falls": "빅토리아 폭포",
  Borobudur: "보로부두르",
  "Forbidden City": "자금성",
  Alhambra: "알함브라 궁전",
  "Dubrovnik Old Town": "두브로브니크 구시가지",
  Santorini: "산토리니",
  "Yellowstone National Park": "옐로스톤 국립공원",
  "Schönbrunn Palace": "쇤브룬 궁전",
  "Potala Palace": "포탈라 궁전",
  "Wat Phra Kaew": "왓 프라깨우",
  "Blue Mosque": "블루 모스크",
  "Sistine Chapel": "시스티나 예배당",
  "Versailles Palace": "베르사유 궁전",
  "Petra Treasury": "페트라 트레저리",
  "Cologne Cathedral": "쾰른 대성당",

  // 어려움 (Hard)
  "Mont Saint-Michel": "몽생미셸",
  Cappadocia: "카파도키아",
  "Terracotta Army": "병마용",
  "Plitvice Lakes": "플리트비체 호수",
  Bagan: "바간",
  Meteora: "메테오라",
  "Antelope Canyon": "앤털로프 캐년",
  "Waitomo Glowworm Caves": "와이토모 반딧불 동굴",
  Pamukkale: "파묵칼레",
  "Jeju Island": "제주도",
  "Zhangjiajie National Forest": "장자제 국립공원",
  Trolltunga: "트롤퉁가",
  "Giant's Causeway": "자이언츠 코즈웨이",
  "Wadden Sea": "바덴 해",
  Preikestolen: "프레이케스톨렌",
  "Salar de Tara": "살라르 데 타라",
  Deadvlei: "데드블레이",
  "Fingal's Cave": "핑갈의 동굴",
  "Socotra Island": "소코트라 섬",
  "Tianmen Mountain": "톈먼산",
  "Lençóis Maranhenses": "렌소이스 마라냔세스",
  "Chocolate Hills": "초콜릿 힐스",
  "Moraine Lake": "모레인 호수",

  // 매우 어려움 (Very Hard)
  "Tsingy de Bemaraha": "칭기 데 베마라하",
  Sigiriya: "시기리야",
  "Göbekli Tepe": "괴베클리 테페",
  "Nazca Lines": "나스카 라인",
  "Salar de Uyuni": "우유니 소금사막",
  "Taos Pueblo": "타오스 푸에블로",
  "Lake Bled": "블레드 호수",
  "Paro Taktsang": "파로 탁상 사원",
  "Svalbard Global Seed Vault": "스발바르 국제 종자 저장고",
  "Kyaiktiyo Pagoda": "짜익티요 파고다",
  "Avenue of the Baobabs": "바오밥 나무 가로수길",
  "Seongsan Ilchulbong": "성산 일출봉",
  "Darvaza Gas Crater": "다르바자 가스 분화구",
  "Virunga National Park": "비룽가 국립공원",
  "Zhangjiajie Glass Bridge": "장자제 유리 다리",
  "Quinta da Regaleira": "킨타 다 헤갈레이라",
  "Hang Nga Guesthouse": "행 응아 게스트하우스",
  "Las Lajas Sanctuary": "라스 라하스 성소",
  "Crooked Forest": "구부러진 숲",
  "Underwater Waterfall": "해저 폭포",
  "Tunnel of Love": "사랑의 터널",
};

async function updateLandmarksData() {
  try {
    // 파일 경로
    const filePath = path.join(__dirname, "landmarks.json");

    // JSON 파일 읽기
    console.log("명소 데이터 파일 읽는 중...");
    const data = fs.readFileSync(filePath, "utf8");
    const landmarks = JSON.parse(data) as Landmark[];

    console.log(`총 ${landmarks.length}개의 명소 데이터 로드 완료`);

    // 명소 데이터 업데이트
    const updatedLandmarks = landmarks.map((landmark) => {
      // 현재 name이 문자열인 경우
      if (typeof landmark.name === "string") {
        const englishName = landmark.name;
        const koreanName = koreanNameMap[englishName] || `${englishName} (번역 필요)`;

        // name을 객체로 변환
        const newLandmark = {
          ...landmark,
          name: {
            en: englishName,
            ko: koreanName,
          },
        };

        return newLandmark;
      }

      // 이미 객체인 경우, 번역 필요한 항목 업데이트
      if (typeof landmark.name === "object" && landmark.name.ko && landmark.name.ko.includes("(번역 필요)")) {
        const englishName = landmark.name.en;
        const koreanName = koreanNameMap[englishName] || landmark.name.ko;

        return {
          ...landmark,
          name: {
            ...landmark.name,
            ko: koreanName,
          },
        };
      }

      // 이미 객체인 경우 그대로 반환
      return landmark;
    });

    // 업데이트된 데이터 저장
    fs.writeFileSync(filePath, JSON.stringify(updatedLandmarks, null, 2));
    console.log(`✅ 다국어 명소 이름이 추가된 데이터를 ${filePath}에 저장했습니다.`);
  } catch (error) {
    console.error("❌ 명소 데이터 업데이트 중 오류 발생:", error);
  }
}

// 스크립트 실행
updateLandmarksData().catch((error) => {
  console.error("❌ 명소 데이터 업데이트 실행 중 오류 발생:", error);
  process.exit(1);
});
