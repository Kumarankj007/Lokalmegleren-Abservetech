/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from "./apitools";

/**
 * Server-side GET against the API.
 *
 * Unlike `helper/apitools`, this touches no zustand store (those are module
 * singletons and must never be written during SSR) and participates in the
 * Next.js data cache via `revalidate`.
 *
 * Returns the parsed body, or null on any failure - one dead endpoint should
 * degrade a single section, not take down the page.
 */
export async function serverGet(
  endpoint: string,
  params: Record<string, any> = {},
  revalidate = 60,
) {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();

  const url = `${BASE_URL}${endpoint}${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Accept: "application/json",
      },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("serverGet failed:", endpoint, error);
    return null;
  }
}
