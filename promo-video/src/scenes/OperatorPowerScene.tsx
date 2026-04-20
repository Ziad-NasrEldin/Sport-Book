import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { DashboardMockup } from "../components/DashboardMockup";
import { BRAND, PRODUCT_POINTS, PROMO_COPY, SAFE_AREA } from "../constants";
import { FONT_STACKS } from "../fonts";
import { entranceSpring } from "../lib/animation";

const statCards = [
  { label: "Revenue", value: "184K", delta: "+18%" },
  { label: "Occupancy", value: "92%", delta: "+7%" },
  { label: "Coach fill", value: "86%", delta: "+12%" },
];

const branches = [
  { name: "Downtown", rate: "97%", color: "#36D68D" },
  { name: "North Hub", rate: "89%", color: "#FF8C00" },
  { name: "West Club", rate: "84%", color: "#F5D547" },
];

export const OperatorPowerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = entranceSpring({ fps, frame, duration: 24 });
  const countUp = spring({
    fps,
    frame: frame - 10,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
  });
  const dashboardShift = interpolate(frame, [0, 90], [80, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedText
        eyebrow="Operator power"
        title={"Run branches.\nControl schedules.\nTrack revenue live."}
        body="Multi-branch operations, coach calendars, occupancy analytics."
        bodyMarginTop={30}
        bodySize={24}
        maxWidth={820}
        titleSize={78}
      />

      <DashboardMockup
        title="Unified operations"
        style={{
          left: 140,
          top: 660 + (1 - reveal) * 60,
          transform: `rotate(-4deg) translateY(${dashboardShift}px)`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 18,
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                padding: "20px 18px",
                borderRadius: 28,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  color: BRAND.textMuted,
                  fontFamily: FONT_STACKS.ui,
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  marginTop: 12,
                  color: BRAND.text,
                  fontFamily: FONT_STACKS.display,
                  fontSize: 44,
                  fontWeight: 800,
                  letterSpacing: "-0.06em",
                }}
              >
                {card.label === "Revenue"
                  ? `${Math.round(184 * countUp)}K`
                  : card.label === "Occupancy"
                    ? `${Math.round(92 * countUp)}%`
                    : `${Math.round(86 * countUp)}%`}
              </div>
              <div
                style={{
                  marginTop: 10,
                  color: BRAND.successGreen,
                  fontFamily: FONT_STACKS.ui,
                  fontSize: 15,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {card.delta}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 16,
          }}
        >
          <div
            style={{
              padding: 20,
              borderRadius: 30,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                color: BRAND.text,
                fontFamily: FONT_STACKS.display,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                marginBottom: 18,
              }}
            >
              Branch performance
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {branches.map((branch, index) => {
                const width = 48 + countUp * (42 - index * 4);
                return (
                  <div key={branch.name}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: BRAND.textMuted,
                        fontFamily: FONT_STACKS.body,
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      <span>{branch.name}</span>
                      <span>{branch.rate}</span>
                    </div>
                    <div
                      style={{
                        height: 14,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${width}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: branch.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 30,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                color: BRAND.text,
                fontFamily: FONT_STACKS.display,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                marginBottom: 18,
              }}
            >
              Coach calendar
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <div
                  key={day}
                  style={{
                    color: BRAND.textMuted,
                    fontFamily: FONT_STACKS.ui,
                    fontSize: 12,
                    textAlign: "center",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {Array.from({ length: 5 }).map((_, row) => (
              <div
                key={row}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {Array.from({ length: 5 }).map((__, column) => {
                  const hot = (row + column) % 3 === 0;
                  return (
                    <div
                      key={`${row}-${column}`}
                      style={{
                        height: 44,
                        borderRadius: 16,
                        background: hot
                          ? "rgba(255,140,0,0.22)"
                          : "rgba(255,255,255,0.06)",
                        border: hot
                          ? "1px solid rgba(255,140,0,0.34)"
                          : "1px solid rgba(255,255,255,0.03)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DashboardMockup>

      <div
        style={{
          position: "absolute",
          right: SAFE_AREA.right,
          top: 740,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {PROMO_COPY.operatorOverlays.map((item, index) => {
          const itemReveal = entranceSpring({
            fps,
            frame,
            delay: 16 + index * 5,
            duration: 20,
          });
          return (
            <div
              key={item}
              style={{
                padding: "18px 24px",
                borderRadius: 999,
                background:
                  index === 2
                    ? "rgba(54,214,141,0.2)"
                    : "rgba(255,255,255,0.08)",
                color: BRAND.text,
                fontFamily: FONT_STACKS.ui,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: itemReveal,
                transform: `translateX(${(1 - itemReveal) * 40}px)`,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: SAFE_AREA.right,
          bottom: 220,
          padding: "20px 24px",
          borderRadius: 28,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            color: BRAND.textMuted,
            fontFamily: FONT_STACKS.ui,
            fontSize: 14,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Visibility stack
        </div>
        <div
          style={{
            color: BRAND.text,
            fontFamily: FONT_STACKS.display,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          {PRODUCT_POINTS.analytics}
          <br />
          {PRODUCT_POINTS.localizedPayments}
        </div>
      </div>
    </AbsoluteFill>
  );
};
