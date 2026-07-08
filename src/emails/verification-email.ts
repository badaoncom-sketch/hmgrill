// Resend의 react 옵션은 @react-email/render 의존성이 필요하므로
// 추가 패키지 없이 HTML/텍스트 문자열로 직접 렌더링한다.

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderVerificationEmail({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verificationUrl);

  const html = `<!DOCTYPE html>
<html lang="ko">
  <body style="margin:0;padding:0;background-color:#f4efe6;">
    <div style="display:none;max-height:0;overflow:hidden;">${safeName}님, 링크를 눌러 화목 이메일 인증을 완료해 주세요.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4efe6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:1px solid #e6ddc9;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:#0d0d0d;padding:22px 32px;">
                <span style="font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:19px;font-weight:700;letter-spacing:0.28em;color:#f7e6c1;">화목</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#241f16;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.4;">이메일 인증을 완료해 주세요</h1>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4a4235;">
                  ${safeName}님, 화목 회원가입을 완료하려면 이메일 인증이 필요합니다.
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a4235;">
                  아래 버튼을 눌러 인증을 완료한 뒤 쿠폰 다운로드와 마이페이지를 이용해 주세요.
                </p>
                <a href="${safeUrl}" style="display:inline-block;background-color:#b8821e;color:#ffffff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
                  이메일 인증하기
                </a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#8a8071;">
                  버튼이 열리지 않으면 아래 주소를 복사해 브라우저에 붙여넣어 주세요.<br />
                  <a href="${safeUrl}" style="color:#b8821e;word-break:break-all;">${safeUrl}</a>
                </p>
                <hr style="margin:24px 0;border:none;border-top:1px solid #ece4d3;" />
                <p style="margin:0;font-size:12px;line-height:1.7;color:#8a8071;">
                  인증 링크는 24시간 동안 유효합니다.<br />
                  본인이 요청하지 않은 가입이라면 이 메일을 무시해 주세요.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:11px;color:#a39a89;">
            회목 주식회사 · 부산광역시 동래구 온천천로 447-2
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${name}님, 화목 회원가입을 완료하려면 이메일 인증이 필요합니다.`,
    "",
    "아래 주소를 브라우저에 붙여넣어 인증을 완료해 주세요.",
    verificationUrl,
    "",
    "인증 링크는 24시간 동안 유효합니다.",
    "본인이 요청하지 않은 가입이라면 이 메일을 무시해 주세요.",
  ].join("\n");

  return { html, text };
}
