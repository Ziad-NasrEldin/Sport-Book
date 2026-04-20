import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, PRODUCT_POINTS, SAFE_AREA } from "../constants";
import { FONT_STACKS } from "../fonts";
import { staggeredReveal } from "../lib/animation";

const chatBubbles = [
  { top: 470, left: 88, width: 360, text: "Court free 7pm?" },
  { top: 600, left: 330, width: 300, text: "Coach moved slot" },
  { top: 740, left: 118, width: 420, text: "Please send transfer proof" },
];

const clashBars = [
  { top: 1060, left: 104, width: 450, color: "#FF5D73", label: "Court A 19:00" },
  { top: 1124, left: 308, width: 428, color: "#FF8C00", label: "Coach Omar 19:00" },
  { top: 1188, left: 178, width: 506, color: "#36D68D", label: "Branch North 20:00" },
];

export const ChaosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = interpolate(frame, [0, 6, 22, 28], [0.24, 0.5, 0.18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const noise = interpolate(frame % 10, [0, 5, 9], [-10, 10, -6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blur = interpolate(frame, [58, 90], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleOut = interpolate(frame, [62, 90], [1, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scaleOut}) translateX(${noise}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.top,
          left: SAFE_AREA.left,
          zIndex: 30,
        }}
      >
        <div
          style={{
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
          Pain
        </div>

        <div
          style={{
            marginTop: 26,
            color: BRAND.text,
            fontFamily: FONT_STACKS.display,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            textShadow: "0 16px 48px rgba(0,0,0,0.28)",
          }}
        >
          <div>Manual booking</div>
          <div style={{ marginTop: 14 }}>kills revenue.</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, rgba(255,93,115,${flash}) 100%)`,
        }}
      />

      {chatBubbles.map((bubble, index) => {
        const reveal = staggeredReveal({ fps, frame, index, step: 6 });
        return (
          <div
            key={bubble.text}
            style={{
              position: "absolute",
              top: bubble.top + (1 - reveal) * 45,
              left: bubble.left,
              width: bubble.width,
              padding: "28px 30px",
              borderRadius: 34,
              background:
                index === 1
                  ? "linear-gradient(135deg, rgba(255,140,0,0.18), rgba(255,140,0,0.08))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
              opacity: reveal,
              transform: `rotate(${index % 2 === 0 ? -4 : 5}deg)`,
            }}
          >
            <div
              style={{
                color: "#F6F8FC",
                fontFamily: FONT_STACKS.body,
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              {bubble.text}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 420,
          right: SAFE_AREA.right,
          width: 260,
          padding: "24px 22px",
          borderRadius: 30,
          background: "rgba(255, 93, 115, 0.16)",
          border: "1px solid rgba(255, 93, 115, 0.3)",
          boxShadow: "0 26px 70px rgba(255,93,115,0.2)",
        }}
      >
        <div
          style={{
            color: BRAND.textMuted,
            fontFamily: FONT_STACKS.ui,
            fontSize: 18,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Missed call
        </div>
        <div
          style={{
            marginTop: 16,
            color: BRAND.text,
            fontFamily: FONT_STACKS.display,
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.05em",
          }}
        >
          08
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          bottom: 160,
          height: 420,
          padding: 28,
          borderRadius: 42,
          background:
            "linear-gradient(180deg, rgba(16,27,45,0.92), rgba(8,16,29,0.94))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px repeat(4, 1fr)",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {["Time", "Court A", "Court B", "Coach", "Payments"].map((column) => (
            <div
              key={column}
              style={{
                color: BRAND.textMuted,
                fontFamily: FONT_STACKS.ui,
                fontSize: 18,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {column}
            </div>
          ))}
        </div>

        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns: "140px repeat(4, 1fr)",
              gap: 14,
              marginBottom: 16,
            }}
          >
            {Array.from({ length: 5 }).map((__, cellIndex) => (
              <div
                key={cellIndex}
                style={{
                  height: 48,
                  borderRadius: 18,
                  background:
                    cellIndex === 0
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.035)",
                }}
              />
            ))}
          </div>
        ))}

        {clashBars.map((bar, index) => {
          const reveal = staggeredReveal({ fps, frame, index, step: 3 });
          return (
            <div
              key={bar.label}
              style={{
                position: "absolute",
                top: bar.top - 1040,
                left: bar.left - SAFE_AREA.left,
                width: bar.width,
                height: 50,
                borderRadius: 18,
                background: `${bar.color}dd`,
                boxShadow: `0 18px 30px ${bar.color}33`,
                opacity: 0.84 * reveal,
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  color: "#08101d",
                  fontFamily: FONT_STACKS.ui,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {bar.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1460,
          left: SAFE_AREA.left,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 22px",
          borderRadius: 999,
          background: "rgba(255, 140, 0, 0.16)",
          border: "1px solid rgba(255,140,0,0.22)",
          color: BRAND.text,
          fontFamily: FONT_STACKS.ui,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {PRODUCT_POINTS.realTime}
      </div>
    </AbsoluteFill>
  );
};
