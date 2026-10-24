export const STEP_IDS = ['intro', 'predict', 'both-up', 'at-infinity', 'continuity'] as const;
export type StepId = (typeof STEP_IDS)[number];
