"use client";

import usePropertyStore from "../store/propertyStore";
import { useEffect, useMemo } from "react";
import {
  HomeCardImageSkeleton,
  HomePropertyGridSkeleton,
} from "./skeletons";

// How many properties this section shows.
const VISIBLE_COUNT = 4;
import ImageComponent from "../components/image";
import { getGoogleMapsUrl } from "../helper/utils";
import Link from "next/link";

// import { useState } from "react";

const fonts = {
  title:
    " lg:text-[60px] md:text-[50px] sm:text-[40px] text-[33px] font-normal text-[#939393] ",
  head: " lg:text-[36px] md:text-[30px] text-[25px] font-normal ",
  subHead: " lg:text-[20px] text-[18px] font-semibold ",
  abtP: " lg:text-[30px] sm:text-[20px] text-[18px] font-normal text-white ",
  pFont: " md:text-[16px] text-[14px] ",
};

export default function Magazine({
  contactUs,
  aboutUs,
}: {
  contactUs?: any;
  aboutUs: string[];
}) {
  // const [activeTab, setActiveTab] = useState(0);
  // const tabs = ["All", "Inspiration", "Economics and law", "Home purchase"];

  // Narrow selectors - subscribing to the whole store re-rendered this section
  // on every image batch that landed.
  const propertyCache = usePropertyStore((s) => s.propertyCache);
  const propertyImagesCache = usePropertyStore((s) => s.propertyImagesCache);
  const lastSortBy = usePropertyStore((s) => s.lastSortBy);
  const loading = usePropertyStore((s) => s.loading);
  const ready = usePropertyStore((s) => s.ready);
  const fetchAllPropertiesAndImages = usePropertyStore(
    (s) => s.fetchAllPropertiesAndImages,
  );

  const properties = useMemo(
    () => propertyCache[lastSortBy] || [],
    [propertyCache, lastSortBy],
  );
  const propertyImages = useMemo(
    () => propertyImagesCache[lastSortBy] || {},
    [propertyImagesCache, lastSortBy],
  );
  const featured = useMemo(() => properties.slice(0, VISIBLE_COUNT), [properties]);

  // get the property List
  useEffect(() => {
    const body: any = { tenantId: 381, employeeId: 3000004 };
    // Only the first few cards are shown here, so don't fetch images for the
    // entire portfolio - that was one request per property on every homepage
    // visit, for cards nobody sees.
    fetchAllPropertiesAndImages(body, { imageLimit: VISIBLE_COUNT });
  }, []);

  return (
    <>
      {/* <section className="px-[20px] bg-[#fff] pt-[50px]">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-[25px] sm:text-[40px] font-bold text-[#333] px-[20px] text-center">The Magazine</h2>
                    <p className="text-[14px] font-semibold text-[#757575] text-center">Inspiring and useful home materials</p>
                    <div className="my-[50px]">
                        <div className="flex gap-0 sm:gap-x-[30px] flex-wrap justify-center border-b border-gray-300">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`px-5 py-3 text-[16px] sm:text-[18px] md:text-[20px] cursor-pointer font-semibold
                                 ${activeTab === index
                                            ? "text-[#18344e] border-b-2 border-[#18344e]"
                                            : "text-[#757575] hover:text-[#18344e]"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pb-[50px]">
                        {activeTab === 0 &&
                        <p className="text-center text-[40px] text-black">Coming Soon...</p>
                        }
                        {activeTab === 1 &&
                        <p className="text-center text-[40px] text-black">Coming Soon...</p>
                        }
                        {activeTab === 2 &&
                        <p className="text-center text-[40px] text-black">Coming Soon...</p>
                        }
                        {activeTab === 3 &&
                        <p className="text-center text-[40px] text-black">Coming Soon...</p>
                        }
                    </div>
                </div>
            </section> */}
      {/* contact us */}
      <section className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3 my-20">
        {contactUs?.title && (
          <strong
            className={`${fonts.head} block text-center text-[#111] mb-6`}
          >
            {contactUs.title}
          </strong>
        )}

        {(contactUs?.data?.length ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-5">
            {contactUs!.data.map((item: any, ind: any) => (
              <div key={item._id ?? ind} className="p-2 xl:w-[32%] md:w-[48%]">
                {item.head && (
                  <b
                    className={`${fonts.subHead} text-[#111] mb-5 inline-block`}
                  >
                    {item.head}
                  </b>
                )}
                {item.desc && (
                  <p className={`${fonts.pFont} text-[#313131]`}>{item.desc}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/contact"
            className={
              fonts?.pFont +
              "p-2 px-20 mx-auto text-center inline-block bg-[#d6bc77] border-2 border-[#d6bc77] text-white rounded-full cursor-pointer hover:bg-transparent hover:text-[#d6bc77] duration-200"
            }
          >
            Kontakt oss
          </Link>
        </div>
      </section>
      {/* Våre eiendommer	 */}
      <section className="bg-[#f6f6f6] py-20">
        <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3">
          <h3 className={fonts?.title + "mb-10 text-center"}>
            Våre eiendommer
          </h3>
          {loading || (!ready && featured.length === 0) ? (
            <HomePropertyGridSkeleton count={VISIBLE_COUNT} />
          ) : (
            featured.length > 0 && (
              <div className="flex flex-wrap justify-between gap-y-6">
                {featured.map((item: any, ind: number) => {
                  const filterImg = propertyImages[item.id]?.filter(
                    (img: any) => !img.slettet,
                  );
                  return (
                    <Link
                      href={`/detail?id=${item?.id}`}
                      key={ind}
                      className="md:w-[49%] relative group w-full bg-white rounded-lg overflow-hidden shadow duration-200 hover:shadow-lg before:absolute before:left-0 before:bottom-0 before:h-1.5 before:w-full before:scale-0 before:bg-[#e2cf9e] hover:before:scale-100 before:duration-300"
                    >
                      {filterImg ? (
                        filterImg?.[0]?.url &&
                        filterImg?.[0]?.url != "" && (
                          <div className="overflow-hidden">
                            <ImageComponent
                              width={800}
                              height={600}
                              alt="house-image"
                              src={
                                filterImg?.length > 0
                                  ? filterImg?.[0]?.url
                                  : "/assets/errorImage.webp"
                              }
                              /* Well below the banner - never compete with the
                                 LCP image for bandwidth. */
                              priority={false}
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="w-full h-[200px] md:h-[300px] lg:h-[450px] object-cover animate-slide-in group-hover:scale-105 duration-200"
                            />
                          </div>
                        )
                      ) : (
                        <HomeCardImageSkeleton />
                      )}
                      {item?.eiendom?.adresse && (
                        <div
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(getGoogleMapsUrl(item.eiendom));
                          }}
                          className="text-[18px] p-4 text-[#757575] group-hover:text-black mb-auto inline-block font-medium hover:underline cursor-pointer"
                        >
                          {item.eiendom.adresse}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )
          )}
          <div className="text-center mt-10">
            <Link
              href="/housing"
              className={
                fonts?.pFont +
                "p-2 px-10 mx-auto text-center inline-block bg-[#d6bc77] border-2 border-[#d6bc77] text-white rounded-full cursor-pointer hover:bg-transparent hover:text-[#d6bc77] duration-200"
              }
            >
              Se alle eiendommer til salgs
            </Link>
          </div>
        </div>
      </section>
      {/* about us */}
      <section className="bg-[#d6bc77] py-20">
        <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3">
          {aboutUs?.length > 0 &&
            aboutUs.map((item, ind) => (
              <p key={ind} className={`${fonts.abtP} text-center mb-14`}>
                {item}
              </p>
            ))}
          <div className="text-center mt-10">
            <Link
              href="/about"
              className={`${fonts.pFont} p-4 px-30 mx-auto text-center inline-block bg-white border-2 border-white rounded-full cursor-pointer hover:bg-transparent hover:text-white duration-200`}
            >
              Om oss
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
