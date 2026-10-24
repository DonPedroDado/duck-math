import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type SHUser } from './steps.ts';
import { view, type SHView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.sh_step_intro_title(),
	vertical: () => m.sh_step_vertical_title(),
	opposite: () => m.sh_step_opposite_title(),
	lookup: () => m.sh_step_lookup_title(),
	horizontal: () => m.sh_step_horizontal_title(),
	both: () => m.sh_step_both_title()
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
} satisfies ConceptRuntime<SHUser, SHView>;
