// ── 내부 링크: 스크롤은 하되 주소창에 #를 남기지 않는다 ──
export {};

// 앵커가 URL에 남으면 다음 새로고침 때 그 섹션에서 시작해 버린다.
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ── 스크롤 등장 ──
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("in");
    });
  },
  { rootMargin: "0px 0px -8% 0px" },
);
document
  .querySelectorAll("[data-reveal]")
  .forEach((el) => io.observe(el));

// ── 판정 카드 3종: 호버·포커스로 가운데 카드를 바꾼다 ──
const verdicts = [...document.querySelectorAll(".verdict")];
function pickVerdict(index) {
  verdicts.forEach((c, i) => {
    c.classList.toggle("is-on", i === index);
    // 선택된 카드 쪽을 향해 기울도록 좌우 방향을 나눠 준다
    c.style.setProperty("--tilt", i < index ? "8deg" : "-8deg");
  });
}
verdicts.forEach((card, i) => {
  card.addEventListener("mouseenter", () => pickVerdict(i));
  card.addEventListener("focus", () => pickVerdict(i));
});
// 기본값은 가운데(주의) 카드 — 원본 디자인의 초기 상태
pickVerdict(1);
