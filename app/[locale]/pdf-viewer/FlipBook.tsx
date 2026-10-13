"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import './flipbook.css';
import { useRouter } from '@/components/navigation';
import {
    X,
    Download,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    LayoutGrid,
    Maximize2,
    Minimize2,
    FileX,
} from 'lucide-react';
import {
    FLIPPING_TIME,
    MAX_SHADOW_OPACITY,
    PAGE_HEIGHT,
    PAGE_WIDTH,
} from './constants';
import type { FlipEvent, FlipbookProps } from './types';

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

const Flipbook = ({ images, generatePDF }: FlipbookProps) => {
    const bookElement = useRef<HTMLDivElement>(null);
    const pageFlip = useRef<PageFlip | null>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const scrubRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [goToPage, setGoToPage] = useState("");
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);

    const [zoom, setZoom] = useState<number>(1);
    const [fitScale, setFitScale] = useState<number>(1);
    const [showThumbs, setShowThumbs] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

    const handleGoToPage = useCallback(() => {
        const page = Number(goToPage);

        if (
            !pageFlip.current ||
            isNaN(page) ||
            page < 1 ||
            page > totalPage
        ) {
            return;
        }

        // Instant navigation
        pageFlip?.current?.turnToPage(page - 1);

        // Update page indicator
        setCurrentPage(page);

        setGoToPage("");
    }, [goToPage, totalPage]);

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

    // page-flip renders the book at a fixed pixel size (min/max width+height are
    // pinned to the same value), so on a short viewport the spread is taller than
    // the stage and its top ends up behind the chrome. Scale it down to fit, then
    // the zoom control multiplies on top of that.
    const bookWidth = PAGE_WIDTH * 2;
    const bookHeight = PAGE_HEIGHT;

    useEffect(() => {
        const measure = () => {
            const stage = stageRef.current;
            if (!stage) return;
            // clientWidth/Height include the stage's padding, so read the actual
            // padding back off it.
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
    }, [bookWidth, bookHeight, isFullscreen]);

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

    useEffect(() => {
        if (!bookElement.current) return;
        let flip: PageFlip | null = null;

        const timer = setTimeout(() => {
            if (!bookElement.current) return;

            // Album-style: each page 420x560, so the OPEN spread is ~840 wide
            flip = new PageFlip(bookElement.current, {
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                size: "fixed",
                minWidth: PAGE_WIDTH,
                maxWidth: PAGE_WIDTH,
                minHeight: PAGE_HEIGHT,
                maxHeight: PAGE_HEIGHT,
                maxShadowOpacity: MAX_SHADOW_OPACITY,
                showCover: true,
                mobileScrollSupport: false,
                usePortrait: false,        // <- forces 2-page spread, never collapses to single
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
                    flip.on('flip', (e: FlipEvent) => setCurrentPage(Number(e.data) + 1));
                } catch (error) {
                    console.error("PageFlip load error:", error);
                }
            }
        }, 0);

        return () => {
            clearTimeout(timer);
            if (flip) flip.destroy();
        };
    }, []);

    const onPrevPage = useCallback(() => pageFlip.current?.flipPrev(), []);
    const onNextPage = useCallback(() => pageFlip.current?.flipNext(), []);

    const progress = totalPage > 0 ? (currentPage / totalPage) * 100 : 0;

    /** "182 - 183 / 230" for an open spread, "1 / 230" for the cover. */
    const isSpread = currentPage > 1 && currentPage < totalPage;
    const pageLabel =
        totalPage === 0
            ? ""
            : isSpread
                ? `${currentPage} - ${currentPage + 1} / ${totalPage}`
                : `${currentPage} / ${totalPage}`;

    if (!images?.length) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-black text-white/60">
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
            className="relative min-h-screen bg-black text-white select-none overflow-hidden"
        >

            {/* Title */}
            <div className="absolute top-0 inset-x-0 z-20 pointer-events-none bg-theme2 px-5 py-3 shadow-md">
                <h1 className="text-base sm:text-xl text-center font-semibold tracking-wide text-theme">
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
                {/*
                  Two nested boxes: the outer one reserves the *scaled* footprint so
                  the scroll container knows how tall the book really is, the inner
                  one carries the transform. `m-auto` centers it without the flex
                  overflow trap that puts the top out of scroll reach.
                */}
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
                                {images.map((img, i) => (
                                    <div className="page" key={i}>
                                        <div
                                            className="page-content"
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                <div
                                                    className="page-image"
                                                    style={{
                                                        height: '100%',
                                                        width: '100%',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        backgroundImage: `url(${img})`,
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
                        {images.map((img, i) => {
                            const pageNo = i + 1;
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
                                            backgroundImage: `url(${img})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
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
                        {/* Go to page */}
                        <div className="flex items-center gap-2 rounded-full bg-neutral-900/95 border border-white/15 px-3 py-1.5">
                            <input
                                type="number"
                                min={1}
                                max={totalPage}
                                value={goToPage}
                                onChange={(e) => setGoToPage(e.target.value)}
                                placeholder="Side"
                                className="w-16 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleGoToPage();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleGoToPage}
                                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                            >
                                Gå
                            </button>
                        </div>

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
                            onClick={() => setShowThumbs((v) => !v)}
                            className="sm:w-10 sm:h-10 w-8 h-8"
                        >
                            <LayoutGrid className="w-6 h-6" strokeWidth={1.5} />
                        </IconButton>

                        {/* Download */}
                        <IconButton
                            label="Last ned PDF"
                            onClick={generatePDF}
                            className="sm:w-10 sm:h-10 w-8 h-8"
                        >
                            <Download className="w-6 h-6" strokeWidth={1.5} />
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
