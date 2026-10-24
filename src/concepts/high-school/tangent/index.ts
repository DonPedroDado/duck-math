import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'tangent',
	category: 'high-school',
	path: '/high-school/tangent/',
	order: 2,
	title: m.tn_title,
	hook: m.tn_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
