# 구현 상태

- 작성일: 2026-07-05
- 기준 문서: `화목-홈페이지-v1.0-기획설계서.md`

## 완료된 1차 구현

- Next.js 16 App Router 프로젝트 기반 구성
- TypeScript, Tailwind CSS, ESLint 구성
- 공개 홈페이지 메뉴 라우트 구성
- 쿠폰 다운로드, 내 쿠폰, 사용내역 화면 구성
- 직원모드 QR 스캔 입력 화면 구성
- 관리자 대시보드와 쿠폰 발행 화면 구성
- Supabase SSR 클라이언트 준비
- Supabase Auth 회원가입, 로그인, 로그아웃 서버 액션 연결
- Resend 이메일 인증 API 라우트와 이메일 템플릿 준비
- Resend 이메일 인증 토큰 생성, 재발송, 검증 흐름 연결
- 쿠폰 발행 및 다운로드 서버 액션과 Supabase RPC 트랜잭션 연결
- 직원모드 쿠폰 조회 및 사용완료 서버 액션과 Supabase RPC 트랜잭션 연결
- 관리자와 직원모드 서버 가드 공통화
- 초기 관리자/직원 권한 승격 스크립트 준비
- 회원 쿠폰 QR 이미지를 실제 QR 생성 라이브러리로 연결
- 관리자 회원관리와 직원관리의 `profiles` 조회 및 권한 변경 서버 액션 연결
- 관리자 메뉴, 이벤트, 공지, 문의, 배너, 팝업 운영 테이블과 서버 액션 연결
- 공개 홈, 메뉴, 이벤트, 공지, 고객센터를 Supabase 운영 데이터 조회로 연결
- 쿠폰 다운로드 목록, 내 쿠폰, 사용내역, 관리자 쿠폰 화면 DB 조회 연결
- Supabase 초기 스키마와 RLS 초안 작성
- Supabase CLI 프로젝트 설정과 표준 마이그레이션 파일 구성
- 환경변수 예시 파일 작성

## 아직 실제 연동 전인 항목

- 관리자 운영 화면의 수정 폼 고도화와 상세 편집 화면
- Resend 발신 도메인 검증
- Vercel 프로젝트 연결과 운영 환경변수 등록

## 보안 점검 메모

`npm audit`에서 Next.js 내부 PostCSS 경로에 대한 moderate 항목 2건이 보고되었다. 자동 제안 수정은 Next.js 9로 다운그레이드하는 방식이라 App Router와 Next.js 16 요구사항에 맞지 않아 적용하지 않았다. Next.js 패치 버전이 제공되면 업그레이드로 처리한다.

## 검증 결과

- `npm run lint`: 통과
- `npm run build`: 통과
- `npm run db:push:dry-run`: 원격 DB 최신 상태 확인
- `npm run admin:promote`: 인자 누락 시 사용법 출력 확인
- `npm audit --audit-level=moderate`: Next.js 내부 PostCSS moderate 2건 유지. 강제 수정 제안은 Next.js 9 다운그레이드라 미적용
- 개발 서버: `http://localhost:3000`
- 라우트 응답 확인: `/`, `/coupons`, `/staff`, `/admin/coupons` 모두 `200 OK`
- `.env.local` 필수 키 존재 확인: 통과
- Supabase CLI 확인: `2.108.0`
- Supabase CLI/MCP 계정 프로젝트 확인: 현재 연결 계정에는 `.env.local`의 hmgrill project ref가 표시되지 않음
- `npm run db:push:dry-run`: DB 마이그레이션 접속정보가 없어 안전하게 중단됨
- 직접 DB URL dry-run: IPv6 직접 접속 문제로 실패. Transaction Pooler IPv4 접속 문자열 필요
- Transaction Pooler dry-run: region-only host는 자동 보정했으나 `tenant/user not found`로 실패. Dashboard에서 복사한 정확한 pooler URI 필요
- Supabase 원격 마이그레이션 적용: `20260704185722`, `20260704192827` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704193516` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704194707` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704195812` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704203904`, `20260704204545` 적용 완료
- Supabase advisors: 이슈 없음
- RLS 확인: `profiles`, `coupon_issues`, `member_coupons`, `coupon_events`, `email_verification_tokens`, `menu_items`, `content_posts`, `inquiries`, `site_banners`, `site_popups` 모두 활성화
- 정책 확인: 쿠폰/프로필 공개 정책과 운영 콘텐츠 공개 SELECT 정책 적용 확인
- GRANT 확인: 공개 운영 테이블은 `anon`, `authenticated` SELECT만 허용하고, `inquiries`와 관리자 쓰기 권한은 `service_role`만 허용
- 인증 구현 확인: 회원가입, 로그인, 로그아웃, 인증 메일 재발송, 이메일 인증 링크 검증, 마이페이지 접근 제한 연결
- 쿠폰 RPC 확인: `issue_coupon`, `download_coupon`, `use_coupon` 함수는 `service_role`만 실행 가능
- 쿠폰 화면 확인: `/coupons`는 `200 OK`, `/coupons/my`는 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- 직원모드 화면 확인: `/staff`는 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- 관리자 화면 확인: `/admin`, `/admin/coupons`는 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- 관리자 세부 화면 확인: `/admin/members`, `/admin/staff`는 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- 공개 운영 화면 확인: `/`, `/menu`, `/events`, `/notices`, `/support`는 `200 OK`
- 관리자 운영 화면 확인: `/admin/menu`, `/admin/events`, `/admin/inquiries`, `/admin/banners`, `/admin/popups`는 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- 라우트 응답 확인: `/signup`, `/login`, `/auth/verify`는 `200 OK`, `/mypage`는 비로그인 상태에서 `/login`으로 `307` 리다이렉트

## Supabase 마이그레이션 운영 기준

추후 사용자가 Supabase SQL 적용을 요청하면 Codex가 직접 마이그레이션을 실행한다.

- 새 SQL 변경은 `supabase migration new <name>`으로 파일을 만든 뒤 작성한다.
- 원격 적용 전 Supabase changelog와 CLI help를 확인한다.
- `public` 테이블은 명시적 `GRANT`와 RLS 정책을 함께 관리한다.
- 적용 후 가능한 범위에서 migration list, advisors, 테스트 쿼리로 검증한다.
- 직접 적용을 위해 `npm run db:push:dry-run`, `npm run db:push` 스크립트를 사용한다.
- 현재 실행 환경에서는 `SUPABASE_POOLER_DB_URL` 사용을 우선한다.
- `SUPABASE_POOLER_DB_URL`은 프로젝트의 실제 Transaction pooler URI를 그대로 사용해야 한다. region 또는 host가 다르면 tenant를 찾지 못한다.
