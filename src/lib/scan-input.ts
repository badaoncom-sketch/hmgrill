// QR 리더기는 키보드처럼 입력하므로, 태블릿이 한글(두벌식) 자판 상태면
// 토큰의 영문자가 한글 자모/음절로 바뀌어 들어온다. 이를 QWERTY로 역변환한다.
const JAMO_TO_QWERTY: Record<string, string> = {
  ㅂ: "q", ㅈ: "w", ㄷ: "e", ㄱ: "r", ㅅ: "t",
  ㅛ: "y", ㅕ: "u", ㅑ: "i", ㅐ: "o", ㅔ: "p",
  ㅁ: "a", ㄴ: "s", ㅇ: "d", ㄹ: "f", ㅎ: "g",
  ㅗ: "h", ㅓ: "j", ㅏ: "k", ㅣ: "l",
  ㅋ: "z", ㅌ: "x", ㅊ: "c", ㅍ: "v", ㅠ: "b", ㅜ: "n", ㅡ: "m",
  ㅃ: "Q", ㅉ: "W", ㄸ: "E", ㄲ: "R", ㅆ: "T", ㅒ: "O", ㅖ: "P",
  // 조합 모음/겹받침은 두 키 입력의 결과다.
  ㅘ: "hk", ㅙ: "ho", ㅚ: "hl", ㅝ: "nj", ㅞ: "np", ㅟ: "nl", ㅢ: "ml",
  ㄳ: "rt", ㄵ: "sw", ㄶ: "sg", ㄺ: "fr", ㄻ: "fa", ㄼ: "fq",
  ㄽ: "ft", ㄾ: "fx", ㄿ: "fv", ㅀ: "fg", ㅄ: "qt",
};

const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];
const JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];
const JONGSEONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

function jamoToQwerty(jamo: string) {
  return JAMO_TO_QWERTY[jamo] ?? jamo;
}

export function normalizeScanInput(value: string) {
  const stripped = value.replace(/\s+/g, "");
  let result = "";

  for (const char of stripped) {
    const code = char.charCodeAt(0);

    if (code >= 0xac00 && code <= 0xd7a3) {
      // 완성형 음절(IME가 조합한 경우)을 자모로 분해한 뒤 역변환한다.
      const index = code - 0xac00;
      const cho = CHOSEONG[Math.floor(index / 588)];
      const jung = JUNGSEONG[Math.floor((index % 588) / 28)];
      const jong = JONGSEONG[index % 28];
      result += jamoToQwerty(cho) + jamoToQwerty(jung) + (jong ? jamoToQwerty(jong) : "");
    } else {
      result += jamoToQwerty(char);
    }
  }

  return result;
}
