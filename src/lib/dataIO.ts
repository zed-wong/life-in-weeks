// Export & import the user's complete life-progress data as JSON.
// Data lives only in the browser, so export = backup / migration.

import {
    userDataStore,
    lifeEventsStore,
    type UserData,
    type LifeEvent
} from '$lib/stores';
import { get } from 'svelte/store';

const SCHEMA_VERSION = 1;

export interface LifeProgressExport {
    schema: 'life-progress';
    version: number;
    exportedAt: string;
    userData: UserData | null;
    events: LifeEvent[];
}

export function buildExport(): LifeProgressExport {
    return {
        schema: 'life-progress',
        version: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        userData: get(userDataStore),
        events: get(lifeEventsStore) ?? []
    };
}

export function downloadExport(): void {
    const data = buildExport();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const today = new Date().toISOString().slice(0, 10);
    const filename = `life-progress-${today}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export type ImportResult =
    | { ok: true; eventsImported: number; userDataImported: boolean }
    | { ok: false; error: string };

export async function importFromFile(file: File): Promise<ImportResult> {
    let parsed: unknown;
    try {
        const text = await file.text();
        parsed = JSON.parse(text);
    } catch {
        return { ok: false, error: 'Could not read the file as JSON.' };
    }

    if (!isValidExport(parsed)) {
        return { ok: false, error: 'This does not look like a Life Progress export.' };
    }

    if (parsed.userData) {
        userDataStore.set(parsed.userData);
    }
    lifeEventsStore.set(parsed.events);

    return {
        ok: true,
        eventsImported: parsed.events.length,
        userDataImported: !!parsed.userData
    };
}

function isValidExport(x: unknown): x is LifeProgressExport {
    if (!x || typeof x !== 'object') return false;
    const o = x as Record<string, unknown>;
    if (o.schema !== 'life-progress') return false;
    if (typeof o.version !== 'number') return false;
    if (!Array.isArray(o.events)) return false;
    // events shape — only do a soft check on first entry
    if (o.events.length > 0) {
        const e = o.events[0] as Record<string, unknown>;
        if (typeof e.id !== 'string' || typeof e.weekIndex !== 'number' || typeof e.title !== 'string') {
            return false;
        }
    }
    return true;
}
