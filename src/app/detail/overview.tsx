"use client";
import CallMadeIcon from "@mui/icons-material/CallMade";
import ImageComponent from "../components/image";
import { useEffect, useState } from "react";
import { Checkbox, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import ErrorIcon from "@mui/icons-material/Error";
import GetPropertyDetail from "../api/get/propertyDetail";
import GetBriefDetail from "../api/get/accordionDescr";
import PlaceIcon from "@mui/icons-material/Place";
import GetprofileDetail from "../api/get/profileDetail";
import GetprofileDetail2 from "../api/get/profileDetail2";
// import GetansvarligansvarligProfileDetail from "../api/get/ansvarligProfileDetail";
import { useSearchParams } from "next/navigation";
import { getGoogleMapsUrl } from "../helper/utils";
import Link from "next/link";
import GetDocumentLink from "../api/get/documentLink";
import { isHydrated } from "./hydration";
import {
  BrokerPortraitSkeleton,
  OverviewSkeleton,
  VisitingSkeleton,
} from "./skeletons";

export default function Overview() {
  const searchParams: any = useSearchParams();
  const { DocumentLink, DocumentLinkLoad } = GetDocumentLink()
  const propertyId: any = searchParams.get("id");
  // Narrow selectors so unrelated store writes don't re-render this large tree.
  const propertyDetail: any = GetPropertyDetail((s: any) => s.propertyDetail);
  const propertyVisiting: any = GetPropertyDetail(
    (s: any) => s.propertyVisiting,
  );
  const propertyVisitingLoad: any = GetPropertyDetail(
    (s: any) => s.propertyVisitingLoad,
  );
  const propertyDetailLoad: any = GetPropertyDetail(
    (s: any) => s.propertyDetailLoad,
  );
  const propertyDetailReady: any = GetPropertyDetail(
    (s: any) => s.propertyDetailReady,
  );
  const propertyVisitingReady: any = GetPropertyDetail(
    (s: any) => s.propertyVisitingReady,
  );
  const describitonList: any = GetBriefDetail((s: any) => s.describitonList);
  const describitonListLoad: any = GetBriefDetail(
    (s: any) => s.describitonListLoad,
  );
  const [contactOpen, setContactOpen] = useState(false);

  const handleContactOpen = (path = "interesse") => {
    //  setContactOpen(true);
    window.open(
      `https://interessent.webmegler.no/interessent/${path}?tenantId=381&oppdragsId=${propertyId}`,
      "_blank",
    );
  };

  const { FetchProfileDetail, profileDetail, load } = GetprofileDetail();
  const { FetchProfileDetail2, profileDetail2, load2 } = GetprofileDetail2();
  // const { FetchansvarligProfileDetail, ansvarligProfileDetail, loader } = GetansvarligansvarligProfileDetail();
  const handleClose = () => {
    setContactOpen(false);
  };
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const submit = () => {};

  useEffect(() => {
    const employeeId = propertyDetail?.megler1?.id;
    // Resolved on the server already (serverData.ts) - skip the refetch.
    if (!employeeId || isHydrated(`employee:${employeeId}`)) return;
    FetchProfileDetail({ tenantId: "381", employeeId });
  }, [propertyDetail?.megler1?.id]);

  useEffect(() => {
    const employeeId = propertyDetail?.megler2?.id;
    if (!employeeId || isHydrated(`employee:${employeeId}`)) return;
    FetchProfileDetail2({ tenantId: "381", employeeId });
  }, [propertyDetail?.megler2?.id]);

  // useEffect(() => {
  //   if (propertyDetail?.ansvarligMegler?.id) {
  //     const employeeId = propertyDetail?.ansvarligMegler?.id
  //     debugger
  //     FetchansvarligProfileDetail({ tenantId: "381", employeeId });
  //   }

  // }, [propertyDetail]);

  const getWeek = (dates = "") => {
    const date = new Date(dates);
    const weekday = date.toLocaleString("no-NO", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleString("no-NO", { month: "long" });

    // Capitalize weekday first letter
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    // Combine to desired format
    const formatted = `${capitalizedWeekday}, ${day}. ${capitalizedMonth}`;
    return formatted;
  };

  const getTime = (dates = "") => {
    const date = new Date(dates);
    const time = date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });
    return time;
  };

  const checkPast = (dates = "") => {
    const date = new Date(dates);
    const now = new Date();
    const isPast = date.getTime() < now.getTime();
    return isPast;
  };

  const emptyTags = (html = "") => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const noBR = [...doc.body.querySelectorAll("*")].filter(
      (el) => el.tagName.toLowerCase() !== "br",
    );
    // Find empty tags
    const emptyTags = noBR.filter((el) => {
      return el.children.length == 0;
    });
    // console.log(emptyTags, 'doc')
    return emptyTags.length > 0;
  };

  // console.log("profileDetail", propertyDetail);
  // console.log("propertyVisiting", propertyVisiting);
  return (
    <>
      {propertyDetailLoad || !propertyDetailReady ? (
        <OverviewSkeleton />
      ) : (
        propertyDetail &&
        Object.keys(propertyDetail).length > 0 && (
          <>
            <div className="max-w-[1300px] px-2.5 mx-auto mt-[50px] flex items-start flex-col gap-5 w-full">
              <p className="text-[25px] text-[#333] font-medium">
                {propertyDetail?.eiendom?.kommune}
              </p>
              <p className="text-[18px] text-[#caa950] font-semibold mb-0.5">
                {propertyDetail?.eiendom?.område}
              </p>

              {propertyDetail?.eiendom?.adresse &&
                propertyDetail?.eiendom?.adresse != "" && (
                  <a
                    href={getGoogleMapsUrl(propertyDetail.eiendom)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[16px] text-[#757575] mb-2.5 font-normal hover:underline cursor-pointer"
                  >
                    <span className="ml-1">
                      <PlaceIcon
                        fontSize="medium"
                        className="text-[#caa950]"
                        style={{ marginLeft: "-7px" }}
                      />
                      {propertyDetail.eiendom.adresse}
                    </span>
                  </a>
                )}
            </div>
            <section className="border-t border-[#a9a39b] mx-auto mt-5">
              <div className="max-w-[1300px] px-2.5 mx-auto mt-0 flex flex-col lg:flex-row gap-5 w-full">
                <div className="border-r border-[#a9a39b] pt-5 pb-10 lg:w-[850px]">
                  <div className="w-full p-0 pr-2.5 rounded-[10px]">
                    {/* <p className="text-[22px] mb-[15px] text-[#333] font-medium leading-[27px]">
                    {propertyDetail?.overskrift}
                  </p> */}
                    {/* {console.log(describitonList[0]?.subGroup.find(
                          (item: any) => item.overskrift == "Beskrivelse"
                        )?.html,'describitonList[0]?.subGroup')} */}
                    {describitonList &&
                      describitonList.length > 0 &&
                      !describitonListLoad &&
                      Array.isArray(describitonList) &&
                      describitonList[0]?.subGroup.some(
                        (item: any) =>
                          item.overskrift == "Beskrivelse" &&
                          emptyTags(item?.html),
                      ) && (
                        <>
                          <p className="text-[22px] font-semibold my-[25px] text-[#333]">
                            Kort om eiendommen
                          </p>
                          {describitonList[0]?.subGroup.find(
                            (item: any) => item.overskrift == "Beskrivelse",
                          )?.html && (
                            <div className="text-[15px] text-[#000000de] font-medium">
                              {/* <p className="text-[25px] mb-5">Kort om eiendommen </p> */}
                              <span
                                className="text-[18px]"
                                dangerouslySetInnerHTML={{
                                  __html: describitonList[0]?.subGroup.find(
                                    (item: any) =>
                                      item.overskrift === "Beskrivelse",
                                  ).html,
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}

                    <p className="text-[22px] font-semibold my-[25px] text-[#333]">
                      Nøkkelopplysninger
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 mx-auto gap-10">
                      <p className="text-[15px] text-[#333] font-medium">
                        Prisantydning: <br></br>
                        {propertyDetail?.prisantydning && (
                          <span className="text-[#06456d] text-[20px]">
                            kr{" "}
                            {propertyDetail?.prisantydning
                              ?.toLocaleString("no-NO")
                              .replace(/,/g, " ")}
                            {propertyDetail?.prisantydningTil &&
                            propertyDetail?.prisantydningTil > 0
                              ? " - " + propertyDetail?.prisantydningTil
                              ?.toLocaleString("no-NO")
                              .replace(/,/g, " ")
                              : ""}
                            ,-
                          </span>
                        )}
                      </p>
                      {propertyDetail?.okonomi?.fellesutgifter?.utgifter !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Felleskostnader: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            kr{" "}
                            {propertyDetail?.okonomi?.fellesutgifter?.utgifter
                              .toLocaleString("no-NO")
                              .replace(/\u00A0/g, " ")}
                            {propertyDetail?.okonomi?.fellesutgifter?.utgifterTil &&
                            propertyDetail?.okonomi?.fellesutgifter?.utgifterTil > 0
                              ? " - " + propertyDetail?.okonomi?.fellesutgifter?.utgifterTil
                              ?.toLocaleString("no-NO")
                              .replace(/,/g, " ")
                              : ""}
                            ,- /Mnd
                          </span>
                        </p>
                      )}

                      {/* {propertyDetail?.okonomi?.omsetningsdetaljer?.salgssum != 0 && (
                      <p className="text-[15px] text-[#333] font-medium">
                        Salgssum:{" "}<br></br>
                        <span className="text-[red] text-[19px]">
                          {`kr ${propertyDetail.okonomi?.omsetningsdetaljer?.salgssum
                            .toLocaleString("no-NO")
                            .replace(/\u00A0/g, " ")},-`}
                        </span>
                      </p>
                    )} */}

                      {propertyDetail?.okonomi?.salgssum ? (
                        <p className="text-[15px] text-[#333] font-medium">
                          Salgssum: <br></br>
                          <span className="text-[red] text-[19px]">
                            {propertyDetail?.okonomi?.salgssum}
                            {`kr ${propertyDetail.okonomi?.salgssum
                              .toLocaleString("no-NO")
                              .replace(/\u00A0/g, " ")},-`}
                          </span>
                        </p>
                      ) : null}

                      {propertyDetail?.okonomi?.andelFellesgjeld?.saldo !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Andel gjeld: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            kr{" "}
                            {propertyDetail?.okonomi?.andelFellesgjeld?.saldo
                              ?.toLocaleString("no-NO")
                              .replace(/,/g, " ")}
                            {propertyDetail?.okonomi?.andelFellesgjeld?.saldoTil &&
                            propertyDetail?.okonomi?.andelFellesgjeld?.saldoTil > 0
                              ? " - " + propertyDetail?.okonomi?.andelFellesgjeld?.saldoTil
                              ?.toLocaleString("no-NO")
                              .replace(/,/g, " ")
                              : ""}
                            ,-
                          </span>
                        </p>
                      )}

                      {propertyDetail?.okonomi?.andelFellesformue != 0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Andel formune: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {`kr ${propertyDetail?.okonomi?.andelFellesformue
                              ?.toLocaleString("no-NO")
                              .replace(/\u00A0/g, " ")},-`}
                          </span>
                        </p>
                      )}

                      {propertyDetail?.takst != null &&
                      propertyDetail?.takst?.ligningsverdi != 0 ? (
                        <p className="text-[15px] text-[#333] font-medium">
                          Formuesverdi: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {`kr ${propertyDetail.takst?.ligningsverdi
                              ?.toLocaleString("no-NO")
                              .replace(/\u00A0/g, " ")},-`}
                          </span>
                        </p>
                      ) : null}

                      {/* <p className="text-[15px] text-[#333] font-medium">{`${propertyDetail?.eiendom?.arealer?.interntbruksareal != 0 ? 'Generelt BRA:' : 'Primærrom:'}`} <span className="text-[#06456d] text-[20px]">{propertyDetail?.eiendom?.arealer?.interntbruksareal != 0 ? propertyDetail?.eiendom?.arealer?.interntbruksareal : propertyDetail?.eiendom?.arealer?.primærrom}m²</span></p> */}
                      {propertyDetail?.takst != null &&
                      propertyDetail?.takst?.ligningsverdi2 != 0 ? (
                        <p className="text-[15px] text-[#333] font-medium">
                          Formuesverdi (sekundaerbolig): <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {`kr ${propertyDetail.takst?.ligningsverdi2
                              .toLocaleString("no-NO")
                              .replace(/\u00A0/g, " ")},-`}
                          </span>
                        </p>
                      ) : null}

                      {propertyDetail?.eiendom?.romfordeling?.antallSoverom !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Soverom: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {" "}
                            {propertyDetail?.eiendom?.romfordeling?.antallSoverom}
                            {propertyDetail?.eiendom?.romfordeling?.antallSoveromTil &&
                            propertyDetail?.eiendom?.romfordeling?.antallSoveromTil > 0
                              ? " - " + propertyDetail?.eiendom?.romfordeling?.antallSoveromTil
                              : ""}
                          </span>
                        </p>
                      )}

                      <p className="text-[15px] text-[#333] font-medium">
                        Eiendomstype: <br></br>
                        <span className="text-[#06456d] text-[20px]">
                          {" "}
                          {
                            propertyDetail?.markedsføring?.finnInnstillinger
                              ?.eiendomstype
                          }
                        </span>
                      </p>

                      <p className="text-[15px] text-[#333] font-medium">
                        Eierform: <br></br>
                        <span className="text-[#06456d] text-[20px]">
                          {propertyDetail?.eierformBygning?.navn}
                        </span>
                      </p>

                      {propertyDetail?.eiendom?.arealer?.tomteareal != 0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Tomt: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {/* {
                              propertyDetail?.markedsføring?.finnInnstillinger
                                ?.eierformTomt
                            } */}
                            {propertyDetail?.eiendom?.arealer?.tomteareal} m²
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.etasje > 0 ||
                      propertyDetail?.eiendom?.bolignummer !== "" ? (
                        <p className="text-[15px] text-[#333] font-medium">
                          Leilighet: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.etasje > 0
                              ? `${propertyDetail?.eiendom?.etasje}. etasje `
                              : ""}
                            {propertyDetail?.eiendom?.etasje > 0 &&
                            propertyDetail.eiendom.bolignummer !== ""
                              ? "/ "
                              : ""}
                            {propertyDetail?.eiendom?.bolignummer &&
                              propertyDetail?.eiendom?.bolignummer !== "" && (
                                <>
                                  {" "}
                                  Bruksenhetsnr. <br></br>
                                  {propertyDetail?.eiendom?.bolignummer}
                                </>
                              )}
                          </span>
                        </p>
                      ) : (
                        <></>
                      )}

                      {propertyDetail?.eiendom?.byggeår != 0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Byggeår: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.byggeår}
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.arealer?.primærrom != 0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Primærrom: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.arealer?.primærrom.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            {propertyDetail?.eiendom?.arealer?.primærromTil &&
                            propertyDetail?.eiendom?.arealer?.primærromTil > 0
                              ? "- " + propertyDetail?.eiendom?.arealer?.primærromTil
                              ?.toLocaleString("no-NO",{
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },) + " "
                              : ""}
                             m²
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.arealer?.bruksareal != 0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Bruksareal: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.arealer?.bruksareal.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            {propertyDetail?.eiendom?.arealer?.bruksarealTil &&
                            propertyDetail?.eiendom?.arealer?.bruksarealTil > 0
                              ? "- " + propertyDetail?.eiendom?.arealer?.bruksarealTil
                              ?.toLocaleString("no-NO",{
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },) + " "
                              : ""}
                             m²
                          </span>
                        </p>
                      )}

                      {propertyDetail?.okonomi?.kommunaleAvgifter?.avgifter !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Kommunale avgifter: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.okonomi?.kommunaleAvgifter?.avgifter?.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            {/* m² */}
                          </span>
                        </p>
                      )}

                      {propertyDetail?.okonomi?.kommunaleAvgifter?.periode !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          Periode: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.okonomi?.kommunaleAvgifter?.periode?.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.arealer?.interntbruksareal !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          BRA-i: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.arealer?.interntbruksareal?.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            m²
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.arealer?.eksterntbruksareal !=
                        0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          BRA-e: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.arealer?.eksterntbruksareal?.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            m²
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.arealer?.aapentareal != 0 && (
                        <p className="text-[15px] text-[#333] font-medium">
                          TBA: <br></br>
                          <span className="text-[#06456d] text-[20px]">
                            {propertyDetail?.eiendom?.arealer?.aapentareal.toLocaleString(
                              "no-NO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            m²
                          </span>
                        </p>
                      )}

                      {propertyDetail?.eiendom?.energimerking !==
                        "IkkeSatt" && (
                        <div className="flex flex-row flex-wrap gap-1 sm:gap-2 text-[17px] text-[#333] font-medium items-center">
                          <p className="text-[15px] text-[#333] font-medium flex items-center gap-2">
                            Energimerke:
                          </p>
                          <span className="text-[#06456d] text-[20px] flex items-center gap-2">
                            {/* {propertyDetail?.eiendom?.energimerking} */}
                            {propertyDetail?.eiendom?.energimerking && (
                              <svg
                                width="32"
                                height="32"
                                viewBox="0 0 32 32"
                                className="ml-0"
                                style={{ display: "inline" }}
                              >
                                <polygon
                                  points="16,4 29,12 24,28 8,28 3,12"
                                  fill={
                                    propertyDetail.eiendom.energimerking.includes(
                                      "Rød",
                                    )
                                      ? "#C32632"
                                      : propertyDetail.eiendom.energimerking.includes(
                                            "Oransje",
                                          )
                                        ? "#F47821"
                                        : propertyDetail.eiendom.energimerking.includes(
                                              "Grønn",
                                            )
                                          ? "#279248"
                                          : propertyDetail.eiendom.energimerking.includes(
                                                "IkkeSatt",
                                              )
                                            ? "#4caf50"
                                            : "#caa950"
                                  }
                                />
                                <text
                                  x="16"
                                  y="18"
                                  textAnchor="middle"
                                  fontSize="16"
                                  fill="#fff"
                                  fontWeight="bold"
                                  dominantBaseline="middle"
                                >
                                  {propertyDetail.eiendom.energimerking.slice(
                                    -1,
                                  )}
                                </text>
                              </svg>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3.5 mt-10 flex-wrap items-center">
                      <button
                        className="px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white font-semibold py-3"
                        onClick={() =>
                          window.open(
                            `${propertyDetail?.markedsføring?.elektroniskBudgivningUrl}`,
                            "_blank",
                          )
                        }
                      >
                        Gi bud
                        <CallMadeIcon
                          fontSize="inherit"
                          className="text-white"
                        />
                      </button>
                      <button
                        onClick={() => {
                          handleContactOpen("salgsoppgave");
                        }}
                        className="px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white font-semibold py-3"
                      >
                        Budvarsel
                      </button>
                      <button
                        className="px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white font-semibold py-3"
                        onClick={() => handleContactOpen("salgsoppgave")}
                      >
                        Bestill salgsoppgave
                        <CallMadeIcon
                          fontSize="inherit"
                          className="text-white"
                        />
                      </button>
                      <button
                        onClick={() => handleContactOpen("visningspaamelding")}
                        className="px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white font-semibold py-3"
                      >
                        Registrer deg for visning
                        <CallMadeIcon
                          fontSize="inherit"
                          className="text-white"
                        />
                      </button>
                      {DocumentLink?.map((item: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => window.open(item?.url, "_blank")}
                          className="px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white font-semibold py-3"
                        >
                          {item?.navn}
                          <CallMadeIcon
                            fontSize="inherit"
                            className="text-white"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-10 pb-10">
                  <div className="w-full sm:w-[408px] mx-auto p-5 py-0 rounded-[10px]">
                    {propertyDetail?.megler1 && (
                      <div className="mb-5">
                        {load ? (
                          <BrokerPortraitSkeleton />
                        ) : typeof profileDetail === "string" &&
                          profileDetail ? (
                          <ImageComponent
                            src={profileDetail ? profileDetail : ""}
                            alt="logo"
                            className="w-[150px] h-[150px] mb-5"
                            width={150}
                            height={150}
                          />
                        ) : null}

                        <p className="text-[15px] text-[#333] font-medium">
                          <span className="text-[#06456d] text-[20px] pl-0">
                            {propertyDetail?.megler1?.navn}
                          </span>
                        </p>

                        <p className="text-[15px] text-[#333] font-medium">
                          <span className="text-[#06456d] text-[20px] pl-0">
                            {propertyDetail?.megler1?.email}
                          </span>
                        </p>

                        <p className="text-[15px] text-[#333] font-medium">
                          <span className="text-[#06456d] text-[20px] pl-0">
                            {propertyDetail?.megler1?.mobiltelefon}
                          </span>
                        </p>
                        {propertyDetail?.megler1?.id && (
                          <Link
                            href={`/kontakt-megler?id=${propertyDetail?.megler1?.id}`}
                            className="w-[200px] block px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white text-center font-semibold py-3 mr-2 mt-6"
                          >
                            Kontakt megler
                          </Link>
                        )}
                      </div>
                    )}
                    {propertyDetail?.megler2 && (
                      <div className="mb-5">
                        {load2 ? (
                          <BrokerPortraitSkeleton />
                        ) : typeof profileDetail2 === "string" &&
                          profileDetail2 ? (
                          <ImageComponent
                            src={profileDetail2 ? profileDetail2 : ""}
                            alt="logo"
                            className="w-[150px] h-[150px] mb-5"
                            width={150}
                            height={150}
                          />
                        ) : null}
                        <p className="text-[15px] text-[#333] font-medium">
                          <span className="text-[#06456d] text-[20px] pl-0">
                            {propertyDetail?.megler2?.navn}
                          </span>
                        </p>

                        <p className="text-[15px] text-[#333] font-medium">
                          <span className="text-[#06456d] text-[20px] pl-0">
                            {propertyDetail?.megler2?.email}
                          </span>
                        </p>

                        <p className="text-[15px] text-[#333] font-medium">
                          <span className="text-[#06456d] text-[20px] pl-0">
                            {propertyDetail?.megler2?.mobiltelefon}
                          </span>
                        </p>
                        {propertyDetail?.megler2?.id && (
                          <Link
                            href={`/kontakt-megler?id=${propertyDetail?.megler2?.id}`}
                            className="w-[200px] block px-[15px] rounded-[20px] cursor-pointer bg-[#18344e] text-[18px] text-white text-center font-semibold py-3 mr-2 mt-6"
                          >
                            Kontakt megler
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  {(propertyVisitingLoad || !propertyVisitingReady) &&
                    propertyDetail?.oppdragstatus != "05.Solgt" && (
                      <VisitingSkeleton />
                    )}
                  {!propertyVisitingLoad &&
                    propertyVisitingReady &&
                    propertyDetail?.oppdragstatus != "05.Solgt" &&
                    propertyVisiting &&
                    propertyVisiting.length > 0 &&
                    propertyVisiting?.some(
                      (item: any) =>
                        !checkPast(item?.fra) &&
                        (item?.kontaktReferanse == null ||
                          item?.kontaktReferanse?.type != "Privat"),
                    ) && (
                      <>
                        <strong className="text-[30px] font-normal text-[#18344e]">
                          Kommende visninger
                        </strong>
                        <div className="flex flex-col gap-4">
                          {propertyVisiting?.map(
                            (item: any, ind: number) =>
                              !checkPast(item?.fra) &&
                              (item?.kontaktReferanse == null ||
                                item?.kontaktReferanse?.type != "Privat") && ( //item?.privat && (
                                <div key={ind} className="">
                                  <div className="px-3 my-1">
                                    <p className="text-2xl text-[#333] font-normal mb-2">
                                      {getWeek(item?.fra)}
                                    </p>
                                    <p className="text-2xl text-[#333] font-normal mb-2">
                                      {getTime(item?.fra)} -{" "}
                                      {getTime(item?.til)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button
                                      onClick={() =>
                                        handleContactOpen("visningspaamelding")
                                      }
                                      className="cursor-pointer max-w-[230px] p-3 text-center w-full inline-block rounded-[20px] bg-[#18344e] text-white font-semibold text-[18px]"
                                    >
                                      Meld deg på visning
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleContactOpen("salgsoppgave")
                                      }
                                      className="cursor-pointer max-w-[230px] p-3 text-center w-full inline-block rounded-[20px] border border-[#18344e] text-[#18344e] text-[18px] font-semibold hover:bg-[#18344e] hover:text-white duration-100"
                                    >
                                      Jeg ønsker budvarsel
                                    </button>
                                  </div>
                                </div>
                              ),
                          )}
                        </div>
                      </>
                    )}
                </div>
              </div>
            </section>
          </>
        )
      )}

      <Modal
        open={contactOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="w-full relative h-full overflow-y-auto bg-white">
          <div className="absolute top-4 right-4">
            <CloseIcon
              fontSize="large"
              className="text-[#767676] text-[24px] cursor-pointer"
              onClick={handleClose}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-white p-5 sm:p-[50px] h-full">
              <p className="text-[40px] font-medium text-[#333] pt-10 md:pt-0">
                Sign up for viewing
              </p>
              <p className="text-[20px] my-10 font-medium text-[#333] max-w-[500px]">
                Check the desired fields, fill out the form and register for
                viewing at Norefjell Alpingrend 28 .
              </p>
              <form onSubmit={handleSubmit(submit)}>
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col w-full">
                      <Controller
                        name="contact"
                        control={control}
                        rules={{ required: "Kindly enter your Timing" }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full text-black text-[18px] outline-none px-10 h-[50px] border-b border-[#e7e7e7]"
                          >
                            <option value="">Contact broker for time*</option>
                            <option value="Select viewing data">
                              Select viewing data*
                            </option>
                          </select>
                        )}
                      />
                      {errors.contact && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.contact?.message?.toString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <Controller
                        name="people"
                        control={control}
                        rules={{ required: "Kindly select peoples" }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full text-black outline-none text-[18px] px-10 h-[50px] border-b border-[#e7e7e7]"
                          >
                            <option value="">Select number of peoples*</option>
                            <option value="1">1 People</option>
                            <option value="2">2 People</option>
                            <option value="3">3 People</option>
                            <option value="4">4 People</option>
                            <option value="5">5 People</option>
                          </select>
                        )}
                      />
                      {errors.people && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.people?.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        First Name<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="firstname"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Firstname is required",
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Only alphabetic characters are allowed",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter firstname"
                            className="w-full placeholder-[#757575] shadow-sm px-10 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.firstname && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.firstname?.message?.toString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        Last Name<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="lastname"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "lastname is required",
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Only alphabetic characters are allowed",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter lastname"
                            className="w-full placeholder-[#757575] shadow-sm px-10 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.lastname && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.lastname?.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        Telephone<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="Telephone"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Only numbers are allowed",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter number"
                            className="w-full placeholder-[#757575] shadow-sm p-5 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.Telephone && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.Telephone?.message?.toString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        Email<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="email_id"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value:
                              /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email format",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Email ID*"
                            className="w-full placeholder-[#757575] shadow-sm px-10 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.email_id && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.email_id?.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[16px] font-semibold text-[#333]">
                    I would like to be contacted about:
                  </p>
                  <div className="flex flex-col mr-auto">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="SMS notification"
                      />
                      <span className="text-black font-medium">
                        SMS notification
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="Valuation or sale of my home"
                      />
                      <span className="text-black font-medium">
                        Valuation or sale of my home
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="Proof of financing or mortgage offer"
                      />
                      <span className="text-black font-medium">
                        Proof of financing or mortgage offer
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="Residential property from Nordvik"
                      />
                      <span className="text-black font-medium">
                        Residential property from Nordvik
                      </span>
                    </label>
                  </div>
                  <button className="w-full shadow-sm h-[50px] rounded-[10px] cursor-pointer bg-[#18344e] text-[18px] font-medium text-white">
                    Sign up
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-[#F3F5F6] p-5 sm:p-[50px] h-full">
              <p className="text-[40px] font-medium text-[#333]">
                Current Brokers
              </p>
              <p className="text-[20px] my-[30px] font-medium text-[#333] max-w-[500px]">
                Contact the broker to arrange a private viewing. We will arrange
                for a safe implementation.
              </p>
              <div className="flex flex-col gap-5">
                <div className="bg-white shadow-md rounded-[10px] p-5 flex items-center gap-5">
                  <ImageComponent
                    width={500}
                    height={500}
                    alt="broker-image"
                    src="/assets/broker1.jpeg"
                    className="object-cover rounded-full w-[120px] h-[120px] sm:w-[150px] md:w-[200px] sm:h-[150px] md:h-[200px]"
                  />
                  <div className="flex flex-col pl-2.5">
                    <p className="text-[20px] md:text-[30px] font-medium text-[#333]">
                      Henrik Bredo Larsen
                    </p>
                    <p className="text-[16px] md:text-[20px] font-medium text-[#757575]">
                      Property Agent & Broker
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer mt-[15px] font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      8652301479
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      broker@gmail.com
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow-md rounded-[10px] p-5 flex items-center gap-5">
                  <ImageComponent
                    width={500}
                    height={500}
                    alt="broker-image"
                    src="/assets/broker2.jpeg"
                    className="object-cover rounded-full w-[120px] h-[120px] sm:w-[150px] md:w-[200px] sm:h-[150px] md:h-[200px]"
                  />
                  <div className="flex flex-col pl-2.5">
                    <p className="text-[20px] md:text-[30px] font-medium text-[#333]">
                      Rashed Kabir
                    </p>
                    <p className="text-[16px] md:text-[20px] font-medium text-[#757575]">
                      Property Agent & Broker
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer mt-[15px] font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      8652301479
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      broker@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
