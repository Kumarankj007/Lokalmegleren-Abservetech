/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from "react";
import ImageComponent from "../components/image";

const content = [
  {
    p: [
      "Drømmer du om å være en del av et innovativt og fremtidsrettet meglerforetak? Lokalmegleren er i ferd med å bygge Norges største meglerkontor på Østlandet, og vi ser etter dyktige eiendomsmeglere som vil bli med på denne spennende reisen.",
    ],
  },
  {
    title: "Vårt unike konsept: Større kontor, større muligheter",
    p: [
      "I stedet for å spre oss ut over mange små kontorer, satser vi på én stor, sentralisert base med flere hundre meglere. Dette gir oss en unik mulighet til å samarbeide på tvers, dele erfaringer og ressurser, og samtidig holde kostnadene nede. Vårt digitale fokus muliggjør fleksible arbeidsmetoder der du kan jobbe mer i feltet og fra hjemmekontor, og mindre på kontoret. Ukentlige digitale møter med regionskontorene holder deg oppdatert og tilkoblet, uansett hvor du er.",
      "I tillegg etablerer vi flere møtepunkt og kontorer hvor meglerne kan ha kundemøter, skrive dokumenter og jobbe når det trengs. I første omgang vil disse kontorene bli lokalisert i Oslo, Drammen og Asker/Bærum. Dette gir deg fleksibiliteten til å jobbe der du trenger, samtidig som du har tilgang til profesjonelle fasiliteter når det er nødvendig.",
      "Vi vil også arrangere fysiske månedlige møter, for eksempel på fredager, hvor alle samles for å dele erfaringer og innsikt. Under disse møtene kårer vi månedens megler – en motivasjonsboost for teamet!",
    ],
  },
  {
    title: "Maksimer din inntjening",
    p: [
      "Hos Lokalmegleren kutter vi unødvendige mellomledd for å gi deg, som megler, størst mulig andel av provisjonen. Som en del av vår satsing, tilbyr vi de første 20 meglerne/partnerne en eksklusiv avtale: hele 60 % av netto provisjonen du henter inn. Dette er en mulighet til å sikre en lønnsom og stabil inntekt, samtidig som du bygger karrieren din i et sterkt og fremoverlent team.",
    ],
  },
  {
    title: "Vi ser etter de beste",
    p: [
      "For å bli en del av vårt partnerprogram, stiller vi krav til erfaring og kompetanse. Du må ha solgt minst 40 eiendommer og ha en dokumentert track record som eiendomsmegler. Andre kandidater kan bli vurdert gjennom en grundig opptaksprosess som inkluderer intervjuer og evalueringer.",
    ],
  },
  {
    title: "Hvorfor velge Lokalmegleren?",
    li: [
      {
        head: "Fleksibilitet",
        item: "Jobb mer i feltet, mindre på kontoret, og dra nytte av våre hjemmekontorløsninger.",
      },
      {
        head: "Innovativt arbeidsmiljø",
        item: "Dra fordel av et digitalt fokus som effektiviserer hverdagen din.",
      },
      {
        head: "Høy inntjening",
        item: "Få størst mulig andel av din egen provisjon.",
      },
      {
        head: "Samarbeid",
        item: "Bli en del av et større, sterkt fellesskap der kompetanse og erfaring deles på tvers.",
      },
      {
        head: "Karrieremuligheter",
        item: "Vær med å bygge et fremtidsrettet konsept som skiller seg ut i bransjen.",
      },
      {
        head: "Møtepunkt",
        item: "Tilgang til profesjonelle kontorer og fasiliteter i Oslo, Drammen og Asker/Bærum.",
      },
      {
        head: "Motivasjon",
        item: "Delta på månedlige møter og vær med i kåringen av månedens megler.",
      },
    ],
  },
  {
    title: "Ta neste steg",
    p: [
      "Er du klar for å bli en del av Lokalmegleren og være med på å skape Norges mest innovative og lønnsomme meglerforetak? Kontakt oss i dag for en uforpliktende samtale og hør mer om våre planer og hva vi kan tilby deg som partner eller megler.",
      "Lokalmegleren – fremtiden er her, og vi vil ha deg med på laget.",
      "Kontakt Tajinder Sharma på 915 86 120 eller sharma@lokalmegleren.no",
    ],
  },
];

export default function page() {

  const fonts = {
    head: " mb-5 md:text-[18px] text-[16px] font-semibold text-[#313131] ",
    pFont: " mb-5 md:text-[16px] text-[14px] font-normal text-[#313131] ",
    liFont: " mb-5 md:text-[17px] text-[15px] font-semibold text-[#313131] "
  }
  return (
    <div className="bg-[#e2cf9e] py-10">
      <div className="max-w-[1200px] mx-auto md:px-10 sm:px-5 px-3">
        <strong className={fonts?.liFont}>
          Bli en del av fremtidens meglerteam hos Lokalmegleren
        </strong>
        <div className="w-full md:h-[400px] h-[300px] my-10">
          <ImageComponent
            width={500}
            height={500}
            alt="ledge-1"
            src={"/assets/ledige-1.png"}
            className="w-full h-full object-cover rounded-4xl"
          />
        </div>
        {/* content */}
        {content?.length > 0 &&
          content?.map((item: any, ind: number) => (
            <div key={ind} className="mb-3">
              {item?.title && item?.title?.length > 0 && (
                <strong className={fonts?.head + "inline-block"}>{item?.title}</strong>
              )}
              {item?.p &&
                item?.p?.length > 0 &&
                item?.p?.map((pItm: any, i: number) => (
                  <p
                    className={fonts?.pFont}
                    key={i}
                  >
                    {pItm}
                  </p>
                ))}
              {item?.li && item?.li?.length > 0 && (
                <ul className="list-disc pl-5 mb-5 marker:text-[#313131]">
                  {item?.li?.map((liItm: any, i: number) => (
                    <li key={i} className="mb-3">
                      {liItm?.head && <b className={fonts?.liFont}>{liItm?.head}: </b>}
                      {liItm?.item && <span className={fonts?.pFont}>{liItm?.item}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        <div></div>
      </div>
    </div>
  );
}
