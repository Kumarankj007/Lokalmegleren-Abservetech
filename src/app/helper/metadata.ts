import { Metadata } from "next";
import { API } from "./apitools";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id?: string };
}): Promise<Metadata> {
  // Read the query parameter safely on the server
  const propertyId = searchParams?.id ?? null; 
  
  const res = await API.GET("api/webmegler/properties/images", {
    tenantId: "381",
    propertyId: propertyId,
  });
  const val = await res?.data;
  // console.log(val[0].url, "val");
  return {
    title: propertyId ? `Property ${propertyId}` : "Property",
    openGraph: {
      images: [
        {
          url: val[0].url, // replace or build from propertyId
          width: 1200,
          height: 630,
          alt: `Preview for property ${propertyId ?? ""}`,
        },
      ],
      url: "https://instantaneous-moira-caringly.ngrok-free.dev",
    },
    alternates: {
      canonical:
        "https://instantaneous-moira-caringly.ngrok-free.dev",
    },
    twitter: {
      card: "summary_large_image",
      images: [val[0].url],
    },
  };
}