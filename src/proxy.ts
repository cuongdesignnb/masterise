import { existsSync } from "node:fs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type LegacyNamespace = "du-an" | "tin-tuc" | "dau-tu";

type LookupResult =
  | { kind: "found"; slug: string }
  | { kind: "missing" }
  | { kind: "failure"; reason: string };

const LEGACY_PATH = /^\/(du-an|tin-tuc|dau-tu)\/([^/]+)\/?$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOOKUP_TIMEOUT_MS = 3000;

function getApiBaseUrl() {
  const configured = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8747/api/v1").trim();

  // The local compose network resolves the API through the nginx service,
  // while production builds normally provide the public API URL at build time.
  if (existsSync("/.dockerenv") && /https?:\/\/localhost:8747/i.test(configured)) {
    return configured.replace(/https?:\/\/localhost:8747/i, "http://mh_nginx").replace(/\/$/, "");
  }

  return configured.replace(/\/$/, "");
}

function response(status: number, headers: Record<string, string> = {}) {
  return new NextResponse(status === 404 ? "Not Found" : "Service Unavailable", {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      ...headers,
    },
  });
}

function unavailable(namespace: LegacyNamespace, slug: string, reason: string): LookupResult {
  console.error(JSON.stringify({
    event: "legacy_slug_lookup_failed",
    namespace,
    slug,
    reason,
  }));

  return { kind: "failure", reason };
}

async function lookupLegacySlug(namespace: LegacyNamespace, slug: string): Promise<LookupResult> {
  const endpoint = namespace === "du-an" ? `/projects/${encodeURIComponent(slug)}` : `/posts/${encodeURIComponent(slug)}`;

  try {
    const result = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });

    if (result.status === 404) return { kind: "missing" };
    if (!result.ok) return unavailable(namespace, slug, `upstream_http_${result.status}`);

    const payload: unknown = await result.json();
    const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : null;
    const data = root?.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
    const entity = data?.[namespace === "du-an" ? "project" : "post"];

    if (!entity || typeof entity !== "object") {
      return unavailable(namespace, slug, "malformed_upstream_payload");
    }

    const entityRecord = entity as Record<string, unknown>;
    const canonicalSlug = typeof entityRecord.slug === "string" ? entityRecord.slug.trim() : "";
    const contentType = typeof entityRecord.post_type === "string" ? entityRecord.post_type : "";

    if (!SLUG_PATTERN.test(canonicalSlug)) {
      return unavailable(namespace, slug, "malformed_canonical_slug");
    }

    if (namespace !== "du-an" && contentType !== "news" && contentType !== "investment") {
      return unavailable(namespace, slug, "malformed_post_type");
    }

    if (namespace === "tin-tuc" && contentType !== "news") return { kind: "missing" };
    if (namespace === "dau-tu" && contentType !== "investment") return { kind: "missing" };

    return { kind: "found", slug: canonicalSlug };
  } catch (error) {
    return unavailable(namespace, slug, error instanceof Error ? error.name : "upstream_request_failed");
  }
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const match = request.nextUrl.pathname.match(LEGACY_PATH);
  if (!match) return NextResponse.next();

  const namespace = match[1] as LegacyNamespace;
  let slug: string;
  try {
    slug = decodeURIComponent(match[2]);
  } catch {
    return response(404);
  }

  if (!SLUG_PATTERN.test(slug)) return response(404);
  const lookup = await lookupLegacySlug(namespace, slug);

  if (lookup.kind === "missing") return response(404);
  if (lookup.kind === "failure") return response(503, { "Retry-After": "30" });

  const destination = new URL(request.url);
  destination.pathname = `/${lookup.slug}`;
  // Construct the response explicitly so the legacy route never throws a
  // redirect exception that can be rendered as streamed HTML/meta. The URL
  // remains a real one-hop HTTP 308 with the original query string preserved.
  return new NextResponse(destination.toString(), {
    status: 308,
    headers: { Location: destination.toString() },
  });
}

export const config = {
  matcher: ["/du-an/:slug", "/tin-tuc/:slug", "/dau-tu/:slug"],
};
