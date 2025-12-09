/**
 * Generates a URL-friendly slug from an article title
 * @param title - The article title
 * @param id - Optional article ID to ensure uniqueness
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string, id?: string): string {
  // Convert to lowercase and replace spaces/special chars with hyphens
  let slug = title
    .toLowerCase()
    .trim()
    // Replace common special characters
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100);

  // If slug is empty or too short, use a fallback
  if (!slug || slug.length < 3) {
    slug = 'article';
  }

  // Append article ID for uniqueness if provided
  if (id) {
    const shortId = id.substring(0, 8);
    slug = `${slug}-${shortId}`;
  }

  return slug;
}

/**
 * Extracts article ID from a slug if it was appended
 * @param slug - The slug to parse
 * @returns The article ID if found, null otherwise
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like an ID (8+ characters, alphanumeric)
  if (lastPart && lastPart.length >= 8 && /^[a-z0-9]+$/.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}

