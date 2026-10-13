"use client";
import { useEffect } from "react";
import { useProfileStore } from "@/app/store/userProfileStore";
// import { useQuery } from "@tanstack/react-query";
// import { APICONSTANT } from "@/services/config";
// import { getApiMethos } from "@/services/global";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import LogoutButton from "../auth/logout-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";

// Define your expected response type
// type ProfileResponse = {
//     _id: string;
//     appName: string;
//     description: string;
//     apiUrl: string;
//     baseUrl: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//     favicon: {
//         url: string;
//         public_id: string;
//         _id: string;
//     };
//     logo: {
//         url: string;
//         public_id: string;
//         _id: string;
//     };
//     smtp: {
//         host: string;
//         port: number;
//         secure: boolean;
//         user: string;
//         pass: string;
//     };
// };

interface ProfileApiResponse {
    error: boolean;
    message: string;
    data: {
        firstname: string;
        lastname: string;
        email: string;
        profilePic?: {
            url: string;
            public_id: string;
        } | null;
        role?: string;
        phone?: string;
        country_name?: string;
        state_name?: string;
        city?: string;
        street?: string;
    };
}

const ProfileInfoClient = ({ session }: { session: any }) => {
    const { profile, fetchProfile } = useProfileStore();
    console.log(profile, "profile")
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const profilePicture = `${process.env.NEXT_PUBLIC_SITE_URL}${'admins'}${profile?.profilePic?.url}`

    // const { data, isLoading, error } = useQuery<ProfileApiResponse>({
    //     queryKey: ["profileData", APICONSTANT.GET_PROFILE] as const, // 'as const' keeps it readonly
    //     queryFn: getApiMethos, // no need to wrap
    //     retry: 0,
    // });

    // console.log("API Response:", data);

    return (
        <div className="md:block hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                    <div className="flex items-center gap-3 text-default-800">
                        <Image
                            src={profile?.profilePic?.url !== undefined ? profilePicture : "/profile.jpeg"}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="rounded-full"
                        />
                        <div className="text-sm font-medium capitalize lg:block hidden">
                            {profile?.firstname} {" "}
                            <span className="lowercase text-default-600">({profile?.role})</span>
                        </div>
                        <span className="text-base me-2.5 lg:inline-block hidden">
                            <Icon icon="heroicons-outline:chevron-down" />
                        </span>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 p-0" align="end">
                    <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
                        <Image
                            src={profile?.profilePic?.url !== undefined ? profilePicture : "/profile.jpeg"}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="rounded-full"
                        />
                        <div>
                            <div className="text-sm font-medium text-default-800 capitalize">
                                {profile?.firstname} {profile?.lastname}
                            </div>
                            <Link
                                href="/dashboard/analytics"
                                className="text-xs text-default-600 hover:text-primary"
                            >
                                {profile?.email}
                            </Link>
                        </div>
                    </DropdownMenuLabel>

                    {/* {data && (
            <div className="px-3 text-xs text-default-600">
              App: {data.appName}
            </div>
          )} */}

                    {/* <DropdownMenuGroup>
                        <Link href="/admin-profile" className="cursor-pointer">
                            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                                <Icon icon="heroicons:user" className="w-4 h-4" />
                                Profile
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuGroup> */}

                    {/* <DropdownMenuSeparator /> */}

                    <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer">
                        <LogoutButton />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ProfileInfoClient;