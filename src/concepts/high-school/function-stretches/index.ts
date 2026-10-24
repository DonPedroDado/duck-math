import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'function-stretches',
	category: 'high-school',
	path: '/high-school/function-stretches/',
	order: 6,
	title: m.sr_title,
	hook: m.sr_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
