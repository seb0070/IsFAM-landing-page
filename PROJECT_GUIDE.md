# IsFam 프로젝트 수정 안내

## 실행 방법

이 프로젝트는 Vite로 빌드합니다. VS Code의 **Go Live** 대신 아래 명령으로 실행합니다.

```bash
npm run dev
```

터미널에 표시되는 Vite 주소(기본 `http://127.0.0.1:5173`)로 접속합니다.
영어 페이지는 같은 주소의 `/en/` 입니다.

## 페이지 구성

한국어와 영어가 **각각 별도 주소**입니다. 구조와 디자인은 같고 문구만 다릅니다.

| 언어 | 주소 | HTML 껍데기 | 진입점 | 섹션 폴더 |
| --- | --- | --- | --- | --- |
| 한국어 | `/` | `index.html` | `src/main.ts` | `sections/` |
| 영어 | `/en/` | `en/index.html` | `src/main-en.ts` | `sections/en/` |

두 진입점 모두 본체는 `src/app.ts` 하나를 부릅니다. 동작을 바꾸려면 `app.ts`를 고치면
양쪽에 같이 반영됩니다.

> `en/index.html`의 CSS `<link>`는 반드시 `/css/...`처럼 **루트 기준**이어야 합니다.
> `css/...`로 쓰면 `/en/css/...`로 해석되어 빌드가 깨집니다.

## 내용 수정 위치

화면 문구와 이미지는 `sections` 폴더에서 수정합니다. 영어판은 `sections/en/`에 **같은
파일 이름**으로 있습니다. 클래스·`id`·`data-*` 속성은 양쪽이 똑같아야 하고, 번역하는 것은
텍스트와 `alt`뿐입니다.

| 화면 | 파일 |
| --- | --- |
| 첫 화면 | `sections/hero.html` |
| 서비스가 필요한 이유 | `sections/why.html` |
| 음성 A/B 체험 | `sections/voice-test.html` |
| 설정, 판정, 가족 알림 | `sections/how.html` |
| 개인정보 보호와 안심 설계 | `sections/tech.html` |
| 행동 안내, 사용 상황, FAQ | `sections/trust-guide.html` |
| 마지막 전환 영역 | `sections/cta.html` |
| 하단 저작권 문구 | `sections/footer.html` |

내비게이션은 섹션이 아니라 `index.html` / `en/index.html`에 직접 있습니다.

이미지를 교체할 때는 새 파일을 `public/assets`에 넣고 해당 섹션 HTML의 `src`를
`/assets/새파일.webp`처럼 **`/`로 시작하게** 적습니다. 섹션 HTML은 `?raw`로 주입되어
Vite가 경로를 고쳐 주지 않으므로, 상대경로로 쓰면 영어 페이지에서 404가 납니다.

### 영어판에서만 다른 것

- `#why`의 지표 세 개는 국내 수치가 아니라 FBI IC3 수치입니다.
- 체험 음성은 `/assets/real-voice-en.m4a`, `/assets/fake-voice-en.m4a`를 씁니다.
  **진짜 음성이 반드시 A 슬롯**이어야 합니다(DB의 `is_correct`가 `choice = 'a'`로
  고정된 생성 열입니다). 파일이 없는 동안은 파형만 움직이는 폴백으로 동작합니다.
- 연령대 버튼의 `data-age` 값(`1020`/`3040`/`5060`/`70`)은 DB의 CHECK 제약과 묶여
  있어 **바꾸면 안 됩니다.** 라벨만 번역합니다.

## 디자인 수정 위치

| 수정 대상 | 파일 |
| --- | --- |
| 색상 변수, 공통 버튼과 기본 규칙 | `css/base.css` |
| 내비게이션 | `css/nav.css` |
| 첫 화면 | `css/hero.css` |
| 음성 테스트 | `css/voice-test.css` |
| 필요성 및 통계 | `css/why.css` |
| 작동 방식 | `css/how.css` |
| 판정 카드 | `css/verdict.css` |
| 가족 알림 | `css/share.css` |
| 기술 보안 | `css/tech.css` |
| CTA와 푸터 | `css/cta-footer.css` |
| 보강 콘텐츠와 FAQ | `css/content.css` |
| 모바일 대응 | `css/responsive.css` |
| Apple 스타일 보정 | `css/apple-home.css` |
| 표면·버튼·헤더 최종 결정 | `css/design-system.css` |
| 3D, Shader, Liquid 효과 배치 | `src/effects.css` |
| Apple 스타일 스크롤 연출 | `src/story.css` |

적용 순서가 곧 우선순위입니다. `<link>` 17개 중 **`css/design-system.css`가 마지막**이라
색상·크기를 빠르게 바꾸려면 이 파일을 먼저 확인합니다. 그보다 더 나중에 오는 것은
`src/main.ts`가 불러오는 `src/effects.css`와 `src/story.css` 둘뿐입니다.

영어 전용 보정도 이 파일에 있습니다 — `html[lang="en"]`으로 시작하는 규칙
(`word-break`, 지표 단위 간격)과 언어 전환 링크 `.nav-lang`입니다.
전환 링크에 `.nav-link`를 쓰면 안 됩니다. 모바일에서 `display: none`이 두 곳에
걸려 있어 폰에서 사라집니다.

## 기능 및 효과 수정 위치

- `src/app.ts`: HTML 섹션 조립, 스크롤 진행도, 카운트업, 설치 링크, 스티키 헤더
- `src/main.ts` / `src/main-en.ts`: 언어별 섹션을 모아 `app.ts`에 넘기는 진입점
- `src/hero-webgl.tsx`: 첫 화면 WebGL (PC에서만 지연 로드)
- `js/core.js`: 앵커 스크롤, 등장 효과, 판정 카드 선택
- `js/voice-test.js`: 음성 재생, 파형, 연령대와 결과 처리
- `js/voice-test-strings.js`: 체험 섹션의 한국어·영어 문구 (여기만 고치면 됩니다)
- `js/supabase.js`: 테스트 결과 저장과 통계 조회
- `supabase/migrations/`: 데이터베이스 테이블, 통계 함수, 언어 컬럼

앱 스토어가 열리면 `src/app.ts`의 `APP_STORE_URL`, `PLAY_STORE_URL` 두 줄만
채우면 `[data-install]`이 붙은 버튼이 전부 설치 링크로 바뀝니다.

## 주요 명령

```bash
npm run dev        # 개발 서버
npm run typecheck  # TypeScript 검사
npm run lint       # 코드 검사
npm run build      # 배포용 빌드 (한국어·영어 두 페이지가 함께 나옵니다)
```

`dist` 폴더는 `npm run build` 실행 시 자동으로 다시 생성되므로 직접 수정하지 않습니다.

## 배포

Cloudflare Pages **Direct Upload** 방식입니다(Git 연결이 아닙니다).

```bash
npm run build
npx wrangler pages deploy dist --project-name=isfam --branch=main
```

`/en`(끝 슬래시 없음)은 Pages가 `/en/`으로 308 리다이렉트합니다. 이 동작은
`npx wrangler pages dev dist`로만 확인할 수 있고 `vite preview`로는 재현되지 않습니다.
