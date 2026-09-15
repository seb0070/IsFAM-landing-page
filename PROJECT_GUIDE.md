# IsFam 프로젝트 수정 안내

## 실행 방법

이 프로젝트는 React와 Vite를 사용합니다. VS Code의 **Go Live** 대신 아래 명령으로 실행합니다.

```bash
npm run dev
```

터미널에 표시되는 Vite 주소(기본 `http://127.0.0.1:5173`)로 접속합니다.

## 내용 수정 위치

화면 문구와 이미지는 `sections` 폴더에서 수정합니다.

| 화면 | 파일 |
| --- | --- |
| 내비게이션과 첫 화면 | `sections/hero.html` |
| 음성 A/B 체험 | `sections/voice-test.html` |
| 서비스가 필요한 이유 | `sections/why.html` |
| IsFam의 차이와 핵심 소개 | `sections/intro.html` |
| 설정, 판정, 가족 공유 | `sections/how.html` |
| 개인정보 보호와 안심 설계 | `sections/tech.html` |
| 행동 안내, 부모님 사용성, 사용 상황, FAQ | `sections/trust-guide.html` |
| 마지막 신청 영역 | `sections/cta.html` |
| 하단 저작권 문구 | `sections/footer.html` |

이미지를 교체할 때는 새 파일을 `assets`에 넣고 해당 섹션 HTML의 `src` 경로를 변경합니다.

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
| 가족 공유 | `css/share.css` |
| 기술 보안 | `css/tech.css` |
| CTA와 푸터 | `css/cta-footer.css` |
| 보강 콘텐츠와 FAQ | `css/content.css` |
| 모바일 대응 | `css/responsive.css` |
| Apple 스타일 최종 보정 | `css/apple-home.css` |
| 3D, Shader, Liquid 효과 배치 | `src/effects.css` |
| Apple 스타일 스크롤 연출 | `src/story.css` |

`css/apple-home.css`이 기존 스타일보다 나중에 적용되므로, 전체적인 색상이나 크기를 빠르게 바꾸려면 이 파일을 먼저 확인합니다.

## 기능 및 효과 수정 위치

- `src/main.tsx`: HTML 섹션 조립, 스크롤 진행도, Shader Gradient, React Three Fiber 3D, Liquid Logo, Liquid Glass
- `js/core.js`: 앵커 스크롤, 등장 효과, 판정 카드 선택
- `js/voice-test.js`: 음성 재생, 파형, 연령대와 결과 처리
- `js/supabase.js`: 테스트 결과 저장과 통계 조회
- `supabase/migrations/0001_voice_test_results.sql`: 데이터베이스 테이블과 통계 함수

## 주요 명령

```bash
npm run dev        # 개발 서버
npm run typecheck  # TypeScript 검사
npm run lint       # 코드 검사
npm run build      # 배포용 빌드
```

`dist` 폴더는 `npm run build` 실행 시 자동으로 다시 생성되므로 직접 수정하지 않습니다.
