import {
  AboutUsSkeleton,
  BannerSkeleton,
  ContactUsSkeleton,
  PropertiesSectionSkeleton,
  ReviewsSectionSkeleton,
} from "./homepage/skeletons";

/**
 * Homepage fallback, shown while the server resolves the CMS content.
 * Blocks appear in the same order and at the same sizes as the real page.
 */
export default function Loading() {
  return (
    <>
      <BannerSkeleton />
      <ContactUsSkeleton />
      <PropertiesSectionSkeleton />
      <AboutUsSkeleton />
      <ReviewsSectionSkeleton />
    </>
  );
}
