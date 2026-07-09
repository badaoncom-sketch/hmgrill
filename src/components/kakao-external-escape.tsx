"use client";

import { useEffect } from "react";

// 카카오톡 인앱 브라우저는 글자 크기를 임의로 조정하고 공유·다운로드가
// 제한되어 일반 브라우저와 다르게 보인다. 접속 즉시 기기의 기본
// 브라우저(크롬·사파리)로 같은 주소를 열어 동일한 화면을 보여준다.
export function KakaoExternalEscape() {
  useEffect(() => {
    if (!/KAKAOTALK/i.test(navigator.userAgent)) {
      return;
    }
    try {
      // 전환에 실패한 구버전에서 무한 재시도하지 않도록 1회만 시도한다.
      if (sessionStorage.getItem("hm-kakao-escape")) {
        return;
      }
      sessionStorage.setItem("hm-kakao-escape", "1");
    } catch {
      // sessionStorage가 막힌 환경에서도 전환은 시도한다.
    }
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(
      window.location.href,
    )}`;
  }, []);

  return null;
}
