# 파일 점검 기록

- 점검일: 2026-07-05
- 대상 저장소: `badaoncom-sketch/hmgrill`
- 점검 기준: 현재 저장소에 존재하는 모든 프로젝트 파일

## 요약

현재 저장소는 Next.js App Router 기반 1차 구현 단계이다.

점검 결과, 프로젝트 기준 문서와 실행 가능한 앱 기반 파일이 존재하며 GitHub 원격 저장소와 `main` 브랜치 연결이 완료되어 있다.

## 파일별 점검

| 파일 | 상태 | 점검 결과 |
| --- | --- | --- |
| `README.md` | 신규 작성 | 프로젝트 목적, 현재 상태, 문서 구조, 개발 원칙을 정리했다. |
| `화목-홈페이지-v1.0-기획설계서.md` | 수정 | 문서 버전, 정리일, 저장소, 문서 성격 메타데이터를 추가했다. |
| `docs/FILE-AUDIT.md` | 신규 작성 | 현재 저장소 파일별 점검 결과를 기록했다. |
| `docs/IMPLEMENTATION-ROADMAP.md` | 신규 작성 | 기획설계서를 기준으로 개발 단계와 검증 기준을 정리했다. |
| `docs/IMPLEMENTATION-STATUS.md` | 신규 작성 | 1차 구현 완료 범위와 남은 실제 연동 항목을 기록했다. |
| `docs/SUPABASE-MIGRATION.md` | 신규 작성 | Codex가 직접 Supabase 마이그레이션을 적용하기 위한 환경변수와 명령을 정리했다. |
| `package.json` | 신규 작성 | Next.js, React, Supabase, Resend, UI 유틸 의존성과 실행 스크립트를 정의했다. |
| `.env.example` | 신규 작성 | Supabase, Resend, 사이트 URL 환경변수 예시를 정의했다. |
| `src/app/*` | 신규 작성 | 공개, 회원, 쿠폰, 직원모드, 관리자 라우트 화면을 구성했다. |
| `src/components/*` | 신규 작성 | 재사용 UI, 쿠폰 카드, QR 쿠폰, 직원 스캐너, 관리자 쿠폰 발행 폼을 구성했다. |
| `src/components/auth/*` | 신규 작성 | 회원가입, 로그인, 인증 메일 재발송 클라이언트 폼을 구성했다. |
| `src/lib/*` | 신규 작성 | 타입, 샘플 데이터, 쿠폰 정책, Supabase 클라이언트, 환경변수 유틸을 구성했다. |
| `src/lib/auth/*` | 신규 작성 | 이메일 인증 토큰 생성, 해시, Resend 발송, 토큰 검증 로직을 구성했다. |
| `src/emails/*` | 신규 작성 | Resend 이메일 인증 템플릿을 구성했다. |
| `middleware.ts` | 신규 작성 | Supabase SSR 세션 갱신 미들웨어를 연결했다. |
| `scripts/supabase-migrate.mjs` | 신규 작성 | `.env.local`의 DB 접속정보를 사용해 Supabase 원격 마이그레이션을 직접 적용하는 스크립트다. |
| `supabase/config.toml` | 신규 작성 | Supabase CLI 프로젝트 설정을 초기화했다. |
| `supabase/migrations/20260704185722_initial_schema.sql` | 신규 작성 | 쿠폰 운영을 위한 초기 테이블, enum, 명시적 GRANT, RLS 초안을 작성했다. |
| `supabase/migrations/20260704193516_add_email_verification_tokens.sql` | 신규 작성 | Resend 이메일 인증을 위한 토큰 테이블과 service role 전용 권한을 작성했다. |

## 확인한 사항

- Git 저장소가 초기화되어 있다.
- 원격 저장소 `origin`이 `https://github.com/badaoncom-sketch/hmgrill.git`로 설정되어 있다.
- 현재 브랜치는 `main`이다.
- 이전 커밋은 원격 `origin/main`과 동기화되어 있었다.
- 구현 코드와 패키지 설정이 존재한다.
- Supabase 원격 마이그레이션은 아직 적용하지 않았다.
- 추후 Supabase SQL 마이그레이션은 사용자가 별도 요청하면 Codex가 직접 적용한다.

## 미확인 또는 향후 확인 필요

- Supabase 프로젝트 및 환경변수 구성 여부
- Resend 도메인 및 API Key 구성 여부
- Vercel 프로젝트 연결 여부
- 데이터베이스 마이그레이션 원격 적용 여부
- 인증, 쿠폰, 직원모드, 관리자 기능의 실제 DB 연동 여부

## 다음 점검 기준

구현 파일이 추가되면 아래 항목을 기준으로 다시 점검한다.

- `package.json` 스크립트
- TypeScript 설정
- ESLint 및 포맷 설정
- 환경변수 예시 파일
- Supabase 클라이언트 및 서버 클라이언트 분리
- DB 스키마와 RLS 정책
- 인증 흐름
- 쿠폰 다운로드 및 사용 처리 트랜잭션
- 관리자, 회원, 직원 권한 분리
- 빌드, 린트, 타입 체크 결과
