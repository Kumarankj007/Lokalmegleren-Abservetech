/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import GetOmOssList from "../api/dynamicPagesapi/About";

// const content = {
//   blk1: {
//     title: "Lokalmegleren din",
//     li: [
//       "Vi har spesialisert oss på salg av boligeiendommer i regionen. Vi har den ekspertisen og lokalkunnskapen som er nødvendig for å kunne levere meglertjenester i toppklasse. Salg av alle typer eiendommer bygger på tillit, så overlat ikke ditt valg av megler til tilfeldighetene. Vi er opptatt av at du skal være fornøyd, og vårt fokus er å gi deg en trygg eiendomshandel enten du er selger eller kjøper. I dag fremstår de fleste meglerforretninger som svært like. Hos oss er det lov å tenke fritt og annerledes, og vårt konsept legger til rette for at alle kunder og alle eiendommer er ulike og har sitt særpreg.",
//       "Gjennom et godt utviklet kontaktnett, sikre rutiner samt et team du kan stole på, kan vi levere deg et kvalitetsprodukt.",
//       "Dersom du ikke skulle finne din drømmebolig blant de vi har for salg, kan vi tilby deg et aktivt søk etter det du er på utkikk etter. Vi vil da annonsere etter ønsket bolig, både i aviser og på internett, samt benytte vårt omfattende kontaktnett. Det er verdt å merke seg at mange eiendommer ikke synliggjøres gjennom annonser.",
//     ],
//   },
//   blk2: {
//     title: "Skal du selge?",
//     li: [
//       "Vil vi gi deg en verdivurdering av boligen din. Ta kontakt med oss, så kan vi gi deg en verdivurdering av din bolig og et tilbud på meglertjenesten.",
//       "Verdivurdering for andre hensikter enn salg blir det fakturert et avtalt beløp.",
//       "﻿Ved salg av deres eiendom via Lokalmegleren.no senere, vil beløpet da bli fratrukket provisjonen. Du kan benytte skjemaet på disse sidene eller ringe oss på 32 82 25 00.",
//       "Besøk oss gjerne på vårt kontor på Bragernes Torg, Drammen. Vi ønsker deg velkommen som kunde.",
//     ],
//   },
// };

const fonts = {
  head: " mb-5 lg:text-[54px] md:text-[40px] text-[33px] font-semibold text-[#111] ",
  subHead:
    " mb-7 md:text-[40px] md:text-[35px] text-[27px] font-semibold text-[#111] ",
  pFont: " md:text-[16px] text-[14px] font-normal ",
};

export default function About() {
  const { omOssList, FetchOmOssList } = GetOmOssList();

  useEffect(() => {
    FetchOmOssList();
  }, [FetchOmOssList]);

  const sortedList = [...(omOssList ?? [])].sort(
    (a: any, b: any) => a.order - b.order,
  );

  const blk1Items = sortedList.slice(0, -1);
  const blk2 = sortedList[sortedList.length - 1];

  return (
    <div>
      <div className="bg-[url(/assets/boligstoff2.webp)] flex items-center bg-no-repeat bg-cover bg-center relative before:absolute before:size-full before:bg-[#000000] before:z-10 before:left-0 before:top-0 before:opacity-60 text-white mb-14">
        <div className="max-w-[1400px] mx-auto py-16 md:px-10 sm:px-5 px-3 z-20">
          <strong className={"block text-center text-white" + fonts?.head}>
            Lokalkjent der du bor
          </strong>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto md:px-10 sm:px-5 px-3">
        {/* blk 1 — all items except last */}
        {blk1Items.map((blk: any, index: number) => (
          <div key={blk._id ?? index}>
            {blk.title && (
              <b className={"block text-center" + fonts?.subHead}>
                {blk.title}
              </b>
            )}
            {blk.li?.length > 0 && (
              <ul className="mb-20">
                {blk.li.map((item: string, ind: number) => (
                  <li
                    key={ind}
                    className={fonts?.pFont + "mb-5 text-[#313131]"}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* blk 2 — last item */}
        {blk2 && (
          <div className="lg:p-16 p-7 py-16 bg-[url(/assets/abt_img.jpg)] bg-no-repeat bg-cover bg-fixed rounded-lg mb-20">
            <div className="lg:max-w-2/4 w-full mx-auto bg-white rounded-lg shadow-md py-6 lg:px-16 px-5">
              {blk2.title && (
                <b className={"block text-center" + fonts?.subHead}>
                  {blk2.title}
                </b>
              )}
              {blk2.li?.length > 0 && (
                <ul className="mb-10">
                  {blk2.li.map((item: string, ind: number) => (
                    <li
                      key={ind}
                      className={
                        fonts?.pFont + "text-[#313131] mb-5 text-center"
                      }
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={"/contact"}
                className={
                  fonts.pFont +
                  "block max-w-72 text-center rounded-full bg-[#e2cf9e] text-white px-7 py-3 mx-auto"
                }
              >
                Kontakt oss
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
