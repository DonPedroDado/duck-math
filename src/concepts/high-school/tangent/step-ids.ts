export const STEP_IDS = ['intro', 'tan'] as const;
export type StepId = (typeof STEP_IDS)[number];
export const isStepId = (s: string): s is StepId => (STEP_IDS as readonly string[]).includes(s);
