"use client";
import React, { useEffect, useState, useTransition } from "react";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT, APIURLS } from "@/services/config";
import { fetchApi } from "@/services/global";
import { useSearchParams } from "next/navigation";
import useReactQuery from "@/hooks/useReactQuery";
import Loader from "@/components/loader2";
import PropertyKonvoTemplateEditor from "./PropertyTemplateEditor";
import NoKonvo from "./Nokonvo";
import {
  PropertyImage,
  PropertyImagesResponse,
} from "../(protected)/eiendommer/interface";
import { useRouter } from "@/components/navigation";

export default function Client() {
  const id = useSearchParams().get("path");
  const isHtml = useSearchParams().get("isHtml");
  const title = useSearchParams().get("title");
  const fileName = useSearchParams().get("fileName");
  // Master-template edit mode: opened from /templates with a `templateId`.
  // In this mode the editor loads/saves a master template instead of a
  // property's generated HTML (property queries + Webmegler sync are skipped).
  const templateId = useSearchParams().get("templateId");
  const isTemplateMode = !!templateId;
  const router = useRouter();
  const [isPendingWrite, startTransitionWrite] = useTransition();
  const [isPendinghtml, startTransitionhtml] = useTransition();
  const [isPendingPDF, startTransitionPDF] = useTransition();
  const [isPendingSync, startTransitionSync] = useTransition();
  const type = useSearchParams().get("type");
  const mutation = useApiMutation("get");
  const [htmlString, setHtml] = useState("");
  const postMutation = useApiMutation("post");
  const putMutation = useApiMutation("put");
  const {
    data: previewData,
    isLoading,
    isError,
  } = useReactQuery<any>(
    `GENRATE_HTML`,
    `${id || 3000006}`,
    !isTemplateMode && isHtml == "false",
    false,
  );

  const loadHtml = async () => {
      if (isTemplateMode) {
        startTransitionhtml(async () => {
          try {
            const res: any = await fetchApi(
              APICONSTANT.GET_MASTER_TEMPLATE,
              `${templateId}?includeHtml=true`,
            );
            setHtml(res?.data?.html || "");
          } catch (error) {
            console.error(error);
          }
        });
        return;
      }
      if (isHtml == "true") {
        startTransitionhtml(async () => {
          const html = fileName ? `${id}/${fileName}` : `${id}/${id}.html`;   // fileName ? `${id}/${fileName}` : `${id}/${id}.html`
          const response = await fetch(
            `${APIURLS?.imageUrl}${APICONSTANT.GET_HTML}${html}`,
          );
          const htmlString = await response.text();
          setHtml(htmlString);
        });
      }
    }

  useEffect(() => {
    loadHtml();
  }, [fileName]);

  // sync to webmegler text:
  const syncToWebmegler = async (html: string) => {
    console.log(html, "html");

    startTransitionSync(async () => {
      const filename = fileName ? {filename: fileName} : {}
      const response: any = await postMutation.mutateAsync({
        url: { apiUrl: APICONSTANT.SYNC_WEBMEGLER + id },
        body: { html: html, ...filename },
      });
      console.log(response, "response");
      if (response?.status && response?.updatedHtml) {
        setHtml(response?.updatedHtml);
      }
    });
  };

  const {
    data: previewImg,
    isLoading: isLoadingImg,
    isError: isErrorImg,
  } = useReactQuery<PropertyImagesResponse>(
    `PROPERTYIMG`,
    `?tenantId=381&propertyId=${id || 3000006}`,
    !isTemplateMode,
    false,
  );
  const PropertyImg: PropertyImage[] = previewImg?.data || [];

  // const saveHtml = async (html: string) => {
  //   startTransitionWrite(async () => {
  //     const response = await postMutation.mutateAsync({
  //       url: { apiUrl: APICONSTANT.WRITE_HTML + id },
  //       body: {
  //         html: html,
  //       },
  //     });
  //   });
  // };

  const saveHtml = async (html: string, name?: string) => {
    startTransitionWrite(async () => {
      try{
        // Master-template edit mode → save straight to the template record.
        if (isTemplateMode) {
          const res = await putMutation.mutateAsync({
            url: { apiUrl: APICONSTANT.UPDATE_MASTER_TEMPLATE + templateId },
            body: { html },
          });
          if (res?.status) loadHtml();
          return;
        }

        const resolvedFileName = fileName ?? undefined;
        let res;
        if (resolvedFileName) {
          res = await postMutation.mutateAsync({
            url: {
              apiUrl: `${APICONSTANT.WRITE_HTML}${id}?fileName=${resolvedFileName}`,
            },
            body: { html },
          });
        } else {
          res = await postMutation.mutateAsync({
            url: { apiUrl: APICONSTANT.WRITE_HTML + id },
            body: {
              html,
              ...(name ? { name } : {}),
            },
          });
        }
        if (res?.status) {
          const data = res?.data;
          router?.replace(`/rediger?path=${id}&title=${title}&isHtml=true&fileName=${data?.fileName || name}`);
          loadHtml()
        }
      }catch(error){
        console.error(error);
      }
    });
  };

  const generatePDF = async () => {
    startTransitionPDF(async () => {
      const response = await mutation.mutateAsync({
        url: { apiUrl: APICONSTANT.GENRATE_PDF + id + "?filename=" + (fileName || id + ".html") },
      });
      // console.log(response, "response");
      if (response?.status === true && response?.data?.path) {
        window.open(`/en/pdf-viewer?url=${encodeURIComponent(response?.data?.path)}&id=${id}`, "_blank");
      }
    });
  };

  const handleDownload = async () => {
    try {
      await generatePDF();
    } catch (error) {
      console.error(error);
    }
  };

  if (isError || isErrorImg)
    return (
      <p className="p-4 text-red-500">Feil ved lasting av egenskapsbilde</p>
    );
  return isLoading || isPendinghtml ? (
    <Loader message="Laster inn redigeringsprogrammet..." />
  ) : (isTemplateMode ? htmlString : previewData?.path || htmlString) ? (
    <>
      {/* <Html2Canvas /> */}
      {isTemplateMode ? (
        // Master-template edit mode: edit + save the template HTML only.
        // No property → no Webmegler sync (showSync=false) and no PDF (onSave omitted).
        <NoKonvo
          initialHtml={htmlString.replace(/<br\s*\/?>/gi, "\n")}
          title={title || ""}
          onSaveHtml={saveHtml}
          pendingSaveHtml={isPendingWrite}
          showSync={false}
          isTemplateMode
          images={[]}
        />
      ) : type === "nokonvo" ? (
        <PropertyKonvoTemplateEditor
          initialHtml={
            isHtml == "false" ? (previewData?.path as string) : htmlString
          }
        />
      ) : (
        // <LokalmeglerEditor htmlData={previewData?.data as string} />
        <NoKonvo
          initialHtml={(htmlString || (previewData?.path as string)).replace(
            /<br\s*\/?>/gi,
            "\n",
          )}
          title={title || id || ""}
          onSave={handleDownload}
          onSaveHtml={saveHtml}
          onSyncWebmegler={syncToWebmegler}
          // documentImages={documents}
          pendingSaveHtml={isPendingWrite}
          fileName={fileName ?? undefined}
          pendingPDF={isPendingPDF}
          pendingSync={isPendingSync}
          images={
            PropertyImg?.map((item) => ({
              src: "https://images.weserv.nl/?url=" + item.url,
              label: item.beskrivelse,
            })) || []
          }
        />
      )}
    </>
  ) : null;
}
