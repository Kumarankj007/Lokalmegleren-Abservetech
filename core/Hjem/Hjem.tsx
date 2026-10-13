"use client";
import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Home,
  Pencil,
  Plus,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HjemData, HjemApiResponse } from "./types";
import { EMPTY_HJEM } from "./Constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import HjemFormBody from "./Hjemformbody";

// ── deepSet utility

export function deepSet<T extends object>(
  prev: T,
  path: string,
  value: unknown,
): T {
  const keys = path.split(".");
  const next = structuredClone(prev) as unknown as Record<string, unknown>;
  let cursor = next;
  for (let i = 0; i < keys.length - 1; i++) {
    cursor = cursor[keys[i]] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
  return next as unknown as T;
}

// ── FormData builder

const buildFormData = (data: HjemData): FormData => {
  const fd = new FormData();
  fd.append("banner[title]", data.banner.title);
  data.banner.disc.forEach((d, i) => fd.append(`banner[disc][${i}]`, d));
  if (data.banner.image instanceof File) fd.append("image", data.banner.image);
  fd.append("contactUs[title]", data.contactUs.title);
  data.contactUs.data.forEach((item, i) => {
    fd.append(`contactUs[data][${i}][head]`, item.head);
    fd.append(`contactUs[data][${i}][desc]`, item.desc);
  });
  data.aboutUs.forEach((text, i) => fd.append(`aboutUs[${i}]`, text));
  return fd;
};

// ── PreviewRow

const PreviewRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28 shrink-0">
      {label}
    </span>
    <span className="text-xs text-foreground truncate">{value}</span>
  </div>
);

// ── Main component

const Hjem = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<HjemData>(EMPTY_HJEM);
  const [isPending, startTransition] = React.useTransition();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<HjemApiResponse>("HJEM_ENDPOINT");

  const hjemData: HjemData | null =
    response?.data &&
    typeof response.data === "object" &&
    !("message" in response.data)
      ? response.data
      : null;

  const hasData = !!hjemData?._id;

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        hasData
          ? {
              ...hjemData!,
              banner: {
                ...hjemData!.banner,
                image: hjemData!.banner.image ?? null,
              },
            }
          : EMPTY_HJEM,
      );
    }
  }, [dialogOpen, hasData]); // eslint-disable-line react-hooks/exhaustive-deps

  const postMutation = useApiMutation("post", "");
  const putMutation = useApiMutation("put", "");

  const set = (path: string, value: unknown) =>
    setForm((prev) => deepSet(prev, path, value));

  const handleSave = () => {
    startTransition(async () => {
      try {
        const fd = buildFormData(form);
        const mutation = hasData ? putMutation : postMutation;
        const url = hasData
          ? `${APICONSTANT.HJEM_ENDPOINT}`
          : APICONSTANT.HJEM_ENDPOINT;

        const res = await mutation.mutateAsync({
          url: { apiUrl: url },
          body: fd,
        });

        if (!res?.error) {
          await queryClient.invalidateQueries({ queryKey: ["HJEM_ENDPOINT"] });
          refetch();
          setDialogOpen(false);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const valid = form.banner.title.trim().length > 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          {/* ── Header ── */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Home className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">
                  Hjem
                </h1>
                <p className="text-xs text-muted-foreground">
                  Homepage content
                </p>
              </div>
            </div>

            {/* Always show — Create when empty, Edit when exists */}
            {!isLoading && (
              <Button
                type="button"
                color="primary"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="gap-1.5"
              >
                {hasData ? (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit Page</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Create Page</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {/* ── Error (real network error, not "not found") ── */}
          {isError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load homepage content.</span>
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-auto flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* ── Empty state — document doesn't exist yet ── */}
          {!isLoading && !isError && !hasData && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-border">
              <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
                <Home className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No homepage content yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Create the homepage banner, contact section and about us.
                </p>
              </div>
              <Button
                type="button"
                variant="soft"
                color="primary"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Create homepage
              </Button>
            </div>
          )}

          {/* ── Content preview ── */}
          {!isLoading && !isError && hasData && hjemData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-pink-500/20 bg-card p-4 space-y-2">
                <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider block mb-3">
                  Banner
                </span>
                <PreviewRow label="Title" value={hjemData.banner.title} />
                <PreviewRow
                  label="Disc items"
                  value={hjemData.banner.disc.length}
                />
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-card p-4 space-y-2">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-3">
                  Contact Us
                </span>
                <PreviewRow label="Title" value={hjemData.contactUs.title} />
                <PreviewRow
                  label="Items"
                  value={hjemData.contactUs.data.length}
                />
              </div>

              <div className="rounded-xl border border-sky-500/20 bg-card p-4 space-y-2">
                <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block mb-3">
                  About Us
                </span>
                <PreviewRow label="Items" value={hjemData.aboutUs.length} />
                {hjemData.aboutUs[0] && (
                  <PreviewRow label="First" value={hjemData.aboutUs[0]} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Dialog (shared for create + edit) ── */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(v) => !v && setDialogOpen(false)}
        >
          <DialogContent
            size="lg"
            className="flex flex-col max-h-[90dvh] p-0 gap-0 overflow-hidden"
          >
            <DialogHeader className="shrink-0 px-4 sm:px-6 py-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  {hasData ? (
                    <Pencil className="w-3 h-3 text-primary" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-semibold leading-tight">
                    {hasData ? "Edit Homepage" : "Create Homepage"}
                  </DialogTitle>
                  <DialogDescription>
                    <span className="text-[11px] text-muted-foreground">
                      {hasData
                        ? "Update banner, contact us, and about us content"
                        : "Set up the homepage banner, contact section and about us"}
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 min-h-0">
              <HjemFormBody form={form} set={set} />
            </div>

            <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 border-t border-border/60 bg-muted/10">
              <Button
                type="button"
                color="primary"
                size="md"
                disabled={!valid || isPending}
                onClick={handleSave}
                className="gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isPending
                  ? "Saving…"
                  : hasData
                    ? "Save Changes"
                    : "Create Page"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                color="secondary"
                size="md"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Hjem;
