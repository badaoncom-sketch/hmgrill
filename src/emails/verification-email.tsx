export function VerificationEmail({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#171717",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>화목 이메일 인증</h1>
      <p>{name}님, 화목 회원가입을 완료하려면 이메일 인증이 필요합니다.</p>
      <p>
        아래 링크를 눌러 인증을 완료한 뒤 쿠폰 다운로드와 마이페이지를
        이용해 주세요.
      </p>
      <p>
        <a
          href={verificationUrl}
          style={{
            display: "inline-block",
            borderRadius: 6,
            background: "#b91c1c",
            color: "#ffffff",
            padding: "12px 16px",
            textDecoration: "none",
          }}
        >
          이메일 인증하기
        </a>
      </p>
      <p style={{ color: "#525252", fontSize: 13 }}>
        본인이 요청하지 않은 가입이라면 이 메일을 무시해 주세요.
      </p>
    </div>
  );
}
