"use client";

import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/icon";
import { clearToken } from "@/services/authService";
import { useRouter } from "@/components/navigation";
import { useProfileStore } from "@/app/store/userProfileStore";

const LogoutButton = () => {
    const router = useRouter();
    const clearProfile = useProfileStore((state) => state.clearProfile);
    const handleLogout = () => {
        // signOut({ callbackUrl: "/" });
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user");
        clearToken();
        clearProfile();
        router.push("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2"
        >
            <Icon icon="heroicons:power" className="w-4 h-4" />
            Log out
        </button>
    );
};

export default LogoutButton;