/**
 * Extract the video ID from a YouTube URL
 * 
 * @param url YouTube URL
 * @returns Video ID or null if not a valid YouTube URL
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  // Regular expressions for different YouTube URL formats
  const regexps = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?=.*v=([^&]+))(?:\S+)?$/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([^/?]+)(?:\S+)?$/,
    /^https?:\/\/(?:www\.)?youtube\.com\/v\/([^/?]+)(?:\S+)?$/,
    /^https?:\/\/youtu\.be\/([^/?]+)(?:\S+)?$/,
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([^/?]+)(?:\S+)?$/
  ];
  
  for (const regexp of regexps) {
    const match = url.match(regexp);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Format view count with commas
 * 
 * @param count View count as a number or string
 * @returns Formatted count with commas
 */
export function formatViewCount(count: number | string): string {
  const numCount = typeof count === 'string' ? parseInt(count, 10) : count;
  return numCount.toLocaleString();
}

/**
 * Format duration from ISO 8601 format to HH:MM:SS
 * 
 * @param isoDuration YouTube duration in ISO 8601 format
 * @returns Formatted duration string
 */
export function formatDuration(isoDuration: string): string {
  if (!isoDuration) return '';
  
  // ISO 8601 duration format: PT#H#M#S
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '';
  
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
} 