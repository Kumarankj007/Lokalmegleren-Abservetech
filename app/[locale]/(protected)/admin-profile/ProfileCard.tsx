"use client";
import React, { useEffect, useState } from "react";
import useReactQuery from "@/hooks/useReactQuery";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditProfileModal from "./EditProfileModal";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
interface ProfileApiResponse {
  error: boolean;
  message: string;
  data: {
    name: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    password: string;
    professionalTitle: string | null;
    bio: string | null;
    profilePic?: {
      url: string;
      public_id: string;
    } | null;
    role?: string;
  };
}

function ProfileCard() {
  const [displayProfile, setDisplayProfile] = useState<
    ProfileApiResponse["data"] | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: previewProfile,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<ProfileApiResponse>("GET_PROFILE");

  useEffect(() => {
    if (previewProfile && !previewProfile.error) {
      setDisplayProfile(previewProfile.data);
    }
  }, [previewProfile]);

  const profilePicture = `${process.env.NEXT_PUBLIC_SITE_URL}${"admins"}${
    displayProfile?.profilePic?.url
  }`;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (isError || previewProfile?.error) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400">
        Failed to load profile.
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No profile data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex flex-col gap-[30px]">
        {/* Profile Picture & Name */}
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-16 h-16 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">

          <Avatar className="w-16 h-16">
            <AvatarImage src={profilePicture} alt={profilePicture || "Admin"} />
            <AvatarFallback className=" text-[30px] font-semibold ">
              {"A"}
            </AvatarFallback>
          </Avatar>
            {/* <Image
              src={
                displayProfile?.profilePic?.url !== undefined
                  ? profilePicture
                  : "/profile.jpeg"
              }
              alt="Profile"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            /> */}
          </div>
          <div>
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {displayProfile.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayProfile.email}
            </p>
          </div>
        </div>

        {/* Personal Info */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <InfoItem label="Full Name" value={`${displayProfile.name}`} />
            <InfoItem label="Email Address" value={displayProfile.email} />
            <InfoItem
              label="Phone"
              value={
                `${displayProfile.phoneCode} ${displayProfile.phoneNumber}` ||
                "-"
              }
            />
            <InfoItem
              label="Professional Title"
              value={displayProfile?.professionalTitle || "--"}
            />
            <InfoItem label="Bio" value={displayProfile?.bio || "--"} />
            {/* <InfoItem label="Role" value={displayProfile.role || '-'} /> */}
          </div>
        </div>
      </div>

      {/* Edit Button + Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4 gap-1">
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Edit
            </Button>
          </DialogTrigger>
        </div>
        <EditProfileModal
          profile={displayProfile}
          onClose={() => setIsDialogOpen(false)}
          refetch={refetch}
        />
      </Dialog>
    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-2 text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value}
    </p>
  </div>
);

export default ProfileCard;
