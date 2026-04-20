import { AbsoluteFill, Sequence } from "remotion";
import { AudioCueOverlay } from "./components/AudioCueOverlay";
import { Backdrop } from "./components/Backdrop";
import { SafeAreaGuides } from "./components/SafeAreaGuides";
import {
  AUDIO_CUES,
  SCENE_TIMINGS,
  type PromoProps,
} from "./constants";
import { ChaosScene } from "./scenes/ChaosScene";
import { EndCardScene } from "./scenes/EndCardScene";
import { OperatorPowerScene } from "./scenes/OperatorPowerScene";
import { PlayerFlowScene } from "./scenes/PlayerFlowScene";
import { SolutionScene } from "./scenes/SolutionScene";

export const SportBookUltimatePromo: React.FC<PromoProps> = ({
  showAudioCues = false,
  showSafeAreas = false,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050b17" }}>
      <Backdrop />

      <Sequence
        from={SCENE_TIMINGS.chaos.start}
        durationInFrames={SCENE_TIMINGS.chaos.duration}
      >
        <ChaosScene />
      </Sequence>

      <Sequence
        from={SCENE_TIMINGS.solution.start}
        durationInFrames={SCENE_TIMINGS.solution.duration}
      >
        <SolutionScene />
      </Sequence>

      <Sequence
        from={SCENE_TIMINGS.playerFlow.start}
        durationInFrames={SCENE_TIMINGS.playerFlow.duration}
      >
        <PlayerFlowScene />
      </Sequence>

      <Sequence
        from={SCENE_TIMINGS.operatorPower.start}
        durationInFrames={SCENE_TIMINGS.operatorPower.duration}
      >
        <OperatorPowerScene />
      </Sequence>

      <Sequence
        from={SCENE_TIMINGS.endCard.start}
        durationInFrames={SCENE_TIMINGS.endCard.duration}
      >
        <EndCardScene />
      </Sequence>

      {showSafeAreas ? <SafeAreaGuides /> : null}
      {showAudioCues ? <AudioCueOverlay cues={AUDIO_CUES} /> : null}
    </AbsoluteFill>
  );
};
