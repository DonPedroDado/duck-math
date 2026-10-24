import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type TNUser } from './steps.ts';
import { view, type TNView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.tn_step_intro_title(),
	tan: () => m.tn_step_tan_title(),
	sec: () => m.tn_step_sec_title(),
	csc: () => m.tn_step_csc_title(),
	cot: () => m.tn_step_cot_title(),
	all: () => m.tn_step_all_title()
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
} satisfies ConceptRuntime<TNUser, TNView>;
