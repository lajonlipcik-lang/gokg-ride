export function canRequestRide(user: { email_confirmed_at?: string | null } | null) {
  return Boolean(user?.email_confirmed_at);
}
export function isRecoveryLink(hash: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "recovery";
}