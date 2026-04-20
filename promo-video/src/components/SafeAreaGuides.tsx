import { AbsoluteFill } from "remotion";
import { SAFE_AREA } from "../constants";

export const SafeAreaGuides: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.top,
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          bottom: SAFE_AREA.bottom,
          border: "2px dashed rgba(255,255,255,0.22)",
          borderRadius: 32,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.top - 42,
          left: SAFE_AREA.left,
          color: "rgba(255,255,255,0.45)",
          fontSize: 18,
          fontFamily: "monospace",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Safe area
      </div>
    </AbsoluteFill>
  );
};
