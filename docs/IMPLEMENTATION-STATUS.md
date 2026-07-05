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
- 쿠폰 발행중단 및 관리자 중단 쿠폰 재발행 서버 액션과 Supabase RPC 트랜잭션 연결
- 관리자 쿠폰 상세 화면에서 발행별 다운로드 쿠폰과 이벤트 이력 조회 연결
- 임시 데이터 생성 후 정리하는 쿠폰 전체 흐름 E2E 검증 스크립트 준비 및 실행
- 직원모드 쿠폰 조회 및 사용완료 서버 액션과 Supabase RPC 트랜잭션 연결
- 관리자와 직원모드 서버 가드 공통화
- 초기 관리자/직원 권한 승격 스크립트 준비
- 회원 쿠폰 QR 이미지를 실제 QR 생성 라이브러리로 연결
- 관리자 회원관리와 직원관리의 `profiles` 조회 및 권한 변경 서버 액션 연결
- 관리자 메뉴, 이벤트, 공지, 문의, 배너, 팝업 운영 테이블과 서버 액션 연결
- 관리자 메뉴, 이벤트, 공지, 배너, 팝업 기존 항목 수정 폼 연결
- 관리자 메뉴 이미지 경로 입력, 저장, 공개 메뉴/홈 노출 연결
- 사용자가 추가한 `public/images/menu/` 메뉴 이미지 정적 자산 반영
- 메뉴 이미지 10장을 모두 사용하는 추천 메뉴명, 설명, 가격 데이터 반영
- 화목 브랜드 이미지 `public/images/brand/` 정적 자산 반영
- 브랜드 UI 가이드 `docs/BRAND-UI-GUIDE.md` 작성
- 공개 홈 랜딩을 쿠폰 중심에서 장작구이 전문점 브랜드 중심으로 재구성
- 헤더, 푸터, 버튼, 카드, 배지, 입력 필드의 전역 브랜드 톤 정리
- 홈, 소개, 메뉴, 쿠폰, 이벤트, 공지, 고객센터, 회원, 직원 주요 화면의 문구와 색상 체계 정리
- 새 첨부 기준 히어로 순수 배경 에셋 `public/images/brand/brand-hero-background.png` 반영
- 히어로 배경 금지 요소, 좌측 Safe Area, 4K 교체 기준을 브랜드 UI 가이드에 추가
- 홈 히어로를 시안 기준의 좌측 카피/CTA, 우측 장작불 배경, 하단 가치 패널 구조로 재개선
- 전역 헤더를 로고, 중앙 네비게이션, 로그인/메뉴 아이콘 중심의 다크 글래스 톤으로 개선
- 임시 운영 콘텐츠를 생성, 수정, 검증, 정리하는 E2E 스크립트 준비
- Resend 발신 도메인 점검 스크립트 준비
- Vercel 배포 준비 점검 스크립트와 배포 점검표 준비
- Resend 실제 발신 도메인 DNS 검증 완료
- 관리자 대시보드 쿠폰 수량, 금액, 최근 사용 처리 통계 보강
- 직원모드 최근 처리 내역 표시 보강
- 회원 쿠폰 만료 상태 표시, QR 숨김, 남은 사용기간 표시 보강
- 고객 문의 폼 기본 스팸 방어와 서버 측 입력 검증 보강
- 공개 홈, 메뉴, 이벤트, 공지, 고객센터를 Supabase 운영 데이터 조회로 연결
- 쿠폰 다운로드 목록, 내 쿠폰, 사용내역, 관리자 쿠폰 화면 DB 조회 연결
- Supabase 초기 스키마와 RLS 초안 작성
- Supabase CLI 프로젝트 설정과 표준 마이그레이션 파일 구성
- 환경변수 예시 파일 작성

## 아직 실제 연동 전인 항목

- Vercel 프로젝트 연결과 운영 환경변수 등록
- 실제 QR 리더기 물리 장비 테스트
- 실제 매장 주소와 지도 확정
- 운영 이미지 업로드를 Supabase Storage로 전환할지 여부 확정

## 보안 점검 메모

`npm audit`에서 Next.js 내부 PostCSS 경로에 대한 moderate 항목 2건이 보고되었다. 자동 제안 수정은 Next.js 9로 다운그레이드하는 방식이라 App Router와 Next.js 16 요구사항에 맞지 않아 적용하지 않았다. Next.js 패치 버전이 제공되면 업그레이드로 처리한다.

## 검증 결과

- `npm run lint`: 통과
- `npm run build`: 통과
- `npm run db:push:dry-run`: 통과. 원격 DB가 로컬 마이그레이션과 최신 상태임을 확인
- `npm run admin:promote`: 인자 누락 시 사용법 출력 확인
- `npm run test:e2e:coupon`: 통과. 임시 관리자, 회원, 직원, 쿠폰을 생성해 발행, 발행중단, 재발행, 다운로드, 사용완료, 이벤트 기록을 검증하고 정리 완료
- `npm run test:e2e:content`: 통과. 임시 메뉴, 공지, 문의, 배너, 팝업을 생성, 수정, 검증하고 정리 완료
- `npm run ops:resend`: 통과. `EMAIL_FROM` 도메인 `hmgrill.com`이 Resend에서 `verified`이고 sending/receiving 모두 `enabled`
- `npm run ops:vercel`: 차단. 필수 환경변수는 존재하지만 `NEXT_PUBLIC_SITE_URL`이 운영 URL이 아니고, Vercel CLI와 `.vercel/project.json` 프로젝트 연결이 없음
- 브랜드 UI 개선 후 `npm run lint`, `npm run build`, `npm run db:push:dry-run`, `npm run test:e2e:content`, `npm run test:e2e:coupon`, `npm run ops:resend` 재통과
- 브랜드 UI 개선 후 라우트 응답 확인: `/`, `/about`, `/menu`, `/coupons`, `/events`, `/notices`, `/support`, `/signup`, `/login` 모두 `200 OK`
- 브랜드 UI 개선 후 보호 라우트 응답 확인: `/mypage`, `/staff`, `/admin` 모두 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- 브라우저 플러그인 캡처 검증: 현재 실행 환경에서 `iab` 브라우저를 사용할 수 없어 미수행
- `npm audit --audit-level=moderate`: Next.js 내부 PostCSS moderate 2건 유지. 강제 수정 제안은 Next.js 9 다운그레이드라 미적용
- 로컬 서버: `http://localhost:3000`
- 공개 라우트 응답 확인: `/`, `/menu`, `/events`, `/notices`, `/support`, `/coupons`, `/signup`, `/login` 모두 `200 OK`
- 보호 라우트 응답 확인: `/mypage`, `/staff`, `/admin`, `/admin/coupons`, `/admin/menu`, `/admin/banners` 모두 비로그인 상태에서 `/login`으로 `307` 리다이렉트
- `.env.local` 필수 키 존재 확인: 통과
- Supabase CLI 확인: `2.108.0`
- Supabase 원격 마이그레이션 적용: `20260704185722`, `20260704192827` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704193516` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704194707` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704195812` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704203904`, `20260704204545` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260704205054` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260705033046` 적용 완료
- Supabase 원격 마이그레이션 적용: `20260705033921` 적용 완료
- Supabase 원격 마이그레이션 목록 확인: 로컬과 원격 모두 `20260704185722`부터 `20260705033921`까지 동일
- Supabase advisors: 이슈 없음
- RLS 확인: `profiles`, `coupon_issues`, `member_coupons`, `coupon_events`, `email_verification_tokens`, `menu_items`, `content_posts`, `inquiries`, `site_banners`, `site_popups` 모두 활성화
- 정책 확인: 쿠폰/프로필 공개 정책과 운영 콘텐츠 공개 SELECT 정책 적용 확인
- GRANT 확인: 공개 운영 테이블은 `anon`, `authenticated` SELECT만 허용하고, `inquiries`와 관리자 쓰기 권한은 `service_role`만 허용
- 인증 구현 확인: 회원가입, 로그인, 로그아웃, 인증 메일 재발송, 이메일 인증 링크 검증, 마이페이지 접근 제한 연결
- 쿠폰 RPC 확인: `issue_coupon`, `download_coupon`, `use_coupon`, `stop_coupon_issue`, `resume_coupon_issue` 함수는 `service_role`만 실행 가능
- 관리자 보완 확인: 대시보드 수량/금액 통계, 최근 사용 처리, 메뉴별 운영 가능 상태 표시 추가
- 직원모드 보완 확인: 로그인한 직원 또는 관리자의 최근 쿠폰 처리 내역 표시 추가
- 회원 쿠폰 보완 확인: 만료된 쿠폰은 화면에서 기간 만료로 표시하고 QR을 숨기며, 사용 가능 쿠폰은 남은 사용기간 표시
- 고객센터 보완 확인: 문의 폼 honeypot, 이메일 형식, 메시지 길이 검증 추가
- 메뉴 이미지 확인: `menu_items.image_url` 컬럼 추가, 관리자 메뉴관리 이미지 경로 입력, 공개 홈/메뉴 이미지 렌더링 연결
- 메뉴 데이터 확인: 운영 메뉴 10개, 이미지 연결 10개로 모든 메뉴 이미지 사용 확인
- E2E 정리 확인: `hmgrill-e2e-%` 프로필, `E2E 쿠폰 %` 발행, `cpn_e2e_%` 회원 쿠폰 모두 0건
- 콘텐츠 E2E 정리 확인: `E2E 메뉴%`, `E2E 공지%`, `hmgrill-content-e2e-%`, `E2E 배너%`, `E2E 팝업%` 모두 0건

## Supabase 마이그레이션 운영 기준

추후 사용자가 Supabase SQL 적용을 요청하면 Codex가 직접 마이그레이션을 실행한다.

- 새 SQL 변경은 `supabase migration new <name>`으로 파일을 만든 뒤 작성한다.
- 원격 적용 전 Supabase changelog와 CLI help를 확인한다.
- `public` 테이블은 명시적 `GRANT`와 RLS 정책을 함께 관리한다.
- 적용 후 가능한 범위에서 migration list, advisors, 테스트 쿼리로 검증한다.
- 직접 적용을 위해 `npm run db:push:dry-run`, `npm run db:push` 스크립트를 사용한다.
- 현재 실행 환경에서는 `SUPABASE_POOLER_DB_URL` 사용을 우선한다.
- `SUPABASE_POOLER_DB_URL`은 프로젝트의 실제 Transaction pooler URI를 그대로 사용해야 한다. region 또는 host가 다르면 tenant를 찾지 못한다.
