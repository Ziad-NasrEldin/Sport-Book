import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, SAFE_AREA } from "../constants";
import { FONT_STACKS } from "../fonts";
import { entranceSpring } from "../lib/animation";

type AnimatedTextProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  maxWidth?: number;
  bodyMaxWidth?: number;
  bodyMarginTop?: number;
  bodySize?: number;
  titleLineHeight?: number;
  titleSize?: number;
  top?: number;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  align = "left",
  body,
  bodyMarginTop = 38,
  bodyMaxWidth,
  bodySize = 32,
  eyebrow,
  maxWidth = 760,
  titleLineHeight = 0.96,
  titleSize = 86,
  top = SAFE_AREA.top,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = entranceSpring({ fps, frame, delay: 2, duration: 24 });
  const bodyIn = entranceSpring({ fps, frame, delay: 8, duration: 28 });
  const eyebrowIn = entranceSpring({ fps, frame, delay: 0, duration: 20 });
  const blurOut = interpolate(frame, [58, 82], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitShift = interpolate(frame, [56, 84], [0, -80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10, 64, 86], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shared: CSSProperties = {
    textAlign: align,
    transform: `translateY(${exitShift}px)`,
    filter: `blur(${blurOut}px)`,
    opacity,
  };

  return (
      <div
      style={{
        position: "absolute",
        top,
        left: align === "center" ? SAFE_AREA.left : SAFE_AREA.left,
        right: SAFE_AREA.right,
        display: "flex",
        justifyContent: align === "center" ? "center" : "flex-start",
        zIndex: 30,
      }}
    >
      <div style={{ maxWidth }}>
        {eyebrow ? (
          <div
            style={{
              ...shared,
              opacity: opacity * eyebrowIn,
              transform: `translateY(${(1 - eyebrowIn) * 36 + exitShift}px)`,
              marginBottom: 22,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 22px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
              color: BRAND.text,
              fontFamily: FONT_STACKS.ui,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: BRAND.sportyOrange,
                boxShadow: "0 0 24px rgba(255,140,0,0.7)",
              }}
            />
            {eyebrow}
          </div>
        ) : null}

        <div
          style={{
            ...shared,
            opacity: opacity * titleIn,
            transform: `translateY(${(1 - titleIn) * 72 + exitShift}px)`,
            color: BRAND.text,
            fontFamily: FONT_STACKS.display,
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: titleLineHeight,
            letterSpacing: "-0.05em",
            textShadow: "0 16px 48px rgba(0,0,0,0.28)",
            whiteSpace: "pre-line",
          }}
        >
          {title}
        </div>

        {body ? (
          <div
            style={{
              ...shared,
              opacity: opacity * bodyIn,
              transform: `translateY(${(1 - bodyIn) * 42 + exitShift}px)`,
              marginTop: bodyMarginTop,
              maxWidth: bodyMaxWidth ?? maxWidth - 70,
              color: BRAND.textMuted,
              fontFamily: FONT_STACKS.body,
              fontSize: bodySize,
              fontWeight: 500,
              lineHeight: 1.22,
              letterSpacing: "-0.025em",
            }}
          >
            {body}
          </div>
        ) : null}
      </div>
    </div>
  );
};
