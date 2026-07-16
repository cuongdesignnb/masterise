import { existsSync } from "node:fs";

export function getServerApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8747/api/v1";

  if (existsSync("/.dockerenv")) {
    return apiUrl.replace("localhost:8747", "mh_nginx").replace("127.0.0.1:8747", "mh_nginx");
  }

  return apiUrl;
}

export async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${getServerApiUrl()}${endpoint}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const payload = await res.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchApiResponse<T>(
  endpoint: string,
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${getServerApiUrl()}${endpoint}`, {
      next: {
        revalidate: options.revalidate ?? 300,
        tags: options.tags,
      },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
