import type { CSSProperties } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../constants";

const orbStyle = (
  left: string,
  top: string,
  size: number,
  color: string,
  blur: number,
): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width: size,
  height: size,
  borderRadius: "50%",
  background: color,
  filter: `blur(${blur}px)`,
  opacity: 0.72,
});

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 450], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotate = interpolate(frame, [0, 450], [-5, 7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: `
          radial-gradient(circle at top left, rgba(255,140,0,0.18), transparent 28%),
          radial-gradient(circle at bottom right, rgba(0,35,102,0.9), transparent 34%),
          linear-gradient(180deg, #030711 0%, #08101d 44%, #050b17 100%)
        `,
      }}
    >
      <div
        style={{
          ...orbStyle("-12%", "-8%", 520, "rgba(255, 140, 0, 0.15)", 110),
          transform: `translate3d(${drift * 0.2}px, ${drift * 0.18}px, 0)`,
        }}
      />
      <div
        style={{
          ...orbStyle("62%", "18%", 620, "rgba(0, 35, 102, 0.55)", 160),
          transform: `translate3d(${-drift * 0.14}px, ${drift * 0.07}px, 0)`,
        }}
      />
      <div
        style={{
          ...orbStyle("8%", "68%", 460, "rgba(54, 214, 141, 0.12)", 140),
          transform: `translate3d(${drift * 0.08}px, ${-drift * 0.1}px, 0)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: -160,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)",
          transform: `rotate(${rotate}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 110,
          borderRadius: 90,
          border: "1px solid rgba(255,255,255,0.045)",
          transform: `rotate(${-rotate * 1.7}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, transparent 0%, transparent 48%, ${BRAND.sportyOrange}11 60%, transparent 72%)`,
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};
