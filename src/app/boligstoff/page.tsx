/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import ImageComponent from "../components/image";
import { Dialog } from "@headlessui/react";
import "swiper/css";
import "swiper/css/pagination";
import CloseIcon from "@mui/icons-material/Close";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import GetBoligstoffList from "../api/dynamicPagesapi/Boligstoff";
import { BASE_URL } from "../helper/apitools";
import BoligItem from "./BoligCard";

// const content = [
//   {
//     img: "/assets/boligstoff1.webp",
//     title:
//       "Kravet til egenkapital har senket til 10% - Hva betyr det for boligmarkedet?",
//     p: [
//       "Ved årsskiftet 2024/2025 trådte en ny utlånsforskrift i kraft i Norge, og med dette fulgte flere betydelige endringer som vil påvirke både banker og låntakere. Den mest markante endringen er at kravet til egenkapital ved boligkjøp er redusert fra 15 % til 10 %. Dette innebærer at boligkjøpere nå kan finansiere opptil 90 % av boligens verdi gjennom lån, noe som er spesielt gunstig for unge og førstegangskjøpere som ofte sliter med å spare opp tilstrekkelig egenkapital.",
//       "Den nye forskriften erstatter de tidligere reglene som krevde fornyelse hvert andre år. Denne gangen har regjeringen besluttet å gjøre forskriften varig, uten en fastsatt utløpsdato. Dette er ment å gi større forutsigbarhet for finansinstitusjoner og låntakere. Samtidig vil Finansdepartementet gjennomføre jevnlige vurderinger for å sikre at reglene forblir tilpasset dagens økonomiske situasjon.",
//       "Til tross for at egenkapitalkravet er redusert, videreføres flere sentrale krav for å opprettholde en ansvarlig utlånspraksis. Blant disse er gjeldsgradregelen, som sier at låntakeres samlede gjeld ikke kan overstige fem ganger brutto årsinntekt. I tillegg må bankene fortsatt vurdere låntakeres evne til å betjene lånet, inkludert stresstesting som sikrer at kunden tåler en renteøkning på minst tre prosentpoeng, med en minimumsrente på syv prosent. Krav til avdragsbetaling for boliglån med høy belåningsgrad blir også videreført.",
//       "Et annet viktig element i den nye forskriften er fleksibilitetskvotene. Disse kvotene gir bankene anledning til å avvike fra enkelte krav for en begrenset andel av utlånene. Dette gir rom for fleksibilitet i spesielle tilfeller, men kvotene er begrenset til en viss prosentandel av det totale utlånsvolumet hvert kvartal. Reduksjonen i egenkapitalkravet er ment å stimulere boligmarkedet ved å gjøre det lettere for flere å komme inn på markedet",
//       "For førstegangskjøpere kan dette bety at drømmen om egen bolig blir mer oppnåelig. Samtidig påpeker eksperter at de videreførte kravene til gjeldsgrad og betjeningsevne er nødvendige for å forhindre overopphoping av gjeld i husholdningene og sikre stabilitet i økonomien.",
//       "For de som planlegger å kjøpe bolig, er det viktig å sette seg grundig inn i de nye reglene og vurdere sin egen økonomiske situasjon. Selv om kravene til egenkapital er senket, vil bankene fortsatt gjennomføre grundige vurderinger av lånesøknader for å sikre at kundene har evne til å betjene gjelden.",
//       "Den nye utlånsforskriften markerer en viktig endring for norsk boligøkonomi, og dens virkninger vil trolig bli merkbare både for enkeltpersoner og for hele boligmarkedet i tiden som kommer.",
//     ],
//   },
//   {
//     img: "/assets/boligstoff2.webp",
//     title: "Forberedelser før fotografen kommer og tips til boligstyling",
//     p: [
//       "Når boligen skal fotograferes til salgsoppgaven, er det viktig å skape en atmosfære som appellerer til potensielle kjøpere. Bilder er ofte det første inntrykket de får av boligen, og med riktig boligstyling og forberedelse kan du sikre at hjemmet fremstår fra sin beste side.",
//       "Rydding er det første steget for å gjøre boligen klar. Fjern alle personlige elementer, som private bilder, personlige toalettartikler, og andre ting som kan ta oppmerksomheten bort fra selve boligen. Sørg for at alle overflater, som benker, bord og hyller, er ryddige og fri for unødvendige gjenstander. Dette skaper et rent og oversiktlig uttrykk.",
//       "Ledninger og skjøteledninger bør skjules bak møbler eller fjernes helt for fotograferingen. Løse ledninger kan gi et rotete inntrykk og trekke fokus bort fra rommets helhet. I tillegg bør du fjerne de fleste sko og jakker fra inngangspartiet, slik at inngangen ser åpen og innbydende ut.",
//       "Legg på sengetepper på sengene og sørg for at nattbordene er ryddige, med kun noen få dekorative elementer som en bok eller en lampe. På badene bør du fjerne personlige hygieneartikler og erstatte dem med rene håndklær, et enkelt duftlys eller en plante for å skape et spa-lignende inntrykk. Vaskerommet kan også styles ved å fjerne skittentøyskurver, vaskemidler og andre praktiske, men mindre estetiske elementer.",
//       "For å fremheve boligens beste sider, bør du tenke på å skape en rød tråd i innredningen. Bruk nøytrale farger og stilrene detaljer for å appellere til flest mulig. Pyntegjenstander bør begrenses, men noen få strategisk plasserte elementer kan bidra til å gjøre rommet mer levende og hyggelig. Grønne planter, vaser med friske blomster, eller en skål med frukt på kjøkkenet er enkle grep som skaper en innbydende atmosfære.",
//       "Lyssetting er avgjørende for gode bilder. Sørg for å slippe inn så mye naturlig lys som mulig ved å åpne gardiner og persienner. Samtidig bør alle lamper i rommet fungere, slik at fotografen kan justere lyssettingen etter behov. Rommene bør også fremstå romslige, så vurder å fjerne noen møbler for å skape luft og bevegelsesfrihet.",
//       "Hvis du ønsker å løfte presentasjonen av boligen til et enda høyere nivå, kan det være lurt å vurdere profesjonell boligstyling.",
//       "Aktører som &quot;Pene Rom&quot; har lang erfaring med å fremheve eiendommers fulle potensial gjennom nøye planlagt styling. En profesjonell stylist kan hjelpe deg med å balansere estetikk og funksjonalitet for å skape et hjem som vekker interesse hos kjøpere.God forberedelse før fotograferingen gir ikke bare bedre bilder, men øker også sjansen for at boligen skiller seg ut i markedet. Med noen enkle grep – eller profesjonell hjelp fra eksperter som &quot;Pene Rom&quot; – kan du legge til rette for en raskere og mer vellykket salgsprosess.",
//     ],
//   },
//   {
//     img: "/assets/boligstoff3.webp",
//     title: "Slik forbereder du deg før takstmannens besøk",
//     p: [
//       "Når en takstmann skal utarbeide en rapport om boligen din, er det viktig å forberede seg på riktig måte for å sikre at prosessen går smidig og effektivt. Takstmannens rapport fokuserer på å dokumentere boligens tekniske tilstand og egenskaper, og danner ofte grunnlaget for viktige beslutninger ved salg. Her er våre beste tips for å klargjøre boligen før besøket.",
//       "Takstmannen trenger fri tilgang til ulike deler av boligen, inkludert boder, sikringsskap, og tekniske rom. Sørg for at disse områdene er ryddige og lett tilgjengelige. Dette gjør det enklere for takstmannen å utføre nødvendige inspeksjoner og gir et mer komplett bilde av boligens tilstand.",
//       "Har du plantegninger, tidligere salgsoppgaver, eller annen dokumentasjon knyttet til eiendommen? Legg dette frem før besøket. Slike dokumenter kan gi takstmannen en verdifull oversikt og bidra til at rapporten blir så nøyaktig som mulig.",
//       "Fuktmåling er ofte en del av rapporten. For å sikre korrekte resultater, anbefales det at du ikke bruker våtrom som dusj eller badekar i timene før takstmannen kommer. Fuktige overflater kan gi feilaktige målinger og dermed påvirke vurderingen av rommets tilstand.",
//       "En ryddig bolig gir ikke bare et godt inntrykk, men også bedre arbeidsforhold for takstmannen. Sørg for at større møbler eller gjenstander som kan hindre tilgang til loft, kjeller, eller andre viktige områder er flyttet på forhånd. Har du en garasje eller utendørsområder, er det lurt å gjøre disse presentable også.",
//       "Dersom boligen har spesielle egenskaper, som nylige oppgraderinger, tekniske installasjoner, eller unike løsninger, bør dette informeres om. Slike detaljer kan være viktige for å gi et fullstendig bilde av boligens tilstand.",
//       "Takstmannens rapport er et viktig dokument som gir en objektiv og detaljert beskrivelse av boligen din, for å forstå boligens tekniske tilstand. Forberedelsene dine bidrar til at rapporten blir så nøyaktig og grundig som mulig.",
//       "Ved å være godt forberedt sørger du for en problemfri prosess – og et enda bedre resultat!",
//     ],
//   },
//   {
//     img: "/assets/boligstoff4.webp",
//     title: "Alt du må vite før du byr på drømmeboligen",
//     p: [
//       "Før du legger inn bud på en eiendom, er det avgjørende å gjøre grundige undersøkelser for å oppfylle din undersøkelsesplikt. Dette innebærer å gjennomgå all tilgjengelig dokumentasjon nøye, inkludert salgsoppgaven, som gir en oversikt over eiendommens størrelse, alder, standard og beliggenhet. Det er også viktig å sette seg inn i eventuelle reguleringsplaner for området, da disse kan påvirke både eiendommens verdi og bruksmuligheter. ",
//       "Du bør videre undersøke heftelser og servitutter som kan følge eiendommen, for eksempel veirettigheter eller bruksbegrensninger. Besøk området for å få en følelse av nabolaget og sjekk praktiske faktorer som nærhet til skoler, transport og butikker. En kritisk del av undersøkelsene er gjennomgang av tilstandsrapporten. Denne rapporten gir en detaljert vurdering av eiendommens tekniske tilstand og avdekker potensielle problemer. Når du leser rapporten, bør du være spesielt oppmerksom på områder som bad, kjøkken, tak og drenering, siden feil her kan være kostbare å utbedre. Se etter indikasjoner på fuktproblemer eller skader i våtrom, da dette kan føre til store utgifter. Vurder også elektrisk anlegg og ventilasjon, som kan ha betydning både for sikkerhet og komfort. Tilstandsrapporten bruker gjerne en gradert skala som gir deg en indikasjon på hvilke elementer som har behov for snarlig utbedring eller oppgradering.",
//       "Det er også viktig å undersøke de totale kostnadene knyttet til eiendommen, som kommunale avgifter, felleskostnader og vedlikehold. Sørg for at du har finansiering på plass, og få en klar bekreftelse fra banken før du legger inn bud. Hvis du er usikker på tekniske forhold, kan det være nyttig å ha med en fagperson på visning for å vurdere eiendommen.",
//       "Til sammen gir disse tiltakene deg en helhetlig forståelse av eiendommen og dens potensielle utfordringer, slik at du kan ta en informert beslutning før du legger inn bud.",
//     ],
//   },
//   {
//     img: "/assets/boligstoff1.webp",
//   },
// ];

const fonts = {
  title:
    " mb-5 lg:text-[36px] md:text-[30px] text-[27px] font-normal text-[#111] ",
  head: " mb-7 md:text-[22px] text-[19px] font-semibold text-[#111] ",
  pFont: " md:text-[18px] text-[15px] font-normal text-[#313131] ",
  readMore: " md:text-[19px] text-[17px] font-normal text-[#313131] ",
};
export default function Boligs() {
  const { boligstoffList, FetchBoligstoffList } = GetBoligstoffList();

  useEffect(() => {
    FetchBoligstoffList();
  }, [FetchBoligstoffList]);

  const content = [...(boligstoffList ?? [])]
    .sort((a: any, b: any) => a.order - b.order)
    .map((item: any) => ({
      img: item.images?.[0] ? `${BASE_URL}${item.images[0]}` : "",
      title: item.title ?? "",
      p: item.paragraph ?? [],
    }));
  const [active, setActive] = useState<number>(0);
  const [slider, setSlider] = useState<boolean>(false);
  const swiperRef: any = useRef(null);
  return (
    <div className="bg-[#e2cf9e] py-10">
      <div className="max-w-[1400px] mx-auto md:px-10 sm:px-5 px-3">
        <strong className={fonts.title + "text-center block"}>
          Boligstoff
        </strong>

        {content.map((item, ind) => (
          <BoligItem
            key={ind}
            item={item}
            ind={ind}
            onImageClick={(i) => {
              setActive(i);
              setSlider(true);
            }}
          />
        ))}

        {/* Full-Screen Image Slider */}
        <Dialog open={slider} onClose={() => setSlider(false)}>
          <div className="fixed inset-0 bg-[#e2cf9e] bg-opacity-90 z-100 flex justify-center items-center">
            <div className="max-w-[1400px] w-full relative mx-auto md:px-10 sm:px-5 px-3 flex justify-center items-center gap-3">
              <button
                onClick={() => setSlider(false)}
                className="absolute top-0 right-3 text-white text-2xl cursor-pointer"
              >
                <CloseIcon
                  fontSize="medium"
                  className="text-black bg-white p-1 rounded-full cursor-pointer"
                />
              </button>
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="cursor-pointer rounded-full bg-white text-black md:p-2 p-1 tab:p-4 shadow-lg"
              >
                <FaChevronLeft size={15} />
              </button>
              <Swiper
                loop={true}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                modules={[Pagination, Navigation]}
                slidesPerView={1}
                spaceBetween={0}
                pagination={{ clickable: true }}
                initialSlide={active}
                className="w-full"
              >
                {content.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className="max-h-[95vh] mb-7 overflow-auto [&::-webkit-scrollbar]:hidden">
                      <ImageComponent
                        width={500}
                        height={500}
                        src={item.img}
                        alt={`slide-${index}`}
                        className="w-full lg:max-w-3/4 mx-auto object-contain rounded-xl my-5"
                      />
                      {item.title && (
                        <b className={fonts.head + "block"}>{item.title}</b>
                      )}
                      {item.p?.length > 0 && (
                        <ul>
                          {item.p.map((pItm: any, i: any) => (
                            <li key={i} className={fonts.pFont + "mb-5"}>
                              {pItm}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="cursor-pointer rounded-full bg-white text-black md:p-2 p-1 shadow-lg"
              >
                <FaChevronRight size={15} />
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>

    // <div className="bg-[#e2cf9e] py-10">
    //   <div className="max-w-[1400px] mx-auto md:px-10 sm:px-5 px-3">
    //     <strong className={fonts?.title + "text-center block"}>
    //       Boligstoff
    //     </strong>
    //     {content?.length > 0 &&
    //       content?.map((item: any, ind: number) => {
    //         const [readMore, setReadMore] = useState<boolean>(true);
    //         const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    //         const listRef = useRef<HTMLUListElement>(null);
    //         // handle read more button:
    //         useEffect(() => {
    //           if (listRef.current) {
    //             const { scrollHeight, clientHeight } = listRef.current;
    //             setIsOverflowing(scrollHeight > clientHeight);
    //           }
    //         }, [item?.p]);
    //         return (
    //           <div key={ind}>
    //             <div
    //               className="md:rounded-4xl rounded-2xl my-5  overflow-hidden active:opacity-75 cursor-pointer"
    //               onClick={() => {
    //                 setActive(ind);
    //                 setSlider(true);
    //               }}
    //             >
    //               {item?.img && item?.img != "" && (
    //                 <ImageComponent
    //                   width={500}
    //                   height={500}
    //                   alt="image"
    //                   src={item?.img}
    //                   className="hover:scale-105 w-full object-cover "
    //                 />
    //               )}
    //             </div>
    //             {item?.title && (
    //               <b className={fonts?.head + "block "}>{item?.title}</b>
    //             )}
    //             {item?.p?.length > 0 && (
    //               <ul
    //                 ref={listRef}
    //                 className={
    //                   (readMore ? "line-clamp-4" : "") +
    //                   " relative overflow-hidden mb-10"
    //                 }
    //               >
    //                 {item?.p?.map((pItm: any, i: number) => (
    //                   <li
    //                     key={i}
    //                     className={
    //                       fonts?.pFont +
    //                       (!readMore && item?.p?.length - 1 != i
    //                         ? " mb-5 "
    //                         : " mb-2")
    //                     }
    //                   >
    //                     {pItm}
    //                   </li>
    //                 ))}
    //                 {isOverflowing && (
    //                   <span
    //                     onClick={() => setReadMore(!readMore)}
    //                     className={
    //                       fonts?.readMore +
    //                       (!readMore
    //                         ? " static "
    //                         : " absolute right-0 bottom-0 ") +
    //                       " text-black font-semibold z-70 bg-[#e2cf9e] outline-none text-left cursor-pointer"
    //                     }
    //                   >
    //                     {readMore ? "... Les mer" : "Les mindre"}
    //                   </span>
    //                 )}
    //               </ul>
    //             )}
    //           </div>
    //         );
    //       })}
    //     {/* Full-Screen Image Slider */}
    //     <Dialog open={slider} onClose={() => setSlider(false)}>
    //       <div className="fixed inset-0 bg-[#e2cf9e] bg-opacity-90 z-100 flex justify-center items-center">
    //         <div className="max-w-[1400px] w-full relative mx-auto md:px-10 sm:px-5 px-3 flex justify-center items-center gap-3">
    //           <button
    //             onClick={() => setSlider(false)}
    //             className="absolute top-0 right-3 text-white text-2xl cursor-pointer"
    //           >
    //             <CloseIcon
    //               fontSize="medium"
    //               className="text-[#000] bg-[#fff] p-1 rounded-full cursor-pointer"
    //             />
    //           </button>
    //           <button
    //             onClick={() => swiperRef.current?.slidePrev()}
    //             className="cursor-pointer rounded-full bg-[#fff] text-black md:p-2 p-1 tab:p-4 shadow-lg"
    //           >
    //             <FaChevronLeft size={15} />
    //           </button>
    //           <Swiper
    //             loop={true}
    //             onSwiper={(swiper: any) => (swiperRef.current = swiper)}
    //             modules={[Pagination, Navigation]}
    //             slidesPerView={1}
    //             spaceBetween={0}
    //             pagination={{ clickable: true }}
    //             initialSlide={active}
    //             className="w-full"
    //           >
    //             {Array.isArray(content) &&
    //               content.map((item: any, index: number) => (
    //                 <SwiperSlide key={index}>
    //                   <div className="max-h-[95vh] mb-7 overflow-auto [&::-webkit-scrollbar]:hidden">
    //                     <ImageComponent
    //                       width={500}
    //                       height={500}
    //                       src={item?.img}
    //                       alt={`slide-${index}`}
    //                       className="w-full lg:max-w-3/4 mx-auto object-contain rounded-xl my-5"
    //                     />
    //                     {item?.title && (
    //                       <b className={fonts?.head + "block "}>
    //                         {item?.title}
    //                       </b>
    //                     )}
    //                     {item?.p?.length > 0 && (
    //                       <ul>
    //                         {item?.p?.map((pItm: any, i: number) => (
    //                           <li key={i} className={fonts?.pFont + "mb-5"}>
    //                             {pItm}
    //                           </li>
    //                         ))}
    //                       </ul>
    //                     )}
    //                   </div>
    //                 </SwiperSlide>
    //               ))}
    //           </Swiper>
    //           <button
    //             onClick={() => swiperRef.current?.slideNext()}
    //             className="cursor-pointer rounded-full bg-[#fff] text-black md:p-2 p-1 shadow-lg"
    //           >
    //             <FaChevronRight size={15} />
    //           </button>
    //         </div>
    //       </div>
    //     </Dialog>
    //   </div>
    // </div>
  );
}
