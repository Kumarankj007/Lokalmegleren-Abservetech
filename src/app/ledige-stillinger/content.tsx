/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import ImageComponent from "../components/image";
import { VacancySection } from "./types";
import { BASE_URL } from "../helper/apitools";

// const content = [
//   {
//     img: "/assets/ledige-2.jpg",
//     head: "Vårt unike konsept: Større kontor, større muligheter",
//     p: "I stedet for å spre oss ut over mange små kontorer, satser vi på én stor, sentralisert base med flere hundre meglere. Dette gir oss en unik mulighet til å samarbeide på tvers, dele erfaringer og ressurser, og samtidig holde kostnadene nede. Vårt digitale fokus muliggjør fleksible arbeidsmetoder der du kan jobbe mer i feltet og fra hjemmekontor, og mindre på kontoret. Ukentlige digitale møter med regionskontorene holder deg oppdatert og tilkoblet, uansett hvor du er.",
//   },
//   {
//     img: "/assets/ledige-3.jpg",
//     head: "Møtepunkter",
//     p: "I tillegg etablerer vi flere møtepunkt og kontorer hvor meglerne kan ha kundemøter, skrive dokumenter og jobbe når det trengs. I første omgang vil disse kontorene bli lokalisert i Oslo, Drammen og Asker/Bærum. Dette gir deg fleksibiliteten til å jobbe der du trenger, samtidig som du har tilgang til profesjonelle fasiliteter når det er nødvendig.",
//   },
//   {
//     img: "/assets/ledige-4.jpg",
//     head: "Månedlige møter",
//     p: "Vi vil også arrangere fysiske månedlige møter, for eksempel på fredager, hvor alle samles for å dele erfaringer og innsikt. Under disse møtene kårer vi månedens megler – en motivasjonsboost for teamet!.",
//   },
// ];

interface ContentProps {
  items?: VacancySection[];
}

export default function Content({ items = [] }: ContentProps) {
  const ContentComponent = ({
    item,
    invert = false,
  }: {
    item: VacancySection;
    invert?: boolean;
  }) => {
    const imgSrc = item.image
      ? typeof item.image === "string"
        ? `${BASE_URL}${item.image}`
        : URL.createObjectURL(item.image)
      : null;
    return (
      <div
        className={
          "flex items-center mb-20 flex-col md:gap-20 gap-10" +
          (invert ? " md:flex-row-reverse" : " md:flex-row")
        }
      >
        <div className="sm:h-[500px] h-[300px] w-full md:w-1/2">
          {imgSrc && (
            <ImageComponent
              width={500}
              height={500}
              alt={item.head ?? ""}
              src={imgSrc}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          )}
        </div>
        <div className="md:w-1/2 flex flex-col gap-5 items-start">
          <strong className="md:text-4xl text-3xl font-normal text-black">
            {item.head}
          </strong>
          <p className="md:text-[16px] text-[14px]">{item.p}</p>
          <a
            href="/bli-en-del-av-fremtidens-meglerteam-hos-lokalmegleren"
            className="md:w-2/5 inline-block text-center px-6 p-3 md:text-[20px] text-sm rounded-md gold_btn"
          >
            Les mer
          </a>
        </div>
      </div>
    );
  };
  return (
    <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3">
      {items.map((item, ind) => (
        <ContentComponent
          key={item._id ?? ind}
          item={item}
          invert={ind % 2 !== 0}
        />
      ))}

      {/* black content — static, unchanged */}
      <div className="bg-black rounded-xl flex flex-col md:flex-row justify-between md:p-10 p-6 md:gap-10 gap-5 mb-20">
        <div className="md:w-1/2">
          <h4 className="md:text-2xl text-sm font-semibold text-white max-w-2xs">
            Er du nysgjerrig og ønsker ﻿å vite mer?
          </h4>
        </div>
        <div className="md:w-2/5">
          <p className="text-white md:text-[16px] text-[14px] mb-10">
            Vi arrangerer et meglertreff hvor vi vil introdusere og presentere
            vårt nye konsept. Informasjon om møtested vil bli sendt til de
            påmeldte.
          </p>
          <a
            href="/contact"
            className="p-3 lg:w-3/4 text-center inline-block md:text-[20px] text-sm rounded-md gold_btn"
          >
            Meld din interesse her
          </a>
        </div>
      </div>
    </div>

    // <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3">
    //   {content &&
    //     content.length > 0 &&
    //     content.map((item: any, ind: number) => (
    //       <ContentComponent key={ind} item={item} invert={ind % 2 != 0} />
    //     ))}

    //   {/* black content */}
    //   <div className="bg-black rounded-xl flex flex-col md:flex-row justify-between md:p-10 p-6 md:gap-10 gap-5 mb-20">
    //     <div className="md:w-1/2">
    //       <h4 className="md:text-2xl text-sm font-semibold text-white max-w-2xs">
    //         Er du nysgjerrig og ønsker ﻿å vite mer?
    //       </h4>
    //     </div>
    //     <div className="md:w-2/5">
    //       <p className="text-white md:text-[16px] text-[14px] mb-10">
    //         Vi arrangerer et meglertreff hvor vi vil introdusere og presentere
    //         vårt nye konsept. Informasjon om møtested vil bli sendt til de
    //         påmeldte.
    //       </p>
    //       <a
    //         href="/contact"
    //         className="p-3 lg:w-3/4 text-center inline-block md:text-[20px] text-sm rounded-md gold_btn"
    //       >
    //         Meld din interesse her
    //       </a>
    //     </div>
    //   </div>
    // </div>
  );
}
