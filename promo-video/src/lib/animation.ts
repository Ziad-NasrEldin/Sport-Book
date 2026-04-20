import { Easing, interpolate, spring } from "remotion";

export const entranceSpring = ({
  fps,
  frame,
  delay = 0,
  duration = 24,
}: {
  fps: number;
  frame: number;
  delay?: number;
  duration?: number;
}) => {
  return spring({
    fps,
    frame: frame - delay,
    config: {
      damping: 200,
      mass: 0.75,
      stiffness: 140,
      overshootClamping: false,
    },
    durationInFrames: duration,
  });
};

export const exitRamp = ({
  frame,
  start,
  duration,
}: {
  frame: number;
  start: number;
  duration: number;
}) => {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.7, 1),
  });
};

export const staggeredReveal = ({
  fps,
  frame,
  index,
  step = 5,
}: {
  fps: number;
  frame: number;
  index: number;
  step?: number;
}) => {
  return entranceSpring({
    fps,
    frame,
    delay: index * step,
    duration: 20,
  });
};
