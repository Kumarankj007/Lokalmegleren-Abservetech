"use client";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import useReactQuery from "@/hooks/useReactQuery";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import AdminModal from "./AdminModal";

interface Admin {
  _id?: string;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profilePic?: {
    url: string;
    public_id: string;
  } | null;
}

interface AdminApiResponse {
  error: boolean;
  data?: {
    data?: Admin[];
  };
}

function AdminList() {
  const {
    data: previewAdmin,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<AdminApiResponse>("GET_ADMIN");

  const Admin: Admin[] = previewAdmin?.data?.data || [];

  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const filteredData = Admin.filter(
    (admin) =>
      admin.email.toLowerCase().includes(filterValue.toLowerCase()) ||
      admin.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      admin.role.toLowerCase().includes(filterValue.toLowerCase())
  );

  const handleAdd = () => {
    setModalMode("add");
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setModalMode("edit");
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log("Delete Admin:", id);
  };

  const columns = useMemo<ColumnDef<Admin>[]>(
    () => [
      {
        accessorKey: "name",
        header: "name",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const email = row?.original?.email;
          return <div className="lowercase">{email || "---"}</div>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Posted On",
        cell: ({ getValue }) =>
          new Date(getValue() as string).toLocaleDateString(),
      },
      // {
      //   id: "actions",
      //   header: "",
      //   cell: ({ row }) => {
      //     const query = row.original;
      //     return (
      //       <DropdownMenu>
      //         <DropdownMenuTrigger className="p-2 rounded cursor-pointer">
      //           <MoreVertical className="w-5 h-5" />
      //         </DropdownMenuTrigger>
      //         <DropdownMenuContent align="end">
      //           <DropdownMenuItem onClick={() => handleEdit(query)}>
      //             {/* Edit Icon */}
      //             <svg
      //               className="fill-current"
      //               width="18"
      //               height="18"
      //               viewBox="0 0 18 18"
      //               xmlns="http://www.w3.org/2000/svg"
      //             >
      //               <path
      //                 fillRule="evenodd"
      //                 clipRule="evenodd"
      //                 d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
      //               />
      //             </svg>
      //             <p className="px-2">Edit</p>
      //           </DropdownMenuItem>

      //           <DropdownMenuItem
      //             onClick={() => handleDelete(query._id)}
      //             className="text-red-500"
      //           >
      //             {/* Delete Icon */}
      //             <svg
      //               xmlns="http://www.w3.org/2000/svg"
      //               width="18"
      //               height="18"
      //               viewBox="0 0 24 24"
      //               fill="none"
      //               stroke="currentColor"
      //               strokeWidth="2"
      //               strokeLinecap="round"
      //               strokeLinejoin="round"
      //               className="w-4 h-4"
      //             >
      //               <polyline points="3 6 5 6 21 6" />
      //               <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
      //               <line x1="10" y1="11" x2="10" y2="17" />
      //               <line x1="14" y1="11" x2="14" y2="17" />
      //             </svg>
      //             <p className="px-2">Delete</p>
      //           </DropdownMenuItem>
      //         </DropdownMenuContent>
      //       </DropdownMenu>
      //     );
      //   },
      // },
    ],
    []
  );

  if (isError) return <p className="p-4 text-red-500">Error loading Admins.</p>;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
        {/* Title */}
        <div className="flex-1 text-xl font-medium text-default-900">Admin</div>

        {/* Right side controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Input
            placeholder="Filter by name, email, or role..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={handleAdd}
          >
            {/* Add Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </Button>
        </div>
      </div>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
        />
      </div>

      {/* Admin Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && (
          <AdminModal
            mode={modalMode}
            admin={selectedAdmin || undefined}
            onClose={() => setIsModalOpen(false)}
            refetch={refetch}
          />
        )}
      </Dialog>
    </div>
  );
}

export default AdminList;
