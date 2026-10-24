export const STEP_IDS = ['intro', 'predict', 'approach', 'zoom', 'value', 'jump', 'oscillate'] as const;
export type StepId = (typeof STEP_IDS)[number];
