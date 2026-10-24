export const STEP_IDS = ['intro', 'vertical', 'horizontal', 'reflect-x', 'reflect-y', 'explore'] as const;
export type StepId = (typeof STEP_IDS)[number];
