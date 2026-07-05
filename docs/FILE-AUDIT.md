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
| `docs/MENU-IMAGES.md` | 신규 작성 | 메뉴 이미지 저장 위치와 관리자 입력 경로를 정리했다. |
| `docs/BRAND-UI-GUIDE.md` | 신규 작성 | 화목 브랜드 이미지 기반 전역 UI 디자인 기준을 정리했다. |
| `package.json` | 신규 작성 | Next.js, React, Supabase, Resend, UI 유틸 의존성과 실행 스크립트를 정의했다. |
| `.env.example` | 신규 작성 | Supabase, Resend, 사이트 URL 환경변수 예시를 정의했다. |
| `src/app/*` | 신규 작성 | 공개, 회원, 쿠폰, 직원모드, 관리자 라우트 화면을 구성했다. |
| `src/components/*` | 신규 작성 | 재사용 UI, 쿠폰 카드, 실제 QR 쿠폰, 직원 스캐너, 관리자 쿠폰 발행 폼을 구성했다. |
| `src/components/auth/*` | 신규 작성 | 회원가입, 로그인, 인증 메일 재발송 클라이언트 폼을 구성했다. |
| `src/components/coupon-download-form.tsx` | 신규 작성 | 회원 쿠폰 다운로드 서버 액션 폼을 구성했다. |
| `src/components/menu-image.tsx` | 신규 작성 | 메뉴 이미지가 있으면 표시하고 없으면 안정적인 플레이스홀더를 표시한다. |
| `public/images/brand/*` | 신규 추가 | 화목 브랜드 로고, 매장 외관, 불/간판 분위기 이미지를 전역 UI 기준 이미지로 저장한다. |
| `src/app/actions/staff.ts` | 신규 작성 | 직원모드 쿠폰 조회와 사용완료 서버 액션을 구성했다. |
| `src/app/actions/admin-users.ts` | 신규 작성 | 관리자 회원/직원 권한 변경 서버 액션을 구성했다. |
| `src/app/actions/content.ts` | 신규 작성 | 메뉴, 이벤트, 공지, 문의, 배너, 팝업 운영 서버 액션을 구성했다. |
| `src/lib/*` | 신규 작성 | 타입, 샘플 데이터, 쿠폰 정책, Supabase 클라이언트, 환경변수 유틸을 구성했다. |
| `src/lib/auth/*` | 신규 작성 | 이메일 인증 토큰 생성, 해시, Resend 발송, 토큰 검증 로직을 구성했다. |
| `src/lib/coupons/*` | 신규 작성 | Supabase 쿠폰 row를 화면 타입으로 변환하는 매퍼를 구성했다. |
| `src/lib/content/*` | 신규 작성 | Supabase 운영 콘텐츠 row를 화면 타입으로 변환하는 매퍼를 구성했다. |
| `src/emails/*` | 신규 작성 | Resend 이메일 인증 템플릿을 구성했다. |
| `middleware.ts` | 신규 작성 | Supabase SSR 세션 갱신 미들웨어를 연결했다. |
| `scripts/supabase-migrate.mjs` | 신규 작성 | `.env.local`의 DB 접속정보를 사용해 Supabase 원격 마이그레이션을 직접 적용하는 스크립트다. |
| `scripts/promote-user.mjs` | 신규 작성 | 기존 가입 계정을 관리자 또는 직원 권한으로 승격하는 운영 스크립트다. |
| `scripts/e2e-coupon-flow.mjs` | 신규 작성 | 임시 계정과 쿠폰으로 쿠폰 발행부터 사용완료까지 검증하고 정리하는 E2E 스크립트다. |
| `scripts/e2e-content-management.mjs` | 신규 작성 | 임시 운영 콘텐츠로 생성, 수정, 검증, 정리를 수행하는 E2E 스크립트다. |
| `scripts/resend-domain-check.mjs` | 신규 작성 | `EMAIL_FROM` 도메인이 Resend에서 발신 가능 상태인지 점검하는 스크립트다. |
| `scripts/vercel-readiness.mjs` | 신규 작성 | Vercel 배포 전 환경변수, 사이트 URL, 프로젝트 연결 상태를 점검하는 스크립트다. |
| `public/images/menu/*` | 신규 추가 | 메뉴 화면에서 사용할 정적 메뉴 이미지를 저장한다. |
| `docs/DEPLOYMENT-CHECKLIST.md` | 신규 작성 | Resend와 Vercel 운영 배포 전 확인 절차를 정리했다. |
| `supabase/config.toml` | 신규 작성 | Supabase CLI 프로젝트 설정을 초기화했다. |
| `supabase/migrations/20260704185722_initial_schema.sql` | 신규 작성 | 쿠폰 운영을 위한 초기 테이블, enum, 명시적 GRANT, RLS 초안을 작성했다. |
| `supabase/migrations/20260704193516_add_email_verification_tokens.sql` | 신규 작성 | Resend 이메일 인증을 위한 토큰 테이블과 service role 전용 권한을 작성했다. |
| `supabase/migrations/20260704194707_add_coupon_issue_download_rpcs.sql` | 신규 작성 | 쿠폰 발행과 다운로드를 트랜잭션으로 처리하는 RPC 함수를 작성했다. |
| `supabase/migrations/20260704195812_add_coupon_use_rpc.sql` | 신규 작성 | 직원모드 쿠폰 사용완료를 트랜잭션으로 처리하는 RPC 함수를 작성했다. |
| `supabase/migrations/20260704203904_add_content_management_tables.sql` | 신규 작성 | 메뉴, 이벤트, 공지, 문의, 배너, 팝업 운영 테이블과 RLS 정책을 작성했다. |
| `supabase/migrations/20260704204545_restrict_content_table_grants.sql` | 신규 작성 | 운영 콘텐츠 테이블의 공개 권한을 SELECT 중심으로 정리했다. |
| `supabase/migrations/20260704205054_add_coupon_issue_status_rpcs.sql` | 신규 작성 | 쿠폰 발행중단과 재발행 RPC 함수를 작성했다. |
| `supabase/migrations/20260705033046_add_menu_item_image_url.sql` | 신규 작성 | 메뉴 이미지 경로 저장을 위한 `menu_items.image_url` 컬럼을 추가했다. |
| `supabase/migrations/20260705033921_seed_menu_items_with_images.sql` | 신규 작성 | 메뉴 이미지 10장을 모두 사용하는 추천 메뉴명, 설명, 가격 데이터를 반영했다. |

## 확인한 사항

- Git 저장소가 초기화되어 있다.
- 원격 저장소 `origin`이 `https://github.com/badaoncom-sketch/hmgrill.git`로 설정되어 있다.
- 현재 브랜치는 `main`이다.
- 이전 커밋은 원격 `origin/main`과 동기화되어 있었다.
- 구현 코드와 패키지 설정이 존재한다.
- Supabase 원격 마이그레이션은 `20260705033921`까지 적용 완료 상태였다.
- 이번 UI 개선은 DB 스키마 변경 없이 정적 이미지, 문서, 화면 컴포넌트 중심으로 진행했다.

## 미확인 또는 향후 확인 필요

- Vercel 프로젝트 연결 여부
- 실제 QR 리더기 물리 장비 테스트
- 실제 매장 주소와 지도 확정
- 운영 이미지 업로드를 Supabase Storage로 전환할지 여부

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
