/**
 * 링크 미리보기 이미지(og:image)를 실제 히어로 화면에서 찍는다.
 *
 *   node tools/shoot-og.mjs                     # 배포본에서 찍는다
 *   node tools/shoot-og.mjs http://localhost:4173  # 미리보기 서버에서
 *
 * 히어로 문구나 디자인을 바꾸면 이걸 다시 돌려야 미리보기가 따라온다.
 * 배포본에서 찍는 것이 기본이므로, 바뀐 화면을 먼저 배포한 뒤 실행하고
 * 나온 이미지를 담아 한 번 더 배포하는 순서가 된다.
 *
 * 1200x630 뷰포트로 그대로 찍으면 세로가 모자라 폰 목업 아래가 잘린다.
 * 그래서 더 넓은 뷰포트(1440x756, 같은 1.905:1)로 레이아웃을 잡되
 * deviceScaleFactor 를 1 미만으로 줘서 브라우저가 처음부터 1200x630 으로
 * 래스터화하게 한다. 찍고 나서 줄이는 것보다 선명하고 파일도 작다.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "https://isfam.pages.dev";
const SHOT = { width: 1440, height: 756 };
const OUT = { width: 1200, height: 630 };

const assets = fileURLToPath(new URL("../public/assets/", import.meta.url));

const PAGES = [
  { name: "og-ko", path: "/?lang=ko", locale: "ko-KR" },
  { name: "og-en", path: "/en/", locale: "en-US" },
];

const browser = await chromium.launch();
for (const { name, path, locale } of PAGES) {
  const ctx = await browser.newContext({
    locale,
    viewport: SHOT,
    // 1440 -> 1200. 브라우저가 이 배율로 직접 그려서 결과가 곧 1200x630 이다
    deviceScaleFactor: OUT.width / SHOT.width,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // 등장 연출이 끝나고 WebGL 글로우가 자리잡을 때까지
  await page.waitForTimeout(3000);
  await page.screenshot({ path: assets + name + ".png" });
  console.log(`${name}.png  ${OUT.width}x${OUT.height}  <- ${BASE}${path}`);
  await ctx.close();
}
await browser.close();
