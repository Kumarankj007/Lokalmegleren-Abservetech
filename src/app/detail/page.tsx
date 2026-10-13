import type { Metadata } from "next";
import dynamic from "next/dynamic";
import GalleryDynamic from "./galleryHeader";
import Overview from "./overview";
import HydrateStores from "./hydrateStores";
import ScrollToTop from "./scrollToTop";
import { headers } from "next/headers";
import { getDetailData, getPropertyImages } from "./serverData";

// Below the fold: MUI Accordion + Google Maps + react-icons stay out of the
// initial JS payload and stream in after the above-the-fold content.
const AccordionData = dynamic(() => import("./accordionData"));

type SearchParams = Promise<{ id?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const propertyId = (await searchParams)?.id ?? "";
  const data = await getDetailData(propertyId);

  return (
    <section className="bg-[#e2cf9e]">
      <ScrollToTop />
      {data && <HydrateStores data={data} />}
      <GalleryDynamic />
      <Overview />
      <AccordionData />
    </section>
  );
}

// ---------- Dynamic Metadata (SERVER side) ----------
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const propertyId = (await searchParams)?.id ?? null;

  // Same cache()'d call the page uses - resolved once per request.
  const images = propertyId ? await getPropertyImages(propertyId) : null;
  const val = images?.filter((img: any) => !img.slettet);

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const title = propertyId ? `Eiendom ${propertyId}` : "Eiendom";
  const desc = val?.[0]?.beskrivelse || "Digitalt stylet stue";
  const ogImg = val?.[0]?.url
    ? `https://images.weserv.nl/?url=${encodeURIComponent(val[0].url)}`
    : "";

  return {
    title,
    description: desc,
    openGraph: {
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: `Forhåndsvisning av eiendom ${propertyId ?? ""}`,
        },
      ],
      type: "website",
      url: origin,
    },
    alternates: {
      canonical: origin,
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImg],
    },
  };
}
