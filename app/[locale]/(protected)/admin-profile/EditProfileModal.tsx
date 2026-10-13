"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { countryCodes } from "@/app/constants/countryCode";

interface ProfileApiResponse {
  error: boolean;
  message: string;
  data: {
    name: string;
    email: string;
    password: string;
    phoneCode: string;
    phoneNumber: string;
    professionalTitle: string | null;
    bio: string | null;
    // profilePic?: {
    //     url: string;
    //     public_id: string;
    // } | null;
    role?: string;
  };
}

interface EditProfileModalProps {
  profile: ProfileApiResponse["data"];
  onClose: () => void;
  refetch: () => void;
}

// Zod Schema for Validation
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  professionalTitle: z.string(),
  bio: z.string(),
  password: z.string().optional(),
  phoneCode: z.string().min(1, "Code required"),
  phoneNumber: z.string().min(6, "Phone number required"),
  // profilePic: z
  //     .instanceof(File)
  //     .optional()
  //     .refine((file) => !file || file.type.startsWith("image/"), {
  //         message: "Must be an image file",
  //     }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onClose,
  refetch,
}) => {
  const [isPending, startTransition] = React.useTransition();
  // const [previewImage, setPreviewImage] = useState(profile.profilePic?.url);
  const updateProfile = useApiMutation("put", "");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phoneCode: profile.phoneCode,
      phoneNumber: profile.phoneNumber,
      professionalTitle: profile?.professionalTitle || "",
      bio: profile?.bio || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    startTransition(async () => {
      try {
        // console.log(data,  "data")
        // const formData = new FormData();
        // formData.append("name", data.name);
        // formData.append("professionalTitle", data.professionalTitle);
        // formData.append("bio", data.bio);
        // formData.append("email", data.email);
        // formData.append("password", data.password || "");
        // formData.append("phoneCode", data.phoneCode);
        // formData.append("phoneNumber", data.phoneNumber);

        // Temporarily commenting profilePic
        // if (data.profilePic) {
        //     formData.append("profilePic", data.profilePic);
        // }

        const response = await updateProfile.mutateAsync({
          url: { apiUrl: `${APICONSTANT.UPDATE_PROFILE}` },
          body: data,
        });

        if (!response?.error) {
          await queryClient.invalidateQueries({ queryKey: ["profileData"] });
        }
        onClose();
        refetch();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <DialogContent size="md">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Update your profile information below.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input readOnly type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label>Password</Label>
          <Input type="password" {...register("password")} />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Phone Code */}
        <div>
          <Label>Phone Code</Label>
          <select
            {...register("phoneCode")}
            defaultValue={profile.phoneCode}
            className="w-full rounded border border-default-200 py-2 px-3 h-9 text-sm font-normal bg-background focus:border-primary focus:outline-hidden"
          >
            {countryCodes.map(({ code, label }) => (
              <option key={code} value={code}>
                {label} ({code})
              </option>
            ))}
          </select>
          {errors.phoneCode && (
            <p className="text-red-500 text-xs">{errors.phoneCode.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <Label>Phone Number</Label>
          <Input {...register("phoneNumber")} />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Professional title */}
        <div>
          <Label>Professional title</Label>
          <Input {...register("professionalTitle")} />
          {errors.professionalTitle && (
            <p className="text-red-500 text-xs">
              {errors.professionalTitle.message}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label>Bio</Label>
          <Input {...register("bio")} />
          {errors.bio && (
            <p className="text-red-500 text-xs">{errors.bio.message}</p>
          )}
        </div>

        {/* Temporarily commented Profile Picture */}
        {/* <div>
                    <Label>Profile Picture</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setValue("profilePic", file);
                                const reader = new FileReader();
                                reader.onload = () => setPreviewImage(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-16 h-16 rounded-full mt-2"
                        />
                    )}
                    {errors.profilePic && (
                        <p className="text-red-500 text-xs">{errors.profilePic.message}</p>
                    )}
                </div> */}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default EditProfileModal;
