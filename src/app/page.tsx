import dynamic from "next/dynamic";
import Banner from "./homepage/banner";
import Magazine from "./homepage/magazine";
import { BASE_URL } from "./helper/apitools";
import { getHomepageContent, getReviews } from "./homepage/serverData";

// Below the fold, and pulls in Swiper + MUI Rating - keep it out of the
// critical path.
const Reviews = dynamic(() => import("./homepage/customerReviews"));

// Content comes from the CMS; re-render at most every 5 minutes.
export const revalidate = 300;

export default async function Home() {
  // Both on the server, in parallel: the page ships with its copy already in
  // the HTML instead of blank until hydration + two client fetches finish.
  const [homepageData, reviews] = await Promise.all([
    getHomepageContent(),
    getReviews(),
  ]);

  const banner = homepageData?.banner
    ? {
        title: homepageData.banner.title,
        // Prepend base URL so the image path resolves correctly
        img: homepageData.banner.image
          ? `${BASE_URL}${homepageData.banner.image}`
          : "",
        disc: homepageData.banner.disc ?? [],
      }
    : undefined;

  const contactUs = homepageData?.contactUs ?? undefined;
  const aboutUs: string[] = homepageData?.aboutUs ?? [];

  return (
    <>
      <Banner banner={banner} />
      <Magazine contactUs={contactUs} aboutUs={aboutUs} />
      {reviews?.length > 0 && <Reviews reviews={reviews} />}
    </>
  );
}
