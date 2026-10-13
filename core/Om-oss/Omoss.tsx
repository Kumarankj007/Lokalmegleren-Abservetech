"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Building2,
} from "lucide-react";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OmOssSection } from "./types";
import { EMPTY_OMOSS_SECTION } from "./Constants";
import OmOssCard from "./OmOssCard";
import OmOssEditDialog from "./OmOssEditDialog";

export interface ApiResponse {
  data: OmOssSection[];
  error?: boolean;
}

const OmOss = () => {
  const queryClient = useQueryClient();
  const [dialogTarget, setDialogTarget] = useState<OmOssSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OmOssSection | null>(null);

  const [isPending, startTransition] = React.useTransition();
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<ApiResponse>("ABOUT_ENDPOINT");

  const sections: OmOssSection[] = response?.data ?? [];

  const addMutation = useApiMutation("post", "");
  const editMutation = useApiMutation("put", "");
  const deleteMutation = useApiMutation("delete", "");

  const isEditing = !!dialogTarget?._id;

  const handleSave = (data: OmOssSection) => {
    startTransition(async () => {
      try {
        const nextOrder = isEditing
          ? (dialogTarget.order ?? 1)
          : sections.length > 0
            ? Math.max(...sections.map((s) => s.order ?? 0)) + 1
            : 1;

        const payload = {
          order: nextOrder,
          title: data.title,
          ...(data.li?.length && { li: data.li }),
        };

        const mutation = isEditing ? editMutation : addMutation;
        const res = await mutation.mutateAsync({
          url: {
            apiUrl: isEditing
              ? `${APICONSTANT.ABOUT_ENDPOINT}/${dialogTarget._id}`
              : APICONSTANT.ABOUT_ENDPOINT,
          },
          body: payload,
        });

        if (!res?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_OMOSS"] });
          refetch();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDialogTarget(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget?._id) return;
    startDeleteTransition(async () => {
      try {
        const res = await deleteMutation.mutateAsync({
          url: {
            apiUrl: `${APICONSTANT.ABOUT_ENDPOINT}/${deleteTarget._id}`,
          },
        });
        if (!res?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_OMOSS"] });
          refetch();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDeleteTarget(null);
      }
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          {/* ── Header ── */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Building2 className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">
                  Om oss
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Loading…"
                    : `${sections.length} block${sections.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <Button
              type="button"
              color="primary"
              size="sm"
              onClick={() => setDialogTarget(EMPTY_OMOSS_SECTION)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Block</span>
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
              <span>Failed to load blocks.</span>
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

          {/* ── Empty state ── */}
          {!isLoading && !isError && sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-border">
              <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No blocks yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Add your first Om oss content block to get started.
                </p>
              </div>
              <Button
                type="button"
                variant="soft"
                color="primary"
                size="sm"
                onClick={() => setDialogTarget(EMPTY_OMOSS_SECTION)}
                className="gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add first block
              </Button>
            </div>
          )}

          {/* ── Block List — 2-column grid ── */}
          {!isLoading && sections.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sections.map((section, i) => (
                <OmOssCard
                  key={section._id ?? i}
                  section={section}
                  index={i}
                  onEdit={() => setDialogTarget(section)}
                  onDelete={() => setDeleteTarget(section)}
                  isDeleting={
                    isDeletePending && deleteTarget?._id === section._id
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Add / Edit Dialog ── */}
        <OmOssEditDialog
          open={!!dialogTarget}
          onClose={() => setDialogTarget(null)}
          initial={dialogTarget ?? EMPTY_OMOSS_SECTION}
          onSave={handleSave}
          isSaving={isPending}
          mode={isEditing ? "edit" : "add"}
        />

        {/* ── Delete Modal ── */}
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Block"
          description={
            deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
              : "Are you sure you want to delete this block? This action cannot be undone."
          }
          confirmText={isDeletePending ? "Deleting…" : "Delete"}
          cancelText="Cancel"
        />
      </div>
    </TooltipProvider>
  );
};

export default OmOss;
