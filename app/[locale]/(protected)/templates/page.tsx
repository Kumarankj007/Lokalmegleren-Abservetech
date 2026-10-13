"use client";
import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Templates from "./Templates";

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <Card>
        <CardContent className="p-0">
          <Templates />
        </CardContent>
      </Card>
    </>
  );
}

export default page;
