/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import PlaceIcon from '@mui/icons-material/Place';
import CallMadeIcon from '@mui/icons-material/CallMade';
import ImageComponent from "../components/image";


export default function SimilarHomes() {
    const swiperRef = useRef(null);
    const propertyData: any = [
        {
            image: '/assets/house.jpg',
            amount: '3,790,000',
            name: 'Aulli',
            describe: 'Newer, stylish and modern 3-bedroom apartment. Large west-facing balcony with fantastic views. Elevator and garage space.',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/house2.jpg',
            amount: '3,460,000',
            name: 'Kragero Resort',
            describe: 'Create your dream home in the hills of beautiful Refsnes! Stair-free access, end and 3 bedrooms - Balcony with extensive views and evening sun',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/h3.jpg',
            amount: '3,850,000',
            name: 'LILLEBERG / HOVIN',
            describe: 'Great newer restaurant/cafe premises, SLIP1SENTER, Rognan. Fully equipped. Sunny outdoor seating areas included.',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/h4.jpg',
            amount: '2,950,000',
            name: 'ROSENBORG',
            describe: 'Classic and bright freehold apartment | Possibility of 3 bedrooms | Great shared backyard | Renovation project | Perfect first-time purchase!',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/house.jpg',
            amount: '1,900,000',
            name: 'Aulli',
            describe: 'Newer, stylish and modern 3-bedroom apartment. Large west-facing balcony with fantastic views. Elevator and garage space.',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/house2.jpg',
            amount: '6,250,000',
            name: 'Kragero Resort',
            describe: 'Create your dream home in the hills of beautiful Refsnes! Stair-free access, end and 3 bedrooms - Balcony with extensive views and evening sun',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/h3.jpg',
            amount: '1,750,000',
            name: 'LILLEBERG / HOVIN',
            describe: 'Great newer restaurant/cafe premises, SLIP1SENTER, Rognan. Fully equipped. Sunny outdoor seating areas included.',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/h4.jpg',
            amount: '2,275,000',
            name: 'ROSENBORG',
            describe: 'Classic and bright freehold apartment | Possibility of 3 bedrooms | Great shared backyard | Renovation project | Perfect first-time purchase!',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
        {
            image: '/assets/house.jpg',
            amount: '2,690,000',
            name: 'Aulli',
            describe: 'Newer, stylish and modern 3-bedroom apartment. Large west-facing balcony with fantastic views. Elevator and garage space.',
            sqft: '1370',
            bed: '02',
            bath: '01'
        },
    ]

    return (
        <>
            <section className="mt-[50px]">
                <h2 className="text-[30px] font-bold text-[#333] text-center mb-[50px]">Similar homes in the immediate area</h2>
                <div className="max-w-[1300px] mx-auto px-[20px]">
                    <Swiper
                        onSwiper={(swiper: any) => (swiperRef.current = swiper)}
                        slidesPerView={1}
                        spaceBetween={10}
                        slidesPerGroup={1}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop={true}
                        modules={[Navigation, Pagination, Autoplay]}
                        className=""
                        breakpoints={{
                            640: { slidesPerView: 1, spaceBetween: 10 },
                            768: { slidesPerView: 2, spaceBetween: 15 },
                            1200: { slidesPerView: 3, spaceBetween: 20 },
                        }}
                    >
                        {propertyData?.map((item: any, index: any) => (
                            <SwiperSlide
                                key={index}
                                className="w-full py-[20px]"
                            >
                                <div key={index} className="group flex flex-col rounded-[10px] cursor-pointer p-[10px]">
                                    <div className="relative">
                                        <ImageComponent width={500} height={500} alt="house-image" src={item?.image} className="w-full h-[250px] sm:h-[300px]" />
                                    </div>
                                    <p className="text-[20px] text-[#333] group-hover:text-[#18344e] group-hover:font-bold font-semibold mt-[10px] mb-[6px]">{item?.name}</p>
                                    <p className="text-[14px] text-[#757575] mt-auto font-medium"><span><PlaceIcon fontSize='small' className='text-[#caa950]' /></span>Trevaliglia 1, Bold</p>
                                    <div className='my-[25px]'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-[8px]'>
                                                <ImageComponent width={500} height={500} alt='sqft' src='/assets/sqft-icon.svg' className='w-[18px] h-[18px]' />
                                                <p className='text-[16px] font-semibold text-[#333]'>{item?.sqft}<span className='text-[#757575] font-medium'> sqft</span></p>
                                            </div>
                                            <div className='flex items-center gap-[8px]'>
                                                <ImageComponent width={500} height={500} alt='bed' src='/assets/bed-icon.svg' className='w-[18px] h-[18px]' />
                                                <p className='text-[16px] font-semibold text-[#333]'>{item?.bed}<span className='text-[#757575] font-medium'> bed</span></p>
                                            </div>
                                            <div className='flex items-center gap-[8px]'>
                                                <ImageComponent width={500} height={500} alt='bath' src='/assets/bath-icon.svg' className='w-[18px] h-[18px]' />
                                                <p className='text-[16px] font-semibold text-[#333]'>{item?.bath}<span className='text-[#757575] font-medium'> bath</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center py-[20px] justify-between border-t border-b border-[#fff] border-dashed'>
                                        <p className='text-[25px] text-[#333] font-semibold'>${item?.amount}</p>
                                        <Link href='/detail' className='group bg-[#0c1a27] group-hover:bg-[#fff] cursor-pointer p-[5px]'>
                                            <CallMadeIcon fontSize='medium' className='text-[#fff] group-hover:text-[#0c1a27]' />
                                        </Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </>
    );
}
