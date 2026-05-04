<!-- TopBar.svelte — editorial masthead -->
<script lang="ts">
    import SunIcon from "@lucide/svelte/icons/sun";
    import MoonIcon from "@lucide/svelte/icons/moon";
    import { toggleMode } from "mode-watcher";
    import { onMount } from 'svelte';

    let isIOS = $state(false);

    onMount(() => {
        isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    });
</script>

<header class="relative {isIOS ? 'mt-[env(safe-area-inset-top)]' : ''}">
    <div class="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div class="flex h-16 items-center justify-between">
            <!-- Wordmark -->
            <a href="/" class="group flex items-baseline gap-2 select-none">
                <span class="font-serif italic text-xl tracking-tight text-foreground transition-colors">
                    Life
                </span>
                <span class="eyebrow text-foreground/60 group-hover:text-primary transition-colors">
                    in&nbsp;weeks
                </span>
            </a>

            <!-- Theme toggle: minimal, no border, no shadow -->
            <button
                type="button"
                onclick={toggleMode}
                class="group relative flex h-9 w-9 items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                aria-label="Toggle theme"
            >
                <SunIcon class="h-[1.05rem] w-[1.05rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                <MoonIcon class="absolute h-[1.05rem] w-[1.05rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
            </button>
        </div>
    </div>
    <hr class="rule mx-auto max-w-[1400px]" />
</header>
