import { useEffect } from "react";
import {
  canonicalUrl,
  getRoute,
  OG_IMAGE_URL,
  SITE_ORIGIN,
  type RoutePath,
} from "@shared/seo-routes";

export { canonicalUrl, SITE_ORIGIN };
export type { RoutePath };

export interface SeoOptions {
  /** Full <title> for this route. */
  title: string;
  /** Meta description for this route. */
  description: string;
  /**
   * Route path this page canonicalizes to, e.g. "/about".
   * Pass null (or omit) for pages that must NOT emit a canonical — e.g. 404.
   */
  path?: string | null;
  /** When true, emits <meta name="robots" content="noindex, follow">. */
  noindex?: boolean;
}

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeTags(selector: string): void {
  const nodes = document.head.querySelectorAll(selector);
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].remove();
  }
}

/**
 * Per-route SEO for CLIENT-SIDE NAVIGATION only.
 *
 * The tags that matter for crawlers and link unfurlers are baked into the served
 * HTML at build time by scripts/prerender-seo.ts — every route is its own real file
 * with its own title/description/canonical/og:url, so nothing here is load-bearing
 * for a consumer that does not run JavaScript. This hook exists so that a wouter
 * in-app navigation (which never re-fetches HTML) still updates the document head.
 *
 * Prefer `useRouteSeo("/about")`, which pulls the copy from shared/seo-routes.ts so
 * the runtime tags and the prerendered tags cannot drift. Use this raw hook only for
 * pages that are not in the route table (i.e. NotFound).
 */
export function useSeo({
  title,
  description,
  path = null,
  noindex = false,
}: SeoOptions): void {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Josh Moore");
    upsertMeta("property", "og:image", OG_IMAGE_URL);
    upsertMeta("name", "twitter:card", "summary_large_image");

    if (noindex) {
      upsertMeta("name", "robots", "noindex, follow");
    } else {
      // A previously rendered noindex page must not poison the next route.
      removeTags('meta[name="robots"]');
    }

    if (path) {
      const url = canonicalUrl(path);
      let link = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
      upsertMeta("property", "og:url", url);
    } else {
      // No canonical may point at a non-existent page.
      removeTags('link[rel="canonical"]');
      removeTags('meta[property="og:url"]');
    }
  }, [title, description, path, noindex]);
}

/**
 * Set the head tags for a route from the shared route table.
 * Call once at the top of each routed page component.
 */
export function useRouteSeo(path: RoutePath): void {
  const { title, description } = getRoute(path);
  useSeo({ title, description, path });
}

export default useSeo;
