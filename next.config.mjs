// import createNextIntlPlugin from "next-intl/plugin";
// import nextra from "nextra";

// /** @type {import('next').NextConfig} */

// const withNextIntl = createNextIntlPlugin();

// const withNextra = nextra({
//   theme: "nextra-theme-docs",
//   themeConfig: "./theme.config.tsx",
// });
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "api.lorem.space",
//       },
//       {
//         protocol: "https",
//         hostname: "lh3.googleusercontent.com",
//       },
//       {
//         protocol: "https",
//         hostname: "a0.muscache.com",
//       },
//       {
//         protocol: "https",
//         hostname: "avatars.githubusercontent.com",
//       },
//       {
//         protocol: "https",
//         hostname: "i.pravatar.cc",
//       },
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//       }
//     ],
//   },
// };

// export default withNextIntl(withNextra(nextConfig));

import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";
const withNextIntl = createNextIntlPlugin();
const withNextra = nextra({
  defaultShowCopyCode: true,
  latex: true,
  mdxOptions: {},
});
const nextConfig = {
  images: {
    domains: ["external.webmegler.no"],
    remotePatterns: [
      { protocol: "https", hostname: "api.lorem.space" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "a0.muscache.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false, // ✅ prevents konva node build crash
    };

    return config;
  },
};
export default withNextIntl(withNextra(nextConfig));