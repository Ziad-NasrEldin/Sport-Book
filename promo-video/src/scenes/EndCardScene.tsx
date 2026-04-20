import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DashboardMockup } from "../components/DashboardMockup";
import { PhoneMockup } from "../components/PhoneMockup";
import { BRAND, PRODUCT_POINTS, PROMO_COPY, SAFE_AREA } from "../constants";
import { FONT_STACKS } from "../fonts";

export const EndCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 130, mass: 0.85 },
    durationInFrames: 28,
  });
  const glow = interpolate(frame, [0, 20, 60], [0.2, 0.52, 0.36], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "54%",
          width: 840,
          height: 840,
          transform: `translate(-50%, -50%) scale(${0.92 + rise * 0.08})`,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,140,0,${glow}), transparent 52%)`,
          filter: "blur(80px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.top,
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 22px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: BRAND.text,
            fontFamily: FONT_STACKS.ui,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Digital operating system
        </div>

        <div
          style={{
            marginTop: 30,
            color: BRAND.text,
            fontFamily: FONT_STACKS.display,
            fontSize: 102,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.06em",
            textShadow: "0 16px 48px rgba(0,0,0,0.28)",
          }}
        >
          {PROMO_COPY.outroHeadline}
        </div>

        <div
          style={{
            marginTop: 22,
            color: BRAND.textMuted,
            fontFamily: FONT_STACKS.body,
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: "-0.03em",
          }}
        >
          {PROMO_COPY.outroSubline}
        </div>
      </div>

      <PhoneMockup
        label="Player + coach"
        scale={0.73}
        style={{
          left: 110,
          top: 760 - rise * 80,
          transform: "rotate(-8deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #F9FBFF 0%, #EEF3FF 48%, #F5F8FF 100%)",
            padding: 80,
          }}
        >
          <div
            style={{
              color: BRAND.royalBlueDeep,
              fontFamily: FONT_STACKS.display,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              marginBottom: 18,
            }}
          >
            Book in under 30 seconds
          </div>
          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {[PRODUCT_POINTS.realTime, PRODUCT_POINTS.unifiedCart, PRODUCT_POINTS.localizedPayments].map(
              (item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "18px 20px",
                    borderRadius: 24,
                    background: "#FFFFFF",
                    boxShadow: "0 12px 28px rgba(0,17,58,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background:
                        index === 0
                          ? BRAND.successGreen
                          : index === 1
                            ? BRAND.sportyOrange
                            : BRAND.royalBlue,
                    }}
                  />
                  <div
                    style={{
                      color: BRAND.royalBlueDeep,
                      fontFamily: FONT_STACKS.body,
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </PhoneMockup>

      <DashboardMockup
        title="Revenue command center"
        style={{
          right: 90,
          bottom: 260 - rise * 60,
          width: 600,
          height: 520,
          transform: "rotate(5deg)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {["Branches", "Bookings", "Payouts"].map((label, index) => (
            <div
              key={label}
              style={{
                padding: "16px 14px",
                borderRadius: 22,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  color: BRAND.textMuted,
                  fontFamily: FONT_STACKS.ui,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  color: BRAND.text,
                  fontFamily: FONT_STACKS.display,
                  fontSize: 34,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                }}
              >
                {index === 0 ? "12" : index === 1 ? "1.8K" : "472K"}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            height: 170,
            padding: 18,
            borderRadius: 28,
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          {[50, 72, 64, 88, 98, 78, 114].map((height, index) => (
            <div
              key={height}
              style={{
                flex: 1,
                height,
                borderRadius: 18,
                background:
                  index === 6
                    ? `linear-gradient(180deg, ${BRAND.sportyOrangeSoft}, ${BRAND.sportyOrange})`
                    : "rgba(255,255,255,0.14)",
              }}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "18px 20px",
            borderRadius: 24,
            background: "rgba(54,214,141,0.12)",
            color: BRAND.successGreen,
            fontFamily: FONT_STACKS.ui,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Built for modern sports operators
        </div>
      </DashboardMockup>

      <div
        style={{
          position: "absolute",
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          bottom: 120,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            padding: "24px 30px",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${BRAND.sportyOrange}, ${BRAND.sportyOrangeSoft})`,
            color: "#08101d",
            fontFamily: FONT_STACKS.display,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            boxShadow: "0 24px 56px rgba(255,140,0,0.3)",
          }}
        >
          <span>{PROMO_COPY.outroCta}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
