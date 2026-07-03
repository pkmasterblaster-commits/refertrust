// Single switch that hides all V2 UI. Backend tables + APIs for V2 exist,
// but nothing renders until this is flipped to true after V1 launch.
export const SHOW_V2_FEATURES = false;

// Granular flags (all gated by SHOW_V2_FEATURES). Lets you turn on one V2
// feature at a time later without touching component code.
export const FEATURES = {
  interviewFeedback: SHOW_V2_FEATURES && true,
  bonusTracking: SHOW_V2_FEATURES && true,
  gamification: SHOW_V2_FEATURES && true,
};
