/**
 * 페이지 진입점. React 없이 순수 DOM 으로 동작한다.
 *
 * 무거운 WebGL 연출은 PC + WebGL 지원일 때만 별도 청크로 내려받는다(hero-webgl.tsx).
 * 모바일은 three.js 를 한 바이트도 받지 않는다.
 */
import heroHtml from "../sections/hero.html?raw";
import voiceTestHtml from "../sections/voice-test.html?raw";
import whyHtml from "../sections/why.html?raw";
import howHtml from "../sections/how.html?raw";
import techHtml from "../sections/tech.html?raw";
import ctaHtml from "../sections/cta.html?raw";
import footerHtml from "../sections/footer.html?raw";
import trustGuideHtml from "../sections/trust-guide.html?raw";
import "./effects.css";
import "./story.css";

const sectionMarkup: Record<string, string> = {
  "sections/hero.html": heroHtml,
  "sections/voice-test.html": voiceTestHtml,
  "sections/why.html": whyHtml,
  "sections/how.html": howHtml,
  "sections/tech.html": techHtml,
  "sections/cta.html": ctaHtml,
  "sections/footer.html": footerHtml,
  "sections/trust-guide.html": trustGuideHtml,
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** 이 폭 아래로는 3D 링을 띄우지 않는다. CSS 브레이크포인트와 같은 값을 쓴다. */
const isDesktop = window.matchMedia("(min-width: 861px)").matches;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function includeSections() {
  document.querySelectorAll<HTMLElement>("[data-include]").forEach((slot) => {
    const path = slot.dataset.include;
    if (path && sectionMarkup[path]) slot.outerHTML = sectionMarkup[path];
  });
}

function initScrollStory() {
  const targets = document.querySelectorAll<HTMLElement>("[data-story]");
  const state = new Map<HTMLElement, { current: number; target: number }>();
  let animationFrame = 0;

  const paint = () => {
    state.forEach((item, target) => {
      target.style.setProperty("--story-progress", item.current.toFixed(4));
      if (target.classList.contains("hero-story")) {
        const wave = Math.sin(item.current * Math.PI * 2);
        target.style.setProperty("--hero-lift", `${(-8 * item.current).toFixed(2)}px`);
        target.style.setProperty("--hero-turn", `${(wave * 1).toFixed(2)}deg`);
        target.style.setProperty("--hero-aura-shift", `${(wave * 16).toFixed(2)}px`);
      }
    });
  };

  const animate = () => {
    let moving = false;
    state.forEach((item) => {
      const delta = item.target - item.current;
      if (Math.abs(delta) > 0.0005) {
        item.current += delta * 0.14;
        moving = true;
      } else {
        item.current = item.target;
      }
    });
    paint();
    animationFrame = moving ? requestAnimationFrame(animate) : 0;
  };

  const measure = (immediate = false) => {
    const viewport = window.innerHeight;
    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const progress =
        target.dataset.story === "hero"
          ? Math.min(1, Math.max(0, -rect.top / Math.max(rect.height - viewport, 1)))
          : Math.min(1, Math.max(0, (viewport - rect.top) / Math.max(rect.height + viewport, 1)));
      const item = state.get(target) ?? { current: progress, target: progress };
      item.target = progress;
      if (immediate || reducedMotion) item.current = progress;
      state.set(target, item);
    });
    if (immediate || reducedMotion) paint();
    else if (!animationFrame) animationFrame = requestAnimationFrame(animate);
  };

  const requestUpdate = () => measure(false);

  document.documentElement.classList.add("story-ready");
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  measure(true);
}

/**
 * 설정 3단계: PC 에서 폰 화면이 스크롤에 따라 바뀌도록 활성 단계를 표시한다.
 * .step 은 PC 에서 display:contents 라 상자가 없으므로 안쪽 .step-copy 를 관찰한다.
 * 모바일에서는 CSS 가 이 클래스를 무시하고 3단계를 그대로 펼친다.
 */
function initStepStory() {
  const steps = [...document.querySelectorAll<HTMLElement>(".steps > .step")];
  if (!steps.length) return;

  const select = (index: number) => {
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const hit = entries.find((entry) => entry.isIntersecting);
      if (!hit) return;
      const step = (hit.target as HTMLElement).closest(".step");
      if (step) select(steps.indexOf(step as HTMLElement));
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
  );

  steps.forEach((step) => {
    const copy = step.querySelector(".step-copy");
    if (copy) observer.observe(copy);
  });
  select(0);
}


/**
 * 화면에 들어오면 숫자가 0 에서 목표값까지 올라간다.
 * 원래 값은 마크업에 그대로 두므로 JS 가 없으면 완성된 숫자가 보인다.
 */
function initCountUp() {
  if (reducedMotion) return;
  const targets = [...document.querySelectorAll<HTMLElement>("[data-countup]")];
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);

        const raw = (el.textContent ?? "").trim();
        const goal = Number(raw.replace(/[^\d]/g, ""));
        if (!goal) return;
        const grouped = raw.includes(",");
        const start = performance.now();
        const duration = 1100;

        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = Math.round(goal * eased);
          el.textContent = grouped ? value.toLocaleString("ko-KR") : String(value);
          if (p < 1) requestAnimationFrame(tick);
        };

        el.textContent = "0";
        requestAnimationFrame(tick);
      });
    },
    { rootMargin: "0px 0px -18% 0px", threshold: 0 },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * 앱 설치 딥링크.
 *
 * 스토어 등록이 끝나면 아래 두 주소만 채우면 [data-install] 버튼이
 * 보는 기기에 맞는 스토어로 연결된다. 비어 있는 동안에는 마크업의
 * href(#start)를 그대로 두어 시작 안내 섹션으로 내려간다 — 없는 앱을
 * 가리키는 링크를 만들지 않는다.
 */
const APP_STORE_URL = "";
const PLAY_STORE_URL = "";

function initInstallLinks() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("a[data-install]")];
  if (!links.length) return;

  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // 아이패드는 iPadOS 13 부터 맥으로 위장한다
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const store = isIOS
    ? APP_STORE_URL
    : /Android/i.test(ua)
      ? PLAY_STORE_URL
      : "";
  if (!store) return;

  // href 를 직접 바꾼다 — 새 탭 열기·링크 복사도 그대로 동작하고,
  // core.js 의 '#앵커 부드러운 스크롤' 대상에서도 자연히 빠진다.
  links.forEach((link) => {
    link.href = store;
    link.rel = "noopener";
  });
}

/**
 * 스티키 헤더의 두 가지 상태.
 *
 *  is-stuck  맨 위에서는 투명, 스크롤이 시작되면 면과 그림자가 생긴다.
 *  show-cta  첫 화면에서는 본문의 주 버튼 하나에 시선이 가야 하므로
 *            헤더 버튼을 숨겨 두고, 본문 버튼이 화면 위로 사라질 때
 *            떠오르게 한다. 스크롤 위치를 재는 대신 그 버튼 자체를
 *            관찰하면 글자 크기나 배치가 바뀌어도 따라온다.
 */
function initNav() {
  const nav = document.querySelector<HTMLElement>(".nav");
  if (!nav) return;

  const paintStuck = () => {
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  };
  paintStuck();
  window.addEventListener("scroll", paintStuck, { passive: true });

  const heroCta = document.querySelector(".hero-start");
  if (!heroCta) {
    // 본문 버튼이 없으면 숨겨 둘 이유가 없다
    nav.classList.add("show-cta");
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => nav.classList.toggle("show-cta", !entry.isIntersecting),
    { threshold: 0 },
  );
  observer.observe(heroCta);
}

async function bootstrap() {
  includeSections();
  initScrollStory();
  initStepStory();
  initCountUp();
  initInstallLinks();
  initNav();

  await import("../js/core.js");
  await import("../js/voice-test.js");

  // 무거운 연출은 맨 마지막에, 그것도 PC 에서만 내려받는다.
  if (isDesktop && supportsWebGL()) {
    const { mountHeroWebGL } = await import("./hero-webgl");
    mountHeroWebGL();
  }
}

bootstrap().catch((error) => {
  console.error("IsFam 초기화 중 오류가 발생했습니다.", error);
});
