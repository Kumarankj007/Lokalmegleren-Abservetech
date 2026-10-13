"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import GetPropertyDetail from "../api/get/propertyDetail";
import GetBriefDetail from "../api/get/accordionDescr";
import GetProductDetail from "../api/get/accordionPdf";
import GetDocumentLink from "../api/get/documentLink";
import GetprofileDetail from "../api/get/profileDetail";
import GetprofileDetail2 from "../api/get/profileDetail2";
import usePropertyStore from "../api/get/properties";
import useRootStore from "../store/root";
import { markHydrated } from "./hydration";
import type { DetailData } from "./serverData";

// The stores are module singletons, so they may only be written on the client
// (a server write would leak one request's property into another's render).
// useLayoutEffect runs before paint, so the seeded data is on screen in the
// first frame instead of flashing a skeleton.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Seeds the zustand stores with the payload the server already fetched, so the
 * detail components render real content without any client-side round trip.
 * Anything the server could not resolve is left untouched and the client
 * components fall back to fetching it themselves.
 *
 * Renders nothing.
 */
export default function HydrateStores({ data }: { data: DetailData }) {
  const hydratedFor = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (hydratedFor.current === data.propertyId) return;
    hydratedFor.current = data.propertyId;

    if (data.propertyDetail) {
      GetPropertyDetail.setState({
        propertyDetail: data.propertyDetail,
        propertyDetailLoad: false,
        propertyDetailReady: true,
      });
      markHydrated(`detail:${data.propertyId}`);
    }
    if (data.propertyVisiting) {
      GetPropertyDetail.setState({
        propertyVisiting: data.propertyVisiting,
        propertyVisitingLoad: false,
        propertyVisitingReady: true,
      });
      markHydrated(`visiting:${data.propertyId}`);
    }
    if (data.describitonList) {
      GetBriefDetail.setState({
        describitonList: data.describitonList,
        describitonListLoad: false,
        describitonListReady: true,
      });
      markHydrated(`brief:${data.propertyId}`);
    }
    if (data.titleList) {
      GetProductDetail.setState({
        titleList: data.titleList,
        titleListLoad: false,
        titleListReady: true,
      });
      markHydrated(`docs:${data.propertyId}`);
    }
    if (data.documentLink) {
      GetDocumentLink.setState({
        DocumentLink: data.documentLink,
        DocumentLinkLoad: false,
      });
      markHydrated(`linker:${data.propertyId}`);
    }
    if (data.images) {
      usePropertyStore.setState({
        singlepropertiesImage: data.images as any,
        singleImagesLoad: false,
      });
      markHydrated(`images:${data.propertyId}`);
      const first = data.images.find((img: any) => !img?.slettet);
      if (first?.url) useRootStore.getState().setImg(first.url);
    }
    if (data.profileDetail) {
      GetprofileDetail.setState({
        profileDetail: data.profileDetail,
        load: false,
      });
      markHydrated(`employee:${data.employeeIds[0]}`);
    }
    if (data.profileDetail2) {
      GetprofileDetail2.setState({
        profileDetail2: data.profileDetail2,
        load2: false,
      });
      markHydrated(`employee:${data.employeeIds[1]}`);
    }
  }, [data]);

  return null;
}
