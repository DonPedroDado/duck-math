export const STEP_IDS = ['intro', 'vertical', 'opposite', 'lookup', 'horizontal', 'both'] as const;
export type StepId = (typeof STEP_IDS)[number];
