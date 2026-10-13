"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/components/navigation';

// Define the event data types based on page-flip documentation
interface FlipEvent {
    data: number;
    object: PageFlip;
}

interface StateEvent {
    data: string; // 'read', 'flipping', etc.
    object: PageFlip;
}

const Flipbook = ({images, generatePDF}:{images: string[], generatePDF: () => void}) => {
    const bookElement = useRef<HTMLDivElement>(null);
    const pageFlip = useRef<PageFlip | null>(null);
    const router = useRouter()
    
    // State for the UI indicators
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [orientation, setOrientation] = useState<string>('landscape');
    const [state, setState] = useState<string>('read');

useEffect(() => {
    if (!bookElement.current) return;

    let flip: PageFlip | null = null;

    // Use a timeout to ensure Next.js has finished rendering the DOM
    const timer = setTimeout(() => {
        if (!bookElement.current) return;

        flip = new PageFlip(bookElement.current, {
            width: 400,
            height: 566,
            size: "stretch",
            minWidth: 400,
            maxWidth: 400,
            minHeight: 566,
            maxHeight: 566,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false,
            startPage: 0,
        });

        const pages = bookElement.current.querySelectorAll<HTMLElement>(".page");

        if (pages.length > 0) {
            try {
                flip.loadFromHTML(pages);
                
                // Only call these if flip is successfully initialized
                pageFlip.current = flip;
                setTotalPage(flip.getPageCount());
                setOrientation(flip.getOrientation());
                setCurrentPage(flip.getCurrentPageIndex() + 1);

                // Event Listeners
                flip.on('flip', (e: any) => setCurrentPage((e.data as number) + 1));
                flip.on('changeState', (e: any) => setState(e.data as string));
                flip.on('changeOrientation', (e: any) => setOrientation(e.data as string));
                
            } catch (error) {
                console.error("PageFlip load error:", error);
            }
        }
    }, 0);

    return () => {
        clearTimeout(timer);
        if (flip) {
            flip.destroy();
        }
    };
}, []);

    // Handlers using the ref to avoid stale closures
    const onPrevPage = useCallback(() => {
        pageFlip.current?.flipPrev();
    }, []);

    const onNextPage = useCallback(() => {
        pageFlip.current?.flipNext();
    }, []);

    return images?.length > 0 ?(
        <div className='flex flex-col gap-3 my-5'>
            <div className='flex items-center justify-center gap-3'>
                <Button onClick={()=>router.back()}>Back</Button>
                <h2 className="text-center text-2xl font-bold">Pdf Preview</h2>
                <Button onClick={generatePDF}>Download Pdf</Button>
            </div>
            <div className="flip-book-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="flip-book" ref={bookElement}>
                    {/* Content Pages */}
                    {images.map((img, i) => (
                        <div className="page" key={i}>
                            <div className="page-content" style={{ height: '100%',background: '#e2cf9e' }}>
                                <div 
                                    className="page-image" 
                                    style={{ 
                                        height: '100%', 
                                        width: '100%',
                                        backgroundSize: 'cover',
                                        backgroundImage: `url(${img})` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="controls flex items-center justify-center gap-3">
                <Button variant={"outline"} onClick={onPrevPage} className="btn-prev cursor-pointer">Previous page</Button>
                <span className="text-sm font-medium">
                    Page <strong>{currentPage}</strong> of {totalPage} 
                </span>
                <Button variant={"outline"} onClick={onNextPage} className="btn-next cursor-pointer">Next page</Button>
                
                {/* <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                    Status: <i>{state}</i> | Orientation: <i>{orientation}</i>
                </div> */}
            </div>
        </div>
    ): (<div>No Pages</div>);
};

export default Flipbook;