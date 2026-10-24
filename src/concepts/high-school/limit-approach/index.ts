import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'limit-approach',
	category: 'high-school',
	path: '/high-school/limit-approach/',
	order: 8,
	title: m.la_title,
	hook: m.la_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
