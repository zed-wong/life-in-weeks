<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { userDataStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { quotes, newQueue } from '$lib/quotes';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import { cn } from '$lib/utils';

	function handleStart() {
		if ($userDataStore) goto('/stats');
		else goto('/setup');
	}

	const cta = $derived($userDataStore ? 'Continue' : 'Begin');

	// Quote rotation:
	// - SSR renders quote 0 (deterministic, avoids hydration mismatch).
	// - On client mount, build a shuffled queue and start at its head.
	// - "Another" advances through the queue. When exhausted, reshuffle —
	//   guaranteeing each of the 40 quotes appears once before any repeats,
	//   and that the first quote of a new cycle differs from the last shown.
	let quoteIndex = $state(0);
	let mounted = $state(false);
	let rerolling = $state(false);

	let queue = $state<number[]>([]);
	let pos = $state(0);

	onMount(() => {
		queue = newQueue();
		pos = 0;
		quoteIndex = queue[0];
		mounted = true;
	});

	function reroll() {
		if (!mounted) return;
		rerolling = true;
		setTimeout(() => {
			let nextPos = pos + 1;
			if (nextPos >= queue.length) {
				queue = newQueue(quoteIndex);
				nextPos = 0;
			}
			pos = nextPos;
			quoteIndex = queue[pos];
			rerolling = false;
		}, 220);
	}

	const quote = $derived(quotes[quoteIndex]);
</script>

<section class="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-12 pt-10 sm:pt-20 lg:pt-32 pb-12">
		<!-- Left column: editorial hero -->
		<div class="lg:col-span-7 lg:col-start-1">
			<p class="eyebrow rise mb-6">A quiet field guide to your time</p>

			<h1 class="rise rise-delay-1 text-balance">
				Your life,<br />
				<span class="italic-display text-primary">measured in weeks.</span>
			</h1>

			<div class="rise rise-delay-2 mt-10 max-w-[36rem] prose-body text-pretty">
				Most weeks pass without comment — yet they are the units that build a life.
				This is a place to see them all at once: the ones already lived, the ones still
				to come, and the few that changed everything in between.
			</div>

			<div class="rise rise-delay-3 mt-12 flex items-center gap-6">
				<Button
					size="lg"
					onclick={handleStart}
					class="h-12 px-8 rounded-full text-base font-medium tracking-tight"
				>
					{cta}
					<span aria-hidden="true" class="ml-1">→</span>
				</Button>
				<a href="#about" class="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors">
					What is this?
				</a>
			</div>
		</div>

		<!-- Right column: editorial number block -->
		<aside class="lg:col-span-4 lg:col-start-9 lg:pt-2 self-start rise rise-delay-2">
			<div class="border-l border-border pl-6 sm:pl-8 space-y-8">
				<div>
					<p class="eyebrow mb-2">If you live to 80</p>
					<p class="display-number text-4xl sm:text-5xl tabular text-foreground">4,160</p>
					<p class="text-xs text-muted-foreground mt-1.5">weeks, give or take.</p>
				</div>

				<hr class="rule w-12" />

				<div>
					<p class="eyebrow mb-2">A life in graph paper</p>
					<p class="prose-body text-sm">
						One dot per week. Click to record what mattered — a milestone, a turning point, or
						simply a Tuesday worth remembering.
					</p>
				</div>
			</div>
		</aside>
	</div>

	<!-- Decorative ornament -->
	<div class="ornament my-12 sm:my-16" aria-hidden="true">❦</div>

	<!-- Pull-quote (rotates each visit) ============================== -->
	<figure class="relative mx-auto max-w-3xl py-8 sm:py-12 px-4 text-center rise rise-delay-3">
		<!-- Opening quotation mark, large, decorative -->
		<span
			aria-hidden="true"
			class="absolute -top-2 sm:top-2 left-1/2 -translate-x-1/2 font-serif text-primary/15 select-none pointer-events-none italic"
			style="font-size: clamp(7rem, 18vw, 12rem); line-height: 0.7;"
		>“</span>

		<blockquote
			lang={quote.lang === 'zh' ? 'zh-Hans' : quote.lang === 'la' ? 'la' : 'en'}
			class={cn(
				'relative z-10 transition-all duration-300 ease-out',
				rerolling && 'opacity-0 translate-y-1',
				!rerolling && 'opacity-100 translate-y-0'
			)}
		>
			<p
				class={cn(
					'italic-display text-pretty leading-[1.2]',
					quote.lang === 'zh'
						? 'text-2xl sm:text-3xl lg:text-[2.25rem] tracking-[0.02em]'
						: 'text-2xl sm:text-3xl lg:text-[2.25rem] tracking-[-0.01em]'
				)}
			>
				{quote.text}
			</p>
		</blockquote>

		<figcaption
			class={cn(
				'mt-6 sm:mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground transition-all duration-300 ease-out',
				rerolling && 'opacity-0 translate-y-1',
				!rerolling && 'opacity-100 translate-y-0'
			)}
		>
			<span class="block w-8 h-px bg-border"></span>
			<span class="font-sans not-italic">
				<span class="text-foreground/85">{quote.author}</span>
				{#if quote.source}
					<span class="text-muted-foreground/70"> · {quote.source}</span>
				{/if}
			</span>
			<span class="block w-8 h-px bg-border"></span>
		</figcaption>
	</figure>

	<!-- Reroll button -->
	{#if mounted}
		<div class="text-center -mt-2">
			<button
				type="button"
				onclick={reroll}
				class="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-primary transition-colors group"
				aria-label="Show another quote"
			>
				<RefreshIcon class={cn('h-3 w-3 transition-transform duration-500', rerolling && 'rotate-180')} />
				<span class="tracking-wide uppercase">Another</span>
			</button>
		</div>
	{/if}

	<div class="ornament my-12 sm:my-16" aria-hidden="true">❦</div>

	<!-- About section -->
	<div id="about" class="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
		<div class="lg:col-span-5">
			<p class="eyebrow mb-3">The idea</p>
			<h3 class="text-balance">Time, made visible.</h3>
		</div>
		<div class="lg:col-span-6 lg:col-start-7 prose-body space-y-4">
			<p>
				Inspired by Tim Urban's <em>Your Life in Weeks</em>, this app turns abstract time into
				a finite, countable grid. Each square is a week. The colored ones are weeks you've already lived.
			</p>
			<p>
				What makes it yours: every week can hold a memory. Tap any square to add an event, mark a
				milestone (★), or commemorate a turning point (◆). The grid becomes a quiet autobiography —
				one you can read at a glance.
			</p>
			<p class="italic-display text-foreground">
				Your data lives only in your browser. Nothing is sent anywhere.
			</p>
		</div>
	</div>
</section>
