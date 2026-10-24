import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'function-shifts',
	category: 'high-school',
	path: '/high-school/function-shifts/',
	order: 5,
	title: m.sh_title,
	hook: m.sh_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
