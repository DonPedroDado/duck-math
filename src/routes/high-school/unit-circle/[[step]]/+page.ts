import { error } from '@sveltejs/kit';
import { STEP_IDS, isStepId } from '#concepts/high-school/unit-circle/step-ids.ts';

export const load = ({ params }: { params: { step?: string } }) => {
	const step = params.step ?? STEP_IDS[0];
	if (!isStepId(step)) error(404, 'Unknown step');
	return { step };
};
