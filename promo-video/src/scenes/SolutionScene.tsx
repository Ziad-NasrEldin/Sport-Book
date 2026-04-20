import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BRAND, PRODUCT_POINTS, PROMO_COPY, SAFE_AREA } from "../constants";
import { FONT_STACKS } from "../fonts";
import { entranceSpring } from "../lib/animation";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = entranceSpring({ fps, frame, delay: 4, duration: 24 });
  const bgScale = interpolate(frame, [0, 90], [1.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringRotate = interpolate(frame, [0, 90], [-18, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${bgScale})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(255,140,0,0.24), transparent 24%), linear-gradient(180deg, rgba(0,35,102,0.22), transparent 58%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 850,
          width: 620,
          height: 620,
          transform: `translate(-50%, -50%) rotate(${ringRotate}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 850,
          width: 420,
          height: 420,
          transform: `translate(-50%, -50%) rotate(${-ringRotate * 1.8}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 850,
          width: 260,
          height: 260,
          transform: `translate(-50%, -50%) scale(${logoIn})`,
          borderRadius: 72,
          background:
            "linear-gradient(135deg, rgba(0,35,102,0.98), rgba(255,140,0,0.94))",
          boxShadow:
            "0 28px 80px rgba(0,0,0,0.35), 0 0 120px rgba(255,140,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.display,
            fontSize: 110,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.08em",
          }}
        >
          SB
        </div>
      </div>

      <AnimatedText
        eyebrow="Solution"
        title={PROMO_COPY.solution}
        body="Unified court booking, coach scheduling, payments, analytics."
        align="center"
        bodyMarginTop={30}
        bodySize={28}
        maxWidth={760}
        titleSize={82}
      />

      <div
        style={{
          position: "absolute",
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          bottom: 190,
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {[PRODUCT_POINTS.heroMetric, PRODUCT_POINTS.unifiedCart, PRODUCT_POINTS.branchControl].map(
          (item, index) => {
            const reveal = entranceSpring({
              fps,
              frame,
              delay: 20 + index * 4,
              duration: 22,
            });

            return (
              <div
                key={item}
                style={{
                  flex: 1,
                  padding: "24px 20px",
                  borderRadius: 30,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(18px)",
                  opacity: reveal,
                  transform: `translateY(${(1 - reveal) * 30}px)`,
                }}
              >
                <div
                  style={{
                    color: BRAND.text,
                    fontFamily: FONT_STACKS.body,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {item}
                </div>
              </div>
            );
          },
        )}
      </div>
    </AbsoluteFill>
  );
};
