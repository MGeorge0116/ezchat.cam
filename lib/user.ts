export function getDisplayName(): string {
  if (typeof window === "undefined") return "";
  // cookie first
  const m = document.cookie.match(/(?:^|;\s*)displayName=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  // fallback localStorage
  const ls = localStorage.getItem("displayName");
  if (ls) return ls;
  return "";
}
