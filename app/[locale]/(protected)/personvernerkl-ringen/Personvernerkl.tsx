"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Shield,
} from "lucide-react";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentSection } from "@/core/personvernerkl-ringen/FormDialogComponents/types";
import { EMPTY_SECTION } from "@/core/personvernerkl-ringen/PrivacyListComponents/Constants";
import PersonvernCard from "@/core/personvernerkl-ringen/PrivacyListComponents/Personverncard";
import PersonvernEditDialog from "@/core/personvernerkl-ringen/PrivacyListComponents/Personverneditdialog";

export interface ApiResponse {
  data: ContentSection[];
  error?: boolean;
}

const Personvernerkl = () => {
  const queryClient = useQueryClient();
  const [dialogTarget, setDialogTarget] = useState<ContentSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentSection | null>(null);

  const [isPending, startTransition] = React.useTransition();
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<ApiResponse>("GET_PERSONVERN");

  const sections: ContentSection[] = response?.data ?? [];

  const addMutation = useApiMutation("post", "");
  const editMutation = useApiMutation("put", "");
  const deleteMutation = useApiMutation("delete", "");

  const isEditing = !!dialogTarget?._id;

  const handleSave = (data: ContentSection) => {
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
          ...(data.p1?.trim() && { p1: data.p1 }),
          ...(data.p2?.trim() && { p2: data.p2 }),
          ...(data.note && { note: data.note }),
          ...(data.li?.length && { li: data.li }),
          ...(data.address?.length && { address: data.address }),
        };
        const mutation = isEditing ? editMutation : addMutation;
        const res = await mutation.mutateAsync({
          url: {
            apiUrl: isEditing
              ? `${APICONSTANT.UPDATE_PERSONVERN}/${dialogTarget._id}`
              : APICONSTANT.ADD_PERSONVERN,
          },
          body: payload,
        });
        if (!res?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_PERSONVERN"] });
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
            apiUrl: `${APICONSTANT.DELETE_PERSONVERN}/${deleteTarget._id}`,
          },
        });
        if (!res?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_PERSONVERN"] });
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
                <Shield className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">
                  Personvernerklæring
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Loading…"
                    : `${sections.length} section${sections.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <Button
              type="button"
              color="primary"
              size="sm"
              onClick={() => setDialogTarget(EMPTY_SECTION)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Section</span>
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
              <span>Failed to load sections.</span>
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
                  No sections yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Add your first privacy policy section to get started.
                </p>
              </div>
              <Button
                type="button"
                variant="soft"
                color="primary"
                size="sm"
                onClick={() => setDialogTarget(EMPTY_SECTION)}
                className="gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add first section
              </Button>
            </div>
          )}

          {/* ── Section List — 2-column grid ── */}
          {!isLoading && sections.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sections.map((section, i) => (
                <PersonvernCard
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
        <PersonvernEditDialog
          open={!!dialogTarget}
          onClose={() => setDialogTarget(null)}
          initial={dialogTarget ?? EMPTY_SECTION}
          onSave={handleSave}
          isSaving={isPending}
          mode={isEditing ? "edit" : "add"}
        />

        {/* ── Delete Modal ── */}
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Section"
          description={
            deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
              : "Are you sure you want to delete this section? This action cannot be undone."
          }
          confirmText={isDeletePending ? "Deleting…" : "Delete"}
          cancelText="Cancel"
        />
      </div>
    </TooltipProvider>
  );
};

export default Personvernerkl;
