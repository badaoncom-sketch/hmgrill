# Supabase 마이그레이션 운영

이 문서는 Codex가 `hmgrill` Supabase SQL 마이그레이션을 직접 적용하기 위한 기준이다.

## 현재 상태

- Supabase CLI 설정 완료
- 초기 마이그레이션 파일 준비 완료
- 원격 DB 직접 적용은 아직 미실행
- 현재 CLI/MCP 계정에서 보이는 프로젝트는 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` project ref와 일치하지 않는다

## 필요한 환경변수

`.env.local`에 아래 값 중 하나를 추가해야 Codex가 직접 적용할 수 있다.

권장:

```bash
SUPABASE_POOLER_DB_URL=
```

`SUPABASE_POOLER_DB_URL`은 Supabase Dashboard의 `Connect > Transaction pooler` URI를 사용한다. 직접 DB URL인 `db.<project-ref>.supabase.co:5432`는 IPv6 직접 접속이 필요할 수 있어 현재 실행 환경에서 실패할 수 있다.

pooler 호스트가 `ap-northeast-2.pooler.supabase.com`처럼 region-only 형태이면 스크립트가 `aws-0-ap-northeast-2.pooler.supabase.com` 형식으로 자동 보정한다.

Supabase CLI migration 작업은 prepared statement 문제를 피하기 위해 pooler session 포트인 `5432`를 사용한다. Dashboard의 Transaction pooler URI가 `6543` 포트여도 스크립트가 CLI 실행 시 `5432`로 보정한다.

대안 1:

```bash
SUPABASE_DB_URL=
```

대안 2:

```bash
SUPABASE_PROJECT_REF=
SUPABASE_DB_PASSWORD=
```

DB 접속 문자열에는 비밀번호가 포함되므로 Git에 커밋하지 않는다.

## 실행 명령

적용 전 확인:

```bash
npm run db:push:dry-run
```

원격 적용:

```bash
npm run db:push
```

스크립트는 다음을 수행한다.

- Supabase CLI 버전 확인
- 원격 DB에 pending migration 적용
- migration list 확인
- 적용 후 `public.coupon_issues` 테이블 존재 확인 쿼리 실행

## 보안 기준

- `.env.local`은 Git에 커밋하지 않는다.
- `service_role` 키는 브라우저 코드에서 사용하지 않는다.
- `public` 테이블은 명시적 `GRANT`와 RLS 정책을 함께 관리한다.
- 잘못된 프로젝트에 적용하지 않도록 project ref를 먼저 확인한다.

## 초기 관리자 또는 직원 권한 부여

회원가입이 끝난 계정은 기본 `member` 권한으로 생성된다. 운영 초기에는 아래 명령으로 기존 가입 계정을 관리자 또는 직원으로 승격한다.

관리자 승격:

```bash
npm run admin:promote -- owner@example.com admin
```

직원 승격:

```bash
npm run admin:promote -- staff@example.com staff
```

이 명령은 `profiles.role`과 Supabase Auth `app_metadata.role`을 함께 갱신한다. 기본적으로 이메일 인증 상태는 바꾸지 않는다. Resend 도메인 설정 전이라 초기 운영 계정의 이메일 인증까지 강제로 완료해야 할 때만 아래 플래그를 추가한다.

```bash
npm run admin:promote -- owner@example.com admin --verify-email
```
