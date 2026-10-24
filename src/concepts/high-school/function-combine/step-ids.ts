export const STEP_IDS = ['intro', 'build-c', 'build-b', 'build-a', 'build-d', 'order', 'explore'] as const;
export type StepId = (typeof STEP_IDS)[number];
