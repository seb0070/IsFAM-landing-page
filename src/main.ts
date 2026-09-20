/** 한국어 페이지 진입점. 본체는 app.ts 에 있다. */
import { start } from "./app";
import heroHtml from "../sections/hero.html?raw";
import whyHtml from "../sections/why.html?raw";
import voiceTestHtml from "../sections/voice-test.html?raw";
import howHtml from "../sections/how.html?raw";
import techHtml from "../sections/tech.html?raw";
import trustGuideHtml from "../sections/trust-guide.html?raw";
import ctaHtml from "../sections/cta.html?raw";
import footerHtml from "../sections/footer.html?raw";

start({
  "sections/hero.html": heroHtml,
  "sections/why.html": whyHtml,
  "sections/voice-test.html": voiceTestHtml,
  "sections/how.html": howHtml,
  "sections/tech.html": techHtml,
  "sections/trust-guide.html": trustGuideHtml,
  "sections/cta.html": ctaHtml,
  "sections/footer.html": footerHtml,
});
