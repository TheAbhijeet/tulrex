export function slugify(text: string): string {
    return text
        .toString() // Ensure string type
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading/trailing whitespace
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
