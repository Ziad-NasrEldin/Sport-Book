export const VIDEO_CONFIG = {
  id: "SportBookUltimatePromo",
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 450,
} as const;

export const BRAND = {
  royalBlue: "#002366",
  royalBlueDeep: "#00113a",
  sportyOrange: "#FF8C00",
  sportyOrangeSoft: "#FDB04D",
  accentYellow: "#F5D547",
  successGreen: "#36D68D",
  surface: "#08101d",
  surfaceSoft: "#101b2d",
  surfaceRaised: "#15243a",
  text: "#F6F8FC",
  textMuted: "rgba(246, 248, 252, 0.68)",
  danger: "#FF5D73",
} as const;

export const SAFE_AREA = {
  top: 170,
  right: 72,
  bottom: 220,
  left: 72,
} as const;

export const SCENE_TIMINGS = {
  chaos: { start: 0, duration: 90 },
  solution: { start: 90, duration: 90 },
  playerFlow: { start: 180, duration: 120 },
  operatorPower: { start: 300, duration: 90 },
  endCard: { start: 390, duration: 60 },
} as const;

export const PROMO_COPY = {
  brand: "SportBook Ultimate",
  pain: "Still running bookings on WhatsApp?",
  solution: "One platform. Full control.",
  playerOverlays: [
    "Find nearby courts",
    "Book coaches too",
    "Checkout in seconds",
  ],
  operatorOverlays: [
    "Manage branches",
    "Control availability",
    "Track revenue live",
  ],
  outroHeadline: "Book faster. Manage smarter.",
  outroSubline: "SportBook Ultimate",
  outroCta: "Digitize your sports business",
} as const;

export const PRODUCT_POINTS = {
  heroMetric: "Book in under 30 seconds",
  unifiedCart: "Courts + coaches. One cart.",
  realTime: "Real-time availability",
  branchControl: "Multi-branch control",
  localizedPayments: "Localized payments",
  analytics: "Live revenue visibility",
} as const;

export const AUDIO_CUES = [
  { frame: 0, label: "Distorted chat burst" },
  { frame: 24, label: "Call vibration hit" },
  { frame: 60, label: "Glitch whip" },
  { frame: 90, label: "Impact logo snap" },
  { frame: 122, label: "UI lock-in click" },
  { frame: 180, label: "Map pin pop" },
  { frame: 210, label: "Slot pulse tap" },
  { frame: 246, label: "Checkout rise" },
  { frame: 300, label: "Dashboard slam" },
  { frame: 330, label: "Metric count-up tick" },
  { frame: 390, label: "Hero whoosh" },
  { frame: 449, label: "Final CTA hit" },
] as const;

export type PromoProps = {
  showAudioCues?: boolean;
  showSafeAreas?: boolean;
};

export const DEFAULT_PROMO_PROPS: PromoProps = {
  showAudioCues: false,
  showSafeAreas: false,
};
