// Utilities for converting between week indices and dates.
// weekIndex 0 = the 7-day window that begins on the user's birthday.

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function dateToWeekIndex(birthday: string | Date, date: string | Date): number {
    const birth = new Date(birthday).getTime();
    const target = new Date(date).getTime();
    return Math.floor((target - birth) / MS_PER_WEEK);
}

export function weekIndexToDate(birthday: string | Date, weekIndex: number): Date {
    const birth = new Date(birthday).getTime();
    return new Date(birth + weekIndex * MS_PER_WEEK);
}

export function weekRangeLabel(birthday: string | Date, weekIndex: number, locale = 'en-US'): string {
    const start = weekIndexToDate(birthday, weekIndex);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    const fmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function ageAtWeek(weekIndex: number): { years: number; weeks: number } {
    return {
        years: Math.floor(weekIndex / 52),
        weeks: weekIndex % 52
    };
}

export function generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISODate(): string {
    return new Date().toISOString().slice(0, 10);
}
