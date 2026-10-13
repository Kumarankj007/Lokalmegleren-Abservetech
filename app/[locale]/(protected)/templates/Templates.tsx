"use client";

import React, { useState, useTransition } from "react";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import TableList from "./TableList";
import { MasterTemplate, MasterTemplatesResponse } from "./interface";
import { fetchBaseTemplateHtml, openTemplateEditor } from "./utils";

function Templates() {
  const { data, isLoading, isError, refetch } =
    useReactQuery<MasterTemplatesResponse>("GET_MASTER_TEMPLATES");

  const templates: MasterTemplate[] = data?.data || [];

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, startCreate] = useTransition();

  const createMutation = useApiMutation("post");

  const handleCreate = () => {
    if (!name.trim()) return;
    startCreate(async () => {
      try {
        const html = await fetchBaseTemplateHtml(name.trim());
        const response = await createMutation.mutateAsync({
          url: { apiUrl: APICONSTANT.CREATE_MASTER_TEMPLATE },
          body: {
            name: name.trim(),
            description: description.trim(),
            html,
          },
        });
        if (response?.status && response?.data?._id) {
          setShowCreate(false);
          setName("");
          setDescription("");
          refetch();
          openTemplateEditor({
            _id: response.data._id,
            name: response.data.name,
          });
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  if (isError) {
    return <p className="p-4 text-red-500">Feil ved lasting av maler</p>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
        <div className="flex-1 text-xl font-medium text-default-900">Maler</div>
        <Button variant="default" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny mal
        </Button>
      </div>

      <div className="p-4">
        <TableList templates={templates} isLoading={isLoading} refetch={refetch} />
      </div>

      {/* Create template dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent size="sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Ny mal</DialogTitle>
            <DialogDescription>
              Gi malen et navn. Du blir sendt til redigeringsprogrammet for å
              designe den.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="template-name">Navn</Label>
              <Input
                id="template-name"
                placeholder="F.eks. Standard prospekt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="template-description">Beskrivelse (valgfritt)</Label>
              <Textarea
                id="template-description"
                placeholder="Kort beskrivelse av malen"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              disabled={isCreating}
            >
              Avbryt
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Oppretter..." : "Opprett og rediger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Templates;
