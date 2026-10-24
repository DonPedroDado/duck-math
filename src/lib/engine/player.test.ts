import { describe, it, expect } from 'vitest';
import { initialState, reduce, isStaged, restage, awaiting, predictPhase, MAX_DT, type PlayerState } from './player';
import { stepStart, stepEnd, totalDuration, type StepDef } from './timeline';
import { STEPS, POLICY, type UCUser } from '#concepts/high-school/unit-circle/steps.ts';
import { view } from '#concepts/high-school/unit-circle/view.ts';

const S = STEPS;
const st = (p: Partial<PlayerState>): PlayerState => ({ t: 0, step: 0, playing: false, rate: 1, revealed: true, ...p });

describe('player reducer', () => {
	it('initialState is staged and paused', () => {
		expect(initialState(S, 2)).toEqual({ t: stepEnd(S, 2), step: 2, playing: false, rate: 1, revealed: true });
		expect(isStaged(S, initialState(S, 2))).toBe(true);
		expect(initialState(S).t).toBe(stepEnd(S, 0));
	});
	it('play resumes same step if mid-step', () => {
		const s = st({ t: 1, step: 0 });
		expect(reduce(S, s, { type: 'play' })).toMatchObject({ t: 1, step: 0, playing: true });
		expect(reduce(S, s, { type: 'toggle' })).toMatchObject({ t: 1, step: 0, playing: true });
	});
	it('play at staged advances to next step', () => {
		const s = initialState(S, 0);
		expect(reduce(S, s, { type: 'play' })).toMatchObject({ step: 1, t: stepStart(S, 1), playing: true });
	});
	it('play at last staged restarts', () => {
		const s = initialState(S, 5);
		expect(reduce(S, s, { type: 'play' })).toMatchObject({ step: 0, t: 0, playing: true });
	});
	it('toggle while playing / pause pauses', () => {
		const s = st({ t: 1, playing: true });
		expect(reduce(S, s, { type: 'toggle' }).playing).toBe(false);
		expect(reduce(S, s, { type: 'pause' }).playing).toBe(false);
	});
	it('pause when paused returns same object', () => {
		const s = st({});
		expect(reduce(S, s, { type: 'pause' })).toBe(s);
	});
	it('tick when paused returns same object', () => {
		const s = st({});
		expect(reduce(S, s, { type: 'tick', dt: 0.01 })).toBe(s);
	});
	it('tick clamps dt and stops at step end', () => {
		const s = st({ t: stepStart(S, 1), step: 1, playing: true });
		const n = reduce(S, s, { type: 'tick', dt: 10 });
		expect(n.t - s.t).toBeLessThanOrEqual(MAX_DT + 1e-12);
		let cur = s;
		for (let k = 0; k < 1000 && cur.playing; k++) cur = reduce(S, cur, { type: 'tick', dt: 1 / 60 });
		expect(cur.t).toBe(stepEnd(S, 1));
		expect(cur.playing).toBe(false);
		expect(cur.step).toBe(1);
	});
	it('next / prev / reset', () => {
		expect(reduce(S, st({}), { type: 'next' })).toMatchObject({ step: 1, t: stepStart(S, 1), playing: true });
		const last = initialState(S, 5);
		expect(reduce(S, last, { type: 'next' })).toBe(last);
		expect(reduce(S, initialState(S, 3), { type: 'prev' })).toMatchObject({ step: 2, t: stepEnd(S, 2), playing: false });
		expect(reduce(S, st({ t: 1, playing: true }), { type: 'prev' })).toMatchObject({ step: 0, t: stepEnd(S, 0), playing: false });
		expect(reduce(S, initialState(S, 4), { type: 'reset' })).toMatchObject({ step: 0, t: stepEnd(S, 0), playing: false });
	});
	it('seek and goto', () => {
		expect(reduce(S, st({ playing: true }), { type: 'seek', t: 9 })).toMatchObject({ t: 9, step: 3, playing: false });
		expect(reduce(S, st({}), { type: 'seek', t: 99 })).toMatchObject({ t: totalDuration(S), step: 5 });
		expect(reduce(S, st({}), { type: 'seek', t: -5 })).toMatchObject({ t: 0, step: 0 });
		expect(reduce(S, st({}), { type: 'goto', step: 99 })).toMatchObject({ step: 5, t: stepEnd(S, 5), playing: false });
		expect(reduce(S, st({}), { type: 'goto', step: -2 })).toMatchObject({ step: 0, t: stepEnd(S, 0) });
	});
	it('T-01-16: non-finite input is ignored', () => {
		const s = st({ t: 3, step: 1 });
		expect(reduce(S, s, { type: 'seek', t: NaN })).toBe(s);
		expect(reduce(S, s, { type: 'seek', t: Infinity })).toBe(s);
		expect(reduce(S, s, { type: 'goto', step: NaN })).toBe(s);
		expect(reduce(S, s, { type: 'goto', step: -Infinity })).toBe(s);
	});
});

describe('seek equivalence (PLAY-02)', () => {
	const u = { unit: 'deg' as const };
	it('play-through states match seeked views', () => {
		let s = initialState(S, 0);
		const rec: PlayerState[] = [];
		for (let k = 0; k < 5000 && !(s.step === 5 && isStaged(S, s)); k++) {
			if (!s.playing) s = reduce(S, s, { type: 'play' });
			s = reduce(S, s, { type: 'tick', dt: 1 / 60 });
			rec.push(s);
		}
		expect(rec.length).toBeGreaterThan(100);
		for (const r of rec) {
			const seeked = reduce(S, st({ t: 7, step: 3 }), { type: 'seek', t: r.t });
			expect(view(seeked.t, u)).toEqual(view(r.t, u));
		}
	});
	it('random seeks have no hidden state', () => {
		let s = initialState(S, 0);
		let seed = 12345;
		const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
		for (let k = 0; k < 500; k++) {
			s = reduce(S, s, { type: 'seek', t: rnd() * totalDuration(S) });
			expect(view(s.t, u)).toEqual(view(s.t, { unit: 'deg' }));
		}
	});
});

describe('restage', () => {
	it('resets restage keys only, without mutation', () => {
		const user: Readonly<UCUser> = Object.freeze({ theta: 2, unit: 'deg', moved: true });
		const out = restage(user, POLICY, { unit: 'rad' });
		expect(out).toEqual({ theta: 2, unit: 'rad', moved: true });
		expect(out).not.toBe(user);
		expect(user.unit).toBe('deg');
		expect(restage(user, POLICY, {})).toEqual(user);
	});
});

describe('predict pause', () => {
	const P: StepDef[] = [
		{ id: 'a', dur: 2 },
		{ id: 'b', dur: 4, pause: 1 },
		{ id: 'c', dur: 2 }
	];
	const run = (s: PlayerState): PlayerState => {
		for (let k = 0; k < 2000 && s.playing; k++) s = reduce(P, s, { type: 'tick', dt: 1 / 60 });
		return s;
	};
	const atPause = (): PlayerState => run(reduce(P, initialState(P, 0), { type: 'next' }));

	it('stops exactly at the pause point', () => {
		const n = reduce(P, initialState(P, 0), { type: 'next' });
		expect(n).toMatchObject({ step: 1, t: 2, playing: true, revealed: false });
		const s = run(n);
		expect(s.t).toBe(3);
		expect(s.playing).toBe(false);
		expect(awaiting(P, s)).toBe(true);
		expect(predictPhase(P, s)).toBe('awaiting');
	});
	it('play / toggle / next reveal and continue', () => {
		const s = atPause();
		for (const type of ['play', 'toggle', 'next'] as const) {
			expect(reduce(P, s, { type })).toMatchObject({ revealed: true, playing: true, step: 1, t: 3 });
		}
		expect(reduce(P, s, { type: 'reveal' })).toMatchObject({ revealed: true, playing: true, step: 1, t: 3 });
	});
	it('reveal when not awaiting is a no-op', () => {
		const s = initialState(P, 0);
		expect(reduce(P, s, { type: 'reveal' })).toBe(s);
	});
	it('after reveal ticks run to step end', () => {
		const s = run(reduce(P, atPause(), { type: 'reveal' }));
		expect(s.t).toBe(6);
		expect(s.playing).toBe(false);
		expect(predictPhase(P, s)).toBe('after');
	});
	it('seek never blocks', () => {
		const base = initialState(P, 0);
		const a = reduce(P, base, { type: 'seek', t: 4 });
		expect(a.revealed).toBe(true);
		expect(predictPhase(P, a)).toBe('after');
		const b = reduce(P, base, { type: 'seek', t: 3 });
		expect(b.revealed).toBe(false);
		expect(predictPhase(P, b)).toBe('awaiting');
		const c = reduce(P, base, { type: 'seek', t: 2.5 });
		expect(c.revealed).toBe(false);
		expect(predictPhase(P, c)).toBe('before');
	});
	it('goto / prev / initialState / reset land revealed', () => {
		expect(reduce(P, initialState(P, 0), { type: 'goto', step: 1 })).toMatchObject({ t: 6, revealed: true });
		expect(reduce(P, initialState(P, 2), { type: 'prev' })).toMatchObject({ step: 1, t: 6, revealed: true });
		expect(initialState(P, 1)).toMatchObject({ t: 6, revealed: true });
		expect(reduce(P, atPause(), { type: 'reset' }).revealed).toBe(true);
	});
	it('steps without pause are unaffected', () => {
		const s = initialState(S, 1);
		expect(predictPhase(S, s)).toBe('none');
		expect(awaiting(S, s)).toBe(false);
	});
});
