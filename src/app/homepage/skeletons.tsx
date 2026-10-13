import { Skeleton } from "@mui/material";

/**
 * Skeletons for every block on the homepage.
 *
 * Each one mirrors the section it stands in for - same wrappers, paddings,
 * max-widths and responsive heights - so content swapping in causes no layout
 * shift. Keep them in sync when the corresponding section changes.
 */

// Placeholder tint for light backgrounds, and a light one for the gold/dark
// bands where a dark shimmer would disappear.
const shimmer = { backgroundColor: "rgba(0,0,0,0.08)" } as const;
const shimmerOnColor = { backgroundColor: "rgba(255,255,255,0.35)" } as const;

/** Centered pill button placeholder, as used at the foot of several sections. */
function ButtonSkeleton({
  width = 200,
  onColor = false,
}: {
  width?: number;
  onColor?: boolean;
}) {
  return (
    <div className="text-center mt-10">
      <Skeleton
        variant="rectangular"
        width={width}
        height={44}
        sx={{
          ...(onColor ? shimmerOnColor : shimmer),
          borderRadius: "9999px",
          display: "inline-block",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ banner */

/** Heading + intro paragraphs + the full-bleed hero image. */
export function BannerSkeleton() {
  return (
    <section className="w-full mb-10">
      <div className="max-w-[1500px] mx-auto md:px-10 sm:px-5 px-3 my-10">
        {/* Title - lg:text-[60px] */}
        <Skeleton
          variant="text"
          height={72}
          sx={{ ...shimmer, maxWidth: "620px", margin: "0 auto 20px" }}
          width="60%"
        />
        {/* Two lines of intro copy */}
        <Skeleton
          variant="text"
          height={24}
          width="90%"
          sx={{ ...shimmer, margin: "0 auto 12px" }}
        />
        <Skeleton
          variant="text"
          height={24}
          width="55%"
          sx={{ ...shimmer, margin: "0 auto 12px" }}
        />
      </div>

      {/* Hero image - same heights as the real one, so nothing jumps */}
      <Skeleton
        variant="rectangular"
        width="100%"
        className="h-[400px] sm:h-[70vh] md:h-[80vh]"
        sx={shimmer}
      />
    </section>
  );
}

/* -------------------------------------------------------------- kontakt oss */

/** "Kontakt oss for en uforpliktende prat" - heading + three columns. */
export function ContactUsSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <section className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3 my-20">
      <Skeleton
        variant="text"
        height={44}
        width="55%"
        sx={{ ...shimmer, margin: "0 auto 24px" }}
      />

      <div className="flex flex-wrap items-center justify-center gap-5">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="p-2 xl:w-[32%] md:w-[48%] w-full">
            {/* Column heading */}
            <Skeleton
              variant="text"
              width="45%"
              height={28}
              sx={{ ...shimmer, marginBottom: "20px" }}
            />
            {/* Body copy */}
            {Array.from({ length: 5 }).map((_, line) => (
              <Skeleton
                key={line}
                variant="text"
                height={20}
                width={line === 4 ? "70%" : "100%"}
                sx={shimmer}
              />
            ))}
          </div>
        ))}
      </div>

      <ButtonSkeleton width={220} />
    </section>
  );
}

/* -------------------------------------------------------- våre eiendommer */

/** Matches the card image: md:h-[300px] lg:h-[450px]. */
export function HomeCardImageSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      width="100%"
      className="h-[200px] md:h-[300px] lg:h-[450px]"
      sx={shimmer}
    />
  );
}

/** One property card placeholder. */
export function HomePropertyCardSkeleton() {
  return (
    <div className="md:w-[49%] w-full bg-white rounded-lg overflow-hidden shadow">
      <HomeCardImageSkeleton />
      <div className="p-4">
        <Skeleton variant="text" width="60%" height={28} sx={shimmer} />
      </div>
    </div>
  );
}

/** The 2x2 grid of card placeholders (no section chrome). */
export function HomePropertyGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap justify-between gap-y-6">
      {Array.from({ length: count }).map((_, idx) => (
        <HomePropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/** Full "Våre eiendommer" band: heading + grid + button. */
export function PropertiesSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="bg-[#f6f6f6] py-20">
      <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3">
        <Skeleton
          variant="text"
          height={72}
          width="40%"
          sx={{ ...shimmer, margin: "0 auto 40px" }}
        />
        <HomePropertyGridSkeleton count={count} />
        <ButtonSkeleton width={280} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- om oss band */

/** The gold "about us" band - large centered paragraphs + button. */
export function AboutUsSkeleton({ paragraphs = 2 }: { paragraphs?: number }) {
  return (
    <section className="bg-[#d6bc77] py-20">
      <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3">
        {Array.from({ length: paragraphs }).map((_, idx) => (
          <div key={idx} className="mb-14">
            {Array.from({ length: idx === 0 ? 3 : 2 }).map((_, line, arr) => (
              <Skeleton
                key={line}
                variant="text"
                height={38}
                width={line === arr.length - 1 ? "55%" : "100%"}
                sx={{ ...shimmerOnColor, margin: "0 auto 8px" }}
              />
            ))}
          </div>
        ))}
        <ButtonSkeleton width={180} onColor />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- anmeldelser */

/** One review card - fixed 340px slide height, same as the real Swiper slide. */
export function ReviewCardSkeleton() {
  return (
    <div className="w-full py-2.5">
      <div className="flex h-[340px] flex-col gap-2.5 rounded-[15px] mx-auto bg-[#e2cf9e] shadow-md p-5">
        {/* Quote glyph */}
        <Skeleton
          variant="circular"
          width={24}
          height={24}
          sx={{ ...shimmer, margin: "0 auto" }}
        />
        {/* Review body */}
        {Array.from({ length: 7 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="text"
            height={20}
            width={idx === 6 ? "60%" : "100%"}
            sx={shimmer}
          />
        ))}
        {/* Rating + author, pinned to the bottom like the real card */}
        <div className="flex flex-wrap items-center mt-auto">
          <Skeleton variant="text" width={100} height={24} sx={shimmer} />
          <Skeleton
            variant="text"
            width={90}
            height={24}
            sx={{ ...shimmer, marginLeft: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * "Kundeanmeldelser" band. Three cards at >=1200px, two at >=768, one below -
 * extras are hidden at the matching breakpoints so the row never wraps.
 */
export function ReviewsSectionSkeleton() {
  return (
    <section className="py-[70px] bg-[#f6f6f6]">
      <div className="max-w-[1300px] mx-auto px-5">
        <div className="flex flex-wrap items-baseline">
          <Skeleton variant="text" width={260} height={52} sx={shimmer} />
          <Skeleton
            variant="text"
            width={180}
            height={34}
            sx={{ ...shimmer, marginLeft: "auto" }}
          />
        </div>

        <div className="py-[30px] flex gap-5">
          <div className="w-full xl:w-[calc((100%-40px)/3)] md:w-[calc((100%-15px)/2)]">
            <ReviewCardSkeleton />
          </div>
          <div className="hidden md:block md:w-[calc((100%-15px)/2)] xl:w-[calc((100%-40px)/3)]">
            <ReviewCardSkeleton />
          </div>
          <div className="hidden xl:block xl:w-[calc((100%-40px)/3)]">
            <ReviewCardSkeleton />
          </div>
        </div>
      </div>
    </section>
  );
}
