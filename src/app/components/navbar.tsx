// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import ImageComponent from "./image";
// import MenuIcon from '@mui/icons-material/Menu';
// import { useEffect, useState } from "react";
// import { Drawer } from "@mui/material";
// import CloseIcon from '@mui/icons-material/Close';

// const Navbar = () => {
//     const pathname = usePathname();
//     const [drawerOpen, setDrawerOpen] = useState(false);
//     const [scrolled, setScrolled] = useState(false);

//     useEffect(() => {
//         const handleScroll = () => {
//           setScrolled(window.scrollY > 100);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//       }, []);

//     const toggleDrawer = () => {
//         setDrawerOpen(!drawerOpen);
//     };
//     const closeDrawer = () => {
//         setDrawerOpen(false);
//     };

//     const menuItems = [
//         { label: "Bolig", path: "/housing" },
//         // { label: "New Construction", path: "/new-construction" },
//         { label: "Selger bolig", path: "/selling-a-home" },
//         { label: "Kontorer", path: "/offices" },
//         // { label: "About", path: "/about" },
//     ];

//     return (
//         <>
//             <nav
//             className={`sticky top-0 z-10 transition-colors duration-300  ${
//                 scrolled ? 'bg-[#18344e]' : 'bg-[#e2cf9e]'
//               }`} 
//             // className="p-[10px] bg-[#e2cf9e] fixed top-0 w-full z-10"
//             >
//                 <div className="max-w-[1300px] mx-auto flex justify-between items-center">
//                 <div className="hidden md:block">
//                         <ul className="flex items-center gap-[15px] lg:gap-[30px]">
//                             {menuItems.map((item, index) => (
//                                 <Link key={index} href={item?.path}
//                                     className={`text-[16px] whitespace-nowrap font-normal cursor-pointer ${scrolled ? "text-[#fff]" : "text-[#18344e]"} hover:text-[#caa950]`}
//                                 >
//                                     {item.label}
//                                 </Link>
//                             ))}
//                         </ul>
//                     </div>
//                     <Link href='/' className="pr-[15px] md:w-[300px]">
//                         <ImageComponent width={500} height={500}
//                             alt="logo-image" src="/assets/logo.png" className="h-[70px] w-[175px] cursor-pointer" />
//                     </Link>

//                     {/* <div className="hidden md:block">
//                         <Link href='/orderValuation' className="bg-[#caa950] ml-[15px] px-[15px] cursor-pointer h-[40px] flex items-center rounded-[5px] text-[16px] text-[#fff] font-semibold">
//                         Verdivurdering
//                         </Link>
//                     </div> */}
//                     <div className="hidden md:block">
//                         <Link href='/orderValuation' className={`ml-[15px] px-[15px] cursor-pointer h-[40px] flex items-center rounded-[5px] text-[16px] ${scrolled ? "text-[#fff]" : "text-[#18344e]"} font-normal`}>
//                         Verdivurdering
//                         </Link>
//                     </div>
//                     <div onClick={toggleDrawer} className="block md:hidden">
//                         <MenuIcon fontSize="large" className="text-[#fff] cursor-pointer" />
//                     </div>
//                 </div>
//             </nav>
//             <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer} className="block md:hidden">
//                 <div className="sticky top-0 z-40 w-full bg-[#fff] p-[16px] shadow-sm">
//                     <CloseIcon onClick={closeDrawer} className="cursor-pointer" />
//                 </div>
//                 <div className="w-[300px]">
//                     <ul className="flex flex-col">
//                         {menuItems.map((item, index) => (
//                             <Link key={index} href={item?.path}
//                                 className={`h-[50px] hover:opacity-90 border-b border-[#18344e] px-[20px] flex items-center text-[18px] font-bold cursor-pointer ${pathname === item.path ? "text-[#fff] bg-[#18344e]" : "text-[#18344e] bg-[#e2cf9e]"}`}
//                             >
//                                 {item.label}
//                             </Link>
//                         ))}
//                         <div className="block md:hidden">
//                             <Link href='/orderValuation' className="bg-[#caa950] flex items-center justify-center m-[20px] px-[15px] cursor-pointer h-[50px] rounded-[5px] text-[18px] text-[#18344e] font-semibold">
//                             Verdivurdering
//                             </Link>
//                         </div>
//                     </ul>
//                 </div>
//             </Drawer>
//         </>
//     );
// };

// export default Navbar;

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ImageComponent from "./image";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ContactBtn from "./contactBtn";

const Navbar = () => {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const scrolledRef = useRef(false); // Track current state manually

    // ✅ Stable scroll behavior using useRef
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;

            // Buffer zone to prevent flickering
            if (!scrolledRef.current && y > 110) {
                scrolledRef.current = true;
                setScrolled(true);
            } else if (scrolledRef.current && y < 80) {
                scrolledRef.current = false;
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    // The PDF viewer is a full-screen reader with its own chrome — no site header.
    if (pathname?.startsWith("/pdf-viewer")) return null;

    const menuItems = [
        // { label: "Bolig", path: "/housing" },
        // { label: "Selger bolig", path: "/selling-a-home" },
        // { label: "Kontorer", path: "/offices" },
        { label: "Hjem", path: "/" },
        { label: "Boligstoff", path: "/boligstoff/" },
        // { label: "Kontakt oss", path: "/comingsoon" },
        { label: "Om oss", path: "/about/" },
        { label: "Våre lokasjoner", path: "/lokasjoner/" },
        // { label: "Våre meglere", path: "/our-brokers/" },
        { label: "Eiendommer til salgs", path: "/housing/" },
        { label: "Personvern", path: "/personvernerkl-ringen/" },
        { label: "Vilkår og betingelser", path: "/terms/" },
        { label: "Ledige stillinger", path: "/ledige-stillinger/" },
    ];

    return (
        <>
            <nav
                className={`sticky top-0 z-80 transition-colors duration-300 shadow-md ease-in-out ogFont ${scrolled ? "bg-[#18344e]" : "bg-[#e2cf9e]"
                    }`}
            >
                <div
                    className={`transition-all duration-300 ease-in-out max-w-[1400px] mx-auto sm:px-5 px-3 flex justify-between items-center ${scrolled ? "py-2" : "py-5"
                        }`}
                >

                    {/* Logo */}
                    <Link href="/" className="focus-visible:outline-none">
                        <ImageComponent
                            width={500}
                            height={500}
                            alt="logo"
                            src={
                                scrolled
                                    ? "/assets/logo.png"
                                    : "/assets/logo-lokalDark.png"
                            }
                            className={(scrolled ? "" : "scale-110 ") + " h-[70px] sm:min-w-[170px] w-[135px] cursor-pointer object-contain"}
                        />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:block ">
                        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-3">
                            {menuItems.map((item, index) => {
                                const isActive = pathname === item.path;

                                return (
                                    <Link
                                        key={index}
                                        href={item.path}
                                        className={`
                                                relative text-[16px] font-normal whitespace-nowrap cursor-pointer transition-all duration-200
                                                ${scrolled ? "text-white" : "text-[#18344e]"}
                                                after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300
                                                hover:after:w-full
                                                ${isActive ? "font-semibold after:w-full" : ""}
          `}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </ul>
                    </div>


                    {/* Desktop CTA */}
                    <div className="hidden md:flex justify-end lg:w-1/6 w-2/5 ">
                        {/* <Link
                            href="/orderValuation"
                            className={`relative text-right cursor-pointer text-[16px] mx-2.5 font-normal transition-all duration-200
                            ${scrolled ? "text-white" : "text-[#18344e]"}
                            hover:font-semibold
                            after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300
                              hover:after:w-full
                            `}
                        >
                            Verdivurdering
                        </Link> */}
                        <ContactBtn />
                    </div>

                    {/* Mobile Menu Button */}
                    <div onClick={toggleDrawer} className="block md:hidden">
                        <MenuIcon fontSize="large" className={(scrolled ? "text-[#e2cf9e]" : "text-[#18344e]")+" cursor-pointer"} />
                    </div>
                </div>
            </nav>

            {/* Drawer */}
            <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
                <div className="sticky top-0 z-40 w-full bg-[#e2cf9e] p-4 shadow-sm">
                    <CloseIcon onClick={closeDrawer} className="cursor-pointer" />
                </div>
                <div className="w-[300px] h-full bg-[#e2cf9e]">
                    <ul className="flex flex-col">
                        {menuItems.map((item, index) => (
                            <Link
                            onClick={closeDrawer}
                                key={index}
                                href={item.path}
                                className={`h-[50px] hover:opacity-90 border-b border-[#18344e] px-[20px] flex items-center text-[18px] font-bold cursor-pointer ${pathname === item.path
                                    ? "text-white bg-[#18344e]"
                                    : "text-[#18344e] bg-[#e2cf9e]"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="block md:hidden m-3">
                            {/* <Link
                                href="/orderValuation"
                                className="bg-[#caa950] flex items-center justify-center m-[20px] px-[15px] cursor-pointer h-[50px] rounded-[5px] text-[18px] text-[#18344e] font-semibold"
                            >
                                Verdivurdering
                            </Link> */}

                        <ContactBtn />
                        </div>
                    </ul>
                </div>
            </Drawer>
        </>
    );
};

export default Navbar;


// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import ImageComponent from "./image";
// import MenuIcon from "@mui/icons-material/Menu";
// import CloseIcon from "@mui/icons-material/Close";
// import { Drawer } from "@mui/material";
// import { useEffect, useRef, useState } from "react";

// const Navbar = () => {
//   const pathname = usePathname();
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const scrolledRef = useRef(false);

//   // ✅ Adjust scroll trigger for mobile
//   useEffect(() => {
//     const handleScroll = () => {
//       const y = window.scrollY;
//       const isMobile = window.innerWidth < 768;

//       const scrollIn = isMobile ? 60 : 120;
//       const scrollOut = isMobile ? 30 : 80;

//       if (!scrolledRef.current && y > scrollIn) {
//         scrolledRef.current = true;
//         setScrolled(true);
//       } else if (scrolledRef.current && y < scrollOut) {
//         scrolledRef.current = false;
//         setScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const toggleDrawer = () => setDrawerOpen(!drawerOpen);
//   const closeDrawer = () => setDrawerOpen(false);

//   const menuItems = [
//     { label: "Bolig", path: "/housing" },
//     { label: "Selger bolig", path: "/selling-a-home" },
//     { label: "Kontorer", path: "/offices" },
//   ];

//   return (
//     <>
//       <nav
//         className={`sticky top-0 z-10 transition-colors duration-500 ease-in-out ${
//           scrolled ? "bg-[#18344e]" : "bg-[#e2cf9e]"
//         }`}
//       >
//         <div
//           className={`transition-all duration-500 ease-in-out max-w-[1300px] mx-auto flex justify-between items-center ${
//             scrolled ? "pt-2" : "pt-[38px]"
//           }`}
//         >
//           {/* Desktop Links */}
//           <div className="hidden md:block">
//             <ul className="flex items-center gap-[15px] lg:gap-[30px]">
//               {menuItems.map((item, index) => {
//                 const isActive = pathname === item.path;
//                 return (
//                   <Link
//                     key={index}
//                     href={item.path}
//                     className={`
//                       relative text-[16px] font-normal whitespace-nowrap cursor-pointer transition-all duration-200
//                       ${scrolled ? "text-white" : "text-[#18344e]"}
//                       hover:font-semibold
//                       after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300
//                       hover:after:w-full
//                       ${isActive ? "font-semibold after:w-full" : ""}
//                     `}
//                   >
//                     {item.label}
//                   </Link>
//                 );
//               })}
//             </ul>
//           </div>

//           {/* Logo */}
//           <Link href="/" className="pr-[15px] md:w-[300px]">
//             <ImageComponent
//               width={500}
//               height={500}
//               alt="logo"
//               src={
//                 scrolled
//                   ? "/assets/logo.png"
//                   : "/assets/logo-lokalDark.png"
//               }
//               className={`transition-all duration-500 ease-in-out ${
//                 scrolled ? "h-[50px]" : "h-[70px]"
//               } w-[175px] cursor-pointer`}
//             />
//           </Link>

//           {/* Desktop CTA */}
//           <div className="hidden md:block">
//             <Link
//               href="/orderValuation"
//               className={`relative ml-[15px] px-[15px] cursor-pointer h-[40px] flex items-center rounded-[5px] text-[16px] font-normal transition-all duration-200
//                 ${scrolled ? "text-white" : "text-[#18344e]"}
//                 hover:font-semibold
//                 after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300
//                 hover:after:w-full
//               `}
//             >
//               Verdivurdering
//             </Link>
//           </div>

//           {/* Mobile Menu Button */}
//           <div onClick={toggleDrawer} className="block md:hidden">
//             <MenuIcon
//               fontSize="large"
//               className={`transition-all duration-300 ${
//                 scrolled ? "text-white" : "text-[#18344e]"
//               } cursor-pointer`}
//             />
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Drawer */}
//       <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
//         <div className="sticky top-0 z-40 w-full bg-white p-4 shadow-sm">
//           <CloseIcon onClick={closeDrawer} className="cursor-pointer" />
//         </div>
//         <div className="w-[300px]">
//           <ul className="flex flex-col">
//             {menuItems.map((item, index) => (
//               <Link
//                 key={index}
//                 href={item.path}
//                 className={`h-[50px] hover:opacity-90 border-b border-[#18344e] px-[20px] flex items-center text-[18px] font-bold cursor-pointer ${
//                   pathname === item.path
//                     ? "text-white bg-[#18344e]"
//                     : "text-[#18344e] bg-[#e2cf9e]"
//                 }`}
//               >
//                 {item.label}
//               </Link>
//             ))}
//             <div className="block md:hidden">
//               <Link
//                 href="/orderValuation"
//                 className="bg-[#caa950] flex items-center justify-center m-[20px] px-[15px] cursor-pointer h-[50px] rounded-[5px] text-[18px] text-[#18344e] font-semibold"
//               >
//                 Verdivurdering
//               </Link>
//             </div>
//           </ul>
//         </div>
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;