/**
 * Spotify URL utilities for embed integration.
 * Converts open.spotify.com URLs to embed format (no OAuth required).
 */

const SPOTIFY_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?open\.spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)(?:\?.*)?/

export type SpotifyType = 'track' | 'playlist' | 'album' | 'artist'

/** Check if a string is a valid Spotify URL. */
export function isSpotifyUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  return SPOTIFY_PATTERN.test(trimmed)
}

/**
 * Convert a Spotify open.spotify.com URL to embed URL format.
 * Supports: track, playlist, album, artist
 * @returns Embed URL or null if not a valid Spotify URL
 */
export function spotifyUrlToEmbed(url: string | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  const match = trimmed.match(SPOTIFY_PATTERN)
  if (!match) return null
  const [, type, id] = match
  return `https://open.spotify.com/embed/${type}/${id}`
}
