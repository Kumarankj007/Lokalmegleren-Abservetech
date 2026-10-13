/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import GetVilkaarList from "../api/dynamicPagesapi/Vilkaar";

const fonts = {
  title: " md:text-[26px] text-[20px] font-semibold text-[#111] ogFont ",
  head: " md:text-[20px] text-[18px] font-semibold text-[#111] ogFont ",
  pFont: " md:text-[16px] text-[14px] text-[#313131] ",
};

// const privacy = [
//   {
//     title: "Personvernvilkår ved forespørsel om kontakt",
//     p1: "Når du ber oss ta kontakt med deg (for eksempel via kontaktskjema, e-post eller telefon), behandler vi de personopplysningene du selv oppgir, typisk navn, telefonnummer, e-postadresse og eventuelle meldinger.",
//     p2: "Formålet med behandlingen er å kunne følge opp forespørselen din og gi deg relevant informasjon eller tjenester du ber oss ta kontakt med deg (for eksempel via kontaktskjema, e-post eller telefon), behandler vi de personopplysningene du selv oppgir, typisk navn, telefonnummer, e-postadresse og eventuelle meldinger.",
//     li: [
//       {
//         label: "Behandlingsgrunnlag:",
//         data: "Vi behandler opplysningene dine basert påditt samtykke når du sender forespørselen.",
//       },
//       {
//         label: "Lagringstid:",
//         data: "Opplysningene lagres så lenge det er nødvendig for å følge opp henvendelsen din, og slettes når formålet er oppfylt eller når du ber oss om det.",
//       },
//       {
//         label: "Tredjeparter:",
//         data: "Vi deler ikke opplysningene dine med andre uten ditt samtykke, med mindre vi er rettslig forpliktet til det.",
//       },
//       {
//         label: "Dine rettigheter:",
//         data: "Du har rett til innsyn, retting og sletting av opplysninger vi har om deg. Du kan når som helst trekke tilbake samtykket ditt ved å kontakte oss.",
//       },
//     ],
//   },
// ];

// const terms = {
//   title: "Vilkår og betingelser for eiendomsmeglingstjenester",
//   subTitle1: "Vederlag og kostnader:",
//   liTitle:
//     "Følgende satser gjelder for oppdraget, med mindre annet er skriftlig avtalt:",
//   li: [
//     "Provisjon: 1,5 % av salgssummen, med minimumsbeløp kr. 47 500.",
//     "Etableringsgebyr: kr. 3 500.",
//     "Tilretteleggingsgebyr: kr. 14 500.",
//     "Visningshonorar: kr. 3 190 per visning.",
//     "Grunnpakke enebolig: kr. 5 990.",
//     "Markedsføringspakke 1: kr. 18 990.",
//     "Markedsføringspakke 2: kr. 6 990.",
//     "Gebyr for utsatt betaling: kr. 3 990.",
//     "Oppgjørsgebyr: kr. 8 490.",
//     "Fotografering/video: Estimert kr. 5 000 (kan variere etter leverandør).",
//     "Pantattester/Grunnbok: kr. 808.",
//     "Tinglysing av panterett med urådighet: kr. 585.",
//     "E-takst: kr. 2 500.",
//   ],
//   totalCost:
//     "Samlede kostnader vil variere avhengig av hvilke tjenester som benyttes.",
//   alternatively:
//     "Alternativt kan oppdraget utføres på timepris etter medgått tid, kr. 3 200 per time.",
//   subTitle2: "Varighet og oppsigelse:",
//   desc: "Oppdraget løper i henhold til avtalt oppdragsavtale. Selger kan si opp oppdraget i tråd med bestemmelsene i eiendomsmeglingsloven. Påløpte kostnader frem til oppsigelsestidspunktet faktureres med avtalt vederlag selger.",
// };

// Fallback Contents
const fallbackPrivacy = {
  title: "Personvernvilkår ved forespørsel om kontakt",
  p1: "Når du ber oss ta kontakt med deg (for eksempel via kontaktskjema, e-post eller telefon), behandler vi de personopplysningene du selv oppgir, typisk navn, telefonnummer, e-postadresse og eventuelle meldinger.",
  p2: "Formålet med behandlingen er å kunne følge opp forespørselen din og gi deg relevant informasjon eller tjenester.",
  li: [
    {
      label: "Behandlingsgrunnlag:",
      data: "Vi behandler opplysningene dine basert på ditt samtykke når du sender forespørselen.",
    },
    {
      label: "Lagringstid:",
      data: "Opplysningene lagres så lenge det er nødvendig for å følge opp henvendelsen din.",
    },
    {
      label: "Tredjeparter:",
      data: "Vi deler ikke opplysningene dine med andre uten ditt samtykke.",
    },
    {
      label: "Dine rettigheter:",
      data: "Du har rett til innsyn, retting og sletting av opplysninger vi har om deg.",
    },
  ],
};

const fallbackTermsTitle = {
  title: "Vilkår og betingelser for eiendomsmeglingstjenester",
};

const fallbackCostSection = {
  title: "Vederlag og kostnader:",
  p1: "Følgende satser gjelder for oppdraget, med mindre annet er skriftlig avtalt:",
  li: [
    {
      data: "Provisjon: 1,5 % av salgssummen, med minimumsbeløp kr. 47 500.",
    },
    {
      data: "Etableringsgebyr: kr. 3 500.",
    },
    {
      data: "Tilretteleggingsgebyr: kr. 14 500.",
    },
    {
      data: "Visningshonorar: kr. 3 190 per visning.",
    },
    {
      data: "Grunnpakke enebolig: kr. 5 990.",
    },
    {
      data: "Markedsføringspakke 1: kr. 18 990.",
    },
    {
      data: "Markedsføringspakke 2: kr. 6 990.",
    },
    {
      data: "Gebyr for utsatt betaling: kr. 3 990.",
    },
    {
      data: "Oppgjørsgebyr: kr. 8 490.",
    },
    {
      data: "Fotografering/video: Estimert kr. 5 000.",
    },
    {
      data: "Pantattester/Grunnbok: kr. 808.",
    },
    {
      data: "Tinglysing av panterett med urådighet: kr. 585.",
    },
    {
      data: "E-takst: kr. 2 500.",
    },
  ],
  p2: `Samlede kostnader vil variere avhengig av hvilke tjenester som benyttes.

Alternativt kan oppdraget utføres på timepris etter medgått tid, kr. 3 200 per time.`,
};

const fallbackDurationSection = {
  title: "Varighet og oppsigelse:",
  p1: "Oppdraget løper i henhold til avtalt oppdragsavtale. Selger kan si opp oppdraget i tråd med bestemmelsene i eiendomsmeglingsloven.",
};

export default function Terms() {
  const { vilkaarList, FetchVilkaarList } = GetVilkaarList();
  useEffect(() => {
    FetchVilkaarList();
  }, [FetchVilkaarList]);

  const sortedList = [...(vilkaarList ?? [])].sort(
    (a: any, b: any) => a.order - b.order,
  );

  const privacy = sortedList?.[0] || fallbackPrivacy;
  const termsTitle = sortedList?.[1] || fallbackTermsTitle;
  const costSection = sortedList?.[2] || fallbackCostSection;
  const durationSection = sortedList?.[3] || fallbackDurationSection;

  return (
    <div className="bg-[#e2cf9e] md:py-10 py-5">
      <div className="max-w-[1300px] mx-auto md:px-10 px-5">
        {/* Privacy Section */}
        {privacy && (
          <section className="my-10">
            {privacy?.title && (
              <strong className={fonts.title + " block text-center"}>
                {privacy.title}
              </strong>
            )}

            {privacy?.p1 && (
              <p className={fonts.pFont + " block mt-5"}>{privacy.p1}</p>
            )}

            {privacy?.p2 && (
              <p className={fonts.pFont + " block mt-5"}>{privacy.p2}</p>
            )}

            {Array.isArray(privacy?.li) && privacy.li.length > 0 && (
              <ul className="list-disc ml-10 mt-5">
                {privacy.li.map((item: any, ind: number) => (
                  <li key={ind} className={fonts.pFont + "mt-5"}>
                    {item?.label && (
                      <span className="font-semibold mr-2">{item.label}</span>
                    )}
                    {item?.data}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Main Terms Title */}
        {termsTitle?.title && (
          <h2 className={fonts.title + " md:mb-10 mb-5 text-center"}>
            {termsTitle.title}
          </h2>
        )}

        {/* Cost Section */}
        {costSection && (
          <>
            {costSection?.title && (
              <strong className={fonts.head + " mb-5 block"}>
                {costSection.title}
              </strong>
            )}

            {costSection?.p1 && (
              <p className={fonts.pFont + "mb-3"}>{costSection.p1}</p>
            )}

            {Array.isArray(costSection?.li) && costSection.li.length > 0 && (
              <ul className="list-disc md:ml-10 ml-5 my-5">
                {costSection.li.map((item: any, ind: number) => (
                  <li key={ind} className={fonts.pFont + "mb-3"}>
                    {item?.label && (
                      <span className="font-semibold mr-1">{item.label}</span>
                    )}
                    {item?.data}
                  </li>
                ))}
              </ul>
            )}

            {costSection?.p2 &&
              costSection.p2.split("\n\n").map((text: string, ind: number) => (
                <p key={ind} className={fonts.pFont + "mb-3"}>
                  {text}
                </p>
              ))}
          </>
        )}

        {/* Duration Section */}
        {durationSection && (
          <>
            {durationSection?.title && (
              <strong className={fonts.head + " mt-8 block"}>
                {durationSection.title}
              </strong>
            )}

            {durationSection?.p1 && (
              <p className={fonts.pFont + "my-3"}>{durationSection.p1}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
