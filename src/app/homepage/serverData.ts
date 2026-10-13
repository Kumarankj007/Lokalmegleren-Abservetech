/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import { serverGet } from "../helper/serverFetch";

// CMS copy and Google reviews change rarely - a 5 minute window keeps the page
// effectively static while still picking up edits without a redeploy.
const REVALIDATE = 300;

export type HomepageContent = {
  banner?: { title?: string; image?: string; disc?: string[] };
  contactUs?: { title: string; data: any[] };
  aboutUs?: string[];
};

export const getHomepageContent = cache(
  async (): Promise<HomepageContent | null> => {
    const res = await serverGet("api/pages/hjem", {}, REVALIDATE);
    return res?.data ?? null;
  },
);

export const getReviews = cache(async (): Promise<any[]> => {
  const res = await serverGet("api/webmegler/reviews", {}, REVALIDATE);
  return res?.data?.reviews ?? [];
});
