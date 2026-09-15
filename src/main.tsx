import React, { Suspense, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { LiquidMetal } from "@paper-design/shaders-react";
import LiquidGlass from "liquid-glass-react";
import * as THREE from "three";
import heroHtml from "../sections/hero.html?raw";
import voiceTestHtml from "../sections/voice-test.html?raw";
import whyHtml from "../sections/why.html?raw";
import howHtml from "../sections/how.html?raw";
import techHtml from "../sections/tech.html?raw";
import ctaHtml from "../sections/cta.html?raw";
import footerHtml from "../sections/footer.html?raw";
import introHtml from "../sections/intro.html?raw";
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
  "sections/intro.html": introHtml,
  "sections/trust-guide.html": trustGuideHtml,
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compactGpu = window.matchMedia("(max-width: 700px)").matches;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function AmbientRings() {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#ff9f50",
      transparent: true,
      opacity: 0.2,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.72,
      thickness: 1.4,
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.035;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
  });

  return (
    <group ref={group} rotation={[0.65, -0.35, 0.15]} position={[1.6, 0, -1]}>
      <mesh material={material}>
        <torusGeometry args={[2.6, 0.16, 24, compactGpu ? 80 : 140]} />
      </mesh>
      <mesh material={material} rotation={[0.25, 0.8, 0.6]} scale={0.72}>
        <torusGeometry args={[2.6, 0.1, 20, compactGpu ? 64 : 120]} />
      </mesh>
    </group>
  );
}

function HeroWebGL() {
  return (
    <>
      <ShaderGradientCanvas
        className="shader-gradient-canvas"
        pixelDensity={compactGpu ? 1 : 1.25}
        pointerEvents="none"
        powerPreference="low-power"
      >
        <ShaderGradient
          control="props"
          type="plane"
          animate={reducedMotion ? "off" : "on"}
          uSpeed={0.08}
          uStrength={1.25}
          uDensity={1.1}
          uFrequency={4.8}
          color1="#ffffff"
          color2="#ff8a24"
          color3="#fff1e4"
          brightness={1.12}
          grain="off"
          lightType="3d"
          cAzimuthAngle={180}
          cPolarAngle={90}
          cDistance={3.4}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
        />
      </ShaderGradientCanvas>
      {!compactGpu && (
        <Canvas
          className="r3f-accent-canvas"
          dpr={[1, 1.25]}
          frameloop={reducedMotion ? "demand" : "always"}
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        >
          <ambientLight intensity={1.8} />
          <directionalLight position={[4, 4, 5]} intensity={2.4} color="#fff3df" />
          <AmbientRings />
        </Canvas>
      )}
    </>
  );
}

function BrandLogo() {
  return (
    <div className="liquid-brand">
      <LiquidMetal
        image="/assets/mascot-splash.webp"
        colorBack="#fff3e7"
        colorTint="#f56300"
        shape="circle"
        repetition={1.5}
        softness={0.72}
        distortion={0.08}
        contour={0.45}
        speed={reducedMotion ? 0 : 0.12}
        fit="cover"
        maxPixelCount={compactGpu ? 180_000 : 420_000}
        style={{ width: "100%", height: "100%" }}
      />
      <strong>IsFam</strong>
    </div>
  );
}

function GlassAction({ compact = false, label, target = "start" }: { compact?: boolean; label?: string; target?: string }) {
  const goToStart = () => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <LiquidGlass
      className={compact ? "glass-action glass-action--compact" : "glass-action"}
      displacementScale={compact ? 26 : 42}
      blurAmount={0.12}
      saturation={125}
      aberrationIntensity={0.8}
      elasticity={reducedMotion ? 0 : 0.12}
      cornerRadius={999}
      padding={compact ? "8px 15px" : "12px 23px"}
      overLight
      mode="standard"
      onClick={goToStart}
    >
      <span>{label ?? (compact ? "IsFam 시작하기" : "IsFam 알아보기")}</span>
    </LiquidGlass>
  );
}

function mountReact(id: string, node: React.ReactNode) {
  const target = document.getElementById(id);
  if (target) createRoot(target).render(<Suspense fallback={null}>{node}</Suspense>);
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

  const measure = (immediate = false) => {
    const viewport = window.innerHeight;
    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const progress = target.dataset.story === "hero"
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

  const paint = () => {
    state.forEach((item, target) => {
      target.style.setProperty("--story-progress", item.current.toFixed(4));
      if (target.classList.contains("hero-story")) {
        const wave = Math.sin(item.current * Math.PI * 2);
        target.style.setProperty("--hero-lift", `${(-18 * item.current).toFixed(2)}px`);
        target.style.setProperty("--hero-turn", `${(wave * 2.4).toFixed(2)}deg`);
        target.style.setProperty("--hero-aura-shift", `${(wave * 38).toFixed(2)}px`);
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

  const requestUpdate = () => measure(false);

  document.documentElement.classList.add("story-ready");
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  measure(true);
}

function initScreenStory() {
  document.querySelectorAll<HTMLElement>("[data-screen-story]").forEach((story) => {
    const copies = [...story.querySelectorAll<HTMLElement>("[data-screen-copy]")];
    const screens = [...story.querySelectorAll<HTMLElement>("[data-screen]")];
    const dots = [...story.querySelectorAll<HTMLElement>(".setup-progress i")];

    const select = (index: number) => {
      story.dataset.step = String(index);
      copies.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
      screens.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
      dots.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries.find((entry) => entry.isIntersecting);
        if (!active) return;
        select(Number((active.target as HTMLElement).dataset.screenCopy));
      },
      { rootMargin: "-44% 0px -44% 0px", threshold: 0 },
    );

    copies.forEach((copy) => observer.observe(copy));
    select(0);
  });
}

async function bootstrap() {
  includeSections();
  if (supportsWebGL()) {
    mountReact("hero-webgl-root", <HeroWebGL />);
    mountReact("liquid-logo-root", <BrandLogo />);
  } else {
    document.documentElement.classList.add("no-webgl");
    const logo = document.getElementById("liquid-logo-root");
    if (logo) {
      logo.classList.add("liquid-brand-fallback");
      logo.textContent = "IsFam";
    }
  }
  mountReact("nav-glass-root", <GlassAction compact label="IsFam 시작하기" />);
  mountReact("hero-glass-root", <GlassAction label="IsFam 알아보기" target="why" />);
  initScrollStory();
  initScreenStory();

  await import("../js/core.js");
  await import("../js/voice-test.js");
}

bootstrap().catch((error) => {
  console.error("IsFam 초기화 중 오류가 발생했습니다.", error);
});
