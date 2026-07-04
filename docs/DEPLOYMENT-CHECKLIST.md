# 배포 점검표

이 문서는 화목 홈페이지를 Vercel과 Resend 운영 환경에 올리기 전 확인해야 할 항목이다.

## Resend

확인 명령:

```bash
npm run ops:resend
```

확인 기준:

- `EMAIL_FROM`은 `example.com`이 아닌 실제 발신 도메인을 사용한다.
- Resend Domains에 `EMAIL_FROM` 도메인이 등록되어 있다.
- 도메인 상태가 `verified`이다.
- sending capability가 `enabled`이다.

Resend 도메인 검증은 비동기 작업이며, DNS가 전파되어야 성공한다.

## Vercel

확인 명령:

```bash
npm run ops:vercel
```

확인 기준:

- `.env.local`에 운영 필수 환경변수가 모두 있다.
- `NEXT_PUBLIC_SITE_URL`은 localhost가 아닌 운영 URL이다.
- `EMAIL_FROM`은 실제 발신 도메인이다.
- Vercel CLI가 설치되어 있다.
- `.vercel/project.json`이 있어 프로젝트가 연결되어 있다.

Vercel 환경변수 등록 대상:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_SITE_URL
EMAIL_FROM
```

운영 배포 전에는 production, preview 환경에 같은 키가 들어갔는지 확인한다.
