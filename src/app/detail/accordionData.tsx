"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import GetBriefDetail from "../api/get/accordionDescr";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadScript } from "@react-google-maps/api";
import LazyMount from "../components/lazyMount";
import {
  AccordionNavSkeleton,
  AccordionRowsSkeleton,
  DocumentsSkeleton,
  MapSkeleton,
} from "./skeletons";
import Googlemap from "./location";
import { FaMinus, FaPlus } from "react-icons/fa";
import GetProductDetail from "../api/get/accordionPdf";
import { API } from "../helper/apitoolspdf";
import GetDocumentLink from "../api/get/documentLink";
import { pdfToBase64Images } from "./pdfToImage";

export default function AccordionData() {
  const [expanded, setExpanded] = useState<number | false>(false);
  const [expandedDoc, setExpandedDoc] = useState<boolean>(false);
  const accordionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const navItemRefs = useRef<{ [key: number]: HTMLLIElement | null }>({});
  const navRef = useRef<HTMLElement | null>(null);
  const navListRef = useRef<HTMLUListElement | null>(null);
  // Index a nav click asked for, held until the layout stops moving.
  const pendingScrollRef = useRef<number | null>(null);
  // How many Accordion transitions are running right now (the one opening and
  // the one closing overlap).
  const runningTransitions = useRef<number>(0);
  // Cancels the in-flight "keep the target pinned" correction loop.
  const cancelSettle = useRef<() => void>(() => {});
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const describitonList: any = GetBriefDetail((s: any) => s.describitonList);
  const describitonListLoad: any = GetBriefDetail(
    (s: any) => s.describitonListLoad,
  );
  const titleList: any = GetProductDetail((s: any) => s.titleList);
  const titleListLoad: any = GetProductDetail((s: any) => s.titleListLoad);
  const titleListReady: any = GetProductDetail((s: any) => s.titleListReady);
  const describitonListReady: any = GetBriefDetail(
    (s: any) => s.describitonListReady,
  );

  // In flight, or not requested yet - either way there is nothing to show.
  const describitonPending = describitonListLoad || !describitonListReady;
  const router = useRouter();
  // const { DocumentLink, DocumentLinkLoad } = GetDocumentLink()
  const searchParams: any = useSearchParams();
  const propertyId: any = searchParams.get("id");


  /**
   * Height of everything pinned to the top of the viewport: the site navbar
   * (which the tab strip reserves via its own `top`) plus the tab strip. Read
   * from the DOM rather than hardcoded, so it stays right when the sticky nav
   * wraps to a different height on small screens.
   */
  const getStickyOffset = () => {
    const nav = navRef.current;
    if (!nav) return 170;
    const top = parseFloat(getComputedStyle(nav).top) || 0;
    return top + nav.offsetHeight;
  };

  /** Gap left between the sticky nav and the accordion header. */
  const SCROLL_GAP = 12;

  const maxScrollTop = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const scrollToAccordion = (index: number) => {
    const target = accordionRefs?.current[index];
    if (!target) return;

    cancelSettle.current();

    /** How far the header currently sits from where it should end up. */
    const drift = () =>
      target.getBoundingClientRect().top - (getStickyOffset() + SCROLL_GAP);

    const clamp = (top: number) => Math.max(0, Math.min(top, maxScrollTop()));

    window.scrollTo({ top: clamp(window.scrollY + drift()), behavior: "smooth" });

    /*
     * A single scrollTo is not enough for a long panel: images inside the
     * freshly expanded HTML decode after the fact and the lazy map mounts, so
     * the document keeps growing underneath us and the header drifts away from
     * the nav. Watch it for a moment and nudge it back — but only once the
     * browser's smooth scroll has come to rest, otherwise the correction and
     * the animation fight each other.
     */
    let raf = 0;
    let lastY = NaN;
    let restFrames = 0;
    const deadline = performance.now() + 2500;

    const tick = () => {
      const y = window.scrollY;
      restFrames = Math.abs(y - lastY) < 0.5 ? restFrames + 1 : 0;
      lastY = y;

      if (restFrames >= 3) {
        const next = clamp(y + drift());
        // `clamp` means a target near the end of the document simply cannot be
        // reached; comparing against the clamped value stops us retrying it.
        if (Math.abs(next - y) > 1) {
          window.scrollTo({ top: next, behavior: "auto" });
          restFrames = 0;
        }
      }

      if (performance.now() < deadline) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    cancelSettle.current = () => cancelAnimationFrame(raf);
  };

  /**
   * Scrolls to the pending target once every Accordion transition has ended.
   * MUI collapses with `timeout: "auto"`, so a tall panel closing runs *longer*
   * than the short one opening — waiting only on the opening panel's
   * `onEntered` lands mid-animation, which is why big sections misbehaved.
   */
  const scrollWhenSettled = () => {
    if (runningTransitions.current > 0) return;
    const index = pendingScrollRef.current;
    if (index === null) return;
    pendingScrollRef.current = null;
    scrollToAccordion(index);
  };

  const handleNavClick = (index: number) => {
    const isAlreadyExpanded = expanded === index;

    if (isAlreadyExpanded) {
      scrollToAccordion(index);
    } else {
      // Scrolling now would aim at a stale position: the open panel collapses
      // while this one expands, so everything below is still moving. Defer
      // until both transitions report they are done.
      pendingScrollRef.current = index;
      setExpanded(index);

      // Safety net in case a transition callback never arrives (reduced
      // motion, a panel that was never mounted, an interrupted animation).
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      fallbackTimer.current = setTimeout(() => {
        runningTransitions.current = 0;
        scrollWhenSettled();
      }, 1200);
    }

    // Centre the clicked tab in the strip. Scrolling the <ul> directly instead
    // of `scrollIntoView` matters: scrollIntoView also walks up to the document
    // scroller and fights the window scroll above, which is what made the page
    // land in the wrong place.
    const navItem = navItemRefs?.current[index];
    const list = navListRef.current;
    if (navItem && list) {
      list.scrollTo({
        left: navItem.offsetLeft - (list.clientWidth - navItem.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  };

  /** Transition hooks shared by every panel — see `scrollWhenSettled`. */
  const transitionSlotProps = {
    transition: {
      onEntering: () => {
        runningTransitions.current += 1;
      },
      onExiting: () => {
        runningTransitions.current += 1;
      },
      onEntered: () => {
        runningTransitions.current = Math.max(0, runningTransitions.current - 1);
        scrollWhenSettled();
      },
      onExited: () => {
        runningTransitions.current = Math.max(0, runningTransitions.current - 1);
        scrollWhenSettled();
      },
    },
  };

  useEffect(() => {
    return () => {
      cancelSettle.current();
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  // const validGroups = describitonList.filter((entry: any) => 
  //   entry.subGroup?.some((sub: any) => {
  //     const html = sub.html?.trim();
  //     const tekst = sub.tekst?.trim();
  //     const htmlFlette = sub.htmlMedFlettekoder?.trim();
  //     return (
  //       html &&
  //       html.toLowerCase() !== "no data" &&
  //       html !== "<div></div>" &&
  //       tekst &&
  //       htmlFlette
  //     );
  //   })
  // );

  // const validGroups = describitonList.filter((entry: any) =>
  //   entry.subGroup?.some((sub: any) => !!sub.htmlMedFlettekoder)
  // );
  const isValidHTML = (str: string) => {
    if (!str) return false;
    const trimmed = str?.trim();
    return (
      trimmed !== "" &&
      trimmed !== "<div></div>" &&
      trimmed !== "<div><br /></div>" &&
      trimmed !== "<div><br />\r\n</div>" &&
      trimmed?.toLowerCase() !== "no data"
    );
  };

  const validGroups = useMemo(
    () =>
      describitonList?.filter((entry: any) =>
        entry?.subGroup?.some(
          (sub: any) =>
            isValidHTML(sub?.htmlMedFlettekoder) || isValidHTML(sub?.html),
        ),
      ),
    [describitonList],
  );

  const pdflink = async (id: string) => {
    // console.log("PDF ID:", id);

    try {
      if (!id || !propertyId) {
        alert("Missing document ID or property ID. Cannot fetch PDF.");
        return;
      }
      const blob = await API?.GETPDF(`api/webmegler/file/document/${id}`, {
        tenantId: "381",
        propertyId,
      });

      const base64Images = await pdfToBase64Images(blob);

      if (!blob || !(blob instanceof Blob)) {
        alert("PDF download failed: Invalid response from server.");
        return;
      }

      // Create a download URL and open in new tab
      // const url = window?.URL?.createObjectURL(blob);
      // window?.open(url, "_blank");

      // // ✅ 2. Also trigger download
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = `document-${id}.pdf`; // ← Optional: customize filename
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url); // Optional: clean up memory

    } catch (error) {
      alert("Failed to fetch or open PDF. Please check your network or try again later.");
      console.error("Failed to fetch or open PDF:", error);
    }
  };

  const openBook = (id: string) => {
    window.open(`/pdf-viewer?id=${id}&propertyId=${propertyId}`, "_blank");
  }

  return (
    <>
      {/* Sticky navbar */}
      {describitonPending ? (
        <AccordionNavSkeleton />
      ) : (
        validGroups?.length > 0 && (
          <nav ref={navRef} className="mt-0 p-[15px] sticky top-[70px] bg-[#9b834a] shadow-md z-10 h-[100px] flex">
            <ul ref={navListRef} className={`max-w-[1300px] overflow-x-auto mx-auto custom-scrollbar flex items-center ${validGroups?.length <= 10 ? "md:justify-center" : ""} gap-5`}>
              {/* <ul className="max-w-[1300px] mx-auto custom-scrollbar flex items-center justify-center gap-5 overflow-x-auto"> */}
              {validGroups?.filter((item: any) => !item?.group?.overskrift?.startsWith("Finn.no"))?.map((entry: any, index: number) => (
                <li
                  key={index}
                  ref={(el) => {
                    navItemRefs.current[index] = el;
                  }}
                  className={`text-[16px] font-medium cursor-pointer whitespace-nowrap hover:text-[#06456d] ${expanded === index ? "text-[#06456d]" : "text-[#333]"
                    }`}
                  onClick={() => handleNavClick(index)}
                >
                  {entry.group?.overskrift}
                </li>
              ))}
            </ul>
          </nav>
        )
      )}
          {/* Accordion content */}
          <section className="mt-0 mx-auto flex flex-col lg:flex-row w-full border-b border-[#a9a39b] pb-5 ">
            <div className="w-full p-0 mb-5 border-l-0 border-t-0 border-r border-[#a9a39b] border">
              {describitonPending && <AccordionRowsSkeleton />}
              {!describitonPending && validGroups?.length > 0 && validGroups?.filter((item: any) => !item?.group?.overskrift?.startsWith("Finn.no"))?.map((entry: any, index: number) => (
                <div
                  key={index}
                  ref={(el) => {
                    accordionRefs.current[index] = el;
                  }}
                  className="accordionitem border-b border-[#a9a39b]"
                >
                  <Accordion
                    sx={{
                      boxShadow: "none",
                      backgroundColor: "#e2ce9d00",
                      paddingLeft: "100px !important",
                      paddingRight: "40px !important",
                      paddingY: "20px !important",
                      // borderRadius: "0px",
                      // borderBottom: "1px solid #ddd",
                      // "&:before": { display: "none" },
                    }}
                    expanded={expanded === index}
                    onChange={() => setExpanded(expanded === index ? false : index)}
                    slotProps={transitionSlotProps}
                  >
                    <AccordionSummary
                      sx={{ padding: "0", margin: "10px 0px" }}
                      expandIcon={expanded === index ? <FaMinus /> : <FaPlus />}
                      aria-controls={`${index}-content`}
                      id={`${index}-header`}
                    >
                      <p
                        className={`text-[20px] font-medium ${expanded === index ? "text-[#06456d]" : "text-[#333]"
                          }`}
                      >
                        {entry.group?.overskrift}
                      </p>
                    </AccordionSummary>

                    {/* <AccordionDetails>
                      {entry.subGroup.map((sub: any, subIdx: number) => {
                        const html = sub?.html?.trim();
                        const tekst = sub?.tekst?.trim();
                        const htmlFlette = sub?.htmlMedFlettekoder?.trim();
                        const overskrift = sub?.overskrift?.trim();

                        if (
                          html &&
                          html !== "<div></div>" &&
                          html.toLowerCase() !== "no data" &&
                          tekst &&
                          htmlFlette
                        ) {
                          return (
                            // <div
                            //   key={subIdx}
                            //   className="mb-4"
                            //   dangerouslySetInnerHTML={{ __html: html }}
                            // />
                            <div key={subIdx} className="mb-6">
                              {overskrift && (
                                <h3 className="text-[18px] font-semibold text-[#18344e] mb-2">
                                  {overskrift}
                                </h3>
                              )}
                              <div dangerouslySetInnerHTML={{ __html: html }} />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </AccordionDetails> */}

                    {/* <AccordionDetails>
                      {entry.subGroup.map((sub: any, subIdx: number) => {
                        const html = sub?.html?.trim();
                        const htmlFlette = sub?.htmlMedFlettekoder?.trim();
                        const overskrift = sub?.overskrift?.trim();

                        if (htmlFlette && htmlFlette !== "") {
                          return (
                            <div key={subIdx} className="mb-6">
                              {overskrift && (
                                <h3 className="text-[18px] font-semibold text-[#18344e] mb-2">
                                  {overskrift}
                                </h3>
                              )}
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    html && html !== "<div></div>" && html.toLowerCase() !== "no data"
                                      ? html
                                      : "<div>Ingen informasjon</div>",
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </AccordionDetails> */}
                    <AccordionDetails>
                      {entry?.subGroup?.map((sub: any, subIdx: number) => {
                        const html = sub?.html?.trim();
                        const htmlFlette = sub?.htmlMedFlettekoder?.trim();
                        const overskrift = sub?.overskrift?.trim();

                        const isEmptyHTML = (str: string) =>
                          !str || str === "<div></div>" || str === "<div><br /></div>" || str === "<div><br />\r\n</div>" || str.toLowerCase() === "no data";

                        if (htmlFlette && !isEmptyHTML(htmlFlette) && !isEmptyHTML(html)) {
                          return (
                            <div key={subIdx} className="mb-6">
                              {overskrift && (
                                <h3 className="text-[18px] font-semibold text-[#18344e] mb-2">
                                  {overskrift}
                                </h3>
                              )}
                              <div dangerouslySetInnerHTML={{ __html: html }} />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </AccordionDetails>
                  </Accordion>
                </div>
              ))}
              {/* {titleList.map((entry: any, index: number) => ( */}
              {/* <div
                  key={index}
                  ref={(el) => {
                    accordionRefs.current[index] = el;
                  }}
                  className="accordionitem border-b border-[#a9a39b]"
                > */}

              {(titleListLoad || !titleListReady) && <DocumentsSkeleton />}
              {!titleListLoad && titleListReady && (titleList?.some((val:any)=> val?.nettpublisert == true)) && (
                <Accordion
                  sx={{
                    boxShadow: "none",
                    backgroundColor: "#e2ce9d00",
                    paddingLeft: "100px !important",
                    paddingRight: "40px !important",
                    paddingY: "20px !important",
                    borderBottom: "1px solid #a9a39b",
                  }}
                  expanded={expandedDoc}
                  onChange={() => setExpandedDoc(!expandedDoc)}
                  slotProps={transitionSlotProps}
                >
                  <AccordionSummary
                    sx={{ padding: "0", margin: "10px 0px" }}
                    expandIcon={expandedDoc ? <FaMinus /> :<FaPlus /> }
                    aria-controls={`content`}
                    id={`-header`}
                  >
                    <p
                      className={`text-[20px] font-medium ${expandedDoc ? "text-[#06456d]" : "text-[#333]"
                        }`}
                    >
                      Dokumenter
                    </p>
                  </AccordionSummary>

                  <AccordionDetails className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 justify-center align-items-center">
                    {/* <div className="text-[#000] text-[14px]">
                      <h3 className="text-[17px]">Linker til andre internettsider</h3>
                      {
                        DocumentLink?.map((doc: any, docIdx: number) => (
                          <div key={docIdx}>
                            <a className="underline cursor-pointer text-[#19354e]" href={doc.url} target="_blank">{doc.navn}</a>
                          </div>
                        ))
                      }
                    </div> */}
                    {/* {
                      Array.isArray(DocumentLink) && DocumentLink.length > 0 && (
                        <div className="text-black text-[14px]">
                          <h3 className="text-[17px]">Linker til andre internettsider</h3>
                          {
                            DocumentLink?.map((doc: any, docIdx: number) => (
                              <div key={docIdx}>
                                <a
                                  className="underline cursor-pointer text-[#19354e]"
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {doc.navn}
                                </a>
                              </div>
                            ))
                          }
                        </div>
                      )
                    } */}
        
                    {Array.isArray(titleList) && titleList?.map((sub: any, subIdx: number) => (
                        sub?.nettpublisert && (
                          <div key={subIdx}>
                            <h3 className="underline cursor-pointer" onClick={() => {
                              openBook(sub?.id)
                            }}>{sub?.navn}</h3>
                            <p className="text-[#808080]">{sub?.filtype}</p>
                          </div>
                        )
                    ))}

                  </AccordionDetails>
                </Accordion>
              )}
              {/* </div> */}
              {/* ))} */}

              {/* Maps JS (~200kB) only loads once the user scrolls near it. */}
              <LazyMount
                className="p-5 lg:pl-[100px]"
                fallback={<MapSkeleton />}
              >
                <LoadScript googleMapsApiKey="AIzaSyDZ3xBwFg3RHF6w016dMH_kIUrRRqcYfgo">
                  <Googlemap />
                </LoadScript>
              </LazyMount>
            </div>
            <div className="mb-5 w-full sm:w-[56%]">
              {/*  <div className="p-10 border-[#a9a39b] sticky top-[170px] border-b border-t-0 boredr-r-0 ">
                <strong className="text-[34px] font-semibold text-[#18344e]">
                  Kommende visninger
                </strong>
                <p className="text-2xl text-[#333] font-normal mb-2">
                  Søndag, 17. august
                </p>
                <p className="text-2xl text-[#333] font-normal mb-2">
                  18:30 - 19:30
                </p>
                <a href="#" className="text-sm text-[#333] font-normal underline underline-offset-[6px] decoration-1 hover:decoration-2 duration-150 mb-2">
                  Legg i kalender 
                </a>
                <div className="mt-10 flex flex-col gap-5">
                  <a className="cursor-pointer max-w-[215px] p-4 text-center w-full inline-block rounded-full bg-[#18344e] text-white text-lg">Meld deg på visning</a>
                  <a className="cursor-pointer max-w-[215px] p-4 text-center w-full inline-block rounded-full border border-[#18344e] text-[#18344e] text-lg hover:bg-[#18344e] hover:text-white duration-100">Jeg ønsker budvarsel</a>
                </div>
              </div> */}
            </div>
          </section>
    </>
  );
}
