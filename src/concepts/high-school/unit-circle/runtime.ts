import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type UCUser } from './steps.ts';
import { view, type UCView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.uc_step_intro_title(),
	angle: () => m.uc_step_angle_title(),
	radian: () => m.uc_step_radian_title(),
	radians: () => m.uc_step_radians_title(),
	cosine: () => m.uc_step_cosine_title(),
	sine: () => m.uc_step_sine_title()
};
const stepTitle = (i: number) => TITLES[STEP_IDS[i]]();

export default {
	steps: STEPS,
	policy: POLICY,
	stepDefaults,
	initialUser,
	view,
	stepTitle,
	Scene,
	Panel
} satisfies ConceptRuntime<UCUser, UCView>;
