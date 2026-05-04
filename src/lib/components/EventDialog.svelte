<script lang="ts">
    import { Dialog as DialogPrimitive } from 'bits-ui';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import {
        addLifeEvent,
        updateLifeEvent,
        removeLifeEvent,
        lifeEventsStore,
        type LifeEvent,
        type LifeEventType
    } from '$lib/stores';
    import {
        dateToWeekIndex,
        weekIndexToDate,
        weekRangeLabel,
        ageAtWeek,
        generateId
    } from '$lib/weekUtils';
    import StarIcon from '@lucide/svelte/icons/star';
    import DiamondIcon from '@lucide/svelte/icons/diamond';
    import CircleIcon from '@lucide/svelte/icons/circle';
    import TrashIcon from '@lucide/svelte/icons/trash-2';
    import XIcon from '@lucide/svelte/icons/x';
    import PlusIcon from '@lucide/svelte/icons/plus';
    import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
    import { cn } from '$lib/utils';

    type Props = {
        open: boolean;
        birthday: string;
        weekIndex: number;
        locale?: string;
        onClose: () => void;
    };

    let {
        open = $bindable(),
        birthday,
        weekIndex,
        locale = 'en-US',
        onClose
    }: Props = $props();

    // All events at this week, sorted by date asc
    const weekEvents = $derived(
        ($lifeEventsStore ?? [])
            .filter((e) => e.weekIndex === weekIndex)
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
    );

    // Mode: 'list' shows all events for this week; 'form' is create/edit form
    type Mode = { kind: 'list' } | { kind: 'form'; event: LifeEvent | null };
    let mode = $state<Mode>({ kind: 'list' });

    // When the dialog opens, decide initial mode based on what's there
    $effect(() => {
        if (open) {
            // Reset to natural starting view each time it opens
            if (weekEvents.length === 0) {
                mode = { kind: 'form', event: null };
            } else {
                mode = { kind: 'list' };
            }
        }
    });

    // Form state
    let title = $state('');
    let description = $state('');
    let type = $state<LifeEventType>('event');
    let tagsInput = $state('');
    let date = $state('');

    // Initialize form fields whenever we enter form mode
    $effect(() => {
        if (mode.kind === 'form') {
            const ev = mode.event;
            if (ev) {
                title = ev.title;
                description = ev.description ?? '';
                type = ev.type;
                tagsInput = ev.tags.join(', ');
                date = ev.date.slice(0, 10);
            } else {
                title = '';
                description = '';
                type = 'event';
                tagsInput = '';
                date = weekIndexToDate(birthday, weekIndex).toISOString().slice(0, 10);
            }
        }
    });

    const age = $derived(ageAtWeek(weekIndex));
    const rangeLabel = $derived(weekRangeLabel(birthday, weekIndex, locale));

    function backToList() {
        if (weekEvents.length > 0) {
            mode = { kind: 'list' };
        } else {
            onClose();
        }
    }

    function handleSave() {
        if (mode.kind !== 'form') return;
        if (!title.trim()) return;
        const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
        const finalWeekIndex = date ? dateToWeekIndex(birthday, date) : weekIndex;

        if (mode.event) {
            updateLifeEvent(mode.event.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                type,
                tags,
                date: new Date(date).toISOString(),
                weekIndex: finalWeekIndex
            });
        } else {
            addLifeEvent({
                id: generateId(),
                weekIndex: finalWeekIndex,
                date: new Date(date).toISOString(),
                title: title.trim(),
                description: description.trim() || undefined,
                type,
                tags
            });
        }

        // After saving, return to list if there are events here, else close
        // Note: If the event was moved to a different week via date change,
        // the weekEvents list at this week may have shrunk.
        if (finalWeekIndex !== weekIndex) {
            // Event moved to a different week — close dialog
            onClose();
        } else {
            backToList();
        }
    }

    function handleDelete() {
        if (mode.kind !== 'form' || !mode.event) return;
        const evToDelete = mode.event;
        removeLifeEvent(evToDelete.id);
        const remaining = weekEvents.filter((e) => e.id !== evToDelete.id);
        if (remaining.length === 0) {
            onClose();
        } else {
            mode = { kind: 'list' };
        }
    }

    type TypeOpt = {
        value: LifeEventType;
        label: string;
        sublabel: string;
        icon: typeof StarIcon;
        textClass: string;
    };

    const typeOptions: TypeOpt[] = [
        { value: 'event', label: 'Event', sublabel: 'Worth remembering', icon: CircleIcon, textClass: 'text-foreground/80' },
        { value: 'milestone', label: 'Milestone', sublabel: 'A new chapter', icon: StarIcon, textClass: 'text-marker-milestone' },
        { value: 'turning-point', label: 'Turning point', sublabel: 'Life changed here', icon: DiamondIcon, textClass: 'text-marker-turning' }
    ];

    function iconFor(t: LifeEventType) {
        if (t === 'milestone') return StarIcon;
        if (t === 'turning-point') return DiamondIcon;
        return CircleIcon;
    }
    function colorFor(t: LifeEventType) {
        if (t === 'milestone') return 'text-marker-milestone';
        if (t === 'turning-point') return 'text-marker-turning';
        return 'text-foreground/70';
    }

    const dateFmt = $derived(
        new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })
    );
</script>

<DialogPrimitive.Root bind:open>
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-background/70 backdrop-blur-md"
        />
        <DialogPrimitive.Content
            class="bg-card text-card-foreground border border-border fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-xl translate-x-[-50%] translate-y-[-50%] rounded-xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
            <!-- Editorial header band -->
            <div class="px-7 sm:px-9 pt-7 pb-5 border-b border-border/70">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3 min-w-0">
                        {#if mode.kind === 'form' && weekEvents.length > 0}
                            <button
                                type="button"
                                onclick={backToList}
                                class="text-muted-foreground hover:text-foreground rounded-full p-1.5 -ml-1.5 mt-1 transition-colors"
                                aria-label="Back to list"
                            >
                                <ChevronLeftIcon class="h-4 w-4" />
                            </button>
                        {/if}
                        <div class="min-w-0">
                            <p class="eyebrow mb-2">
                                Week {weekIndex + 1} · Age {age.years}<span class="opacity-60">y</span> {age.weeks}<span class="opacity-60">w</span>
                            </p>
                            <DialogPrimitive.Title class="font-serif text-2xl sm:text-[1.75rem] leading-tight">
                                {#if mode.kind === 'list'}
                                    <span>This week,</span>
                                    <span class="italic-display text-primary">{weekEvents.length}</span>
                                    <span>{weekEvents.length === 1 ? 'entry' : 'entries'}</span>
                                {:else if mode.event}
                                    <span class="italic-display text-primary">Revising</span>
                                {:else}
                                    <span>A new entry</span>
                                {/if}
                            </DialogPrimitive.Title>
                            <DialogPrimitive.Description class="text-xs text-muted-foreground mt-1 tabular">
                                {rangeLabel}
                            </DialogPrimitive.Description>
                        </div>
                    </div>
                    <button
                        type="button"
                        onclick={onClose}
                        class="text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors -mt-1 -mr-1 shrink-0"
                        aria-label="Close"
                    >
                        <XIcon class="h-4 w-4" />
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="max-h-[60vh] overflow-y-auto">
                {#if mode.kind === 'list'}
                    <!-- LIST MODE: events at this week ============================ -->
                    <ol class="px-7 sm:px-9 py-6 space-y-1">
                        {#each weekEvents as ev (ev.id)}
                            {@const Icon = iconFor(ev.type)}
                            <li>
                                <button
                                    type="button"
                                    onclick={() => (mode = { kind: 'form', event: ev })}
                                    class="group w-full flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/50 text-left transition-colors"
                                >
                                    <span class={cn('mt-1.5 shrink-0', colorFor(ev.type))}>
                                        <Icon
                                            class="h-3.5 w-3.5"
                                            style={ev.type !== 'event' ? 'fill: currentColor;' : ''}
                                        />
                                    </span>
                                    <div class="min-w-0 flex-1">
                                        <p class="font-serif text-base leading-snug truncate group-hover:text-primary transition-colors">
                                            {ev.title}
                                        </p>
                                        <p class="text-[11px] text-muted-foreground tabular mt-0.5">
                                            {dateFmt.format(new Date(ev.date))}
                                        </p>
                                        {#if ev.description}
                                            <p class="text-xs text-muted-foreground/90 mt-1 leading-relaxed line-clamp-2">
                                                {ev.description}
                                            </p>
                                        {/if}
                                        {#if ev.tags.length > 0}
                                            <div class="flex flex-wrap gap-1 mt-1.5">
                                                {#each ev.tags as tag}
                                                    <span class="text-[10px] text-muted-foreground/80 italic">
                                                        #{tag}
                                                    </span>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </button>
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <!-- FORM MODE: create or edit ============================ -->
                    <div class="px-7 sm:px-9 py-7 space-y-6">
                        <fieldset class="space-y-3">
                            <legend class="eyebrow">Kind of moment</legend>
                            <div class="grid grid-cols-3 gap-2">
                                {#each typeOptions as opt}
                                    {@const Icon = opt.icon}
                                    <button
                                        type="button"
                                        onclick={() => (type = opt.value)}
                                        class={cn(
                                            'group flex flex-col items-start gap-1.5 rounded-lg border px-3 py-3 text-left transition-all',
                                            type === opt.value
                                                ? 'border-primary bg-primary/[0.06]'
                                                : 'border-border hover:border-foreground/30 hover:bg-muted/40'
                                        )}
                                    >
                                        <Icon
                                            class={cn('h-4 w-4 transition-transform group-hover:scale-110', opt.textClass)}
                                            style={opt.value !== 'event' ? 'fill: currentColor;' : ''}
                                        />
                                        <div>
                                            <div class={cn('text-sm font-medium leading-tight', type === opt.value && 'text-primary')}>
                                                {opt.label}
                                            </div>
                                            <div class="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                                                {opt.sublabel}
                                            </div>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </fieldset>

                        <div>
                            <label for="event-title" class="eyebrow block mb-2">Title</label>
                            <input
                                id="event-title"
                                bind:value={title}
                                placeholder="e.g. Met someone who would change everything"
                                class="font-serif text-xl w-full bg-transparent border-0 border-b border-border focus:border-primary outline-none pb-2 transition-colors placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:text-base placeholder:italic"
                            />
                        </div>

                        <div>
                            <label for="event-date" class="eyebrow block mb-2">When</label>
                            <Input
                                id="event-date"
                                type="date"
                                bind:value={date}
                                class="bg-transparent border-border tabular"
                            />
                        </div>

                        <div>
                            <label for="event-description" class="eyebrow block mb-2">The story (optional)</label>
                            <textarea
                                id="event-description"
                                bind:value={description}
                                placeholder="What happened? How did it feel? What did you learn?"
                                rows="4"
                                class="w-full rounded-md border border-border bg-transparent px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/60 placeholder:italic focus:border-primary outline-none transition-colors resize-y"
                            ></textarea>
                        </div>

                        <div>
                            <label for="event-tags" class="eyebrow block mb-2">Tags (optional)</label>
                            <Input
                                id="event-tags"
                                bind:value={tagsInput}
                                placeholder="education, family, travel"
                                class="bg-transparent border-border"
                            />
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="px-7 sm:px-9 py-5 border-t border-border/70 bg-muted/30 rounded-b-xl flex items-center justify-between gap-3">
                {#if mode.kind === 'list'}
                    <span class="text-xs text-muted-foreground">
                        Click any entry to edit it.
                    </span>
                    <Button
                        onclick={() => (mode = { kind: 'form', event: null })}
                        class="rounded-full px-5"
                    >
                        <PlusIcon class="h-4 w-4 mr-1" />
                        Add another
                    </Button>
                {:else}
                    <div>
                        {#if mode.event}
                            <button
                                type="button"
                                onclick={handleDelete}
                                class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <TrashIcon class="h-3.5 w-3.5" />
                                Delete entry
                            </button>
                        {/if}
                    </div>
                    <div class="flex gap-2">
                        <Button
                            variant="ghost"
                            onclick={weekEvents.length > 0 ? backToList : onClose}
                            class="rounded-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            onclick={handleSave}
                            disabled={!title.trim()}
                            class="rounded-full px-6"
                        >
                            {mode.event ? 'Save' : 'Add to grid'}
                        </Button>
                    </div>
                {/if}
            </div>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
</DialogPrimitive.Root>
