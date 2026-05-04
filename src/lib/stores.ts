import { writable } from 'svelte/store';

// Define the type for our user data
export interface UserData {
    birthday: string;
    lifeExpectancy: number;
    locale: string;
}

// Event types: regular events, milestones, and turning points
export type LifeEventType = 'event' | 'milestone' | 'turning-point';

export interface LifeEvent {
    id: string;
    weekIndex: number;       // anchored to a specific week (0 = birth week)
    date: string;            // ISO date string for precise display
    title: string;
    description?: string;
    type: LifeEventType;
    tags: string[];
    color?: string;
}

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
    if (typeof window === 'undefined') return null; // SSR check
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
    }
};

// Helper function to safely set localStorage
const setLocalStorage = (key: string, value: string): void => {
    if (typeof window === 'undefined') return; // SSR check
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error('Error setting localStorage:', e);
    }
};

// Create a custom store with localStorage persistence
function createPersistedStore<T>(key: string, initialValue: T | null = null) {
    // Try to load initial value from localStorage
    const storedValue = getLocalStorage(key);
    const initial = storedValue ? JSON.parse(storedValue) : initialValue;

    // Create the writable store
    const { subscribe, set, update } = writable<T | null>(initial);

    // Return a custom store with persistence
    return {
        subscribe,
        set: (value: T | null) => {
            if (value === null) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(key);
                }
            } else {
                setLocalStorage(key, JSON.stringify(value));
            }
            set(value);
        },
        update: (callback: (value: T | null) => T | null) => {
            update((value) => {
                const newValue = callback(value);
                if (newValue === null) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(key);
                    }
                } else {
                    setLocalStorage(key, JSON.stringify(newValue));
                }
                return newValue;
            });
        }
    };
}

// Create and export the userData store
export const userDataStore = createPersistedStore<UserData>('user-data');

// Create and export the lifeEvents store (an array of events, persisted)
export const lifeEventsStore = createPersistedStore<LifeEvent[]>('life-events', []);

// Helpers to add / update / remove individual events while persisting
export function addLifeEvent(event: LifeEvent): void {
    lifeEventsStore.update((events) => [...(events ?? []), event]);
}

export function updateLifeEvent(id: string, patch: Partial<LifeEvent>): void {
    lifeEventsStore.update((events) =>
        (events ?? []).map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
}

export function removeLifeEvent(id: string): void {
    lifeEventsStore.update((events) => (events ?? []).filter((e) => e.id !== id));
}
