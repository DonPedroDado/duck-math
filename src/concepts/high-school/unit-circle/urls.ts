import type { StepId } from './step-ids';

export const UC_BASE = '/high-school/unit-circle/';
export const stepPath = (id: StepId) => `${UC_BASE}${id}/`;
