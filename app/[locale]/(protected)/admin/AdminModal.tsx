'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useApiMutation from '@/hooks/Mutations/useApiMutation'
import { APICONSTANT } from '@/services/config'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/passwordInput'
import CountryCode from '@/utils/CountryCode'
import PhoneLengthByCountry from '@/utils/PhoneLengthByCountry'

interface AdminModalProps {
  mode: "add" | "edit";
  admin?: {
    _id?: string;
    firstname: string;
    lastname: string;
    name: string;
    email: string;
  };
  onClose: () => void;
  refetch: () => void;
}

const baseSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars").optional(),
  phoneCode: z.string().min(1, "Select country code"),
  phoneNumber: z.string().min(1, "Phone number required"),
}).superRefine((data, ctx) => {
  const countryEntry = CountryCode.find(
    (c: any) => c.dial_code === data.phoneCode
  );

  if (!countryEntry) return;

  const countryCode = countryEntry.code;

  const requiredLength = PhoneLengthByCountry[countryCode];

  if (!requiredLength) return;

  if (data.phoneNumber.length !== requiredLength) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phoneNumber"],
      message: `Invalid phone number — ${countryEntry.name} requires ${requiredLength} digits`,
    });
  }
  // .refine((data) => {
  //   const country = data.phoneCode.replace("+", ""); // remove + sign
  //   const countryEntry = CountryCode.find((c) => c.dial_code === data.phoneCode);
  //   if (!countryEntry) return false;
  //   const lenKey = countryEntry.code as keyof typeof PhoneLengthByCountry;
  //   const requiredLength = PhoneLengthByCountry[lenKey] ?? 0;
  //   return data.phoneNumber.length === requiredLength;
  // }, {
  //   message: "Invalid phone number length",
  //   path: ["phoneNumber"],
});

type AdminFormValues = z.infer<typeof baseSchema>;

const AdminModal: React.FC<AdminModalProps> = ({ mode, admin, onClose, refetch }) => {
  const [isPending, startTransition] = React.useTransition();
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const mutation = useApiMutation(mode === "add" ? "post" : "put", "");

  const filteredCountries = CountryCode.filter((c) =>
    `${c.code} ${c.dial_code}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AdminFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      firstname: admin?.firstname || "",
      lastname: admin?.lastname || "",
      email: admin?.email || "",
      phoneCode: "",
      phoneNumber: "",
    }
  });

  const onSubmit = async (data: AdminFormValues) => {
    startTransition(async () => {
      try {
        const fullName = `${data?.firstname} ${data?.lastname}`
        const payload = {
          name: fullName,
          email: data?.email,
          password: data?.password,
          phoneCode: data?.phoneCode,
          phoneNumber: data?.phoneNumber,
        }

        const response = await mutation.mutateAsync({
          url: { apiUrl: mode === "add" ? APICONSTANT.ADD_ADMIN : `${APICONSTANT.UPDATE_ADMIN}` },
          body: payload,
        });

        if (!response?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_ADMIN"] });
        }

        onClose();
        refetch();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <DialogContent size="sm">
      <DialogHeader>
        <DialogTitle>{mode === "add" ? "Add Admin" : "Edit Admin"}</DialogTitle>
        <DialogDescription>
          {mode === "add"
            ? "Fill in details to create a new admin."
            : "Update admin details below."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>First Name</Label>
          <Input {...register("firstname")} />
          {errors.firstname && (
            <p className="text-red-500 text-xs">{errors.firstname.message}</p>
          )}
        </div>

        <div>
          <Label>Last Name</Label>
          <Input {...register("lastname")} />
          {errors.lastname && (
            <p className="text-red-500 text-xs">{errors.lastname.message}</p>
          )}
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label>Phone Number</Label>
          <div className="flex gap-2">
            {/* Country Code Dropdown */}
            {/* <Select
              onValueChange={(value) => {
                const [countryCode, dial] = value.split("|");
                setValue("phoneCode", dial);
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Code" />
              </SelectTrigger>

              <SelectContent>
                {CountryCode.map((c) => (
                  <SelectItem
                    key={`${c.code}-${c.dial_code}`}
                    value={`${c.code}|${c.dial_code}`}
                  >
                    {c.code} ({c.dial_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            <Select
              onValueChange={(value) => {
                const [countryCode, dial] = value.split("|");
                setValue("phoneCode", dial);
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Code" />
              </SelectTrigger>

              <SelectContent>

                <div className="p-2 sticky top-0 z-10">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full border px-2 py-1 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {filteredCountries.length === 0 ? (
                  <p className="p-2 text-sm text-gray-400">No results</p>
                ) : (
                  filteredCountries.map((c) => (
                    <SelectItem
                      key={`${c.code}-${c.dial_code}`}
                      value={`${c.code}|${c.dial_code}`}
                    >
                      {c.code} ({c.dial_code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Input
              type="text"
              maxLength={15}
              {...register("phoneNumber")}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setValue("phoneNumber", onlyDigits);
              }}
            />
          </div>

          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {mode === "add" && (
          <div>
            <Label>Password</Label>
            <PasswordInput {...register("password")} />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? mode === "add"
                ? "Creating..."
                : "Updating..."
              : mode === "add"
                ? "Create"
                : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AdminModal;