const ALLOWED_DOMAINS = [
  "google.com",
  "google.co.id",
  "g.page",
  "goo.gl", // termasuk maps.app.goo.gl
  "g.co",
];

export function isAllowedReviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}