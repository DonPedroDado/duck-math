export const STEP_IDS = ['intro', 'tan', 'sec', 'csc', 'cot', 'all'] as const;
export type StepId = (typeof STEP_IDS)[number];
export const isStepId = (s: string): s is StepId => (STEP_IDS as readonly string[]).includes(s);
