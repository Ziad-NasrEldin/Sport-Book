import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { PhoneMockup } from "../components/PhoneMockup";
import { BRAND, PROMO_COPY, SAFE_AREA } from "../constants";
import { FONT_STACKS } from "../fonts";
import { entranceSpring, staggeredReveal } from "../lib/animation";

const nearbyCards = [
  {
    title: "North Padel Club",
    tag: "Padel",
    eta: "1.2 km",
    price: "320 EGP",
    accent: "#36D68D",
  },
  {
    title: "Coach Maya",
    tag: "Private coach",
    eta: "4.8★",
    price: "450 EGP",
    accent: "#FF8C00",
  },
];

const slots = [
  { label: "18:00", active: false },
  { label: "18:30", active: false },
  { label: "19:00", active: true },
  { label: "19:30", active: false },
  { label: "20:00", active: false },
  { label: "20:30", active: true },
];

const checkoutRows = [
  { label: "Court slot", value: "320 EGP" },
  { label: "Coach add-on", value: "450 EGP" },
  { label: "Local payment", value: "Tap / wallet" },
];

export const PlayerFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = entranceSpring({ fps, frame, duration: 24 });
  const stepA = interpolate(frame, [0, 36, 54], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stepB = interpolate(frame, [30, 54, 84], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stepC = interpolate(frame, [72, 94, 120], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneShift = interpolate(frame, [0, 120], [50, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedText
        eyebrow="Player flow"
        title={"Nearby courts.\nCoaches too.\nCheckout in seconds."}
        body="Location-aware discovery, live slots, one unified cart."
        bodyMarginTop={28}
        bodySize={24}
        maxWidth={720}
        titleSize={78}
      />

      <PhoneMockup
        label="Player app"
        style={{
          left: 210,
          top: 720 + (1 - reveal) * 80,
          transform: `rotate(-7deg) translateY(${phoneShift}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #F8FBFF 0%, #EEF3FF 42%, #F8FBFF 100%)",
            padding: 96,
          }}
        >
          <div
            style={{
              color: BRAND.royalBlueDeep,
              fontFamily: FONT_STACKS.display,
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              marginBottom: 18,
            }}
          >
            Discover nearby
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {["Padel", "Coach", "Tonight"].map((chip) => (
              <div
                key={chip}
                style={{
                  padding: "12px 18px",
                  borderRadius: 999,
                  background: chip === "Coach" ? BRAND.royalBlue : "#FFFFFF",
                  color: chip === "Coach" ? "#FFFFFF" : BRAND.royalBlue,
                  fontFamily: FONT_STACKS.ui,
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "0 10px 24px rgba(0,17,58,0.08)",
                }}
              >
                {chip}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "relative",
              height: 260,
              borderRadius: 38,
              background:
                "radial-gradient(circle at 28% 35%, rgba(255,140,0,0.25), transparent 10%), linear-gradient(180deg, #dce7ff 0%, #e8eeff 100%)",
              overflow: "hidden",
              marginBottom: 22,
              opacity: stepA + stepB * 0.3,
            }}
          >
            {[
              { left: 130, top: 80, color: "#FF8C00" },
              { left: 320, top: 120, color: "#002366" },
              { left: 210, top: 170, color: "#36D68D" },
            ].map((pin, index) => {
              const bounce = spring({
                fps,
                frame: frame - index * 5,
                config: { damping: 10, stiffness: 130, mass: 0.8 },
              });
              return (
                <div
                  key={`${pin.left}-${pin.top}`}
                  style={{
                    position: "absolute",
                    left: pin.left,
                    top: pin.top - bounce * 28,
                    width: 28,
                    height: 28,
                    borderRadius: "50% 50% 50% 0",
                    background: pin.color,
                    transform: "rotate(-45deg)",
                    boxShadow: `0 16px 24px ${pin.color}44`,
                  }}
                />
              );
            })}
          </div>

          {nearbyCards.map((card, index) => {
            const itemReveal = staggeredReveal({ fps, frame, index, step: 4 });
            return (
              <div
                key={card.title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "24px 26px",
                  borderRadius: 34,
                  background: "#FFFFFF",
                  boxShadow: "0 18px 44px rgba(0,17,58,0.08)",
                  marginBottom: 16,
                  opacity: stepA * itemReveal,
                  transform: `translateY(${(1 - itemReveal) * 18}px)`,
                }}
              >
                <div>
                  <div
                    style={{
                      color: BRAND.royalBlueDeep,
                      fontFamily: FONT_STACKS.display,
                      fontSize: 30,
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      color: "rgba(0,17,58,0.58)",
                      fontFamily: FONT_STACKS.body,
                      fontSize: 20,
                      fontWeight: 600,
                      marginTop: 8,
                    }}
                  >
                    {card.tag}   {card.eta}
                  </div>
                </div>
                <div
                  style={{
                    color: card.accent,
                    fontFamily: FONT_STACKS.ui,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {card.price}
                </div>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: 96,
              opacity: stepB,
            }}
          >
            <div
              style={{
                color: BRAND.royalBlueDeep,
                fontFamily: FONT_STACKS.display,
                fontSize: 52,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                marginBottom: 14,
              }}
            >
              Real-time slots
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginTop: 36,
              }}
            >
              {slots.map((slot) => (
                <div
                  key={slot.label}
                  style={{
                    padding: "26px 0",
                    borderRadius: 26,
                    background: slot.active ? BRAND.royalBlue : "#FFFFFF",
                    color: slot.active ? "#FFFFFF" : BRAND.royalBlue,
                    textAlign: "center",
                    fontFamily: FONT_STACKS.ui,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    boxShadow: slot.active
                      ? "0 18px 44px rgba(0,35,102,0.24)"
                      : "0 14px 34px rgba(0,17,58,0.08)",
                  }}
                >
                  {slot.label}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 28,
                padding: "22px 24px",
                borderRadius: 28,
                background: "rgba(54, 214, 141, 0.12)",
                color: BRAND.successGreen,
                fontFamily: FONT_STACKS.ui,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Conflict-free booking engine
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: 96,
              opacity: stepC,
            }}
          >
            <div
              style={{
                color: BRAND.royalBlueDeep,
                fontFamily: FONT_STACKS.display,
                fontSize: 52,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                marginBottom: 14,
              }}
            >
              Unified checkout
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginTop: 36,
              }}
            >
              {checkoutRows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "22px 24px",
                    borderRadius: 28,
                    background: "#FFFFFF",
                    boxShadow: "0 14px 34px rgba(0,17,58,0.08)",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(0,17,58,0.62)",
                      fontFamily: FONT_STACKS.body,
                      fontSize: 22,
                      fontWeight: 600,
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      color: BRAND.royalBlueDeep,
                      fontFamily: FONT_STACKS.ui,
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 30,
                padding: "26px 28px",
                borderRadius: 32,
                background: `linear-gradient(135deg, ${BRAND.sportyOrange}, ${BRAND.sportyOrangeSoft})`,
                color: "#08101d",
                fontFamily: FONT_STACKS.display,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                textAlign: "center",
                boxShadow: "0 22px 48px rgba(255,140,0,0.28)",
              }}
            >
              Checkout in seconds
            </div>
          </div>
        </div>
      </PhoneMockup>

      <div
        style={{
          position: "absolute",
          right: SAFE_AREA.right,
          bottom: 320,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {PROMO_COPY.playerOverlays.map((item, index) => {
          const itemReveal = entranceSpring({
            fps,
            frame,
            delay: 18 + index * 6,
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
                    ? `linear-gradient(135deg, ${BRAND.sportyOrange}, ${BRAND.sportyOrangeSoft})`
                    : "rgba(255,255,255,0.08)",
                color: index === 2 ? "#08101d" : BRAND.text,
                fontFamily: FONT_STACKS.ui,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: itemReveal,
                transform: `translateX(${(1 - itemReveal) * 45}px)`,
                boxShadow:
                  index === 2 ? "0 16px 42px rgba(255,140,0,0.26)" : "none",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
