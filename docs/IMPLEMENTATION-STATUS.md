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
- Resend 이메일 인증 API 라우트와 이메일 템플릿 준비
- Supabase 초기 스키마와 RLS 초안 작성
- 환경변수 예시 파일 작성

## 아직 실제 연동 전인 항목

- Supabase 프로젝트 생성 및 원격 마이그레이션 적용
- Supabase Auth 회원가입, 로그인 서버 액션 연결
- 쿠폰 발행, 다운로드, 사용완료의 DB 트랜잭션 구현
- 관리자, 직원 권한 검증 미들웨어 또는 서버 가드 구현
- 실제 QR 이미지 생성 라이브러리 연동
- Resend 발신 도메인 검증
- Vercel 프로젝트 연결과 운영 환경변수 등록

## 보안 점검 메모

`npm audit`에서 Next.js 내부 PostCSS 경로에 대한 moderate 항목 2건이 보고되었다. 자동 제안 수정은 Next.js 9로 다운그레이드하는 방식이라 App Router와 Next.js 16 요구사항에 맞지 않아 적용하지 않았다. Next.js 패치 버전이 제공되면 업그레이드로 처리한다.

## 검증 결과

- `npm run lint`: 통과
- `npm run build`: 통과
- 개발 서버: `http://localhost:3000`
- 라우트 응답 확인: `/`, `/coupons`, `/staff`, `/admin/coupons` 모두 `200 OK`
