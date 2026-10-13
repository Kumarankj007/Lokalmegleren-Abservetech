import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import Boligstoff from "@/core/Boligstoff/Boligstoff";

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <Boligstoff />
    </>
  );
}

export default page;
