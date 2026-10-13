/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import ImageComponent from "../components/image";
import { BASE_URL } from "../helper/apitools";

const fonts = {
  head: " mb-7 md:text-[22px] text-[19px] font-semibold text-[#111] ",
  pFont: " md:text-[18px] text-[15px] font-normal text-[#313131] ",
  readMore: " md:text-[19px] text-[17px] font-normal text-[#313131] ",
};

export default function BoligItem({
  item,
  ind,
  onImageClick,
}: {
  item: { img: string; title: string; p: string[] };
  ind: number;
  onImageClick: (ind: number) => void;
}) {
  const [readMore, setReadMore] = useState<boolean>(true);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const { scrollHeight, clientHeight } = listRef.current;
      setIsOverflowing(scrollHeight > clientHeight);
    }
  }, [item.p]);

  return (
    <div key={ind}>
      <div
        className="md:rounded-4xl rounded-2xl my-5 overflow-hidden active:opacity-75 cursor-pointer"
        onClick={() => onImageClick(ind)}
      >
        {item.img && item.img !== "" && (
          <ImageComponent
            width={500}
            height={500}
            alt="image"
            unoptimized
            src={item.img}
            className="hover:scale-105 w-full object-cover"
          />
        )}
      </div>
      {item.title && <b className={fonts.head + "block"}>{item.title}</b>}
      {item.p?.length > 0 && (
        <ul
          ref={listRef}
          className={
            (readMore ? "line-clamp-4" : "") + " relative overflow-hidden mb-10"
          }
        >
          {item.p.map((pItm, i) => (
            <li
              key={i}
              className={
                fonts.pFont +
                (!readMore && item.p.length - 1 !== i ? " mb-5 " : " mb-2")
              }
            >
              {pItm}
            </li>
          ))}
          {isOverflowing && (
            <span
              onClick={() => setReadMore(!readMore)}
              className={
                fonts.readMore +
                (!readMore ? " static " : " absolute right-0 bottom-0 ") +
                " text-black font-semibold z-70 bg-[#e2cf9e] outline-none text-left cursor-pointer"
              }
            >
              {readMore ? "... Les mer" : "Les mindre"}
            </span>
          )}
        </ul>
      )}
    </div>
  );
}
