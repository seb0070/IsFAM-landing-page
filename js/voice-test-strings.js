/**
 * 딥보이스 체험의 화면 문구. 로직(voice-test.js)과 떼어 둔다.
 *
 * 문구만 고칠 때는 이 파일만 열면 된다. 언어가 늘면 키를 하나 더 추가한다.
 *
 * rate 는 Supabase 표본이 MIN_SAMPLE 에 못 미칠 때 보여 주는 기준값이다.
 * 이 값이 없으면 결과 자리에 퍼센트를 띄울 수가 없다.
 *
 * A = 진짜 목소리, B = AI 복제. 이 순서는 DB 의 is_correct 생성 열
 * (choice = 'a') 과 묶여 있으니 영어 샘플도 진짜가 A 여야 한다.
 */
export const STRINGS = {
  ko: {
    ages: { 1020: "10 · 20세대", 3040: "30 · 40세대", 5060: "50 · 60세대", 70: "70대 이상" },
    rates: { 1020: 61, 3040: 68, 5060: 82, 70: 89 },
    voice: { a: "/assets/real-voice.m4a", b: "/assets/fake-voice.m4a" },

    playing: "재생 중",
    played: "들어봤음",
    idle: "듣기 전",

    descReal: "진짜 가족 목소리 샘플입니다.",
    descFake: "AI 복제 딥보이스 샘플입니다.",
    descBroken: "음성을 재생할 수 없어 파형만 표시됩니다.",
    descIdle: "같은 사람의 목소리로 들립니다. 이어폰으로 들어보세요.",

    kickerOk: "정답 · 진짜 가족은 음성 A",
    kickerNo: "오답 · 진짜 가족은 음성 A",
    titleOk: "맞혔어요. 음성 B가 딥보이스입니다",
    titleNo: "틀렸어요. 딥보이스는 음성 B였습니다",
    bodyNo:
      "대부분의 사람이 딥보이스를 구별하지 못합니다. 사람의 청각은 미세한 주파수 패턴 차이를 듣도록 설계되지 않았습니다.",

    // 보간이 들어가는 둘만 함수로 둔다
    cap: (label, sample) =>
      sample ? `${label} 구별 실패율 · 참여 ${sample}명` : `${label} 구별 실패율`,
    bodyOk: (rate) =>
      `한 번 맞혔더라도 안심할 수는 없습니다. 같은 연령대 참여자 중 ${rate}%는 두 음성을 구별하지 못했고, 실제 통화에서는 상대가 가족의 이름과 상황까지 말합니다.`,
  },

  en: {
    ages: { 1020: "Ages 10–29", 3040: "Ages 30–49", 5060: "Ages 50–69", 70: "Ages 70+" },
    rates: { 1020: 61, 3040: 68, 5060: 82, 70: 89 },
    voice: { a: "/assets/real-voice-en.m4a", b: "/assets/fake-voice-en.m4a" },

    playing: "Playing",
    played: "Heard it",
    idle: "Not played",

    descReal: "This is the real person's voice.",
    descFake: "This is the AI clone.",
    descBroken: "Audio samples are being prepared — showing waveforms only.",
    descIdle: "They sound like the same person. Try headphones.",

    kickerOk: "Correct · the real voice was A",
    kickerNo: "Not quite · the real voice was A",
    titleOk: "You got it. Voice B was the clone",
    titleNo: "Voice B was the clone",
    bodyNo:
      "Most people cannot tell a cloned voice apart. Human hearing was never built to catch differences this small in frequency patterns.",

    cap: (label, sample) =>
      sample ? `${label} · could not tell them apart · ${sample} responses` : `${label} · could not tell them apart`,
    bodyOk: (rate) =>
      `Getting it right once is not safety. ${rate}% of people in your age group could not tell the two apart — and on a real call, the voice also knows your family's names and your situation.`,
  },
};
