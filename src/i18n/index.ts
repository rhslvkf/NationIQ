import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

import en from "./translations/en";
import ko from "./translations/ko";

// 콜백 핸들러 배열 추가
let changeListeners: Array<() => void> = [];

const i18n = new I18n({
  en,
  ko,
});

// 기본 언어를 영어로 설정
i18n.defaultLocale = "en";

// 현재 장치 로케일로 설정
i18n.locale = Localization.locale.split("-")[0];

// 알 수 없는 문자열을 처리할 방법 (개발 환경에서만 경고)
i18n.enableFallback = true;

// 확장: 언어 변경 이벤트를 처리하기 위한 커스텀 메서드들
const customI18n = {
  ...i18n,

  // 원래 locale setter를 저장
  _locale: i18n.locale,

  // 언어 변경 리스너
  onChange(callback: () => void) {
    changeListeners.push(callback);
    return () => {
      changeListeners = changeListeners.filter((listener) => listener !== callback);
    };
  },

  // locale getter/setter 재정의
  get locale() {
    return this._locale;
  },

  set locale(value: string) {
    this._locale = value;
    i18n.locale = value;
    // 언어 변경 시 모든 리스너에게 알림
    changeListeners.forEach((callback) => callback());
  },
};

export default customI18n;
