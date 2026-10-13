import { DataTable } from "@/components/ui/tablereusable";
import React, { Dispatch, useMemo } from "react";
import { MonthlyRevenue } from "../DashboardClient";
import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction } from "jotai";
import { priceFormat } from "@/lib/utils";

export default function CompanyTable({
  data,
  isLoading,
  page,
  totalPages,
  setPage,
}: {
  data: MonthlyRevenue[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const columns = useMemo<ColumnDef<MonthlyRevenue>[]>(
    () => [
      {
        accessorKey: "month",
        header: "Month",
        cell: ({ row }) => {
          const title = row?.original?.month;
          return (
            <div className="w-[200px] py-2">
              <p>{title || "---"}</p>{" "}
            </div>
          );
        },
      },
      {
        accessorKey: "net_amount",
        header: "Net Amount",
        cell: ({ row }) => {
          const title = priceFormat(row?.original?.net || 0, 2);
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
    ],
    []
  );
  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
