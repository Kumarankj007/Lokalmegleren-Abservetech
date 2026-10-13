/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageComponent from "../components/image";
import CallMadeIcon from '@mui/icons-material/CallMade';
import PlaceIcon from '@mui/icons-material/Place';
import usePropertyStore from "../api/get/properties";
import { useSearchParams } from "next/navigation";
import { Skeleton } from '@mui/material';



export default function HomesForSale() {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ["Homes for sale",];
    const {
        visibleProperties,
        FetchAllProperties,
        LoadNextBatch,
        loadingImages,
        hasMore,
        allProperties,
    } = usePropertyStore();
    // const propertyData: any = [
    //     {
    //         image: '/assets/house.jpg',
    //         amount: '3,790,000',
    //         name: 'Aulli',
    //         describe: 'Newer, stylish and modern 3-bedroom apartment. Large west-facing balcony with fantastic views. Elevator and garage space.',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/house2-image.jpg',
    //         amount: '3,460,000',
    //         name: 'Kragero Resort',
    //         describe: 'Create your dream home in the hills of beautiful Refsnes! Stair-free access, end and 3 bedrooms - Balcony with extensive views and evening sun',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/h3.jpg',
    //         amount: '3,850,000',
    //         name: 'LILLEBERG / HOVIN',
    //         describe: 'Great newer restaurant/cafe premises, SLIP1SENTER, Rognan. Fully equipped. Sunny outdoor seating areas included.',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/h4.jpg',
    //         amount: '2,950,000',
    //         name: 'ROSENBORG',
    //         describe: 'Classic and bright freehold apartment | Possibility of 3 bedrooms | Great shared backyard | Renovation project | Perfect first-time purchase!',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/house.jpg',
    //         amount: '1,900,000',
    //         name: 'Aulli',
    //         describe: 'Newer, stylish and modern 3-bedroom apartment. Large west-facing balcony with fantastic views. Elevator and garage space.',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/house2-image.jpg',
    //         amount: '6,250,000',
    //         name: 'Kragero Resort',
    //         describe: 'Create your dream home in the hills of beautiful Refsnes! Stair-free access, end and 3 bedrooms - Balcony with extensive views and evening sun',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/h3.jpg',
    //         amount: '1,750,000',
    //         name: 'LILLEBERG / HOVIN',
    //         describe: 'Great newer restaurant/cafe premises, SLIP1SENTER, Rognan. Fully equipped. Sunny outdoor seating areas included.',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/h4.jpg',
    //         amount: '2,275,000',
    //         name: 'ROSENBORG',
    //         describe: 'Classic and bright freehold apartment | Possibility of 3 bedrooms | Great shared backyard | Renovation project | Perfect first-time purchase!',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/house.jpg',
    //         amount: '2,690,000',
    //         name: 'Aulli',
    //         describe: 'Newer, stylish and modern 3-bedroom apartment. Large west-facing balcony with fantastic views. Elevator and garage space.',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    //     {
    //         image: '/assets/house2-image.jpg',
    //         amount: '6,250,000',
    //         name: 'Kragero Resort',
    //         describe: 'Create your dream home in the hills of beautiful Refsnes! Stair-free access, end and 3 bedrooms - Balcony with extensive views and evening sun',
    //         sqft: '1370',
    //         bed: '02',
    //         bath: '01'
    //     },
    // ]
    const searchParams: any = useSearchParams();
    const brokerId: any = searchParams.get('id');
    const observerRef = useRef<HTMLDivElement | null>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (target.isIntersecting && !loadingImages && hasMore) {
                LoadNextBatch();
            }
        },
        [LoadNextBatch, loadingImages, hasMore]
    );

    useEffect(() => {
        const body: any = {};
        body.tenantId = 381;
        body.employeeId = brokerId;
        FetchAllProperties(body);
    }, [FetchAllProperties, brokerId]);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver(handleObserver, option);
        const currentRef = observerRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [handleObserver]);

    return (
        <>
            <section className="px-[20px] bg-[#fff]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="py-[50px]">
                        <div className="flex gap-0 sm:gap-x-[30px] flex-wrap justify-center">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`px-5 py-3 text-[16px] cursor-pointer font-semibold
                                 ${activeTab === index
                                            ? "text-[#18344e] border-b-2 border-[#18344e]"
                                            : "text-[#757575] border-0 hover:text-[#18344e]"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pb-[50px]">
                        {activeTab === 0 &&
                           allProperties?.length === 0 ?
                            <p className='text-center text-[#18344e] text-[25px] font-semibold py-[50px]'>No Data</p>
                            :
                            <div className="grid md:grid-cols-2 gap-[30px]">
                                {Array.isArray(visibleProperties) && visibleProperties?.map((item: any, index: any) => (
                                    <Link href={`/detail?id=${item?.id}`} key={index} className="group flex flex-col rounded-[10px] cursor-pointer p-[10px]">
                                        <ImageComponent key={index} width={500} height={500} alt="house-image" src={item?.images && item?.images[0]?.url} className="w-full md:h-[300px] lg:h-[450px]" />
                                        <p className="text-[20px] group-hover:text-[#18344e] text-[#333] font-bold mt-[10px] mb-[6px]">{item?.overskrift}</p>
                                        <p className="text-[18px] text-[#757575] mb-auto font-medium"><span><PlaceIcon fontSize='small' className='text-[#caa950]' /></span>{item?.eiendom?.adresse}</p>
                                        <div className='my-[25px]'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-[8px]'>
                                                    <ImageComponent width={500} height={500} alt='sqft' src='/assets/sqft-icon.svg' className='w-[18px] h-[18px]' />
                                                    <p className='text-[18px] font-semibold text-[#333]'>{item?.eiendom?.arealer?.interntbruksareal != 0 ? item?.eiendom?.arealer?.interntbruksareal : item?.eiendom?.arealer?.primærrom}<span className='text-[#757575] font-medium'> m²</span></p>
                                                </div>
                                                <div className='flex items-center gap-[8px]'>
                                                    <ImageComponent width={500} height={500} alt='bed' src='/assets/bed-icon.svg' className='w-[18px] h-[18px]' />
                                                    <p className='text-[18px] font-semibold text-[#333]'>{item?.eiendom?.romfordeling?.antallSoverom}<span className='text-[#757575] font-medium'> {item?.eiendom?.romfordeling?.antallSoverom > 1 ? 'senger' : 'seng'} </span></p>
                                                </div>
                                                <div className='flex items-center gap-[8px]'>
                                                    <ImageComponent width={500} height={500} alt='bath' src='/assets/bath-icon.svg' className='w-[18px] h-[18px]' />
                                                    <p className='text-[18px] font-semibold text-[#333]'>{item?.eiendom?.romfordeling?.antallBad}<span className='text-[#757575] font-medium'> {item?.eiendom?.romfordeling?.antallBad > 1 ? 'bad' : 'bad'} </span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex items-center py-[20px] justify-between border-t border-b border-[#333] border-dashed'>
                                            <p className='text-[25px] text-[#333] font-semibold'>{item?.prisantydning.toLocaleString()} kr</p>
                                            <Link href={`/detail?id=${item?.id}`} className='group bg-[#0c1a27] group-hover:bg-[#caa950] cursor-pointer p-[5px]'>
                                                <CallMadeIcon fontSize='medium' className='text-[#fff] group-hover:text-[#0c1a27]' />
                                            </Link>
                                        </div>
                                    </Link>
                                ))}
                                {
                                    loadingImages &&
                                    Array.from({ length: 10 }).map((_, idx) =>
                                        <div key={idx}>
                                            <Skeleton variant="rectangular" width='100%' height='450px' />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: '3px', marginTop: '10px' }} />
                                            <Skeleton variant="text" width='70%' sx={{ fontSize: '1rem', marginBottom: '6px' }} />
                                            <Skeleton variant="text" width='40%' sx={{ fontSize: '1rem' }} />
                                            <div className='my-[25px]'>
                                                <div className='flex items-center justify-between'>
                                                    <Skeleton variant="rectangular" width='100px' height='25px' />
                                                    <Skeleton variant="rectangular" width='100px' height='25px' />
                                                    <Skeleton variant="rectangular" width='100px' height='25px' />
                                                </div>
                                            </div>
                                            <Skeleton variant="rectangular" width='100%' height='80px' />
                                        </div>
                                    )
                                }
                                <div ref={observerRef} style={{ height: '1px' }} />
                            </div>
                        }
                    </div>
                </div>
            </section>
        </>
    );
}
