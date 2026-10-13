/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import { serverGet } from "../helper/serverFetch";

export const TENANT_ID = "381";

// How long a property payload may be served from the Next.js data cache.
const REVALIDATE = 60;

const get = (endpoint: string, params: Record<string, any> = {}) =>
  serverGet(endpoint, params, REVALIDATE);

/** Images are needed by both generateMetadata and the page - cache() dedupes. */
export const getPropertyImages = cache(async (propertyId: string) => {
  const res = await get("api/webmegler/properties/images", {
    tenantId: TENANT_ID,
    propertyId,
  });
  return (res?.data as any[]) ?? null;
});

const getEmployeeProfile = cache(async (employeeId: string) => {
  const res = await get("api/webmegler/employee/profile", {
    tenantId: TENANT_ID,
    employeeId,
  });
  return res?.data ?? null;
});

export type DetailData = {
  propertyId: string;
  propertyDetail: any;
  propertyVisiting: any;
  describitonList: any;
  titleList: any;
  documentLink: any;
  images: any[] | null;
  profileDetail: any;
  profileDetail2: any;
  employeeIds: string[];
};

/**
 * Every request the detail page needs, fired in parallel on the server so the
 * browser gets fully populated markup instead of a hydrate-then-waterfall.
 */
export const getDetailData = cache(
  async (propertyId: string): Promise<DetailData | null> => {
    if (!propertyId) return null;

    const [detailRes, visitingRes, briefRes, docsRes, linkerRes, images] =
      await Promise.all([
        get(`api/webmegler/properties/${propertyId}`, { tenantId: TENANT_ID }),
        get(`api/webmegler/properties/visiting/${propertyId}`, {
          tenantId: TENANT_ID,
        }),
        get("api/webmegler/brief/property", {
          tenantId: TENANT_ID,
          propertyId,
        }),
        get("api/webmegler/properties/documents", {
          tenantId: TENANT_ID,
          propertyId,
        }),
        get("api/webmegler/properties/linker", {
          tenantId: TENANT_ID,
          propertyId,
        }),
        getPropertyImages(propertyId),
      ]);

    const propertyDetail = detailRes?.data ?? null;

    // Broker profiles used to be a second client-side waterfall (they depend on
    // propertyDetail); resolve them here instead.
    const megler1 = propertyDetail?.megler1?.id;
    const megler2 = propertyDetail?.megler2?.id;
    const [profileDetail, profileDetail2] = await Promise.all([
      megler1 ? getEmployeeProfile(String(megler1)) : Promise.resolve(null),
      megler2 ? getEmployeeProfile(String(megler2)) : Promise.resolve(null),
    ]);

    return {
      propertyId,
      propertyDetail,
      propertyVisiting: visitingRes?.data ?? null,
      describitonList: briefRes?.data ?? null,
      titleList: docsRes?.data ?? null,
      documentLink: linkerRes?.data ?? null,
      images,
      profileDetail,
      profileDetail2,
      employeeIds: [megler1, megler2].filter(Boolean).map(String),
    };
  },
);
