// ── 응답 수집 (Supabase) ──
// SUPABASE_KEY에 publishable 키를 넣으면 켜진다. 비어 있으면 수집을 건너뛰고
// 아래 AGE_STATS의 기준값을 그대로 보여 준다(페이지는 그대로 동작).
const SUPABASE_URL = "https://taxyhedeamdxbrmdwhew.supabase.co";
const SUPABASE_KEY = "sb_publishable_RaWTVx1ptj4rkZM3DCxchQ_FcEqC9i6";
// 이 응답 수를 넘긴 연령대만 화면 수치를 실제 데이터로 바꾼다
export const MIN_SAMPLE = 30;

// 새로고침해도 같은 사람이 다시 집계되지 않도록 브라우저에 표시를 남긴다.
// 이 방문 안에서만 유효한 submitted 플래그로는 새로고침을 막을 수 없다.
const SUBMIT_KEY = "isfam-voice-test-submitted";
let submitted = false;

function alreadySubmitted() {
  try {
    return localStorage.getItem(SUBMIT_KEY) !== null;
  } catch {
    return false; // 시크릿 모드 등에서 접근이 막히면 막지 않는다
  }
}

function markSubmitted() {
  try {
    localStorage.setItem(SUBMIT_KEY, new Date().toISOString());
  } catch {
    /* 저장 못 해도 흐름은 계속 */
  }
}

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function fetchStats() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/voice_test_stats`,
      { method: "POST", headers: sbHeaders(), body: "{}" },
    );
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// 처음 완료한 경우에만 저장하고, 집계는 항상 최신값을 돌려준다.
// 이미 참여한 사람은 다시 해도 집계에 반영되지 않는다.
export async function saveResult(ageKey, quiz) {
  if (!SUPABASE_KEY) return null;
  if (!submitted && !alreadySubmitted()) {
    submitted = true;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/voice_test_results`,
        {
          method: "POST",
          headers: { ...sbHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({
            age_band: ageKey,
            choice: quiz.choice,
            listened_a: quiz.played.a,
            listened_b: quiz.played.b,
          }),
        },
      );
      // 저장이 확인된 뒤에만 표시를 남긴다(실패 시 다음 방문에 다시 시도 가능)
      if (res.ok) markSubmitted();
    } catch {
      /* 저장 실패는 화면을 막지 않는다 */
    }
  }
  return fetchStats();
}
