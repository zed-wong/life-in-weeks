<script lang="ts">
    import { lifeEventsStore, type LifeEvent } from '$lib/stores';
    import { ageAtWeek } from '$lib/weekUtils';
    import { cn } from '$lib/utils';
    import StarIcon from '@lucide/svelte/icons/star';
    import DiamondIcon from '@lucide/svelte/icons/diamond';
    import CircleIcon from '@lucide/svelte/icons/circle';
    import SearchIcon from '@lucide/svelte/icons/search';

    type Props = {
        locale?: string;
        onSelect: (event: LifeEvent) => void;
    };

    let { locale = 'en-US', onSelect }: Props = $props();

    const events = $derived($lifeEventsStore ?? []);

    let search = $state('');
    let activeFilter = $state<'all' | 'event' | 'milestone' | 'turning-point'>('all');

    const filtered = $derived(
        events
            .filter((e) => {
                if (activeFilter !== 'all' && e.type !== activeFilter) return false;
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                    e.title.toLowerCase().includes(q) ||
                    (e.description ?? '').toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q))
                );
            })
            .slice()
            .sort((a, b) => b.weekIndex - a.weekIndex)
    );

    const dateFmt = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    function iconFor(type: LifeEvent['type']) {
        if (type === 'milestone') return StarIcon;
        if (type === 'turning-point') return DiamondIcon;
        return CircleIcon;
    }

    function colorFor(type: LifeEvent['type']) {
        if (type === 'milestone') return 'text-marker-milestone';
        if (type === 'turning-point') return 'text-marker-turning';
        return 'text-foreground/70';
    }

    const filters: { value: typeof activeFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'milestone', label: 'Milestones' },
        { value: 'turning-point', label: 'Turns' },
        { value: 'event', label: 'Events' }
    ];
</script>

<div class="flex flex-col gap-5 h-full max-h-[calc(100vh-8rem)]">
    <!-- Editorial header -->
    <div class="border-l-2 border-primary pl-4">
        <p class="eyebrow mb-1">The thread</p>
        <h3 class="font-serif text-xl leading-tight">
            <span class="tabular">{events.length}</span>
            {events.length === 1 ? 'entry' : 'entries'}
            {#if events.length > 0}
                <span class="text-muted-foreground italic-display text-base font-normal">in your book</span>
            {/if}
        </h3>
    </div>

    <!-- Search -->
    <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
            bind:value={search}
            placeholder="Search entries…"
            class="w-full h-10 pl-9 pr-3 text-sm bg-transparent border-0 border-b border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground/60 placeholder:italic"
        />
    </div>

    <!-- Filter pills -->
    <div class="flex flex-wrap gap-1.5">
        {#each filters as f}
            <button
                type="button"
                onclick={() => (activeFilter = f.value)}
                class={cn(
                    'rounded-full px-3 py-1 text-xs transition-all',
                    activeFilter === f.value
                        ? 'bg-foreground text-background'
                        : 'bg-transparent text-muted-foreground hover:text-foreground border border-border hover:border-foreground/40'
                )}
            >
                {f.label}
            </button>
        {/each}
    </div>

    <!-- Entries list -->
    <div class="flex-1 overflow-y-auto -mx-2 px-2 pb-4">
        {#if filtered.length === 0}
            <div class="prose-body text-sm italic text-center py-12 px-4 max-w-xs mx-auto">
                {#if events.length === 0}
                    Nothing yet. Click any week in the grid to begin your record.
                {:else}
                    Nothing matches that search.
                {/if}
            </div>
        {:else}
            <ol class="relative space-y-0">
                <!-- Vertical thread line -->
                <span class="absolute left-[7px] top-2 bottom-2 w-px bg-border/80" aria-hidden="true"></span>

                {#each filtered as event, i (event.id)}
                    {@const Icon = iconFor(event.type)}
                    {@const age = ageAtWeek(event.weekIndex)}
                    <li class="relative pl-7">
                        <button
                            type="button"
                            onclick={() => onSelect(event)}
                            class="group block w-full text-left py-3 pr-2 -ml-1 pl-1 rounded-md hover:bg-muted/40 transition-colors"
                        >
                            <!-- Marker on the thread -->
                            <span class="absolute left-0 top-4 flex items-center justify-center w-[15px] h-[15px] rounded-full bg-card border border-border group-hover:border-primary transition-colors">
                                <Icon
                                    class={cn('h-[8px] w-[8px]', colorFor(event.type))}
                                    style={event.type !== 'event' ? 'fill: currentColor;' : ''}
                                />
                            </span>

                            <div class="flex items-baseline justify-between gap-3">
                                <p class="font-serif text-base leading-snug truncate group-hover:text-primary transition-colors">
                                    {event.title}
                                </p>
                                <span class="text-[10px] text-muted-foreground tabular whitespace-nowrap shrink-0 mt-0.5">
                                    age {age.years}
                                </span>
                            </div>

                            <p class="text-[11px] text-muted-foreground tabular mt-0.5">
                                {dateFmt.format(new Date(event.date))}
                            </p>

                            {#if event.description}
                                <p class="text-xs text-muted-foreground/90 mt-1.5 leading-relaxed line-clamp-2">
                                    {event.description}
                                </p>
                            {/if}

                            {#if event.tags.length > 0}
                                <div class="flex flex-wrap gap-1 mt-2">
                                    {#each event.tags as tag}
                                        <span class="text-[10px] text-muted-foreground/80 italic">
                                            #{tag}
                                        </span>
                                    {/each}
                                </div>
                            {/if}
                        </button>
                    </li>
                {/each}
            </ol>
        {/if}
    </div>
</div>
