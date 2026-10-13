"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Rating from "@mui/material/Rating";
import Link from "next/link";

export default function Reviews({ reviews }: { reviews: any }) {
  const swiperRef = useRef(null);

  // const reviewsData = [
  //     {
  //         name: 'Anonymous',
  //         date: 'Apr 2025',
  //         describe: 'I have both bought and sold through Frode. A conscientious real estate agent.'
  //     },
  //     {
  //         name: 'Anonymous',
  //         date: 'Mar 2025',
  //         describe: 'Kristoffer was easy to deal with, we had an open and honest dialogue, and he was always easily accessible. We felt well taken care of throughout the sales process.'
  //     },
  //     {
  //         name: 'Anonymous',
  //         date: 'May 2025',
  //         describe: 'Good and knowledgeable broker, got a good price for the estate I sold despite only one bidder'
  //     },
  //     {
  //         name: 'Anonymous',
  //         date: 'Jun 2025',
  //         describe: 'Very good follow-up. Contributed with tips on styling. Also took on the task of styling the apartment which turned out very well.'
  //     },
  //     {
  //         name: 'Anonymous',
  //         date: 'Sep 2025',
  //         describe: 'Fantastic process from A-Z. Henrik delivered on all counts. Sold above estimate after the first round of viewings.'
  //     },
  //     {
  //         name: 'Anonymous',
  //         date: 'Dec 2025',
  //         describe: 'Very skilled, pleasant and professional broker, I highly recommend Håvard. The whole process went smoothly and quickly, the property sold after one viewing.'
  //     },
  // ]

  return (
    <>
      <section className="py-[70px] bg-[#f6f6f6]">
        <div className="max-w-[1300px] mx-auto px-5">
          <div className="flex flex-wrap items-baseline">
            <h2 className="text-[25px] md:text-[40px] font-bold text-[#333]">
              Kundeanmeldelser
            </h2>
            <Link
              href={" https://share.google/yG4NE07DPWeUlymJP"}
              className="ml-auto text-[20px] sm:text-[25px] font-bold text-[#333] hover:underline opacity-70 hover:opacity-100"
              target="_blank"
            >
              Flere anmeldelser
            </Link>
          </div>
          {/* <div className="flex flex-col justify-center gap-[8px] items-center mt-[20px]">
                        <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly />
                        <p className="text-[16px] font-semibold text-[#333]">4.85 ( 12,048 reviews)</p>
                    </div> */}
          <div className=" py-[30px]">
            <Swiper
              onSwiper={(swiper: any) => (swiperRef.current = swiper)}
              slidesPerView={1}
              spaceBetween={10}
              slidesPerGroup={1}
              // autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={true}
              modules={[Navigation, Pagination, Autoplay]}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 10 },
                768: { slidesPerView: 2, spaceBetween: 15 },
                1200: { slidesPerView: 3, spaceBetween: 20 },
              }}
            >
              {reviews?.map((item: any, index: any) => (
                <SwiperSlide
                  key={index}
                  style={{ height: 340, overflowY: "auto" }}
                  className="w-full py-2.5 cursor-grab active:cursor-grabbing"
                >
                  <div
                    key={index}
                    className="flex h-full flex-col gap-2.5 rounded-[15px] mx-auto bg-[#e2cf9e] shadow-md p-5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1664 1792"
                      id="1567239618"
                      className="w-6 h-6 mx-auto text-[#6f88fc]"
                      fill="#6f88fc"
                      data-icon-name="fa-quote-right"
                    >
                      {" "}
                      <path
                        fill="inherit"
                        d="M768 320v704q0 104-40.5 198.5t-109.5 163.5-163.5 109.5-198.5 40.5h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64q106 0 181-75t75-181v-32q0-40-28-68t-68-28h-224q-80 0-136-56t-56-136v-384q0-80 56-136t136-56h384q80 0 136 56t56 136zM1664 320v704q0 104-40.5 198.5t-109.5 163.5-163.5 109.5-198.5 40.5h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64q106 0 181-75t75-181v-32q0-40-28-68t-68-28h-224q-80 0-136-56t-56-136v-384q0-80 56-136t136-56h384q80 0 136 56t56 136z"
                        id="1836481687"
                      ></path>
                    </svg>
                    {/* <p className="text-[14px] text-[#757575] font-semibold">{item?.date}</p> */}
                    <p className="text-[16px] line-clamp-8 text-semibold text-black leading-[27px] max-w-[350px]">
                      {item?.text}
                    </p>
                    <div className="flex flex-wrap items-center mt-auto">
                      <Rating
                        name="read-only"
                        value={item?.rating}
                        size="small"
                        readOnly
                      />
                      {item?.author_name && (
                        <p className="text-[18px] ml-auto font-semibold text-black">
                          {item?.author_name}
                        </p>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}
