"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import TableList from "./TableList";
import { PropertiesResponse, Property } from "./interface";
import useReactQuery from "@/hooks/useReactQuery";
import PropertyDocument from "./PropertyDocument";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MasterTemplatesResponse } from "../templates/interface";

function Eiendommer() {
  const { data, isLoading, isError } =
    useReactQuery<PropertiesResponse>("PROPERTYLIST", "", true, false);

  const properties: Property[] = data?.data || [];
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);


    const { data: templateList, isLoading : isTemplateLoading, isError : isTemplateError, refetch : refetchTemplates } =
      useReactQuery<MasterTemplatesResponse>("GET_MASTER_TEMPLATES");

  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isError) {
    return <p className="p-4 text-red-500">Feil ved lasting av egenskaper</p>;
  }

  return (
    <div className="flex gap-6">
      {/* Table */}
      <Card className={activeProperty ? "md:w-4/6" : "" + " w-full"}>
        <CardContent className="p-0">
          <TableList
            Property={properties}
            setActiveProperty={setActiveProperty}
            activeProperty={activeProperty}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Desktop → Side Preview */}
      {!isMobile && activeProperty && (
        <Card className="w-2/6">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 px-5 gap-3 md:gap-4">
              <div className="flex-1 text-xl font-medium text-default-900">
                Dokumenter
              </div>
            </div>
            <PropertyDocument activeProperty={activeProperty} templateList={templateList?.data || []} />
          </CardContent>
        </Card>
      )}

      {/* Mobile → Dialog */}
      {isMobile && (
        <Dialog
          open={!!activeProperty}
          onOpenChange={(open) => {
            if (!open) setActiveProperty(null);
          }}
        >
          {activeProperty && (
            <DialogContent size="sm" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Dokumenter</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-auto">
                <PropertyDocument activeProperty={activeProperty} templateList={templateList?.data || []} />
              </div>
            </DialogContent>
          )}
        </Dialog>
      )}
    </div>
  );
}

export default Eiendommer;
