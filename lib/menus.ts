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
  return [
    {
      groupLabel: "",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active: pathname === "/dashboard/analytics" || pathname.startsWith("/dashboard/analytics"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "admin",
      menus: [
        {
          id: "admin",
          href: "/admin",
          label: t("admin"),
          active: pathname === "/admin" || pathname.startsWith("/admin/"),
          icon: "mdi:shield-account",
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
          active: pathname === "/boligstoff" || pathname.startsWith("/boligstoff/"),
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
    {
      groupLabel: "",
      id: "vare-lokasjoner",
      menus: [
        {
          id: "vare-lokasjoner",
          href: "/vare-lokasjoner",
          label: t("vare-lokasjoner"),
          active: pathname === "/vare-lokasjoner" || pathname.startsWith("/vare-lokasjoner/"),
          icon: "mdi:shop-location",
          submenus: [],
        },
      ],
    },
    // {
    //   groupLabel: "",
    //   id: "course",
    //   menus: [
    //     {
    //       id: "course",
    //       href: "/create-course",
    //       label: t("course"),
    //       active:
    //         pathname === "/create-course" ||
    //         pathname.startsWith("/create-course/") ||
    //         ["/courses", "/manage-courses", "/course-reviews"].some((p) =>
    //           pathname.startsWith(p)
    //         ),
    //       icon: "mdi:book-open-variant",
    //       submenus: [
    //         {
    //           href: "/courses",
    //           label: t("courses"),
    //           active: pathname === "/courses" || pathname.startsWith("/courses/"),
    //           icon: "mdi:book-plus",
    //           children: [],
    //         },
    //         {
    //           href: "/manage-courses",
    //           label: t("manage-courses"),
    //           active: pathname === "/manage-courses" || pathname.startsWith("/manage-courses/"),
    //           icon: "mdi:book-cog",
    //           children: [],
    //         },
    //         {
    //           href: "/course-reviews",
    //           label: t("course-reviews"),
    //           active: pathname === "/course-reviews" || pathname.startsWith("/course-reviews/"),
    //           icon: "mdi:comment-text-multiple",
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      groupLabel: "",
      id: "settings",
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: t("settings"),
          active: pathname === "/settings" || pathname.startsWith("/settings/"),
          icon: "mdi:cog", // settings / configuration
          submenus: [
            {
              href: "/settings/smtp",
              label: t("smtp"),
              active: pathname === "/settings/smtp" || pathname.startsWith("/settings/smtp"),
              icon: "mdi:email",
              children: [],
            }
          ],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: "",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active: pathname === "/dashboard/analytics" || pathname.startsWith("/dashboard/analytics/"),
          icon: "heroicons-outline:home",
          submenus: [
            // {
            //   href: "/dashboard/analytics",
            //   label: t("dashboard"),
            //   active: pathname === "/dashboard/analytics",
            //   icon: "",
            //   children: [],
            // },
          ],
        },
      ],
    },
    {
      groupLabel: "",
      id: "admin",
      menus: [
        {
          id: "admin",
          href: "/admin",
          label: t("admin"),
          active: pathname === "/admin" || pathname.startsWith("/admin/"),
          icon: "heroicons-outline:shield-check",
          submenus: [
            // {
            //   href: "/admin",
            //   label: t("admin"),
            //   active: pathname === "/admin",
            //   icon: "",
            //   children: [],
            // },
          ],
        },
      ],
    },
    // {
    //   groupLabel: "",
    //   id: "adminrole",
    //   menus: [
    //     {
    //       id: "adminrole",
    //       href: "/adminrole",
    //       label: t("adminrole"),
    //       active: pathname === "/adminrole" || pathname.startsWith("/adminrole/"),
    //       icon: "heroicons-outline:user-group",
    //       submenus: [
    //         // {
    //         //   href: "/adminrole",
    //         //   label: t("adminrole"),
    //         //   active: pathname === "/adminrole",
    //         //   icon: "",
    //         //   children: [],
    //         // },
    //       ],
    //     },
    //   ],
    // },
    {
      groupLabel: "",
      id: "students",
      menus: [
        {
          id: "students",
          href: "/students",
          label: t("students"),
          active: pathname === "/students" || pathname.startsWith("/students/"),
          icon: "heroicons-outline:academic-cap",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "instructors",
      menus: [
        {
          id: "instructors",
          href: "/instructors",
          label: t("instructors"),
          active: pathname === "/instructors" || pathname.startsWith("/instructors/"),
          icon: "heroicons-outline:chalkboard-teacher",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "course",
      menus: [
        {
          id: "course",
          href: "/create-course",
          label: t("course"),
          active: pathname === "/create-course" || pathname.startsWith("/create-course/"),
          icon: "mdi:book-open-page-variant",
          submenus: [
            {
              href: "/courses",
              label: t("courses"),
              active: pathname === "/course/courses",
              icon: "mdi:book-plus",
              children: [],
            },
            {
              href: "/manage-courses",
              label: t("manage-courses"),
              active: pathname === "/manage-courses",
              icon: "mdi:book-cog",
              children: [],
            },
            {
              href: "/course-reviews",
              label: t("course-reviews"),
              active: pathname === "/course-reviews",
              icon: "mdi:star-check",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "",
      id: "reviews",
      menus: [
        {
          id: "reviews",
          href: "/reviews",
          label: t("reviews"),
          active: pathname === "/reviews" || pathname.startsWith("/reviews/"),
          icon: "rivet-icons:star",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "payout-requests",
      menus: [
        {
          id: "payout-requests",
          href: "/payout-requests",
          label: t("payout-requests"),
          active: pathname === "/payout-requests" || pathname.startsWith("/payout-requests/"),
          icon: "mdi:cash-fast",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "transactions",
      menus: [
        {
          id: "transactions",
          href: "/transactions",
          label: t("transactions"),
          active: pathname === "/transactions" || pathname.startsWith("/transactions/"),
          icon: "mdi:swap-horizontal",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "commissions",
      menus: [
        {
          id: "commissions",
          href: "/commissions",
          label: t("commissions"),
          active: pathname === "/commissions" || pathname.startsWith("/commissions/"),
          icon: "mdi:percent",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "catalog-config",
      menus: [
        {
          id: "catalog-config",
          href: "/catalog-config",
          label: t("catalog-config"),
          active: pathname === "/catalog-config" || pathname.startsWith("/catalog-config/"),
          icon: "mdi:view-list",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "coupons",
      menus: [
        {
          id: "coupons",
          href: "/coupons",
          label: t("coupons"),
          active: pathname === "/coupons" || pathname.startsWith("/coupons/"),
          icon: "mdi:ticket-percent",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "testimonials",
      menus: [
        {
          id: "testimonials",
          href: "/testimonials",
          label: t("testimonials"),
          active: pathname === "/testimonials" || pathname.startsWith("/testimonials/"),
          icon: "mdi:comment-quote",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      id: "settings",
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: t("settings"),
          active: pathname === "/settings" || pathname.startsWith("/settings/"),
          icon: "mdi:cog",
          submenus: [
            {
              href: "/settings/smtp",
              label: t("smtp"),
              active: pathname === "/settings/smtp" || pathname.startsWith("/settings/smtp/"),
              icon: "mdi:email",
              children: [],
            },
            {
              href: "/settings/payments",
              label: "payments",
              active: pathname === "/settings/payments" || pathname.startsWith("/settings/payments/"),
              icon: "mdi:email",
              children: [],
            },
          ],
        },
      ],
    },
  ];
}

// const adminItems = [
//   { title: "Dashboard", url: "/admin", icon: BarChart3 },
//   { title: "Students", url: "/admin/students", icon: Users },
//   { title: "Instructors", url: "/admin/instructors", icon: GraduationCap },
//   { title: "Create Course", url: "/admin/create-course", icon: BookOpen },
//   { title: "Manage Courses", url: "/admin/manage-courses", icon: BookOpen },
//   { title: "Course Reviews", url: "/admin/courses", icon: BookOpen },
//   { title: "Payout Requests", url: "/admin/payouts", icon: CreditCard },
//   { title: "Transactions", url: "/admin/transactions", icon: Receipt },
//   { title: "Commissions", url: "/admin/commissions", icon: Percent },
//   { title: "Catalog Config", url: "/admin/catalog", icon: Settings2 },
//   { title: "Coupons", url: "/admin/coupons", icon: Tag },
//   { title: "Profile", url: "/admin/profile", icon: Users },
//   { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquare },
//   { title: "Settings", url: "/admin/settings", icon: Settings2 },
// ];