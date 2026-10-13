import {
  AccordionSkeleton,
  GalleryHeroSkeleton,
  OverviewSkeleton,
} from "./skeletons";

/**
 * Route-level fallback shown while the server resolves the property payload.
 * Uses the same skeletons as the sections themselves, so the placeholder the
 * user sees never changes shape as the page takes over.
 */
export default function Loading() {
  return (
    <section className="bg-[#e2cf9e]">
      <div className="mt-[0px] md:mt-[0px] pt-[50px]">
        <div className="max-w-[1300px] mx-auto">
          <GalleryHeroSkeleton />
        </div>
      </div>
      <OverviewSkeleton />
      <AccordionSkeleton />
    </section>
  );
}
