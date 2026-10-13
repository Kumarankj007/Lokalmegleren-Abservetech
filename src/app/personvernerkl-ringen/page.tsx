/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import GetPersonvernList from "../api/dynamicPagesapi/PersonvernList";

const fonts = {
  head: " md:text-[18px] text-[16px] font-semibold text-[#313131] ",
  pFont: " md:text-[16px] text-[14px] text-[#313131] ",
};

const content = [
  {
    title: "Personvernerklæring for Lokalmegleren",
    p1: "Vi i Lokalmegleren tar ditt personvern på alvor. Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter dine personopplysninger når du besøker vår nettside og benytter våre tjenester. Erklæringen er utarbeidet med hensyn til gjeldende regelverk, herunder personopplysningsloven, EUs personvernforordning (GDPR) og åpenhetsloven.",
  },
  {
    title: "1. Hvilke personopplysninger vi samler inn",
    p1: "Vi kan samle inn og behandle følgende typer personopplysninger:",
    li: [
      {
        label: "Kontaktinformasjon:",
        data: "Navn, e-postadresse, telefonnummer, og annen informasjon du oppgir når du kontakter oss, registrerer deg eller benytter våre tjenester.",
      },
      {
        label: "Opplysninger knyttet til din henvendelse:",
        data: "Informasjon om din interesse for våre eiendomstjenester, inkludert detaljer om kjøp, salg eller annen eiendomsmegling.",
      },
      {
        label: "Automatisk innsamlede data:",
        data: "Informasjon om ditt besøk på vår nettside, slik som IP-adresse, nettlesertype, tidspunkt for besøk og sider du besøker. Disse opplysningene innhentes blant annet ved hjelp av informasjonskapsler (cookies) og analysetjenester.",
      },
    ],
  },
  {
    title: "2. Formål med behandlingen av personopplysninger",
    note: {
      label: "Kundeservice:",
      data: "Å besvare dine henvendelser og gi deg den informasjon og de tjenester du etterspør.",
    },
    li: [
      {
        label: "Administrasjon av tjenester:",
        data: "Å levere, administrere og utvikle våre eiendomstjenester.",
      },
      {
        label: "Markedsføring",
        data: "Å informere deg om relevante tjenester og tilbud, forutsatt at du har gitt samtykke til dette.",
      },
      {
        label: "Analyse og forbedring:",
        data: "Å analysere bruken av nettsiden vår for å forbedre brukeropplevelsen og våre tjenester.",
      },
      {
        label: "Juridisk etterlevelse:",
        data: "Å oppfylle våre forpliktelser etter lovverket, inkludert krav knyttet til åpenhetsloven.",
      },
    ],
  },
  {
    title: "3. Rettlig grunnlag for behandlingen",
    p1: "Behandlingen av dine personopplysninger baserer seg på følgende rettslige grunnlag:",
    li: [
      {
        label: "Samtykke:",
        data: "Når du aktivt gir oss ditt samtykke, for eksempel ved utfylling av kontaktskjema eller registrering.",
      },
      {
        label: "Avtale:",
        data: "For å oppfylle kontraktsforpliktelser knyttet til våre tjenester.",
      },
      {
        label: "Rettlig forpliktelse:",
        data: "Når vi er pålagt å oppbevare eller behandle opplysninger etter loven.",
      },
      {
        label: "Berettiget interesse:",
        data: "Når behandlingen er nødvendig for våre berettigede interesser, for eksempel for å forbedre våre tjenester og markedsføre relevante tilbud, såfremt dette ikke går på bekostning av dine grunnleggende rettigheter og friheter.",
      },
    ],
  },
  {
    title: "4. Deling av personopplysninger",
    p1: "Vi deler ikke dine personopplysninger med tredjeparter, med mindre:",
    li: [
      {
        label: "Tjenesteleverandører:",
        data: "Det er nødvendig for å levere våre tjenester (for eksempel med samarbeidspartnere eller underleverandører som bistår med teknisk drift eller markedsføring). Disse partene er forpliktet til å behandle opplysningene i samsvar med våre instrukser og gjeldende lovgivning.",
      },
      {
        label: "Lovpålagte krav:",
        data: "Vi er forpliktet til å utlevere opplysninger dersom dette kreves etter lov eller ved rettslig pålegg.",
      },
      {
        label: "Med ditt samtykke:",
        data: "Dersom du har gitt uttrykk for at dine opplysninger kan deles med andre.",
      },
    ],
  },
  {
    title: "5. Lagringstid",
    p1: "Dine personopplysninger oppbevares så lenge det er nødvendig for å oppfylle formålene beskrevet ovenfor, eller så lenge det kreves av lovgivningen. Etter utløpt lagringsperiode blir opplysningene slettet eller anonymisert.",
  },
  {
    title: "6. Dine rettigheter",
    p1: "I henhold til GDPR og norsk personopplysningslov har du følgende rettigheter:",
    li: [
      {
        label: "Innsyn:",
        data: "Du kan be om informasjon om hvilke personopplysninger vi har lagret om deg.",
      },
      {
        label: "Rettelse:",
        data: "Du kan be om å få uriktige eller ufullstendige opplysninger rettet.",
      },
      {
        label: "Sletting:",
        data: "Du kan be om sletting av dine personopplysninger, med visse lovbestemte unntak.",
      },
      {
        label: "Begrensning av behandling:",
        data: "Du kan be om at behandlingen av dine personopplysninger begrenses.",
      },
      {
        label: "Dataoverførbarhet:",
        data: "Du har rett til å motta dine personopplysninger i et strukturert, vanlig brukt og maskinlesbart format.",
      },
      {
        label: "Innsigelse:",
        data: "Du kan i visse tilfeller protestere mot behandlingen av dine personopplysninger.",
      },
    ],
    p2: "For å utøve dine rettigheter, vennligst kontakt oss ved hjelp av kontaktinformasjonen oppgitt ovenfor.",
  },
  {
    title: "7. Sikkerhet",
    p1: "Vi har implementert nødvendige tekniske og organisatoriske tiltak for å beskytte dine personopplysninger mot uautorisert tilgang, endring, tap eller ødeleggelse.",
  },
  {
    title: "8. Bruk av informasjonskapsler (cookies)",
    p1: "Vår nettside benytter informasjonskapsler for å:",
    li: [
      {
        data: "Forbedre brukeropplevelsen.",
      },
      {
        data: "Analysere trafikk og bruksmønstre.",
      },
      {
        data: "Tilpasse innhold og annonser til dine interesser.",
      },
    ],
    p2: "Du kan selv endre innstillingene for informasjonskapsler i din nettleser, men merk at enkelte funksjoner på nettsiden kan bli påvirket dersom du deaktiverer cookies.",
  },
  {
    title: "9. Åpenhetsloven",
    p1: "I henhold til åpenhetsloven skal vi være åpne om hvordan vi behandler personopplysninger. Denne erklæringen er ment å gi en tydelig oversikt over våre rutiner og praksis. Skulle du ha spørsmål eller ønske ytterligere informasjon om vår behandling av dine personopplysninger, er du velkommen til å kontakte oss.",
  },
  {
    title: "10. Endringer i personvernerklæringen",
    p1: "Vi forbeholder oss retten til å endre denne personvernerklæringen ved behov. Ved vesentlige endringer vil vi gjøre deg oppmerksom på dette via vår nettside. Dato for siste oppdatering fremgår nederst i erklæringen.",
  },
  {
    title: "11. Kontaktinformasjon",
    p1: "Har du spørsmål om denne personvernerklæringen eller hvordan vi behandler dine personopplysninger, vennligst kontakt oss:",
    address: [
      "Partnere AS (Lokalmegleren)",
      "Hagaløkkveien 13, 1383 Asker",
      "3017 Drammen",
      "Phone: 32 82 25 00",
      "E-mail: backoffice@lokalmegleren.no",
      "Date of last update: 02.02.2025",
    ],
  },
];

export default function Privacy() {
  const { personvernList, FetchPersonvernList } = GetPersonvernList();
  useEffect(() => {
    FetchPersonvernList();
  }, [FetchPersonvernList]);

  return (
    <div className="bg-[#e2cf9e] md:py-10 py-5">
      <div className="max-w-[1300px] mx-auto md:px-10 px-5">
        {personvernList &&
          personvernList.length > 0 &&
          personvernList?.map((item: any, ind: number) => (
            <section key={ind} className="my-10">
              {item?.title && (
                <strong className={fonts.head + " block"}>{item?.title}</strong>
              )}
              {item?.p1 && (
                <p className={fonts?.pFont + " block mt-5"}>{item?.p1}</p>
              )}
              {Array.isArray(item?.li) && item?.li?.length > 0 && (
                <ul className="list-disc ml-10 mt-5">
                  {item?.li?.map((items: any, ind: number) => (
                    <li key={ind} className={fonts?.pFont + "mt-5"}>
                      {items?.label && (
                        <span className="font-semibold mr-2">
                          {items?.label}
                        </span>
                      )}
                      {items?.data}
                    </li>
                  ))}
                </ul>
              )}
              {item?.p2 && (
                <p className={fonts?.pFont + " block mt-5"}>{item?.p2}</p>
              )}
              {Array.isArray(item?.address) && item?.address?.length > 0 && (
                <div className="mt-5">
                  {item?.address?.map((items: any, ind: number) => (
                    <p className={fonts?.pFont + ""} key={ind}>
                      {items}
                    </p>
                  ))}
                </div>
              )}
            </section>
          ))}
      </div>
    </div>
  );
}
