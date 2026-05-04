<!-- LifeProgressGrid.svelte — editorial life-in-weeks visualization -->
<script lang="ts">
    import { userDataStore, lifeEventsStore, type LifeEvent } from "$lib/stores";
    import { cn } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import { goto } from '$app/navigation';
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogTrigger
    } from "$lib/components/ui/alert-dialog";
    import { onMount } from 'svelte';
    import EventDialog from './EventDialog.svelte';
    import EventTimeline from './EventTimeline.svelte';
    import StarIcon from '@lucide/svelte/icons/star';
    import DiamondIcon from '@lucide/svelte/icons/diamond';
    import CircleIcon from '@lucide/svelte/icons/circle';
    import ListIcon from '@lucide/svelte/icons/list';
    import XIcon from '@lucide/svelte/icons/x';
    import DownloadIcon from '@lucide/svelte/icons/download';
    import UploadIcon from '@lucide/svelte/icons/upload';
    import { ageAtWeek, weekRangeLabel } from '$lib/weekUtils';
    import { downloadExport, importFromFile } from '$lib/dataIO';

    const userData = $derived($userDataStore);
    const events = $derived($lifeEventsStore ?? []);

    $effect(() => {
        if (!userData) goto('/setup');
    });

    const birthday = $derived(userData?.birthday);
    const lifeExpectancy = $derived(userData?.lifeExpectancy);
    const locale = $derived(userData?.locale ?? 'en-US');

    function handleReset() {
        userDataStore.set(null);
        lifeEventsStore.set([]);
        goto('/setup');
    }

    const weeksLived = $derived(birthday ? Math.floor((Date.now() - new Date(birthday).getTime()) / (7 * 24 * 60 * 60 * 1000)) : 0);
    const weeksLeft = $derived(lifeExpectancy ? (lifeExpectancy * 52) - weeksLived : 0);
    const totalWeeks = $derived(lifeExpectancy ? lifeExpectancy * 52 : 0);
    const lifeProgress = $derived(totalWeeks ? (weeksLived / totalWeeks) * 100 : 0);

    // weekIndex -> LifeEvent[] (all events at that week, sorted by date)
    const eventsByWeek = $derived.by(() => {
        const m = new Map<number, LifeEvent[]>();
        for (const ev of events) {
            const list = m.get(ev.weekIndex);
            if (list) list.push(ev);
            else m.set(ev.weekIndex, [ev]);
        }
        for (const list of m.values()) {
            list.sort((a, b) => a.date.localeCompare(b.date));
        }
        return m;
    });

    // The marker shown on the cell uses the highest-priority event type
    const priority = { 'turning-point': 3, milestone: 2, event: 1 } as const;
    function topEvent(list: LifeEvent[] | undefined): LifeEvent | null {
        if (!list || list.length === 0) return null;
        return list.reduce((best, ev) =>
            priority[ev.type] > priority[best.type] ? ev : best
        );
    }

    function eraVar(year: number): string {
        const idx = Math.min(Math.floor(year / 10), 9);
        return `var(--era-${idx + 1})`;
    }

    const nowWeekIndex = $derived(weeksLived);

    // Dialog state — we now only need to track which week is active
    let dialogOpen = $state(false);
    let activeWeekIndex = $state(0);

    // Mobile timeline drawer
    let timelineOpen = $state(false);

    function openWeek(weekIndex: number) {
        activeWeekIndex = weekIndex;
        dialogOpen = true;
        clearHover();
    }

    function openEvent(event: LifeEvent) {
        activeWeekIndex = event.weekIndex;
        dialogOpen = true;
        timelineOpen = false;
    }

    function closeDialog() { dialogOpen = false; }

    let fileInput: HTMLInputElement | null = $state(null);
    let importStatus = $state<{ ok: true; eventsImported: number; userDataImported: boolean } | null>(null);
    let importError = $state<string | null>(null);

    function handleExport() {
        downloadExport();
    }

    function handleImportClick() {
        fileInput?.click();
    }

    async function handleImport(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        const result = await importFromFile(file);
        if (result.ok) {
            importStatus = result;
            importError = null;
        } else {
            importError = result.error;
            importStatus = null;
        }
        target.value = '';
        setTimeout(() => {
            importStatus = null;
            importError = null;
        }, 4000);
    }

    // ===== Hover preview ==========================================
    let hoverWeek = $state<number | null>(null);
    let hoverX = $state(0);
    let hoverY = $state(0);
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;

    function handleEnter(weekIndex: number, e: MouseEvent | FocusEvent) {
        if (hoverTimer) clearTimeout(hoverTimer);
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        hoverX = rect.left + rect.width / 2;
        hoverY = rect.top;
        const list = eventsByWeek.get(weekIndex);
        const delay = list && list.length > 0 ? 120 : 220;
        hoverTimer = setTimeout(() => {
            hoverWeek = weekIndex;
        }, delay);
    }
    function clearHover() {
        if (hoverTimer) clearTimeout(hoverTimer);
        hoverTimer = null;
        hoverWeek = null;
    }

    const hoverEvents = $derived(hoverWeek !== null ? (eventsByWeek.get(hoverWeek) ?? []) : []);
    const hoverAge = $derived(hoverWeek !== null ? ageAtWeek(hoverWeek) : { years: 0, weeks: 0 });
    const hoverRange = $derived(
        hoverWeek !== null && birthday ? weekRangeLabel(birthday, hoverWeek, locale) : ''
    );

    onMount(() => {
        let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta') as HTMLMetaElement;
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    });

    const milestoneCount = $derived(events.filter((e) => e.type === 'milestone').length);
    const turningPointCount = $derived(events.filter((e) => e.type === 'turning-point').length);
    const eventCount = $derived(events.filter((e) => e.type === 'event').length);

    const eraLabels = [
        { decade: 0, label: 'Childhood' },
        { decade: 1, label: 'Adolescence' },
        { decade: 2, label: 'Twenties' },
        { decade: 3, label: 'Thirties' },
        { decade: 4, label: 'Forties' },
        { decade: 5, label: 'Fifties' },
        { decade: 6, label: 'Sixties' },
        { decade: 7, label: 'Seventies' },
        { decade: 8, label: 'Eighties' },
        { decade: 9, label: 'Nineties+' }
    ];
    const visibleEras = $derived(eraLabels.slice(0, Math.min(10, Math.ceil((lifeExpectancy ?? 0) / 10))));

    function iconFor(t: LifeEvent['type']) {
        if (t === 'milestone') return StarIcon;
        if (t === 'turning-point') return DiamondIcon;
        return CircleIcon;
    }
    function colorFor(t: LifeEvent['type']) {
        if (t === 'milestone') return 'text-marker-milestone';
        if (t === 'turning-point') return 'text-marker-turning';
        return 'text-foreground/70';
    }

    const dateFmt = $derived(
        new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    );
</script>

{#if userData}
    <div class="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 pt-8 sm:pt-12 pb-20 pt-[max(env(safe-area-inset-top),2rem)] pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] pb-[max(env(safe-area-inset-bottom),5rem)]">
        <!-- Editorial masthead ============================================ -->
        <header class="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-12 mb-12 sm:mb-16">
            <div class="lg:col-span-7 lg:col-start-1 rise">
                <p class="eyebrow mb-4">A life in {totalWeeks.toLocaleString()} weeks</p>
                <h2 class="text-balance leading-[1.05]">
                    <span class="italic-display text-primary">{lifeProgress.toFixed(1)}%</span>
                    of your weeks<br /> are now behind you.
                </h2>
            </div>

            <aside class="lg:col-span-4 lg:col-start-9 rise rise-delay-2">
                <dl class="border-l border-border pl-6 sm:pl-8 space-y-7">
                    <div>
                        <dt class="eyebrow mb-1">Weeks lived</dt>
                        <dd class="display-number text-3xl sm:text-4xl tabular text-foreground">
                            {weeksLived.toLocaleString()}
                        </dd>
                    </div>
                    <div>
                        <dt class="eyebrow mb-1">Weeks remaining</dt>
                        <dd class="display-number text-3xl sm:text-4xl tabular text-foreground/70">
                            {weeksLeft.toLocaleString()}
                        </dd>
                    </div>
                    {#if events.length > 0}
                        <hr class="rule" />
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <dt class="eyebrow mb-1 text-[0.6rem]">Events</dt>
                                <dd class="font-serif text-2xl tabular">{eventCount}</dd>
                            </div>
                            <div>
                                <dt class="eyebrow mb-1 text-[0.6rem]">Milestones</dt>
                                <dd class="font-serif text-2xl tabular text-marker-milestone">{milestoneCount}</dd>
                            </div>
                            <div>
                                <dt class="eyebrow mb-1 text-[0.6rem]">Turns</dt>
                                <dd class="font-serif text-2xl tabular text-marker-turning">{turningPointCount}</dd>
                            </div>
                        </div>
                    {/if}
                </dl>
            </aside>
        </header>

        <!-- Main two-column layout: Grid + Timeline ====================== -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12">

            <section class="lg:col-span-8 lg:col-start-1 rise rise-delay-2">
                <div class="flex items-baseline justify-between mb-4">
                    <h3 class="font-serif text-xl">Your weeks, all of them.</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        class="lg:hidden text-muted-foreground hover:text-foreground"
                        onclick={() => (timelineOpen = true)}
                    >
                        <ListIcon class="h-4 w-4 mr-1.5" />
                        Timeline
                    </Button>
                </div>

                <p class="text-sm text-muted-foreground mb-6 max-w-xl leading-relaxed">
                    Each square is one week of your life. <em>Hover</em> to peek,
                    <em>tap</em> to add or revise — a milestone <span class="text-marker-milestone">★</span>,
                    a turning point <span class="text-marker-turning">◆</span>, or any moment worth keeping.
                </p>

                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="relative -mx-2 sm:mx-0 overflow-x-auto" role="presentation" onmouseleave={clearHover}>
                    <div class="flex min-w-max items-start gap-3 sm:gap-4 px-2 sm:px-0">
                        <!-- Year axis — parallel CSS grid with identical row pitch to the cells -->
                        <div
                            class="grid grid-flow-row auto-rows-[8px] sm:auto-rows-[12px] gap-[2px] sm:gap-[3px] text-[10px] sm:text-[11px] tabular text-muted-foreground/70"
                        >
                            {#each Array.from({ length: Math.ceil(totalWeeks / 52) }, (_, i) => i) as year}
                                <div class="flex items-center leading-none whitespace-nowrap overflow-visible">
                                    {#if year === 0}
                                        <span class="font-serif italic">birth</span>
                                    {:else if year % 10 === 0}
                                        <span class="font-serif italic">{year}</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>

                        <!-- The 52-column dot grid -->
                        <div
                            class="grid grid-cols-52 gap-[2px] sm:gap-[3px] w-fit"
                            role="grid"
                            aria-label="Life in weeks"
                        >
                            {#each Array.from({ length: totalWeeks }, (_, i) => i) as weekIndex}
                                {@const year = Math.floor(weekIndex / 52)}
                                {@const isPast = weekIndex < weeksLived}
                                {@const isNow = weekIndex === nowWeekIndex}
                                {@const list = eventsByWeek.get(weekIndex)}
                                {@const ev = topEvent(list)}
                                {@const count = list?.length ?? 0}
                                <button
                                    type="button"
                                    onclick={() => openWeek(weekIndex)}
                                    onmouseenter={(e) => handleEnter(weekIndex, e)}
                                    onfocus={(e) => handleEnter(weekIndex, e)}
                                    onmouseleave={clearHover}
                                    onblur={clearHover}
                                    class={cn(
                                        "relative w-[8px] h-[8px] sm:w-[12px] sm:h-[12px] rounded-[2px] cursor-pointer",
                                        "transition-transform duration-200 ease-out hover:scale-[1.8] hover:z-10 focus-visible:scale-[1.8] focus-visible:z-10 focus:outline-none",
                                        ev && 'outline outline-1 outline-foreground/40 outline-offset-[1px]',
                                        isNow && 'animate-pulse'
                                    )}
                                    style:background-color={isPast ? eraVar(year) : `oklch(from ${eraVar(year)} l c h / 0.18)`}
                                    aria-label={count > 0
                                        ? `Week ${weekIndex + 1}, ${count} ${count === 1 ? 'event' : 'events'}`
                                        : `Week ${weekIndex + 1}, year ${year}, no event`}
                                >
                                    {#if ev?.type === 'milestone'}
                                        <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <StarIcon class="h-[7px] w-[7px] sm:h-[10px] sm:w-[10px] text-marker-milestone" style="fill: currentColor;" />
                                        </span>
                                    {:else if ev?.type === 'turning-point'}
                                        <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <DiamondIcon class="h-[7px] w-[7px] sm:h-[10px] sm:w-[10px] text-marker-turning" style="fill: currentColor;" />
                                        </span>
                                    {:else if ev}
                                        <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span class="block w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-foreground/85"></span>
                                        </span>
                                    {/if}

                                    <!-- Stack badge: show count when >1 events on this week -->
                                    {#if count > 1}
                                        <span
                                            class="absolute -top-[3px] -right-[3px] sm:-top-[4px] sm:-right-[4px] flex items-center justify-center min-w-[10px] h-[10px] sm:min-w-[12px] sm:h-[12px] px-[2px] rounded-full bg-primary text-primary-foreground text-[7px] sm:text-[8px] font-semibold tabular leading-none pointer-events-none"
                                            aria-hidden="true"
                                        >
                                            {count}
                                        </span>
                                    {/if}
                                </button>
                            {/each}
                        </div>

                        <!-- Era axis — each era spans 10 rows of pitch 15px (sm) -->
                        <div class="hidden sm:flex flex-col text-[10px] tabular text-muted-foreground ml-2">
                            {#each visibleEras as era}
                                <div class="h-[150px] flex items-start leading-none">
                                    <span
                                        class="font-serif italic whitespace-nowrap"
                                        style:color="oklch(from {`var(--era-${era.decade + 1})`} l c h)"
                                    >
                                        {era.label}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Legend -->
                <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                    <div class="flex items-center gap-1.5">
                        <span class="block w-3 h-3 rounded-[2px] bg-era-5"></span>
                        <span>Lived</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="block w-3 h-3 rounded-[2px]" style="background-color: oklch(from var(--era-5) l c h / 0.18);"></span>
                        <span>Remaining</span>
                    </div>
                    <div class="h-3 w-px bg-border"></div>
                    <div class="flex items-center gap-1.5">
                        <span class="block w-1 h-1 rounded-full bg-foreground/85"></span>
                        <span>Event</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <StarIcon class="h-3 w-3 text-marker-milestone" style="fill: currentColor;" />
                        <span>Milestone</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <DiamondIcon class="h-3 w-3 text-marker-turning" style="fill: currentColor;" />
                        <span>Turning point</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="flex items-center justify-center min-w-[12px] h-[12px] px-[2px] rounded-full bg-primary text-primary-foreground text-[8px] font-semibold tabular">2</span>
                        <span>Multiple</span>
                    </div>
                </div>

                <div class="mt-16 flex items-center justify-between">
                    <div class="ornament" aria-hidden="true">❦</div>
                    <div class="flex items-center gap-4">
                        <button
                            type="button"
                            onclick={handleExport}
                            class="text-xs text-muted-foreground/70 hover:text-foreground underline-offset-4 hover:underline transition-colors inline-flex items-center gap-1.5"
                        >
                            <DownloadIcon class="h-3 w-3" />
                            Export
                        </button>
                        <button
                            type="button"
                            onclick={handleImportClick}
                            class="text-xs text-muted-foreground/70 hover:text-foreground underline-offset-4 hover:underline transition-colors inline-flex items-center gap-1.5"
                        >
                            <UploadIcon class="h-3 w-3" />
                            Import
                        </button>
                        <input
                            bind:this={fileInput}
                            type="file"
                            accept=".json"
                            class="hidden"
                            onchange={handleImport}
                        />
                        <AlertDialog>
                            <AlertDialogTrigger
                                class="text-xs text-muted-foreground/70 hover:text-destructive underline-offset-4 hover:underline transition-colors"
                            >
                                Reset
                            </AlertDialogTrigger>
                            <AlertDialogContent class="w-[95vw] max-w-md mx-2 sm:mx-auto bg-card border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle class="font-serif text-2xl">
                                        Begin again?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription class="prose-body text-sm">
                                        This will erase your birthday, lifespan, and every event you've recorded.
                                        The grid will be blank, like a new notebook. There is no undo.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter class="gap-2 sm:gap-3">
                                    <AlertDialogCancel class="rounded-full">Keep it</AlertDialogCancel>
                                    <AlertDialogAction
                                        class="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
                                        onclick={handleReset}
                                    >
                                        Erase everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {#if importStatus}
                    <p class="mt-3 text-xs text-muted-foreground italic-display tabular rise">
                        Imported {importStatus.eventsImported} event{importStatus.eventsImported !== 1 ? 's' : ''}{importStatus.userDataImported ? ' and settings' : ''}.
                    </p>
                {:else if importError}
                    <p class="mt-3 text-xs text-destructive rise">{importError}</p>
                {/if}
            </section>

            <aside class="hidden lg:block lg:col-span-4 lg:col-start-9 rise rise-delay-3">
                <div class="sticky top-6">
                    <EventTimeline locale={locale} onSelect={openEvent} />
                </div>
            </aside>
        </div>
    </div>

    <!-- Hover preview tooltip ========================================= -->
    {#if hoverWeek !== null && hoverEvents.length > 0}
        <div
            class="pointer-events-none fixed z-[60] hidden sm:block"
            style:left="{Math.max(12, Math.min(hoverX, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 332))}px"
            style:top="{hoverY}px"
            style:transform="translate(-50%, calc(-100% - 14px))"
        >
            <div class="bg-card border border-border shadow-2xl rounded-lg p-3.5 w-[20rem] max-w-[calc(100vw-1.5rem)]">
                <p class="eyebrow text-[0.6rem] mb-2">
                    Week {hoverWeek + 1} · Age {hoverAge.years}<span class="opacity-60">y</span> {hoverAge.weeks}<span class="opacity-60">w</span>
                    <span class="ml-1 text-muted-foreground/60 normal-case tracking-normal">· {hoverRange}</span>
                </p>
                <ul class="space-y-2.5">
                    {#each hoverEvents as ev (ev.id)}
                        {@const Icon = iconFor(ev.type)}
                        <li class="flex items-start gap-2.5">
                            <span class={cn('mt-1 shrink-0', colorFor(ev.type))}>
                                <Icon
                                    class="h-3 w-3"
                                    style={ev.type !== 'event' ? 'fill: currentColor;' : ''}
                                />
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="font-serif text-sm leading-snug truncate">{ev.title}</p>
                                <p class="text-[10px] text-muted-foreground tabular mt-0.5">
                                    {dateFmt.format(new Date(ev.date))}
                                </p>
                                {#if ev.description}
                                    <p class="text-[11px] text-muted-foreground/85 mt-1 line-clamp-2 leading-snug">
                                        {ev.description}
                                    </p>
                                {/if}
                            </div>
                        </li>
                    {/each}
                </ul>
                {#if hoverEvents.length > 1}
                    <p class="mt-3 pt-2 border-t border-border/60 text-[10px] text-muted-foreground italic">
                        Click to view all {hoverEvents.length} entries.
                    </p>
                {:else}
                    <p class="mt-3 pt-2 border-t border-border/60 text-[10px] text-muted-foreground italic">
                        Click to edit.
                    </p>
                {/if}
            </div>
        </div>
    {:else if hoverWeek !== null}
        {@const isPastHover = hoverWeek < weeksLived}
        {@const isNowHover = hoverWeek === nowWeekIndex}
        <div
            class="pointer-events-none fixed z-[60] hidden sm:block"
            style:left="{Math.max(12, Math.min(hoverX, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 232))}px"
            style:top="{hoverY}px"
            style:transform="translate(-50%, calc(-100% - 12px))"
        >
            <div class="bg-card/95 backdrop-blur-sm border border-border/80 shadow-xl rounded-md px-3 py-2 w-[14rem]">
                <p class="eyebrow text-[0.6rem] mb-1.5 flex items-center gap-1.5">
                    <span>Week {hoverWeek + 1}</span>
                    {#if isNowHover}
                        <span class="text-primary normal-case tracking-normal italic font-serif">· this week</span>
                    {:else if isPastHover}
                        <span class="text-muted-foreground/70 normal-case tracking-normal italic font-serif">· lived</span>
                    {:else}
                        <span class="text-muted-foreground/70 normal-case tracking-normal italic font-serif">· ahead</span>
                    {/if}
                </p>
                <p class="font-serif text-sm tabular leading-snug">
                    Age <span class="text-foreground">{hoverAge.years}</span><span class="text-muted-foreground/70">y</span>
                    <span class="text-foreground ml-0.5">{hoverAge.weeks}</span><span class="text-muted-foreground/70">w</span>
                </p>
                <p class="text-[10px] text-muted-foreground tabular mt-1">
                    {hoverRange}
                </p>
                <p class="mt-2 pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground italic">
                    Click to mark this week.
                </p>
            </div>
        </div>
    {/if}

    <!-- Mobile timeline drawer ========================================= -->
    {#if timelineOpen}
        <div
            class="lg:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-md"
            onclick={() => (timelineOpen = false)}
            onkeydown={(e) => e.key === 'Escape' && (timelineOpen = false)}
            role="button"
            tabindex="-1"
            aria-label="Close timeline"
        ></div>
        <aside class="lg:hidden fixed right-0 top-0 bottom-0 w-[88vw] max-w-sm z-50 bg-card border-l border-border shadow-2xl flex flex-col">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border">
                <p class="eyebrow">Timeline</p>
                <button
                    type="button"
                    onclick={() => (timelineOpen = false)}
                    class="text-muted-foreground hover:text-foreground p-1 -mr-1"
                    aria-label="Close timeline"
                >
                    <XIcon class="h-5 w-5" />
                </button>
            </div>
            <div class="flex-1 overflow-hidden p-5">
                <EventTimeline locale={locale} onSelect={openEvent} />
            </div>
        </aside>
    {/if}

    {#if birthday}
        <EventDialog
            bind:open={dialogOpen}
            birthday={birthday}
            weekIndex={activeWeekIndex}
            locale={locale}
            onClose={closeDialog}
        />
    {/if}
{/if}
