/** 영어 페이지 진입점. 본체는 app.ts 에 있다. */
import { start } from "./app";
import heroHtml from "../sections/en/hero.html?raw";
import whyHtml from "../sections/en/why.html?raw";
import voiceTestHtml from "../sections/en/voice-test.html?raw";
import howHtml from "../sections/en/how.html?raw";
import techHtml from "../sections/en/tech.html?raw";
import trustGuideHtml from "../sections/en/trust-guide.html?raw";
import ctaHtml from "../sections/en/cta.html?raw";
import footerHtml from "../sections/en/footer.html?raw";

start({
  "sections/en/hero.html": heroHtml,
  "sections/en/why.html": whyHtml,
  "sections/en/voice-test.html": voiceTestHtml,
  "sections/en/how.html": howHtml,
  "sections/en/tech.html": techHtml,
  "sections/en/trust-guide.html": trustGuideHtml,
  "sections/en/cta.html": ctaHtml,
  "sections/en/footer.html": footerHtml,
});
