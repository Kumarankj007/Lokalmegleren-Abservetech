"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { PageFlip } from "page-flip";
import type { SizeType } from "page-flip";
import "./flipbook.css";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  LayoutGrid,
  Search,
  Share2,
  Maximize2,
  Minimize2,
  Download,
  FileX,
  Loader2,
  Check,
} from "lucide-react";
import {
  FLIPPING_TIME,
  MAX_SHADOW_OPACITY,
  MIN_PAGE_HEIGHT,
  MIN_PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  A3_RATIO_MIN,
  A3_RATIO_MAX,
} from "./constants";
import type { FlipEvent, FlipbookProps } from "./types";
import ImageComponent from "../components/image";

// Type to handle pages after we determine if they need splitting
type ProcessedPage = {
  url: string;
  type: "single" | "split";
  side?: "left" | "right";
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

/** Circular icon button used across the viewer chrome. */
const IconButton = ({
  label,
  active,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    className={
      "inline-flex items-center justify-center rounded-full text-white/85 outline-none " +
      "cursor-pointer select-none transition-colors duration-150 " +
      "hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 " +
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent " +
      (active ? "bg-white/20 text-white " : "") +
      className
    }
    {...rest}
  >
    {children}
  </button>
);

const Flipbook = ({
  images,
  generatePDF,
  isMobile,
  isLoadDownload,
}: FlipbookProps) => {
  const bookElement = useRef<HTMLDivElement>(null);
  const pageFlip = useRef<PageFlip | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);

  const [zoom, setZoom] = useState<number>(1);
  const [fitScale, setFitScale] = useState<number>(1);
  const [showThumbs, setShowThumbs] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [goToPage, setGoToPage] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Image processing
  const [processedPages, setProcessedPages] = useState<ProcessedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  // Check if the 1st index image is A3 size (split)
  const isFirstPageA3 = processedPages[0]?.type === "split";

  // ---------------------------------------------------------------- paging

  const turnTo = useCallback(
    (page: number) => {
      if (!pageFlip.current || totalPage === 0) return;
      const clamped = Math.min(Math.max(page, 1), totalPage);
      pageFlip.current.turnToPage(clamped - 1);
      setCurrentPage(clamped);
    },
    [totalPage],
  );

  const onPrevPage = useCallback(() => pageFlip.current?.flipPrev(), []);
  const onNextPage = useCallback(() => pageFlip.current?.flipNext(), []);

  const handleGoToPage = useCallback(() => {
    const page = Number(goToPage);
    if (isNaN(page) || page < 1 || page > totalPage) return;
    turnTo(page);
    setGoToPage("");
    setShowSearch(false);
  }, [goToPage, totalPage, turnTo]);

  // ----------------------------------------------------------------- zoom

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))),
    [],
  );

  // ------------------------------------------------------------- fit scale

  const bookWidth = isMobile ? MIN_PAGE_WIDTH : PAGE_WIDTH * 2;
  const bookHeight = isMobile ? MIN_PAGE_HEIGHT : PAGE_HEIGHT;

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;

      const cs = getComputedStyle(stage);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const availW = stage.clientWidth - padX;
      const availH = stage.clientHeight - padY;
      if (availW <= 0 || availH <= 0) return;
      setFitScale(Math.min(1, availW / bookWidth, availH / bookHeight));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [
    bookWidth,
    bookHeight,
    isProcessing,
    processedPages.length,
    isFullscreen,
  ]);

  const scale = fitScale * zoom;

  // ----------------------------------------------------------- fullscreen

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ------------------------------------------------------------- keyboard

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") onPrevPage();
      else if (e.key === "ArrowRight") onNextPage();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "Escape") {
        if (showThumbs) setShowThumbs(false);
        else if (showSearch) setShowSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrevPage, onNextPage, zoomIn, zoomOut, showThumbs, showSearch]);

  // --------------------------------------------------- scrubber dragging

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const bar = scrubRef.current;
      if (!bar || totalPage === 0) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(
        Math.max((clientX - rect.left) / rect.width, 0),
        1,
      );
      turnTo(Math.max(1, Math.round(ratio * totalPage)));
    },
    [totalPage, turnTo],
  );

  const onScrubStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      seekFromClientX(e.clientX);
    },
    [seekFromClientX],
  );

  const onScrubMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      seekFromClientX(e.clientX);
    },
    [seekFromClientX],
  );

  // 1. Pre-process images to split A3 spreads into two A4 pages
  useEffect(() => {
    let isMounted = true;

    if (!images?.length) {
      if (isMounted) setIsProcessing(false);
      return;
    }

    const processImages = async () => {
      setIsProcessing(true);

      const promises = images.map((src) => {
        return new Promise<ProcessedPage[]>((resolve) => {
          const img = new window.Image();
          img.src = src;
          img.onload = () => {
            const ratio = img.width / img.height;
            // If aspect ratio falls into A3 landscape boundaries, split it
            if (ratio >= A3_RATIO_MIN && ratio <= A3_RATIO_MAX) {
              resolve([
                { url: src, type: "split", side: "left" },
                { url: src, type: "split", side: "right" },
              ]);
            } else {
              resolve([{ url: src, type: "single" }]);
            }
          };
          img.onerror = () => {
            resolve([{ url: src, type: "single" }]);
          };
        });
      });

      const results = await Promise.all(promises);
      const flatPages = results.flat();

      if (isMounted) {
        setProcessedPages(flatPages);
        setIsProcessing(false);
      }
    };

    processImages();

    return () => {
      isMounted = false;
    };
  }, [images]);

  // 2. Initialize PageFlip once processed pages are mounted in the DOM
  useEffect(() => {
    if (isProcessing || processedPages.length === 0 || !bookElement.current)
      return;

    let flip: PageFlip | null = null;

    const timer = setTimeout(() => {
      if (!bookElement.current) return;

      flip = new PageFlip(bookElement.current, {
        width: isMobile ? MIN_PAGE_WIDTH : PAGE_WIDTH,
        height: isMobile ? MIN_PAGE_HEIGHT : PAGE_HEIGHT,
        size: "stretch" as SizeType,
        minWidth: isMobile ? MIN_PAGE_WIDTH : PAGE_WIDTH,
        maxWidth: isMobile ? MIN_PAGE_WIDTH : PAGE_WIDTH,
        minHeight: isMobile ? MIN_PAGE_HEIGHT : PAGE_HEIGHT,
        maxHeight: isMobile ? MIN_PAGE_HEIGHT : PAGE_HEIGHT,
        maxShadowOpacity: MAX_SHADOW_OPACITY,
        showCover: true,
        mobileScrollSupport: true,
        usePortrait: isMobile ? true : false,
        drawShadow: true,
        flippingTime: FLIPPING_TIME,
        startPage: 0,
      });

      const pages = bookElement.current.querySelectorAll<HTMLElement>(".page");
      if (pages.length > 0) {
        try {
          flip.loadFromHTML(pages);
          pageFlip.current = flip;
          setTotalPage(flip.getPageCount());
          setCurrentPage(flip.getCurrentPageIndex() + 1);
          flip.on("flip", (e: FlipEvent) => setCurrentPage(Number(e.data) + 1));
        } catch (error) {
          console.error("PageFlip load error:", error);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (flip) {
        flip.destroy();
        pageFlip.current = null;
      }
    };
  }, [isProcessing, processedPages, isMobile]);

  const progress = totalPage > 0 ? (currentPage / totalPage) * 100 : 0;

  const isSpread = !isMobile && currentPage > 1 && currentPage < totalPage;
  const pageLabel =
    totalPage === 0
      ? ""
      : isSpread
        ? `${currentPage} - ${currentPage + 1} / ${totalPage}`
        : `${currentPage} / ${totalPage}`;

  // Loading State
  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white/70">
        <Loader2 className="sm:w-10 sm:h-10 w-8 h-8 animate-spin text-white" />
        <p className="text-lg font-medium tracking-wide">
          Forbereder albumet...
        </p>
      </div>
    );
  }

  // Empty State
  if (!processedPages?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white/60">
        <div className="p-6 rounded-full bg-white/10">
          <FileX className="w-12 h-12" />
        </div>
        <p className="text-lg font-medium">Ingen sider å forhåndsvise</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Gå tilbake
        </button>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className="fixed inset-0 z-50 bg-black text-white select-none overflow-hidden"
    >
      {/* Close */}
      {document.fullscreenElement && (
        <IconButton
          label="Lukk"
          onClick={() =>
            document.fullscreenElement
              ? document.exitFullscreen()
              : router.back()
          }
          className="absolute top-2 right-3 z-40 w-10 h-10 text-white hover:bg-white/10"
        >
          <X className="w-7 h-7" strokeWidth={1.5} />
        </IconButton>
      )}

      {/* Title */}
      <div className="absolute top-0 inset-x-0 z-20 pointer-events-none bg-[#18344e] px-5 py-3 shadow-md">
        <h1 className="text-base sm:text-xl text-center font-semibold tracking-wide text-[#e2cf9e]">
          Bla i salgsoppgave
        </h1>
      </div>

      {/* Prev / Next arrows */}
      <IconButton
        label="Forrige side"
        onClick={onPrevPage}
        disabled={currentPage <= 1}
        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12"
      >
        <ChevronLeft className="w-9 h-9" strokeWidth={1.5} />
      </IconButton>

      <IconButton
        label="Neste side"
        onClick={onNextPage}
        disabled={currentPage >= totalPage}
        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12"
      >
        <ChevronRight className="w-9 h-9" strokeWidth={1.5} />
      </IconButton>

      {/* Stage */}
      <div
        ref={stageRef}
        className="absolute inset-0 overflow-auto px-14 pt-20 sm:pt-18 pb-28 flex"
      >
        <div
          className="m-auto"
          style={{
            width: bookWidth * scale,
            height: bookHeight * scale,
            transition: "width 200ms ease-out, height 200ms ease-out",
          }}
        >
          <div
            style={{
              width: bookWidth,
              height: bookHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              transition: "transform 200ms ease-out",
            }}
          >
            <div className="flip-book-wrapper relative flex justify-center">
              <div
                className="flip-book shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                ref={bookElement}
              >
                {/* 1. Cover page — ONLY rendered if 1st image is A3 size */}
                {isFirstPageA3 && (
                  <div className="page" key="cover">
                    <div
                      id="page_1002"
                      className="pdf24_ pdf24_02 blueBg relative w-full h-full bg-[#18344e]"
                    >
                      <ImageComponent
                        src="https://lokalmegleren.no/assets/logo.png"
                        alt="lokalmegleren_logo"
                        height={112}
                        width={100}
                        className="block absolute object-contain w-full h-28"
                        style={{ bottom: "3rem" }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Processed pages */}
                {processedPages.map((page, i) => (
                  <div className="page" key={i}>
                    <div
                      className="page-content"
                      style={{
                        height: "100%",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          className="page-image"
                          style={{
                            height: "100%",
                            width: "100%",
                            backgroundImage: `url(${page.url})`,
                            backgroundSize:
                              page.type === "split" ? "200% 100%" : "cover",
                            backgroundPosition:
                              page.type === "split"
                                ? page.side === "left"
                                  ? "left center"
                                  : "right center"
                                : "center",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search / go-to-page popover */}
      {showSearch && (
        <div className="absolute bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-neutral-900/95 border border-white/15 px-3 py-2 shadow-xl">
          <Search className="w-4 h-4 text-white/50" />
          <input
            autoFocus
            type="number"
            min={1}
            max={totalPage}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGoToPage();
            }}
            placeholder={`Side 1–${totalPage}`}
            className="w-32 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
          />
          <button
            type="button"
            onClick={handleGoToPage}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
          >
            Gå
          </button>
        </div>
      )}

      {/* Thumbnail grid */}
      {showThumbs && (
        <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-sm overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white/80">
              Alle sider
            </h3>
            <IconButton
              label="Lukk oversikt"
              onClick={() => setShowThumbs(false)}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </IconButton>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
            {processedPages.map((page, i) => {
              // Adjust page number offset based on whether cover page is shown
              const pageNo = isFirstPageA3 ? i + 2 : i + 1;
              const isActive =
                pageNo === currentPage ||
                (isSpread && pageNo === currentPage + 1);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    turnTo(pageNo);
                    setShowThumbs(false);
                  }}
                  className={
                    "group relative aspect-[1/1.414] w-full overflow-hidden rounded-md border " +
                    (isActive
                      ? "border-white ring-2 ring-white/60"
                      : "border-white/15 hover:border-white/60")
                  }
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${page.url})`,
                      backgroundSize:
                        page.type === "split" ? "200% 100%" : "cover",
                      backgroundPosition:
                        page.type === "split"
                          ? page.side === "left"
                            ? "left center"
                            : "right center"
                          : "center",
                    }}
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-[10px] text-white/80 tabular-nums">
                    {pageNo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom chrome */}
      <div className="absolute bottom-0 inset-x-0 z-30">
        {/* Scrubber */}
        <div
          ref={scrubRef}
          role="slider"
          aria-label="Sidenavigasjon"
          aria-valuemin={1}
          aria-valuemax={totalPage}
          aria-valuenow={currentPage}
          tabIndex={0}
          onPointerDown={onScrubStart}
          onPointerMove={onScrubMove}
          className="group relative mx-4 h-6 flex items-center cursor-pointer touch-none"
        >
          <div className="h-2 w-full rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-[#1a73e8]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            className="absolute w-4 h-4 rounded-full bg-white shadow -translate-x-1/2 pointer-events-none"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between sm:gap-4 gap-2 sm:px-5 px-4 pb-4 pt-2">
          <span className="text-lg sm:text-xl font-normal tabular-nums text-white/90">
            {pageLabel}
          </span>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom */}
            <IconButton
              label="Zoom ut"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              <Minus className="w-6 h-6" strokeWidth={1.5} />
            </IconButton>

            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoomnivå"
              className="flipbook-zoom w-20 sm:w-28 cursor-pointer"
            />

            <IconButton
              label="Zoom inn"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              <Plus className="w-6 h-6" strokeWidth={1.5} />
            </IconButton>

            {/* Thumbnails */}
            <IconButton
              label="Sideoversikt"
              active={showThumbs}
              onClick={() => {
                setShowThumbs((v) => !v);
                setShowSearch(false);
              }}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              <LayoutGrid className="w-6 h-6" strokeWidth={1.5} />
            </IconButton>

            {/* Search / go to page */}
            <IconButton
              label="Gå til side"
              active={showSearch}
              onClick={() => {
                setShowSearch((v) => !v);
                setShowThumbs(false);
              }}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </IconButton>

            {/* Download */}
            <IconButton
              label="Last ned PDF"
              onClick={generatePDF}
              disabled={isLoadDownload}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              {isLoadDownload ? (
                <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} />
              ) : (
                <Download className="w-6 h-6" strokeWidth={1.5} />
              )}
            </IconButton>

            {/* Fullscreen */}
            <IconButton
              label={isFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}
              onClick={toggleFullscreen}
              className="sm:w-10 sm:h-10 w-8 h-8"
            >
              {isFullscreen ? (
                <Minimize2 className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Maximize2 className="w-6 h-6" strokeWidth={1.5} />
              )}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flipbook;
