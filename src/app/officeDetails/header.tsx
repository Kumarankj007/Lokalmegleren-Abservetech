/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import Rating from '@mui/material/Rating';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import ImageComponent from '../components/image';
import BrokerList from './brokerList';
import GetCompanyDetail from '../api/get/comapnyDetail';
import { useSearchParams } from 'next/navigation';

export default function Banner() {
    const { companyDetail, FetchCompanyDetail }: any = GetCompanyDetail()
    const searchParams: any = useSearchParams();
    const departmentId: any = searchParams.get('id');
    const swiperRef = useRef(null);

    const scrollToSection = (sectionId: string, offset: number = 90) => {
        const target = document.getElementById(sectionId);
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
    };

    const brokersData = [
        { image: '/assets/broker1.jpeg' },
        { image: '/assets/broker2.jpeg' },
        { image: '/assets/broker3.jpeg' },
        { image: '/assets/broker4.jpeg' },
        { image: '/assets/broker5.jpeg' },
        { image: '/assets/broker6.jpeg' },
    ]

    useEffect(() => {
        FetchCompanyDetail(departmentId, { tenantId: '381' })
    }, [FetchCompanyDetail, departmentId])

    return (
        <>
            <section className='bg-[#fff] mt-[90px]'>
                <div className="max-w-[1300px] px-[20px] py-[50px] mx-auto gap-y-[30px] grid grid-cols-1 lg:grid-cols-2 items-center">
                    <div className="flex flex-col">
                        <p className="text-[40px] text-[#333] font-bold">{companyDetail?.navn}</p>
                        {/* <div className="flex flex-col gap-[8px]">
                            <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly />
                            <p className="text-[16px] font-semibold text-[#333]">4.85 ( 75 reviews)</p>
                        </div>
                        <p className='text-[18px] leading-[30px] font-medium text-[#333] w-full lg:max-w-[550px] my-[20px]'>
                            Nordvik is the real estate agent for you who know what it&apos;s worth, and values ​​knowledge, trust and security when you&apos;re selling or buying. We know all of Sørlandet well, and know what homebuyers in these areas are concerned about when choosing their new home. Through our digital solutions, we create the interest you need from your home in completely new ways, adapted to the digital media people use in their home search.
                        </p> */}
                        <Link href='' className='text-[16px] text-[#757575] font-semibold hover:underline'>{companyDetail?.adresse?.besoksadresse}</Link>
                        <Link href='mailto:email' className='text-[16px] my-[5px] text-[#757575] font-semibold hover:underline'>{companyDetail?.email}</Link>
                        <Link href='tel:480 03 992' className='text-[16px] text-[#757575] font-semibold hover:underline'>{companyDetail?.telefon}</Link>
                    </div>
                    <div className='flex flex-col gap-[20px] lg:pl-[30px]'>
                        <div className=''>
                            <p className='text-[15px] text-[#caa950] font-bold'>Selling a home?</p>
                            <p className='text-[22px] text-[#333] font-medium'>How we help you make a good sale</p>
                            <Link href='/selling-a-home' className='bg-[#caa950] mt-[10px] h-[40px] max-w-[190px] cursor-pointer flex items-center justify-center rounded-full px-[15px] text-[16px] text-[#fff] font-bold'>
                                Make an appointment
                            </Link>
                        </div>
                        <div className=''>
                            <p className='text-[15px] text-[#caa950] font-bold'>Valuation</p>
                            <p className='text-[22px] text-[#333] font-medium'>We help you see opportunities in your home</p>
                            <Link href='/orderValuation' className='bg-[#caa950] mt-[10px] h-[40px] max-w-[150px] cursor-pointer flex items-center justify-center rounded-full px-[15px] text-[16px] text-[#fff] font-bold'>
                                Order valuation
                            </Link>
                        </div>
                        <div onClick={() => scrollToSection("target-section", 90)}
                            className="bg-[#e2cf9e] w-full h-[170px] flex items-center justify-between cursor-pointer">
                            <div className="flex flex-col gap-[8px] p-[20px]">
                                <p className="text-[14px] text-[#18344e] w-[100px] sm:w-[200px] font-semibold">Talent and experience</p>
                                <p className="text-[22px] text-[#18344e] w-[100px] sm:w-[200px] font-semibold">Find your broker</p>
                            </div>
                            <Swiper
                                onSwiper={(swiper: any) => (swiperRef.current = swiper)}
                                slidesPerView="auto"
                                effect="fade"
                                fadeEffect={{ crossFade: true }}
                                autoplay={{ delay: 1500, disableOnInteraction: false }}
                                loop={true}
                                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                                className=""
                            >
                                {brokersData?.map((item: any, index: any) => (
                                    <SwiperSlide key={index}>
                                        <ImageComponent
                                            alt="broker-image"
                                            src={item?.image}
                                            width={500}
                                            height={500}
                                            className="w-[170px] h-[170px] ml-auto object-cover"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </section>
            <div id="target-section">
                <BrokerList />
            </div>
        </>
    );
}
