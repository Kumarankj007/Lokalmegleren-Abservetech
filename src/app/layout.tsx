import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import '../../public/assets/alata/Alata/Alata-Regular.ttf';
import "./globals.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import GlobalProvider from "./components/globalProvider";
import { Suspense } from "react";
import Script from "next/script";
// import RootProvider from "./components/rootProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Verdivurdering takst megler eiendomsmegler selge bolig",
  description:
    "Vi har spesialisert oss på salg av boligeiendommer i Drammen, Lier, Asker, Sande, Svelvik og øvre eiker . Vi har lokalkunnskapen som er nødvendig.",
  icons: {
    icon: "/favIcon.ico", // Path relative to the `public` directory
    apple: "/favIcon.ico", // For Apple devices
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* //   {/* <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FEF8F4]`}
    //   >*/}
      <head>
        <link
          rel="icon"
          href="/favIcon.ico"
          type="image/x-icon"
          sizes="32x32"
        />
      </head>
      {/* <RootProvider> */}
      <body>
        {/* Google Tag Manager */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NGHV7QG410"
        />
        <Script id="gtag-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NGHV7QG410');
          `}
        </Script>
        <GlobalProvider>
          <Navbar />
          <Suspense>{children}</Suspense>
          <Footer />
        </GlobalProvider>
      </body>
      {/* </RootProvider> */}
    </html>
  );
}
