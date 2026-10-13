"use client";
import Link from "next/link";
import React from "react";
// import ImageComponent from "../components/image";

interface Content {
  title?: string;
  head?: string;
  address?: string;
  img?: string;
  nav?: string;
  map?: string;
}

const content: Content[] = [
  {
    title: " Lokalmegleren Administrasjon",
    address: "Hagaløkkveien 13, 1383 Asker",
    img: "/assets/blog.webp",
    nav: "/our-brokers",
    map: "https://maps.app.goo.gl/Mp1LMpwTjAFcAdudA",
  },
  {
    title: " Lokalmegleren Bragernes",
    address: "Nedre Storgate 37, 3015 Drammen",
    img: "/assets/blog.webp",
    nav: "/contact",
    map: "https://maps.app.goo.gl/fpqdzWHPwu4LPAXY9",
  },
  {
    title: " Lokalmegleren Strømsø",
    address: "Strømsø Torg 4, 3044 Drammen",
    img: "/assets/blog.webp",
    nav: "/contact",
    map: "https://maps.app.goo.gl/kqDszAPuBWaieThA8",
  },
  {
    title: " Lokalmegleren Asker",
    address: "Hagaløkkveien 13, 1383 Asker",
    img: "/assets/blog.webp",
    nav: "/contact",
    map: "https://maps.app.goo.gl/5s3QtRanEqWZKrSg8",
  },
  {
    title: " Lokalmegleren Lier",
    address: "St. Hallvards vei 3, 3414 Lierstranda",
    img: "/assets/blog.webp",
    nav: "/contact",
    map: "https://maps.app.goo.gl/MgYY57A8okReLcU18",
  },
];

const fonts = {
  head: " mb-5 lg:text-[46px] md:text-[40px] text-[33px] font-semibold text-[#d7c7b4] font-thin uppercase underline ",
  subHead:
    " my-10 md:text-[54px] md:text-[42px] text-[35px] font-semibold font-thin text-[#18344e] uppercase text-center ",
  pFont: " md:text-[20px] text-[14px] font-normal text-[#d7c7b4] ",
};

export default function Blog() {
  return (
    <div className="bg-[#e2cf9e]">
      <div className="max-w-[1400px] mx-auto md:px-10 sm:px-5 px-3 py-10">
        {content?.length > 0 ? (
          <>
            <h1 className={fonts?.subHead}>Våre lokasjoner</h1>
            <ul className="flex flex-wrap md:gap-y-12 gap-y-6">
              {content?.map((val: Content, ind) => (
                <Link
                  href={val?.nav || "#"}
                  key={ind}
                  className={
                    "md:w-[48%] w-full md:odd:mr-[4%] aspect-[1.3] flex flex-col items-center justify-center bg-[#18344e] group overflow-hidden duration-1000"
                  }
                >
                  {/* {val?.img && (
                    <ImageComponent
                      width={500}
                      height={500}
                      alt="ledge-1"
                      src={val?.img}
                      className="w-full h-full z-[1] absolute left-0 top-0 object-cover group-hover:scale-105"
                    />
                  )} */}
                  <div className="relative z-10">
                    {val?.head && (
                      <p className={fonts?.pFont + "text-center"}>
                        {val?.head}
                      </p>
                    )}
                    {val?.title && (
                      <h3
                        className={
                          fonts?.head + " underline-offset-8 text-center"
                        }
                      >
                        {val?.title}
                      </h3>
                    )}
                    {val?.address && (
                      <p
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(val.map);
                        }}
                        className={fonts?.pFont + "text-center hover:underline"}
                      >
                        {val?.address}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
