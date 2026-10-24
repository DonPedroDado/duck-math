import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'sine-cosine-graphs',
	category: 'high-school',
	path: '/high-school/sine-cosine-graphs/',
	order: 3,
	title: m.sg_title,
	hook: m.sg_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
