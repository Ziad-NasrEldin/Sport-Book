import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../constants";
import { FONT_STACKS } from "../fonts";

type AudioCue = {
  frame: number;
  label: string;
};

export const AudioCueOverlay: React.FC<{
  cues: readonly AudioCue[];
}> = ({ cues }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 28,
          bottom: 36,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {cues.map((cue) => {
          const active = Math.abs(frame - cue.frame) <= 4;
          return (
            <div
              key={`${cue.frame}-${cue.label}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: active ? 1 : 0.32,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: active ? BRAND.sportyOrange : "rgba(255,255,255,0.22)",
                  boxShadow: active
                    ? "0 0 24px rgba(255,140,0,0.7)"
                    : "none",
                }}
              />
              <div
                style={{
                  color: "#F6F8FC",
                  fontFamily: FONT_STACKS.ui,
                  fontSize: 18,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {String(cue.frame).padStart(3, "0")}F  {cue.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
