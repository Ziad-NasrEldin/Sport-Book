import type { CSSProperties, ReactNode } from "react";
import { BRAND } from "../constants";
import { FONT_STACKS } from "../fonts";

type DashboardMockupProps = {
  children: ReactNode;
  style?: CSSProperties;
  title?: string;
};

export const DashboardMockup: React.FC<DashboardMockupProps> = ({
  children,
  style,
  title = "Operations Control",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        width: 860,
        height: 820,
        padding: 26,
        borderRadius: 48,
        background:
          "linear-gradient(180deg, rgba(16,27,45,0.92), rgba(8,16,29,0.95))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 36px 100px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              color: BRAND.textMuted,
              fontFamily: FONT_STACKS.ui,
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            SportBook Ultimate
          </div>
          <div
            style={{
              color: BRAND.text,
              fontFamily: FONT_STACKS.display,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {["#36D68D", "#F5D547", "#FF8C00"].map((dot) => (
            <div
              key={dot}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: dot,
              }}
            />
          ))}
        </div>
      </div>
      {children}
    </div>
  );
};
