"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  BriefcaseBusiness,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT, APIURLS } from "@/services/config";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VacancySection } from "./types";
import { EMPTY_VACANCY_SECTION } from "./Constants";
import VacancyCard from "./Vacancycard";
import VacancyEditDialog from "./Vacancyeditdialog";

export interface ApiResponse {
  data: VacancySection[];
  error?: boolean;
}

// ── FormData builder

const buildFormData = (data: VacancySection, order: number): FormData => {
  const fd = new FormData();
  fd.append("order", String(order));
  if (data.head) fd.append("head", data.head);
  if (data.p) fd.append("p", data.p);
  if (data.detailTitle !== undefined && data.detailTitle !== null)
    fd.append("detailTitle", data.detailTitle);
  if (data.detailDesc !== undefined) fd.append("detailDesc", data.detailDesc);
  if (data.image instanceof File) fd.append("image", data.image);
  if (data.detailImage instanceof File)
    fd.append("detailImage", data.detailImage);
  return fd;
};

// ─────────────────────────────────────────────────────────────────────────

const Vacancy = () => {
  const queryClient = useQueryClient();

  const [dialogTarget, setDialogTarget] = useState<VacancySection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VacancySection | null>(null);

  const [isPending, startTransition] = React.useTransition();
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<ApiResponse>("VACENCY_ENDPOINT");

  const allSections: VacancySection[] = response?.data ?? [];
  const banner = allSections[0] ?? null; // order 1 — shown as banner preview
  const cards = allSections.slice(1); // order 2+ — shown as cards grid

  const addMutation = useApiMutation("post", "");
  const editMutation = useApiMutation("put", "");
  const deleteMutation = useApiMutation("delete", "");

  const isEditing = !!dialogTarget?._id;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["VACENCY_ENDPOINT"] });
    refetch();
  };

  // ── Save (add / edit)
  const handleSave = (data: VacancySection) => {
    startTransition(async () => {
      try {
        const nextOrder = isEditing
          ? (dialogTarget.order ?? 1)
          : allSections.length > 0
            ? Math.max(...allSections.map((s) => s.order ?? 0)) + 1
            : 1;

        const fd = buildFormData(data, nextOrder);
        const mutation = isEditing ? editMutation : addMutation;
        const res = await mutation.mutateAsync({
          url: {
            apiUrl: isEditing
              ? `${APICONSTANT.VACENCY_ENDPOINT}/${dialogTarget._id}`
              : APICONSTANT.VACENCY_ENDPOINT,
          },
          body: fd,
        });
        if (!res?.error) {
          await invalidate();
          setDialogTarget(null);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // ── Delete
  const handleDelete = () => {
    if (!deleteTarget?._id) return;
    startDeleteTransition(async () => {
      try {
        const res = await deleteMutation.mutateAsync({
          url: {
            apiUrl: `${APICONSTANT.VACENCY_ENDPOINT}/${deleteTarget._id}`,
          },
        });
        if (!res?.error) {
          await invalidate();
          setDeleteTarget(null);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const getBannerImageSrc = () => {
    if (!banner?.image) return null;
    if (banner.image instanceof File) return URL.createObjectURL(banner.image);
    if (typeof banner.image === "string")
      return `${APIURLS.imageUrl}${banner.image}`;
    return null;
  };
  const bannerImageSrc = getBannerImageSrc();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
          {/* ── Page header ── */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BriefcaseBusiness className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">
                  Ledige stillinger
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Loading…"
                    : `${allSections.length} item${allSections.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <Button
              type="button"
              color="primary"
              size="sm"
              onClick={() => setDialogTarget(EMPTY_VACANCY_SECTION)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {/* ── Error ── */}
          {isError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/8 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load vacancy content.</span>
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

          {!isLoading && !isError && (
            <>
              {/* ── Banner (first item, edit-only — no delete) ── */}
              {banner ? (
                <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  {/* header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Banner
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        Edit only
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDialogTarget(banner)}
                      className="gap-1.5 h-7 px-2.5 text-xs"
                      disabled={isPending && dialogTarget?._id === banner._id}
                    >
                      {isPending && dialogTarget?._id === banner._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5" />
                      )}
                      Edit Banner
                    </Button>
                  </div>

                  {/* preview */}
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {bannerImageSrc && (
                      <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden border border-border/40 shrink-0">
                        <Image
                          src={bannerImageSrc}
                          alt="Banner"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-center gap-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {banner.head ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {banner.p ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* No data yet — first upload becomes banner */
                <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5">
                  <p className="text-xs font-medium text-amber-400">
                    No items yet — the first item you add will become the banner
                  </p>
                  <Button
                    type="button"
                    variant="soft"
                    color="primary"
                    size="sm"
                    onClick={() => setDialogTarget(EMPTY_VACANCY_SECTION)}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add first item
                  </Button>
                </div>
              )}

              {/* ── Cards (order 2+) ── */}
              {cards.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Content Cards
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">
                      {cards.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cards.map((card, i) => (
                      <VacancyCard
                        key={card._id ?? i}
                        section={card}
                        index={i}
                        onEdit={() => setDialogTarget(card)}
                        onDelete={() => setDeleteTarget(card)}
                        isDeleting={
                          isDeletePending && deleteTarget?._id === card._id
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* ── Add / Edit dialog ── */}
        <VacancyEditDialog
          open={!!dialogTarget}
          onClose={() => setDialogTarget(null)}
          initial={dialogTarget ?? EMPTY_VACANCY_SECTION}
          onSave={handleSave}
          isSaving={isPending}
          mode={isEditing ? "edit" : "add"}
        />

        {/* ── Delete modal (only for cards, not banner) ── */}
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Item"
          description={
            deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.head}"? This action cannot be undone.`
              : "Are you sure you want to delete this item? This action cannot be undone."
          }
          confirmText={isDeletePending ? "Deleting…" : "Delete"}
          cancelText="Cancel"
        />
      </div>
    </TooltipProvider>
  );
};

export default Vacancy;
