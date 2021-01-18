import slug from 'slug';

/**
 * Removes non-word characters and shortens the provided string to include up to `max` words.
 */
function shorten(s: string, max: number): string {
    const words = s.replace(/[^\w\s]/g, '').split(/\s+/);
    if (words.length <= max) {
        return words.join(' ');
    }
    const selected = words.slice(0, max - 1).concat(words.reverse().slice(0, 1));
    return selected.join(' ');
}

/**
 * Produces a URL safe slug from the provided string. By default the slug's length is limited to
 * 5 words, if you'd like a slug without a limit set `maxWords` to `Infinity`.
 */
export function makeSlug(s: string, maxWords: number = 5): string {
    if (maxWords === Infinity) {
        return slug(s);
    }
    return slug(shorten(s, maxWords));
}
