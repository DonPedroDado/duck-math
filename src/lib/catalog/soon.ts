/** A Soon card is hidden once any concept it stands for exists, so shipping one needs no catalog edit. */
export function stillSoon<T extends { replacedBy?: readonly string[] }>(
	upcoming: readonly T[],
	conceptIds: readonly string[]
): T[] {
	return upcoming.filter((u) => !u.replacedBy?.some((id) => conceptIds.includes(id)));
}
