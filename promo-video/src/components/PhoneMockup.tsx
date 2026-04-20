import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../constants";
import { FONT_STACKS } from "../fonts";

type PhoneMockupProps = {
  children: ReactNode;
  label?: string;
  scale?: number;
  style?: CSSProperties;
};

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  label,
  scale = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(frame % 60, [0, 30, 59], [0.25, 0.7, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 580 * scale,
        height: 1160 * scale,
        padding: 22 * scale,
        borderRadius: 72 * scale,
        background:
          "linear-gradient(170deg, rgba(255,255,255,0.92), rgba(129,145,175,0.18) 34%, rgba(8,16,29,0.92) 82%)",
        boxShadow:
          "0 45px 120px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.24)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          width: 180 * scale,
          height: 34 * scale,
          borderRadius: 999,
          background: "rgba(5, 11, 23, 0.94)",
          zIndex: 10,
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 54 * scale,
          overflow: "hidden",
          background: "linear-gradient(180deg, #f7f9ff 0%, #edf2ff 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(150deg, rgba(255,255,255,0.2), transparent 24%, transparent 66%, rgba(255,255,255,0.12) 100%)",
            opacity: shimmer,
            pointerEvents: "none",
          }}
        />

        {label ? (
          <div
            style={{
              position: "absolute",
              top: 38 * scale,
              left: 34 * scale,
              zIndex: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 10 * scale,
              padding: `${10 * scale}px ${16 * scale}px`,
              borderRadius: 999,
              color: BRAND.text,
              background: "rgba(0, 17, 58, 0.78)",
              backdropFilter: "blur(12px)",
              fontFamily: FONT_STACKS.ui,
              fontSize: 18 * scale,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 10 * scale,
                height: 10 * scale,
                borderRadius: "50%",
                background: BRAND.successGreen,
              }}
            />
            {label}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};
