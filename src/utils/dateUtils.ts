/**
 * Format a date string (YYYY-MM-DD) to a localized date string without timezone conversion.
 * Prevents the common issue where "2025-12-25" becomes Dec 24 when converted via new Date().
 * 
 * @param dateString - Date in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatDateString(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return '';
  
  // Parse the date components directly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create date in local timezone
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a datetime ISO string to a localized date string.
 * Use this for datetime values that should respect timezone.
 * 
 * @param dateTimeString - ISO datetime string
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatDateTime(
  dateTimeString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  return date.toLocaleDateString(undefined, options);
}
