"use client";
import React from "react";
import { VacancySection } from "./types";
import { BASE_URL } from "../helper/apitools";

interface BannerProps {
  data?: VacancySection;
}

export default function Banner({ data }: BannerProps) {
  // Fall back to the original static asset if no API data yet
  const bgImage = data?.image
    ? typeof data.image === "string"
      ? `${BASE_URL}${data.image}`
      : URL.createObjectURL(data.image)
    : "/assets/ledige-1.png";

  const title =
    data?.head ?? "Bli en del av fremtidens meglerteam hos Lokalmegleren";

  const desc =
    data?.p ??
    "Drømmer du om å være en del av et innovativt og fremtidsrettet meglerforetak? Lokalmegleren er i ferd med å bygge Norges største meglerkontor på Østlandet, og vi ser etter dyktige eiendomsmeglere som vil bli med på denne spennende reisen..";

  return (
    <div>
      <div
        className="h-[80vh] flex items-center bg-no-repeat bg-cover bg-fixed md:bg-right bg-position-[78%] relative before:absolute before:size-full before:bg-black before:z-10 before:left-0 before:top-0 before:opacity-40 text-white mb-14"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="z-20 relative max-w-[1300px] mx-auto md:px-10 px-5">
          <h2 className="font-semibold md:text-4xl text-3xl mb-8">{title}</h2>
          <p className="font-normal md:text-[18px] text-[16px] md:w-1/2">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

// import React from "react";

// export default function Banner() {
//   return (
//     <div>
//       {/* Banner */}
//       <div className="h-[80vh] bg-[url(/assets/ledige-1.png)] flex items-center bg-no-repeat bg-cover bg-fixed md:bg-right bg-position-[78%] relative before:absolute before:size-full before:bg-black before:z-10 before:left-0 before:top-0 before:opacity-40 text-white mb-14">
//         <div className="z-20 relative max-w-[1300px] mx-auto md:px-10 px-5">
//           <h2 className="font-semibold md:text-4xl text-3xl mb-8">
//             Bli en del av fremtidens meglerteam hos Lokalmegleren
//           </h2>
//           <p className="font-normal md:text-[18px] teext-[16px] md:w-1/2">
//             Drømmer du om å være en del av et innovativt og fremtidsrettet
//             meglerforetak? Lokalmegleren er i ferd med å bygge Norges største
//             meglerkontor på Østlandet, og vi ser etter dyktige eiendomsmeglere
//             som vil bli med på denne spennende reisen..
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
