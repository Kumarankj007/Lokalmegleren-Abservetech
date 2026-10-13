import { Skeleton } from "@mui/material";

/**
 * Skeletons for the property detail page.
 *
 * Each one mirrors the real markup it stands in for - same wrappers, same
 * paddings, same heights - so swapping skeleton for content causes no layout
 * shift. Keep them in sync when the corresponding section changes.
 */

const shimmer = { backgroundColor: "rgba(0,0,0,0.08)" } as const;

/** Hero gallery: matches the Swiper slide height at every breakpoint. */
export function GalleryHeroSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[500px] md:h-[700px]">
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{ ...shimmer, borderRadius: "8px" }}
      />
    </div>
  );
}

/**
 * Just the broker portrait. Used where the name/email/phone come from
 * propertyDetail and are already on screen - only the photo is still loading.
 */
export function BrokerPortraitSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      width={150}
      height={150}
      sx={{ ...shimmer, marginBottom: "20px" }}
      className="block"
    />
  );
}

/** Full broker card: portrait + name/email/phone + "Kontakt megler" button. */
export function BrokerCardSkeleton() {
  return (
    <div className="mb-5">
      <Skeleton
        variant="rectangular"
        width={150}
        height={150}
        sx={{ ...shimmer, marginBottom: "20px" }}
      />
      <Skeleton variant="text" width="70%" height={30} sx={shimmer} />
      <Skeleton variant="text" width="85%" height={30} sx={shimmer} />
      <Skeleton variant="text" width="55%" height={30} sx={shimmer} />
      <Skeleton
        variant="rectangular"
        width={200}
        height={48}
        sx={{ ...shimmer, borderRadius: "20px", marginTop: "24px" }}
      />
    </div>
  );
}

/** Upcoming viewings block. */
export function VisitingSkeleton() {
  return (
    <div className="w-full sm:w-[408px] mx-auto p-5 flex flex-col gap-2.5">
      <Skeleton variant="text" width="60%" height={40} sx={shimmer} />
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <Skeleton variant="text" width="75%" height={28} sx={shimmer} />
          <Skeleton variant="text" width="45%" height={24} sx={shimmer} />
        </div>
      ))}
    </div>
  );
}

/**
 * Overview: address block + key facts grid on the left, map + broker card on
 * the right. Mirrors the two-column layout of the real section.
 */
export function OverviewSkeleton() {
  return (
    <div className="max-w-[1400px] px-2.5 mx-auto pt-[50px] flex flex-col lg:flex-row gap-5 w-full">
      <div className="w-full lg:w-[70%] p-5 rounded-[10px] shadow-md flex flex-col gap-[15px]">
        {/* Kommune / område / adresse */}
        <Skeleton variant="text" width="40%" height={38} sx={shimmer} />
        <Skeleton variant="text" width="30%" height={28} sx={shimmer} />
        <Skeleton variant="text" width="60%" height={24} sx={shimmer} />

        {/* Heading */}
        <Skeleton variant="text" width="80%" height={44} sx={shimmer} />

        {/* Nøkkelopplysninger */}
        <Skeleton variant="text" width="40%" height={34} sx={shimmer} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant="text"
              width="100%"
              height={26}
              sx={shimmer}
            />
          ))}
        </div>

        {/* Description */}
        <Skeleton variant="text" width="30%" height={34} sx={shimmer} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={150}
          sx={{ ...shimmer, borderRadius: "6px" }}
        />
        <Skeleton
          variant="rectangular"
          width={200}
          height={48}
          sx={{ ...shimmer, borderRadius: "20px", marginTop: "20px" }}
        />
      </div>

      <div className="flex flex-col gap-5 w-full lg:w-[30%]">
        <Skeleton
          variant="rectangular"
          width="100%"
          height={250}
          sx={{ ...shimmer, borderRadius: "6px" }}
        />
        <div className="p-5 rounded-[10px] shadow-md">
          <BrokerCardSkeleton />
        </div>
      </div>
    </div>
  );
}

/** The sticky section nav above the accordion. Same 100px height as the real one. */
export function AccordionNavSkeleton() {
  return (
    <nav className="mt-0 p-[15px] sticky top-[70px] bg-[#9b834a] shadow-md z-10 h-[100px] flex">
      <ul className="max-w-[1300px] mx-auto flex items-center md:justify-center gap-5 w-full overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <li key={idx}>
            <Skeleton
              variant="text"
              width={110}
              height={26}
              sx={{ backgroundColor: "rgba(255,255,255,0.35)" }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** One collapsed accordion row: title + expand icon, matching MUI's summary height. */
export function AccordionRowSkeleton({ titleWidth = "35%" }: { titleWidth?: string | number }) {
  return (
    <div className="border-b border-[#a9a39b]">
      <div className="flex items-center justify-between py-5 pl-5 lg:pl-[100px] pr-10">
        <Skeleton variant="text" width={titleWidth} height={34} sx={shimmer} />
        <Skeleton variant="circular" width={16} height={16} sx={shimmer} />
      </div>
    </div>
  );
}

/** A stack of collapsed accordion rows. */
export function AccordionRowsSkeleton({ rows = 6 }: { rows?: number }) {
  // Varied widths read as a list of different headings rather than a table.
  const widths = ["35%", "28%", "42%", "31%", "38%", "25%"];
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <AccordionRowSkeleton key={idx} titleWidth={widths[idx % widths.length]} />
      ))}
    </>
  );
}

/** Collapsed "Dokumenter" accordion row. */
export function DocumentsSkeleton() {
  return <AccordionRowSkeleton titleWidth={140} />;
}

/** Full accordion section (nav + rows) - used by the route-level loading.tsx. */
export function AccordionSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      <AccordionNavSkeleton />
      <section className="mt-0 mx-auto flex flex-col lg:flex-row w-full border-b border-[#a9a39b] pb-5">
        <div className="w-full p-0 mb-5 border-l-0 border-t-0 border-r border-[#a9a39b] border">
          <AccordionRowsSkeleton rows={rows} />
        </div>
      </section>
    </>
  );
}

/** Map placeholder - same height as the rendered GoogleMap container. */
export function MapSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={550}
      sx={{ ...shimmer, borderRadius: "6px" }}
    />
  );
}
