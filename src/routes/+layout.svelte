<script lang="ts">
	import '../app.css';
	import TopBar from '$lib/components/TopBar.svelte';
	import { onMount } from 'svelte';
	import { userDataStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ModeWatcher } from "mode-watcher";

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js')
				.then(() => console.log('ServiceWorker registration successful'))
				.catch(err => console.error('ServiceWorker registration failed:', err));
		}

		const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone ||
			document.referrer.includes('android-app://');

		if (isPWA && $userDataStore && $page.url.pathname === '/') {
			goto('/stats');
		}
	});
</script>

<ModeWatcher />
<div class="paper min-h-screen text-foreground">
	<TopBar />
	<main class="min-h-[calc(100vh-4rem)]">
		<slot />
	</main>
</div>

<svelte:head>
	<title>Your Life in Weeks</title>
	<meta name="description" content="A quiet, considered way to see your life as a grid of weeks — and mark the moments that shaped it." />

	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#f5efe6" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="Life Progress" />
	<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

	<meta name="format-detection" content="telephone=no" />
</svelte:head>
