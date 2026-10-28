export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}

export function cardUrl(token: string) {
  return `${getSiteUrl()}/r/${token}`;
}