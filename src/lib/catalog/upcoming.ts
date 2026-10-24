import type { Component } from 'svelte';
import { m } from '#lib/paraglide/messages.js';
import type { CategoryId } from '#concepts/types.ts';
import FunctionsThumb from './thumbs/FunctionsThumb.svelte';
import LimitsThumb from './thumbs/LimitsThumb.svelte';
import DerivativesThumb from './thumbs/DerivativesThumb.svelte';

export interface UpcomingDef {
	id: string;
	category: CategoryId;
	title: () => string;
	hook: () => string;
	thumbnail: Component;
}

export const UPCOMING: UpcomingDef[] = [
	{
		id: 'functions',
		category: 'high-school',
		title: m.catalog_soon_functions_title,
		hook: m.catalog_soon_functions_hook,
		thumbnail: FunctionsThumb
	},
	{
		id: 'limits',
		category: 'high-school',
		title: m.catalog_soon_limits_title,
		hook: m.catalog_soon_limits_hook,
		thumbnail: LimitsThumb
	},
	{
		id: 'derivatives',
		category: 'high-school',
		title: m.catalog_soon_derivatives_title,
		hook: m.catalog_soon_derivatives_hook,
		thumbnail: DerivativesThumb
	}
];
