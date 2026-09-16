/**
 * 히어로 배경의 WebGL 연출(셰이더 그라디언트 + 3D 링).
 *
 * 이 파일은 무겁다(three.js 계열). 그래서 정적으로 import 하지 않고
 * main.ts 에서 PC + WebGL 지원일 때만 동적으로 불러온다.
 * 모바일은 이 청크를 아예 내려받지 않고 CSS 그라디언트만 본다.
 */
import { Suspense, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import * as THREE from "three";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 히어로 오른쪽에 천천히 도는 반투명 링 두 개 */
function AmbientRings() {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
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
        <torusGeometry args={[2.6, 0.16, 24, 140]} />
      </mesh>
      <mesh material={material} rotation={[0.25, 0.8, 0.6]} scale={0.72}>
        <torusGeometry args={[2.6, 0.1, 20, 120]} />
      </mesh>
    </group>
  );
}

function HeroWebGL() {
  return (
    <>
      <ShaderGradientCanvas
        className="shader-gradient-canvas"
        pixelDensity={1.25}
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
    </>
  );
}

export function mountHeroWebGL() {
  const target = document.getElementById("hero-webgl-root");
  if (!target) return;
  createRoot(target).render(
    <Suspense fallback={null}>
      <HeroWebGL />
    </Suspense>,
  );
  document.documentElement.classList.add("webgl-ready");
}
