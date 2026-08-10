/**
 * Generates a zero-offset UTC timestamp strictly conforming to ISO-8601.
 * Example: '2026-08-10T11:20:11.000Z'
 */
export function getUtcTimestamp(): string {
  return new Date().toISOString();
}
