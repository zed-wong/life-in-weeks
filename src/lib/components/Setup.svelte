<script lang="ts">
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { userDataStore } from '$lib/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { buttonVariants } from '$lib/components/ui/button';
	import { DateFormatter, type DateValue, getLocalTimeZone, CalendarDate, today } from '@internationalized/date';

	const userLocale = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
	const df = new DateFormatter(userLocale, { dateStyle: 'long' });

	const now = today(getLocalTimeZone());
	let birthday: DateValue = $state(new CalendarDate(now.year - 30, now.month, now.day));
	let lifeExpectancy = $state(80);
	let contentRef: HTMLElement | null = $state(null);
	let popoverOpen = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!birthday) return;

		userDataStore.set({
			birthday: birthday.toDate(getLocalTimeZone()).toString(),
			lifeExpectancy,
			locale: userLocale
		});
		goto('/stats');
	}
</script>

<section class="mx-auto max-w-[1100px] px-6 sm:px-10 lg:px-16 pt-12 sm:pt-20 pb-24">
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12">
		<!-- Editorial intro -->
		<div class="lg:col-span-5">
			<p class="eyebrow rise mb-4">Step one of one</p>
			<h2 class="rise rise-delay-1 text-balance">
				Two facts<br />
				<span class="italic-display text-primary">to anchor the grid.</span>
			</h2>
			<p class="rise rise-delay-2 prose-body mt-8 max-w-prose">
				Your birthday tells us where the grid begins. Your expected lifespan tells us where to
				stop drawing. Both stay on this device — no account, no cloud.
			</p>

			<div class="rise rise-delay-3 mt-10 hidden lg:block border-l border-border pl-6">
				<p class="eyebrow mb-2">A note</p>
				<p class="text-sm prose-body">
					You can change either of these later. The grid will redraw itself, and your events
					stay anchored to their dates.
				</p>
			</div>
		</div>

		<!-- Form column -->
		<form onsubmit={handleSubmit} class="lg:col-span-6 lg:col-start-7 space-y-10 rise rise-delay-2">
			<div>
				<Label for="birthday" class="eyebrow block mb-3">Date of birth</Label>
				<Popover.Root bind:open={popoverOpen}>
					<Popover.Trigger
						id="birthday"
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full h-14 justify-start text-left font-normal text-base bg-card/50 hover:bg-card border-border/80 hover:border-primary/40 transition-all rounded-md'
						)}
					>
						<CalendarIcon class="mr-3 h-4 w-4 text-muted-foreground" />
						<span class="font-serif italic-display text-lg">
							{df.format(birthday.toDate(getLocalTimeZone()))}
						</span>
					</Popover.Trigger>
					<Popover.Content bind:ref={contentRef} class="w-auto p-0" align="start">
						<Calendar
							captionLayout="dropdown"
							type="single"
							bind:value={birthday}
							ref={contentRef}
							locale={userLocale}
							class="rounded-md border shadow-lg"
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<div>
				<div class="flex items-baseline justify-between mb-3">
					<Label for="lifeExpectancy" class="eyebrow">Expected lifespan</Label>
					<span class="text-xs text-muted-foreground tabular">{lifeExpectancy} years</span>
				</div>

				<input
					type="range"
					id="lifeExpectancy"
					list="lifeExpectancy-ticks"
					bind:value={lifeExpectancy}
					min="60"
					max="150"
					step="1"
					class="w-full accent-primary cursor-pointer"
				/>
				<datalist id="lifeExpectancy-ticks">
					<option value="60"></option>
					<option value="80"></option>
					<option value="100"></option>
					<option value="120"></option>
					<option value="150"></option>
				</datalist>

				<!-- Tick marks aligned with labels (positions = (value - 60) / 90) -->
				<div class="relative h-2 mx-[3px] mt-1">
					{#each [60, 80, 100, 120, 150] as t}
						<span
							aria-hidden="true"
							class="absolute top-0 w-px h-1.5 bg-border -translate-x-1/2"
							style:left="{((t - 60) / 90) * 100}%"
							class:!bg-primary={t === lifeExpectancy}
						></span>
					{/each}
				</div>

				<div class="relative mx-[3px] mt-1 h-4 text-[10px] text-muted-foreground tabular">
					{#each [60, 80, 100, 120, 150] as t}
						<span
							class="absolute -translate-x-1/2"
							style:left="{((t - 60) / 90) * 100}%"
							class:text-primary={t === 80}
						>{t}</span>
					{/each}
				</div>

				<p class="text-xs text-muted-foreground mt-4 leading-relaxed">
					Global average is around 73. If your family lives long, set it higher. The number is
					a guide, not a prophecy.
				</p>
			</div>

			<hr class="rule" />

			<div class="flex items-center justify-end gap-4">
				<a href="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
					Back
				</a>
				<Button
					type="submit"
					size="lg"
					class="h-12 px-8 rounded-full text-base font-medium"
					disabled={!birthday}
				>
					Draw my life
					<span aria-hidden="true" class="ml-1">→</span>
				</Button>
			</div>
		</form>
	</div>
</section>
