"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Loader2, Power, Trash2 } from "lucide-react";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MasterTemplate } from "./interface";
import { openTemplateEditor } from "./utils";

function TableList({
  templates,
  isLoading,
  refetch,
}: {
  templates: MasterTemplate[];
  isLoading: boolean;
  refetch: () => void;
}) {
  const [filterValue, setFilterValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MasterTemplate | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deleteMutation = useApiMutation("delete");
  const updateMutation = useApiMutation("put");

  const filteredData = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      (template.description || "")
        .toLowerCase()
        .includes(filterValue.toLowerCase()),
  );

  const handleToggleActive = (template: MasterTemplate) => {
    setTogglingId(template._id);
    startTransition(async () => {
      try {
        const response = await updateMutation.mutateAsync({
          url: { apiUrl: APICONSTANT.UPDATE_MASTER_TEMPLATE + template._id },
          body: { isActive: !template.isActive },
        });
        if (response?.status) refetch();
      } catch (error) {
        console.error(error);
      } finally {
        setTogglingId(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    startTransition(async () => {
      try {
        const response = await deleteMutation.mutateAsync({
          url: { apiUrl: APICONSTANT.DELETE_MASTER_TEMPLATE + id },
        });
        if (response?.status) refetch();
      } catch (error) {
        console.error(error);
      } finally {
        setDeleteTarget(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<MasterTemplate>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Navn",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name || "---"}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Beskrivelse",
        cell: ({ row }) => (
          <div className="text-muted-foreground max-w-xs truncate">
            {row.original.description || "---"}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge color={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Aktiv" : "Inaktiv"}
          </Badge>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Oppdatert",
        cell: ({ row }) => {
          const updatedAt = row.original.updatedAt;
          return (
            <div className="text-muted-foreground">
              {updatedAt ? new Date(updatedAt).toLocaleDateString("nl-NL") : "---"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Handlinger</div>,
        cell: ({ row }) => {
          const template = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openTemplateEditor(template)}
              >
                <Edit className="mr-2" size={14} />
                Rediger
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending && togglingId === template._id}
                onClick={() => handleToggleActive(template)}
                title={template.isActive ? "Deaktiver" : "Aktiver"}
              >
                {isPending && togglingId === template._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power size={14} />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(template)}
                title="Slett"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          );
        },
      },
    ],
    [isPending, togglingId],
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end py-2 gap-3 sm:gap-4">
        <Input
          placeholder="Filtrer etter navn eller beskrivelse..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="md:w-[260px] w-full"
        />
      </div>

      <div className="pt-2">
        <DataTable columns={columns} data={filteredData} isLoading={isLoading} hoverableRow={false} />
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slette mal?</AlertDialogTitle>
            <AlertDialogDescription>
              Malen «{deleteTarget?.name}» og HTML-filen vil bli slettet
              permanent. Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TableList;
