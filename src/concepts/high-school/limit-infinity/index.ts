import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'limit-infinity',
	category: 'high-school',
	path: '/high-school/limit-infinity/',
	order: 9,
	title: m.li_title,
	hook: m.li_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
