"use client";
import React, { useState, useTransition } from "react";
import {
  Property,
  PropertyImage,
  PropertyImagesResponse,
  PropertyTemplate,
  SavedHtmlTemplatesResponse,
  Template,
  TemplatesResponse,
} from "./interface";
import useReactQuery from "@/hooks/useReactQuery";
import { Card, CardContent } from "@/components/ui/card";
import ImageComponent from "@/components/imageComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Cog, Download, Edit, FilePlus, Loader2, Pencil } from "lucide-react";
import { useRouter } from "@/components/navigation";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { downloadFn } from "@/utils/helper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getUser } from "@/services/authService";
import { MasterTemplate } from "../templates/interface";

export default function PropertyDocument({
  activeProperty,
  templateList
}: {
  activeProperty: Property | null;
  templateList: MasterTemplate[];
}) {
  if (!activeProperty) {
    return <p className="p-4 text-red-500">Noe gikk galt</p>;
  }

  const [isPending, startTransition] = useTransition();
  const [isDownload, startDownload] = useTransition();
  const [isPreview, startPreview] = useTransition();
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const router = useRouter();
  const user = JSON.parse(getUser() || "{}");
  const {
    data: previewImg,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<PropertyImagesResponse>(
    `PROPERTYIMG`,
    `?tenantId=381&propertyId=${activeProperty?.id || 3000006}`,
    true,
    false,
  );

  const {
    data: templates,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
    refetch: refetchTemplates
  } = useReactQuery<TemplatesResponse>(
    `TEMPLATES`,
    `${activeProperty?.id}`,
    true,
  );

  const {
    data: openHtmlTemplate,
    isLoading: isOpenHtmlTemplateLoading,
    isError: isOpenHtmlTemplateError,
  } = useReactQuery<SavedHtmlTemplatesResponse>(
    `OPEN_HTML_TEMPLATE`,
    `?propertyId=${activeProperty?.id}`,
    true,
  );

  const propertyTemplate: Template[] = templates?.data || [];
  const openHtmlTemplateList: PropertyTemplate[] = openHtmlTemplate?.data || [];
  const openHtmlList: any = openHtmlTemplateList?.flatMap(({ propertyId, templates }) =>
    templates.map((template: any) => ({
      propertyId,
      ...template,
    }))
  );

  const mutation = useApiMutation("get");
  const postMutation = useApiMutation("post");

  const isHtml: boolean = previewImg?.propertyHtml || false;
  const PropertyImg: PropertyImage[] = previewImg?.data || [];

  const generateHtml = async () => {
    try {
      startTransition(async () => {
        const response = await mutation.mutateAsync({
          url: { apiUrl: APICONSTANT.GENRATE_HTML + activeProperty?.id },
        });
        if (response?.status === true && activeProperty?.id) {
          refetch();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const generateHtmlWithTemplate = async (templateId: string) => {
    try {
      startTransition(async () => {
        const response = await postMutation.mutateAsync({
          url: { apiUrl: APICONSTANT.GENERATE_FROM_TEMPLATE + activeProperty?.id },
          body: { templateId },
        });
        if (response?.status === true && activeProperty?.id) {
          refetchTemplates();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenererClick = () => {
    // No HTML yet and no master templates to choose from → straight to the
    // default template, nothing to pick.
    if (!isHtml && (templateList?.length ?? 0) === 0) {
      generateHtml();
      return;
    }
    // Otherwise let the admin choose: default template, an existing master
    // template, or (only when HTML already exists) edit the current one.
    setShowHtmlModal(true);
  };

  const handleDownload = async () => {
    try {
      startDownload(async () => {
        await generatePDF("download");
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async () => {
    try {
      // router?.push({
      //   pathname: "/rediger",
      //   query: {
      //     path: activeProperty?.id,
      //     isHtml: isHtml,
      //     title: activeProperty?.eiendom?.adresse,
      //   },
      // });
      const params = new URLSearchParams({
        path: String(activeProperty?.id),
        isHtml: String(isHtml),
        title: activeProperty?.eiendom?.adresse || "",
      });
      window.open(`/en/rediger?${params.toString()}`, "_blank");
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreview = async () => {
    try {
      startPreview(async () => {
        await generatePDF("preview");
      });
    } catch (error) {
      console.error(error);
    }
  };

  const generatePDF = async (type: string) => {
    const response = await mutation.mutateAsync({
      url: { apiUrl: APICONSTANT.GENRATE_PDF + activeProperty?.id },
    });
    if (response?.status === true && response?.data?.path) {
      if (type == "download") {
        await downloadFn(
          process.env.NEXT_PUBLIC_SITE_URL + response?.data?.path,
          activeProperty?.eiendom?.adresse || "property",
        );
      } else if (type == "preview") {
        window.open(
          process.env.NEXT_PUBLIC_SITE_URL + response?.data?.path,
          "_blank",
        );
        // router.push("/eiendommer/rediger?path=" + response?.data?.path);
      }
    }
  };

  if (isError)
    return (
      <p className="p-4 text-red-500">Feil ved lasting av egenskapsbilde</p>
    );

  return (
    <div className="w-full">
      <Card className="md:py-4 md:px-5">
        <CardContent className="p-0 space-y-5">
          {(isLoading || isOpenHtmlTemplateLoading) ? (
            <Skeleton className="aspect-[1.5] w-3/4 mx-auto rounded-lg" />
          ) : (
            PropertyImg?.length > 0 &&
            PropertyImg[0].url && (
              <ImageComponent
                src={PropertyImg[0].url}
                alt="img"
                className="w-3/4 mx-auto rounded-lg"
                width={100}
                height={100}
              />
            )
          )}
          <h2 className="text-xl">{activeProperty?.overskrift}</h2>
          <div>
            <p className="text-md">{activeProperty?.eiendom?.adresse}</p>
            <p className="text-md">{activeProperty?.oppdragstype}</p>
          </div>

          {/* high quality */}
          <strong className="text-xl">Høyoppløst PDF</strong>
          <div className="flex flex-wrap gap-3 py-2">
            {user.role == "ADMIN" && (
            <Button
              className="md:px-4"
              size="md"
              disabled={isPending}
              onClick={handleGenererClick}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? (
                "lasting..."
              ) : (
                <>
                  <Cog className="mr-2" size={20} />
                  Generer HTML
                </>
              )}
            </Button>
            )}
            <Button
              className=""
              size="md"
              disabled={isPending}
              onClick={() => handleEdit()}
              variant={"outline"}
            >
              <Edit className="mr-2" size={20} />
              Rediger
            </Button>
            {/* {isHtml && (
              <>
                <Button
                  className=""
                  size="md"
                  onClick={() => handleDownload()}
                  disabled={isDownload}
                  variant={"outline"}
                >
                  {isDownload && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isDownload ? (
                    "lasting..."
                  ) : (
                    <>
                      <Download className="mr-2" size={20} />
                      Nedlasting
                    </>
                  )}
                </Button>
              </>
            )} */}
          </div>

          {/* Templates */}
          <div className="pt-2">
            <strong className="text-xl">Templates</strong>
            <div className="mt-3 border rounded-lg overflow-hidden">
              {isTemplatesLoading ? (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : propertyTemplate.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No templates
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted z-10">
                      <tr className="border-b">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTemplate.map((template) => (
                        <tr
                          key={template.propertyId}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-2">{template.name}</td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  path: String(activeProperty?.id),
                                  isHtml: String(isHtml),
                                  title: activeProperty?.eiendom?.adresse || "",
                                  fileName: template.fileName,
                                });
                                window.open(
                                  `/en/rediger?${params.toString()}`,
                                  "_blank",
                                );
                              }}
                            >
                              <Edit className="mr-2" size={14} />
                              Rediger
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* {isHtml && (
            <Button
              className="w-full"
              variant={"outline"}
              disabled={isPreview}
              onClick={() => handlePreview()}
            >
              {isPreview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPreview ? "lasting..." : <>PDF-forhåndsvisning</>}
            </Button>
          )} */}

          {/* low quality */}
          {/* <strong className="text-xl">Lavoppløst PDF</strong>
          <div className="flex flex-wrap gap-3 py-2">
            <Button className="" size="md">
              <Cog className="mr-2" size={20}/>
              Generer
            </Button>
            <Button className="" size="md" variant={"outline"}>
              <Download className="mr-2" size={20} />
              Nedlasting
            </Button>
          </div> */}
        </CardContent>
      </Card>

      {/* CONFIRM MODAL */}
      <Dialog open={showHtmlModal} onOpenChange={setShowHtmlModal}>
        <DialogContent size="sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Generer HTML</DialogTitle>
            <DialogDescription>
              {isHtml
                ? "An HTML template already exists for this property. Please choose how to proceed."
                : "Choose how to generate the HTML for this property."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-2">
            {/* New */}
            <div className="border rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-medium">
                <FilePlus size={18} />
                {/* Ny mal */}
                New template
              </div>
              <p className="text-sm text-muted-foreground">
                {isHtml
                  ? "The existing template will be deleted and replaced with a completely new default template. All previous changes will be lost."
                  : "Generate the HTML from the default template."}
              </p>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setShowHtmlModal(false);
                  generateHtml();
                }}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {/* Opprett ny mal */}
                Create new template
              </Button>
            </div>

            {/* Existing Template */}
            {templateList?.length > 0 && (
              <div className="border rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <FilePlus size={18} />
                  {/* Ny mal */}
                  Create using existing Template
                </div>
                <p className="text-sm text-muted-foreground">
                  {/* Den eksisterende malen vil bli slettet og erstattet med en helt
                ny standardmal. Alle tidligere endringer går tapt. */}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {templateList?.map((template: MasterTemplate, index: number) => {
                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant={"outline"}
                        disabled={isPending}
                        onClick={() => {
                          setShowHtmlModal(false);
                          generateHtmlWithTemplate(template?._id);
                        }}
                      >
                        {template?.name}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Edit existing — only meaningful once HTML has been generated */}
            {isHtml && (
            <div className="border rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-medium">
                <Pencil size={18} />
                {/* Rediger eksisterende */}
                Edit existing
              </div>
              <p className="text-sm text-muted-foreground">
                {/* Fortsett å redigere den eksisterende malen. Tidligere endringer
                beholdes. */}
                Continue editing the existing template. Previous changes will be
                retained.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowHtmlModal(false);
                  handleEdit();
                }}
              >
                {/* Rediger mal */}
                Edit template
              </Button>
            </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
