import "./index.css";
import { Composition } from "remotion";
import {
  DEFAULT_PROMO_PROPS,
  VIDEO_CONFIG,
} from "./constants";
import { SportBookUltimatePromo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SportBookUltimatePromo"
        component={SportBookUltimatePromo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={DEFAULT_PROMO_PROPS}
      />
    </>
  );
};
