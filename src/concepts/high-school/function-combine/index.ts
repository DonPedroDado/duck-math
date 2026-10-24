import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'function-combine',
	category: 'high-school',
	path: '/high-school/function-combine/',
	order: 7,
	title: m.cb_title,
	hook: m.cb_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
