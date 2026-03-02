/** Parse VITE_ADMIN_EMAILS env var into a lowercase email set. Comma-separated list. */
function getAdminEmails(): Set<string> {
  return new Set(
    (import.meta.env.VITE_ADMIN_EMAILS || '')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

/** Return true if the given email is in the admin allowlist. */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const allowlist = getAdminEmails()
  if (allowlist.size === 0) return false
  return allowlist.has(email.trim().toLowerCase())
}
