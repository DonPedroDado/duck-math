import { m } from '#lib/paraglide/messages.js';
import type { CategoryId } from '#concepts/types';

export interface CategoryDef {
	id: CategoryId;
	title: () => string;
	status: 'live' | 'later';
}

export const CATEGORIES: CategoryDef[] = [
	{ id: 'high-school', title: m.catalog_section_high_school, status: 'live' },
	{ id: 'university', title: m.catalog_section_university, status: 'later' }
];
