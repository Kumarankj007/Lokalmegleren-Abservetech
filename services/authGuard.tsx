// import { useEffect, useState, ReactNode } from "react";
// import { useLocation, useNavigate } from "react-router";


// const publicRoutes = ["/signin", "/signup", "/reset-password"];

// interface AuthGuardProps {
//   children: ReactNode;
// }

// const AuthGuard = ({ children }: AuthGuardProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token && !publicRoutes.includes(location.pathname)) {
//       navigate("/signin", { replace: true });
//     } else if (token && publicRoutes.includes(location.pathname)) {
//       navigate("/", { replace: true });
//     } else {
//       setLoading(false);
//     }
//   }, [location.pathname, navigate]);

//   if (loading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         {/* <Loader /> */}
//         ...Loading
//       </div>
//     );
//   }

//   return <>{children}</>;
// };

// export default AuthGuard;

'use client'

import { useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from '@/components/navigation';

const publicRoutes = ["/", "/auth/register"];

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && !publicRoutes.includes(pathname)) {
      router.replace("/");
    } else if (token && publicRoutes.includes(pathname)) {
      router.replace("/dashboard/analytics");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  // Render nothing until we finish client-side checks
  if (loading) {
    return null; // or a loader: <div>Loading...</div>
  }

  return <>{children}</>;
};

export default AuthGuard;