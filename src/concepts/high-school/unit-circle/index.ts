import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'unit-circle',
	category: 'high-school',
	path: '/high-school/unit-circle/',
	order: 1,
	title: m.uc_title,
	hook: m.uc_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
