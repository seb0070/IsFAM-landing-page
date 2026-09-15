import { MIN_SAMPLE, saveResult } from "./supabase.js";

// ── 00 딥보이스 체험 ──
const AGE_STATS = {
  1020: { label: "10 · 20세대" },
  3040: { label: "30 · 40세대" },
  5060: { label: "50 · 60세대" },
  70: { label: "70대 이상" },
};
// A = 진짜 가족 목소리, B = AI 복제 딥보이스
const VOICE_SRC = {
  a: "assets/real-voice.m4a",
  b: "assets/fake-voice.m4a",
};
const FALLBACK_MS = 4200;

const quiz = {
  step: "quiz",
  playing: null,
  prog: { a: 0, b: 0 },
  played: { a: false, b: false },
  choice: null,
};
let timer = null;
let audioBroken = false;

// 실제 음성을 미리 붙여 두고, 진행률은 오디오의 재생 위치에서 그대로 읽는다
const audio = {};
["a", "b"].forEach((id) => {
  const el = new Audio(VOICE_SRC[id]);
  el.preload = "metadata";
  el.addEventListener("loadedmetadata", render);
  el.addEventListener("timeupdate", () => {
    if (quiz.playing !== id) return;
    if (!isFinite(el.duration) || !el.duration) return;
    quiz.prog[id] = Math.min(100, (el.currentTime / el.duration) * 100);
    render();
  });
  el.addEventListener("ended", () => {
    quiz.prog[id] = 100;
    quiz.playing = null;
    render();
  });
  el.addEventListener("error", () => {
    audioBroken = true;
    render();
  });
  audio[id] = el;
});

// 재생 전에는 길이(0:14)를, 재생 중·후에는 상태를 보여 준다
function stateText(id) {
  if (quiz.playing === id) return "재생 중";
  if (quiz.played[id]) return "들어봤음";
  const d = audio[id].duration;
  if (!isFinite(d) || !d) return "듣기 전";
  const s = Math.round(d);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

// 30개 막대의 높이를 결정론적으로 만든다 (원본 디자인의 wave 함수)
function wave(seed, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const v =
      Math.abs(Math.sin((i + seed) * 0.63)) * 0.7 +
      Math.abs(Math.sin((i + seed) * 1.9)) * 0.3;
    out.push(Math.round(5 + v * 30));
  }
  return out;
}

function paintWaves() {
  const heights = { a: wave(0, 30), b: wave(11, 30) };
  document.querySelectorAll("[data-wave]").forEach((row) => {
    row.innerHTML = heights[row.dataset.wave]
      .map((h) => `<span style="height:${h}px"></span>`)
      .join("");
  });
}

function describe(id) {
  if (quiz.step === "result") {
    return id === "a"
      ? "진짜 가족 목소리 샘플입니다."
      : "AI 복제 딥보이스 샘플입니다.";
  }
  return audioBroken
    ? "음성을 재생할 수 없어 파형만 표시됩니다."
    : "같은 사람의 목소리로 들립니다. 이어폰으로 들어보세요.";
}

function render() {
  ["a", "b"].forEach((id) => {
    const p = quiz.prog[id];
    document.querySelector(`[data-state="${id}"]`).textContent =
      stateText(id);
    document.querySelector(
      `.wave-fill[data-wave="${id}"]`,
    ).style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    document.querySelector(`[data-desc="${id}"]`).textContent =
      describe(id);
    // 들어 본 카드만 사진을 원래 색으로 되돌린다
    document
      .querySelector(`[data-card="${id}"]`)
      .classList.toggle("is-played", quiz.played[id]);
  });
  document.getElementById("quiz-age").hidden = quiz.step !== "age";
  document.getElementById("quiz-result").hidden = quiz.step !== "result";
}

function play(id) {
  clearInterval(timer);
  // 한 번에 하나만 재생한다
  Object.values(audio).forEach((el) => {
    el.pause();
    el.currentTime = 0;
  });
  quiz.playing = id;
  quiz.played[id] = true;
  quiz.prog = { a: 0, b: 0 };
  render();
  audio[id].play().catch(() => {
    // 파일을 재생할 수 없으면 파형만이라도 움직여 준다
    audioBroken = true;
    fallbackProgress(id);
  });
}

function fallbackProgress(id) {
  const t0 = Date.now();
  timer = setInterval(() => {
    quiz.prog[id] = Math.min(
      100,
      ((Date.now() - t0) / FALLBACK_MS) * 100,
    );
    if (quiz.prog[id] >= 100) {
      clearInterval(timer);
      quiz.playing = null;
    }
    render();
  }, 60);
}

// rate: 표시할 실패율(%), sample: 실제 응답 수(없으면 기준값으로 간주)
function renderResult(ageKey, rate = null, sample = null) {
  const st = AGE_STATS[ageKey] || AGE_STATS[5060];
  const ok = quiz.choice === "a";
  const color = ok ? "var(--safe-lt)" : "var(--danger-lt)";
  const set = (key, text) => {
    document.querySelector(`[data-result="${key}"]`).textContent = text;
  };

  set(
    "kicker",
    ok ? "정답 · 진짜 가족은 음성 A" : "오답 · 진짜 가족은 음성 A",
  );
  set("rate", rate === null ? (ok ? "정답" : "다시 확인") : `${rate}%`);
  set(
    "cap",
    sample && rate !== null
      ? `${st.label} 구별 실패율 · 참여 ${sample}명`
      : `${st.label} 음성 테스트 결과`,
  );
  set(
    "title",
    "생각보다 쉽지 않았나요?",
  );
  set(
    "body",
    "목소리가 자연스럽게 들린다는 것과 실제 사람이라는 것은 같은 의미가 아닐 수 있습니다.",
  );

  document.querySelector('[data-result="kicker"]').style.color = color;
  document.querySelector('[data-result="rate"]').style.color = color;
}

function showResult(ageKey) {
  const st = AGE_STATS[ageKey] || AGE_STATS[5060];

  // 기준값으로 즉시 보여 주고, 수집 결과가 오면 실제 수치로 교체한다
  renderResult(ageKey);
  quiz.step = "result";
  render();

  const rateEl = document.querySelector('[data-result="rate"]');
  // 결과가 새로 그려질 때마다 등장 애니메이션을 다시 태운다
  rateEl.style.animation = "none";
  void rateEl.offsetWidth;
  rateEl.style.animation = "";

  saveResult(ageKey, quiz).then((stats) => {
    if (!stats || quiz.step !== "result") return;
    const row = stats.find((r) => r.age_band === ageKey);
    if (!row) return;
    const total = Number(row.total) || 0;
    const wrong = Number(row.wrong) || 0;
    // 표본이 충분히 쌓인 연령대만 실제 수치로 바꾼다
    if (total < MIN_SAMPLE) return;
    renderResult(ageKey, Math.round((wrong / total) * 100), total);
  });
}

document.querySelectorAll("[data-play]").forEach((btn) => {
  btn.addEventListener("click", () => play(btn.dataset.play));
});
document.querySelectorAll("[data-choose]").forEach((btn) => {
  btn.addEventListener("click", () => {
    quiz.choice = btn.dataset.choose;
    quiz.step = "age";
    render();
  });
});
document.querySelectorAll("[data-age]").forEach((btn) => {
  btn.addEventListener("click", () => showResult(btn.dataset.age));
});

paintWaves();
render();
