/** Format a YYYY-MM-DD date as a readable, timezone-safe string. */
export function formatDate(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number)
  if (!year || !month || !day) return dateOnly
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}
