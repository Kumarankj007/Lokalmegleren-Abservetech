import { getUser } from "@/services/authService";

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any): Group[] {
  // Evaluate per call (not at module load) so it reads the user AFTER auth/
  // hydration — a module-level read runs during SSR/first import when
  // getUser() is empty and would wrongly hide admin-only menus.
  const isAdmin = JSON.parse(getUser() || "{}")?.role == "ADMIN";
  return [
    {
      groupLabel: "",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active:
            pathname === "/dashboard/analytics" ||
            pathname.startsWith("/dashboard/analytics"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "eiendommer",
      menus: [
        {
          id: "eiendommer",
          href: "/eiendommer",
          label: t("eiendommer"),
          active:
            pathname === "/eiendommer" || pathname.startsWith("/eiendommer"),
          icon: "emojione-monotone:house",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "templates",
      menus: [
        {
          id: "templates",
          href: "/templates",
          label: t("templates"),
          active:
            pathname === "/templates" ||
            pathname.startsWith("/templates/"),
          icon: "heroicons-outline:document-duplicate",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "hjem",
      menus: [
        {
          id: "hjem",
          href: "/hjem",
          label: t("hjem"),
          active: pathname === "/hjem" || pathname.startsWith("/hjem/"),
          icon: "material-symbols-light:home",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "boligstoff",
      menus: [
        {
          id: "boligstoff",
          href: "/boligstoff",
          label: t("boligstoff"),
          active:
            pathname === "/boligstoff" || pathname.startsWith("/boligstoff/"),
          icon: "hugeicons:note",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "om-oss",
      menus: [
        {
          id: "om-oss",
          href: "/om-oss",
          label: t("om-oss"),
          active: pathname === "/om-oss" || pathname.startsWith("/om-oss/"),
          icon: "grommet-icons:info",
          submenus: [],
        },
      ],
    },
    // {
    //   groupLabel: "",
    //   id: "vare-lokasjoner",
    //   menus: [
    //     {
    //       id: "vare-lokasjoner",
    //       href: "/vare-lokasjoner",
    //       label: t("vare-lokasjoner"),
    //       active:
    //         pathname === "/vare-lokasjoner" ||
    //         pathname.startsWith("/vare-lokasjoner/"),
    //       icon: "mdi:shop-location",
    //       submenus: [],
    //     },
    //   ],
    // },
    {
      groupLabel: "",
      id: "personvernerkl-ringen",
      menus: [
        {
          id: "personvernerkl-ringen",
          href: "/personvernerkl-ringen",
          label: t("personvernerkl-ringen"),
          active:
            pathname === "/personvernerkl-ringen" ||
            pathname.startsWith("/personvernerkl-ringen/"),
          icon: "mdi:shield-lock-outline",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "vilkår-og-betingelser",
      menus: [
        {
          id: "vilkår-og-betingelser",
          href: "/vilkaar",
          label: t("vilkår-og-betingelser"),
          active:
            pathname === "/vilkaar" ||
            pathname.startsWith("/vilkaar/"),
          icon: "mdi:file-document-check-outline",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "ledige-stillinger ",
      menus: [
        {
          id: "ledige-stillinger",
          href: "/ledige-stillinger",
          label: t("ledige-stillinger"),
          active:
            pathname === "/ledige-stillinger" ||
            pathname.startsWith("/ledige-stillinger/"),
          icon: "mdi:briefcase-outline",
          submenus: [],
        },
      ],
    },
    // {
    //   groupLabel: "",
    //   id: "settings",
    //   menus: [
    //     {
    //       id: "settings",
    //       href: "/settings",
    //       label: t("settings"),
    //       active: pathname === "/settings" || pathname.startsWith("/settings/"),
    //       icon: "mdi:cog", // settings / configuration
    //       submenus: [
    //         {
    //           href: "/settings/smtp",
    //           label: t("smtp"),
    //           active:
    //             pathname === "/settings/smtp" ||
    //             pathname.startsWith("/settings/smtp"),
    //           icon: "mdi:email",
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    // },
  ].filter((item) => (isAdmin ? true : item.id != "templates" ));
}