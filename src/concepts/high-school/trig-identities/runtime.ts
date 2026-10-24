import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type IDUser } from './steps.ts';
import { view, type IDView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.id_step_intro_title(),
	pythagoras: () => m.id_step_pythagoras_title(),
	negative: () => m.id_step_negative_title(),
	supplement: () => m.id_step_supplement_title(),
	complement: () => m.id_step_complement_title(),
	square45: () => m.id_step_square45_title(),
	triangle3060: () => m.id_step_triangle3060_title(),
	special: () => m.id_step_special_title()
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
	Panel,
	layout: 'side'
} satisfies ConceptRuntime<IDUser, IDView>;
