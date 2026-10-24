<script lang="ts">
	let {
		name,
		size = 24
	}: {
		name: 'reset' | 'prev' | 'play' | 'pause' | 'next' | 'chevron-left' | 'globe';
		size?: number;
	} = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'reset'}
		<path d="M3 12a9 9 0 1 0 3-6.7" />
		<path d="M3 4v5h5" />
	{:else if name === 'prev'}
		<path d="M6 5v14" />
		<path d="M19 5l-9 7 9 7z" fill="currentColor" />
	{:else if name === 'play'}
		<path d="M7 4l13 8-13 8z" fill="currentColor" />
	{:else if name === 'pause'}
		<path d="M8 5v14" />
		<path d="M16 5v14" />
	{:else if name === 'next'}
		<path d="M18 5v14" />
		<path d="M5 5l9 7-9 7z" fill="currentColor" />
	{:else if name === 'chevron-left'}
		<path d="M15 5l-7 7 7 7" />
	{:else if name === 'globe'}
		<circle cx="12" cy="12" r="9" />
		<path d="M3 12h18" />
		<path d="M12 3c3 3 3 15 0 18c-3-3-3-15 0-18z" />
	{/if}
</svg>
