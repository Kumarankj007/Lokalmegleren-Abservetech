"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Forces the detail page to open at the top.
 *
 * Next's app router restores the previous scroll offset when you navigate
 * back to a route, and switching between two properties (`/detail?id=A` ->
 * `/detail?id=B`) keeps the page mounted, so the reader would land mid-page
 * on the new property. Scrolling on every id change fixes both cases.
 *
 * Renders nothing.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const id = useSearchParams().get("id");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, id]);

  return null;
}
