import { error } from '@sveltejs/kit';
import { concepts } from '#concepts/registry.ts';
import { loadRuntime } from '#concepts/runtimes.ts';

export const load = async ({ params }: { params: { category: string; concept: string; step?: string } }) => {
	const manifest = concepts.find((c) => c.path === `/${params.category}/${params.concept}/`);
	if (!manifest) error(404, 'Unknown concept');
	const step = params.step ?? manifest.stepIds[0];
	if (!manifest.stepIds.includes(step)) error(404, 'Unknown step');
	const runtime = await loadRuntime(manifest.path);
	if (!runtime) error(404, 'Unknown concept');
	return { manifest, step, runtime };
};
