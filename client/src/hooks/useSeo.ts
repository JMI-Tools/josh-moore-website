import { useEffect } from "react";

/**
 * Canonical origin for the site. Every canonical/og:url is built from this.
 * The apex (itsjoshmoore.com) 308-redirects to www at the domain level, so www
 * is the only host that should ever appear in a canonical tag.
 */
export const SITE_ORIGIN = "https://www.itsjoshmoore.com";

/**
 * Build the canonical URL for a route path.
 * Root keeps its slash ("/"); every other path is emitted without a trailing slash.
 */
export function canonicalUrl(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  if (withSlash === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${withSlash.replace(/\/+$/, "")}`;
}

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
 * Dependency-free per-route SEO for this client-rendered wouter SPA.
 *
 * Sets document.title, the description meta, og:title / og:description / og:url,
 * and injects/updates a single <link rel="canonical">. Because the whole site is
 * served from one static index.html, without this every route would look like a
 * duplicate of "/" to search engines.
 *
 * Call it once at the top of each routed page component.
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

export default useSeo;
