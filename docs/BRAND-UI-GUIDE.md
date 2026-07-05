# 화목 UI/UX 디자인 시스템 가이드라인

- 기준 이미지: `public/images/brand/`
- 적용 범위: Home, 서브페이지, 관리자 페이지, 로그인, 회원가입, 쿠폰, 마이페이지, 직원 화면
- 핵심 원칙: 첨부 디자인 이미지는 분위기와 방향을 참고하는 Reference이며, 이미지 안의 UI, 레이아웃, 카드, 문구를 그대로 복사하지 않는다.

## 디자인 키워드

- Warm
- Luxury
- Premium
- Modern Korean
- Minimal
- Craftsmanship
- Wood Fire
- Dark Theme
- Timeless

## 브랜드 무드

- 따뜻한 분위기
- 고급스러운 공간
- 프리미엄 다이닝
- 장인의 감성
- 참나무 장작
- 불의 따뜻함
- 여유로운 공간감
- 절제된 디자인

## 디자인 컨셉

전통적인 한국 감성을 현대적으로 재해석한다. 전체 분위기는 고급 레스토랑, 호텔 라운지, 프리미엄 스테이크하우스, 일본 와규 매장의 완성도를 목표로 한다.

과한 한국 전통 느낌은 사용하지 않는다. 붓글씨 로고와 따뜻한 조명, 절제된 여백으로만 한국적 감성을 표현한다.

## Design Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--hm-background` | `#0D0D0D` | 전체 배경, 히어로, 푸터 |
| `--hm-surface` | `#1A1A1A` | 섹션, 운영 화면 표면 |
| `--hm-card` | `#232323` | 카드, 패널, 폼 컨테이너 |
| `--hm-primary` | `#F7E6C1` | 주요 버튼, 로고 주변 강조, 텍스트 포인트 |
| `--hm-accent-gold` | `#B8821E` | 보조 강조, Hover |
| `--hm-accent-red` | `#C63B2D` | 위험/오류/불의 포인트 |
| `--hm-text` | `#FFFFFF` | 기본 텍스트 |
| `--hm-subtext` | `#BDBDBD` | 설명 텍스트 |
| `--hm-border` | `rgba(255,255,255,.08)` | 카드/섹션 경계 |
| `--hm-divider` | `rgba(255,255,255,.05)` | 내부 구분선 |
| `--hm-shadow` | `0 20px 60px rgba(0,0,0,.25)` | 은은한 Elevation |

## Typography

- 기본 폰트: `Pretendard Variable`, 없으면 `Noto Sans KR`
- 타이틀: `Noto Serif KR`, Bold
- H1: 700
- H2: 700
- H3: 600
- Body: 400
- Button: 600
- Caption: 400

## Logo

- 제공된 화목 붓글씨 로고를 그대로 사용한다.
- 폰트로 대체하지 않는다.
- 로고를 수정하지 않는다.
- 로고 주변에는 충분한 여백을 확보한다.
- 헤더와 히어로에는 `public/images/brand/brand-logo-transparent.png`를 사용한다.

## Layout

- 8px Grid System
- Desktop Max Width: `1440px`
- Content Width: `1200px`
- Section Padding: `120px`
- Container Padding: `24px`
- Mobile Padding: `20px`
- 충분한 White Space를 유지한다.

## Radius

| Target | Radius |
| --- | --- |
| Card | `20px` |
| Button | `14px` |
| Input | `12px` |
| Image | `24px` |

## Components

### Button

- Primary: `#F7E6C1` background, `#0D0D0D` text
- Secondary: transparent or dark surface
- Outline: `#F7E6C1` border and text
- Hover: `#B8821E`

### Card

- Background: `#232323`
- Border: `1px rgba(255,255,255,.08)`
- Radius: `20px`
- Hover: 아주 은은한 Elevation만 적용

### Input

- Background: `#1A1A1A`
- Border: `rgba(255,255,255,.08)`
- Radius: `12px`
- Focus: `#F7E6C1`

### Icon

- Lucide Icons
- Outline Style
- Filled Icon 사용 금지

## Animation

허용:

- Fade
- Opacity
- Scale
- Blur

금지:

- Bounce
- Rotate
- Flash
- Zoom
- 과한 Motion

## Hero Section

히어로 이미지는 `Background Asset`로 사용한다. 이미지에는 아래 내용을 절대 포함하지 않는다.

- 로고
- 문구
- 버튼
- 메뉴
- 아이콘
- UI
- 텍스트

Hero 이미지는 좌측 약 40%를 비워 둔다. 좌측에는 실제 UI 레이어로 Logo, Title, Description, CTA Button을 배치한다.

우측에는 장작, 숯불, 불꽃, 고기, 연기를 활용한다. Desktop, Tablet, Mobile에서 `object-fit: cover` 기준으로 자연스럽게 크롭될 수 있도록 Safe Area를 고려한다. 운영 최종본은 4K 품질을 기준으로 제작한다.

## Image Style

- Photo Realistic
- Cinematic
- Premium Restaurant
- Warm Lighting
- Dark Interior
- Wood Texture
- Stone Texture
- Smoke
- Fire
- Amber Light
- Bokeh

실제 촬영한 것 같은 분위기를 유지한다. 3D Render 느낌, AI 느낌, 과한 HDR은 금지한다.

## Copy Rule

프로젝트 전체에서 금지어 목록에 포함된 표현은 사용하지 않는다.

## Absolute Bans

- 이모지
- 과한 그라디언트
- Glassmorphism
- Neon
- Material Design 스타일
- Bootstrap 스타일
- 3D 아이콘
- 채도가 높은 색상
- 게임 UI
- 화려한 Animation
- 복잡한 카드 디자인

## Implementation Rule

UI 구현 순서는 항상 Design Token, 공통 컴포넌트, 페이지 순서로 진행한다. 모든 페이지는 공통 디자인 시스템을 사용하며 페이지마다 새로운 스타일을 만들지 않는다.
