import type { Page } from '@playwright/test';

type Pt = { x: number; y: number };

/** Real touch drag via CDP (Input.dispatchTouchEvent): start, N moves, end. */
export async function touchDrag(page: Page, from: Pt, to: Pt, steps = 10): Promise<void> {
	const cdp = await page.context().newCDPSession(page);
	const send = (type: string, p?: Pt) =>
		cdp.send('Input.dispatchTouchEvent', {
			type,
			touchPoints: p ? [{ x: p.x, y: p.y }] : []
		});
	await send('touchStart', from);
	for (let i = 1; i <= steps; i++) {
		await send('touchMove', {
			x: from.x + ((to.x - from.x) * i) / steps,
			y: from.y + ((to.y - from.y) * i) / steps
		});
	}
	await send('touchEnd');
	await cdp.detach();
}
