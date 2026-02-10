/**
 * Subdomain utilities for multi-tenant routing.
 * Subdomain format: schoolname.domain.com (e.g. first-school.localhost:3000)
 */

/**
 * Convert school name to URL-safe subdomain slug.
 * e.g. "First School" -> "first-school"
 */
export function nameToSubdomain(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Extract subdomain from host string.
 * Examples:
 *   - "first-school.localhost:3000" -> "first-school"
 *   - "first-school.example.com" -> "first-school"
 *   - "localhost:3000" -> null
 *   - "www.example.com" -> null (www is ignored)
 */
export function extractSubdomain(host: string): string | null {
  if (!host || typeof host !== "string") return null;

  // Remove port if present
  const hostname = host.split(":")[0];

  const parts = hostname.split(".");
  if (parts.length < 2) return null;

  // localhost with subdomain: subdomain.localhost
  if (hostname.endsWith(".localhost")) {
    const sub = parts[0];
    return sub && sub !== "www" ? sub : null;
  }

  // Standard domain: subdomain.example.com (need at least 3 parts for subdomain)
  if (parts.length >= 3) {
    const sub = parts[0];
    return sub && sub !== "www" && sub !== "app" ? sub : null;
  }

  return null;
}
