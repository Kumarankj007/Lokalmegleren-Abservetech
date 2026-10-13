"use client";
import React, { useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { Property } from "./interface";
import { Button } from "@/components/ui/button";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { Loader2 } from "lucide-react";
import { getUser } from "@/services/authService";

function TableList({
  Property,
  isLoading,
  activeProperty,
  setActiveProperty,
}: {
  Property: Property[];
  isLoading: boolean;
  activeProperty: Property | null;
  setActiveProperty: React.Dispatch<React.SetStateAction<Property | null>>;
}) {
  const [filterValue, setFilterValue] = useState("");
  const mutation = useApiMutation("get");
  const [isPending, startTransition] = useTransition();
  const user = JSON.parse(getUser() || "{}");

  const filteredData = Property.filter(
    (admin) =>
      admin.id.toString().includes(filterValue.toLowerCase()) ||
      admin.eiendom.adresse.toLowerCase().includes(filterValue.toLowerCase()) ||
      admin.overskrift.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const generateHtml = async () => {
    try {
      startTransition(async () => {
        const response = await mutation.mutateAsync({
          url: { apiUrl: APICONSTANT.GENRATE_ALL_HTML },
        });
        if (response?.status) {
          setActiveProperty(null)
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "adresse",
        header: "adresse",
        cell: ({ row }) => {
          const adresse = row?.original?.eiendom.adresse;
          return <div className="lowercase">{adresse || "---"}</div>;
        },
      },
      // {
      //   accessorKey: "adresse",
      //   header: "adresse",
      //   cell: ({ row }) => {
      //     const adresse = row?.original?.eiendom.adresse;
      //     return <div className="lowercase">{adresse || "---"}</div>;
      //   },
      // },
      // {
      //   accessorKey: "prisantydning",
      //   header: "prisantydning",
      //   cell: ({ row }) => {
      //     const prisantydning = row?.original?.prisantydning
      //       ? "kr " +
      //         row?.original?.prisantydning
      //           ?.toLocaleString("no-NO")
      //           .replace(/,/g, " ") +
      //         ",-"
      //       : null;
      //     return <div className="lowercase">{prisantydning || "---"}</div>;
      //   },
      // },
      // {
      //   accessorKey: "oppdragstype",
      //   header: "oppdragstype",
      //   cell: ({ row }) => {
      //     const oppdragstype = row?.original?.oppdragstype;
      //     return <div className="lowercase">{oppdragstype || "---"}</div>;
      //   },
      // },
    ],
    [],
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
        {/* Title */}
        <div className="flex-1 text-xl font-medium text-default-900">
          Eiendomsliste
        </div>

        {/* Right side controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          {user.role == "ADMIN" && (
            <Button variant="default" onClick={generateHtml} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "lasting..." : "Generer Alle HTML"}
            </Button>
          )}
          <Input
            placeholder="Filtrer etter ID, adresse, tittel..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="md:w-[200px] w-full"
          />
        </div>
      </div>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          onRowClick={(row) => setActiveProperty(row.original)}
          activeRow={activeProperty?.id || 0}
        />
      </div>

      {/* Property Modal */}
      {/* <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && (
          <PropertyModal
            mode={modalMode}
            admin={selectedProperty || undefined}
            onClose={() => setIsModalOpen(false)}
            refetch={refetch}
          />
        )}
      </Dialog> */}
    </div>
  );
}

export default TableList;
