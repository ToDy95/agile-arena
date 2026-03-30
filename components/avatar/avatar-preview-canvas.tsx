"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import {
  AVATAR_ACCENT_HEX,
  AVATAR_HAIR_HEX,
  AVATAR_OUTFIT_HEX,
  AVATAR_SKIN_HEX,
} from "@/lib/avatar/avatar-options";
import type { AvatarConfig } from "@/lib/avatar/avatar-types";

const BODY_SCALE: Record<AvatarConfig["bodyType"], number> = {
  compact: 0.88,
  classic: 1,
  heroic: 1.08,
};

function AvatarFigure({ config }: { config: AvatarConfig }) {
  const groupRef = useRef<Group>(null);
  const { reducedMotion } = useMotionPreferences();

  const colors = useMemo(
    () => ({
      skin: AVATAR_SKIN_HEX[config.skinTone],
      hair: AVATAR_HAIR_HEX[config.hairColor],
      outfit: AVATAR_OUTFIT_HEX[config.outfitColor],
      accent: AVATAR_ACCENT_HEX[config.accentColor],
    }),
    [config],
  );

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) {
      return;
    }

    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.22;
    groupRef.current.position.y = Math.sin(t * 1.35) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, -0.65, 0]} scale={BODY_SCALE[config.bodyType]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.84, 0.24, 28]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} metalness={0.04} />
      </mesh>

      <mesh position={[0, 1.03, 0]} castShadow>
        <sphereGeometry args={[0.36, 28, 28]} />
        <meshStandardMaterial color={colors.skin} roughness={0.74} metalness={0.03} />
      </mesh>

      <mesh position={[-0.12, 1.08, 0.32]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>
      <mesh position={[0.12, 1.08, 0.32]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      {config.expression === "smile" ? (
        <mesh position={[0, 0.92, 0.34]} rotation={[0.24, 0, 0]}>
          <torusGeometry args={[0.085, 0.011, 10, 20, Math.PI]} />
          <meshStandardMaterial color="#7C2D12" />
        </mesh>
      ) : null}
      {config.expression === "focused" ? (
        <mesh position={[0, 0.91, 0.34]}>
          <boxGeometry args={[0.13, 0.012, 0.012]} />
          <meshStandardMaterial color="#7C2D12" />
        </mesh>
      ) : null}
      {config.expression === "wink" ? (
        <>
          <mesh position={[-0.12, 1.08, 0.32]}>
            <boxGeometry args={[0.07, 0.01, 0.01]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0.03, 0.9, 0.34]}>
            <torusGeometry args={[0.07, 0.009, 8, 18, Math.PI]} />
            <meshStandardMaterial color="#7C2D12" />
          </mesh>
        </>
      ) : null}
      {config.expression === "surprised" ? (
        <mesh position={[0, 0.9, 0.34]}>
          <torusGeometry args={[0.04, 0.01, 10, 20]} />
          <meshStandardMaterial color="#7C2D12" />
        </mesh>
      ) : null}

      <mesh position={[0, 0.34, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.52, 10, 16]} />
        <meshStandardMaterial
          color={colors.outfit}
          roughness={config.outfit === "armor" ? 0.34 : 0.78}
          metalness={config.outfit === "armor" ? 0.46 : 0.08}
        />
      </mesh>

      {config.outfit === "hoodie" ? (
        <mesh position={[0, 0.6, -0.08]} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[0.18, 0.045, 12, 24, Math.PI]} />
          <meshStandardMaterial color={colors.accent} roughness={0.56} />
        </mesh>
      ) : null}
      {config.outfit === "jacket" ? (
        <mesh position={[0, 0.33, 0.2]}>
          <boxGeometry args={[0.055, 0.47, 0.06]} />
          <meshStandardMaterial color={colors.accent} />
        </mesh>
      ) : null}
      {config.outfit === "armor" ? (
        <mesh position={[0, 0.34, 0.22]}>
          <boxGeometry args={[0.34, 0.44, 0.08]} />
          <meshStandardMaterial color={colors.accent} roughness={0.3} metalness={0.62} />
        </mesh>
      ) : null}

      <mesh position={[-0.27, 0.34, 0]} rotation={[0, 0, 0.18]} castShadow>
        <capsuleGeometry args={[0.06, 0.34, 8, 12]} />
        <meshStandardMaterial color={colors.outfit} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0.27, 0.34, 0]} rotation={[0, 0, -0.18]} castShadow>
        <capsuleGeometry args={[0.06, 0.34, 8, 12]} />
        <meshStandardMaterial color={colors.outfit} roughness={0.7} metalness={0.1} />
      </mesh>

      <mesh position={[-0.11, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.26, 8, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.11, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.26, 8, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {config.hairStyle === "buzz" ? (
        <mesh position={[0, 1.24, 0.02]}>
          <sphereGeometry args={[0.3, 20, 20]} />
          <meshStandardMaterial color={colors.hair} roughness={0.78} />
        </mesh>
      ) : null}
      {config.hairStyle === "short" ? (
        <mesh position={[0, 1.24, 0]}>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color={colors.hair} roughness={0.7} />
        </mesh>
      ) : null}
      {config.hairStyle === "curly" ? (
        <>
          <mesh position={[-0.14, 1.24, 0.15]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.78} />
          </mesh>
          <mesh position={[0, 1.27, 0.2]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.78} />
          </mesh>
          <mesh position={[0.14, 1.24, 0.15]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.78} />
          </mesh>
        </>
      ) : null}
      {config.hairStyle === "ponytail" ? (
        <>
          <mesh position={[0, 1.24, 0.06]}>
            <sphereGeometry args={[0.31, 24, 24]} />
            <meshStandardMaterial color={colors.hair} roughness={0.74} />
          </mesh>
          <mesh position={[0, 1.14, -0.27]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.74} />
          </mesh>
        </>
      ) : null}
      {config.hairStyle === "mohawk" ? (
        <mesh position={[0, 1.3, 0.06]}>
          <boxGeometry args={[0.08, 0.16, 0.52]} />
          <meshStandardMaterial color={colors.hair} roughness={0.64} />
        </mesh>
      ) : null}

      {config.hat === "beanie" ? (
        <>
          <mesh position={[0, 1.29, 0.03]}>
            <sphereGeometry args={[0.31, 24, 24]} />
            <meshStandardMaterial color={colors.accent} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.19, 0.16]}>
            <cylinderGeometry args={[0.24, 0.3, 0.08, 20]} />
            <meshStandardMaterial color={colors.accent} roughness={0.5} />
          </mesh>
        </>
      ) : null}
      {config.hat === "cap" ? (
        <>
          <mesh position={[0, 1.28, 0.04]}>
            <cylinderGeometry args={[0.3, 0.32, 0.2, 24]} />
            <meshStandardMaterial color={colors.accent} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.2, 0.33]}>
            <boxGeometry args={[0.34, 0.02, 0.17]} />
            <meshStandardMaterial color={colors.accent} roughness={0.5} />
          </mesh>
        </>
      ) : null}
      {config.hat === "party" ? (
        <>
          <mesh position={[0, 1.42, 0]}>
            <coneGeometry args={[0.2, 0.42, 24]} />
            <meshStandardMaterial color={colors.accent} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.66, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
        </>
      ) : null}

      {config.accessory === "glasses" ? (
        <>
          <mesh position={[-0.12, 1.08, 0.36]}>
            <torusGeometry args={[0.06, 0.008, 10, 18]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0.12, 1.08, 0.36]}>
            <torusGeometry args={[0.06, 0.008, 10, 18]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0, 1.08, 0.36]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
        </>
      ) : null}
      {config.accessory === "visor" ? (
        <mesh position={[0, 1.08, 0.34]}>
          <boxGeometry args={[0.36, 0.11, 0.02]} />
          <meshStandardMaterial color={colors.accent} roughness={0.26} metalness={0.28} />
        </mesh>
      ) : null}
      {config.accessory === "monocle" ? (
        <>
          <mesh position={[0.12, 1.08, 0.35]}>
            <torusGeometry args={[0.06, 0.008, 10, 18]} />
            <meshStandardMaterial color="#7C2D12" />
          </mesh>
          <mesh position={[0.19, 0.98, 0.34]} rotation={[0.15, 0.1, -0.2]}>
            <cylinderGeometry args={[0.004, 0.004, 0.18, 8]} />
            <meshStandardMaterial color="#7C2D12" />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

type AvatarPreviewCanvasProps = {
  config: AvatarConfig;
};

export function AvatarPreviewCanvas({ config }: AvatarPreviewCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.85, 2.75], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <ambientLight intensity={0.72} />
      <directionalLight position={[2.4, 4, 2.4]} intensity={1.1} castShadow />
      <directionalLight position={[-1.8, 1.8, -1.3]} intensity={0.35} />
      <AvatarFigure config={config} />
    </Canvas>
  );
}
