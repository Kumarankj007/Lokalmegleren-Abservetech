/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
// import ImageComponent from "../components/image";
// import CallMadeIcon from '@mui/icons-material/CallMade';
// import PlaceIcon from '@mui/icons-material/Place';
import GetBrokersList from "../api/get/brokerlist";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@mui/material";
import { getInitial, stringToColor } from "../helper/utils";


export default function BrokerList() {
    const { brokersList, FetchBrokersList }: any = GetBrokersList()
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ["Brokers"];
    const searchParams: any = useSearchParams();
    const departmentId: any = searchParams.get('id');
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

    // const brokerData: any = [
    //     {
    //         image: '/assets/broker1.jpeg',
    //         name: 'Christopher Eastwood',
    //         role: 'Managing Director / Real Estate Agent MNEF / Partner',
    //         email: 'k.eastwood@nordvikbolig.no',
    //         phone: '485 02 050'
    //     },
    //     {
    //         image: '/assets/broker2.jpeg',
    //         name: 'Christopher Eastwood',
    //         role: 'Managing Director / Real Estate Agent MNEF / Partner',
    //         email: 'k.eastwood@nordvikbolig.no',
    //         phone: '485 02 050'
    //     },
    //     {
    //         image: '/assets/broker3.jpeg',
    //         name: 'Christopher Eastwood',
    //         role: 'Managing Director / Real Estate Agent MNEF / Partner',
    //         email: 'k.eastwood@nordvikbolig.no',
    //         phone: '485 02 050'
    //     },
    //     {
    //         image: '/assets/broker4.jpeg',
    //         name: 'Christopher Eastwood',
    //         role: 'Managing Director / Real Estate Agent MNEF / Partner',
    //         email: 'k.eastwood@nordvikbolig.no',
    //         phone: '485 02 050'
    //     },
    //     {
    //         image: '/assets/broker5.jpeg',
    //         name: 'Christopher Eastwood',
    //         role: 'Managing Director / Real Estate Agent MNEF / Partner',
    //         email: 'k.eastwood@nordvikbolig.no',
    //         phone: '485 02 050'
    //     },
    //     {
    //         image: '/assets/broker6.jpeg',
    //         name: 'Christopher Eastwood',
    //         role: 'Managing Director / Real Estate Agent MNEF / Partner',
    //         email: 'k.eastwood@nordvikbolig.no',
    //         phone: '485 02 050'
    //     }
    // ]

    useEffect(() => {
        FetchBrokersList({ tenantId: '381', departmentId })
    }, [FetchBrokersList, departmentId])

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
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px] mx-auto">
                                {brokersList.map((item: any, index: any) => (
                                    <Link key={index} href={`/brokerDetails?id=${item?.id}&depId=${item?.avdelingsId}`} className='bg-[#fff] border-2 border-[#f7f7f7] rounded-[10px] px-[25px] py-[40px] shadow-md flex flex-col justify-center items-center'>
                                        {/* <ImageComponent alt='blog-images' src='/assets/broker1.jpeg' width={500} height={500} className='mb-[20px] w-[180px] h-[180px] rounded-full object-cover' /> */}
                                        <Avatar sx={{ width: 180, height: 180, fontSize:50, bgcolor: stringToColor(item?.navn || ''), marginBottom:'20px'}}>{getInitial(item?.navn)}</Avatar>
                                        <div className="flex flex-col gap-[10px] mb-auto">
                                            <p className="text-[25px] text-[#000] leading-[30px] font-medium text-center">{item?.navn}</p>
                                            <p className="text-[16px] text-[#757575] text-center font-medium mb-[8px]">{item?.stilling || item?.kompetanse}</p>
                                            <p className="text-[18px] text-[#333] text-center font-medium hover:underline">{item?.email}</p>
                                            <p className="text-[18px] text-[#333] text-center font-medium hover:underline">{item?.mobiltelefon}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        }
                        {/* {activeTab === 1 &&
                            <div className="grid md:grid-cols-2 gap-[30px]">
                                {propertyData?.map((item: any, index: any) => (
                                    <Link href='/detail' key={index} className="group flex flex-col rounded-[10px] cursor-pointer p-[10px]">
                                        <div className="relative">
                                            <ImageComponent width={500} height={500} alt="house-image" src={item?.image} className="w-full md:h-[300px] lg:h-[450px]" />
                                        </div>
                                        <p className="text-[20px] group-hover:text-[#18344e] text-[#333] font-bold mt-[10px] mb-[6px]">{item?.name}</p>
                                        <p className="text-[18px] text-[#757575] mt-auto font-medium"><span><PlaceIcon fontSize='small' className='text-[#caa950]' /></span>Trevaliglia 1, Bold</p>
                                        <div className='my-[25px]'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-[8px]'>
                                                    <ImageComponent width={500} height={500} alt='sqft' src='/assets/sqft-icon.svg' className='w-[18px] h-[18px]' />
                                                    <p className='text-[18px] font-semibold text-[#333]'>{item?.sqft}<span className='text-[#757575] font-medium'> sqft</span></p>
                                                </div>
                                                <div className='flex items-center gap-[8px]'>
                                                    <ImageComponent width={500} height={500} alt='bed' src='/assets/bed-icon.svg' className='w-[18px] h-[18px]' />
                                                    <p className='text-[18px] font-semibold text-[#333]'>{item?.bed}<span className='text-[#757575] font-medium'> bed</span></p>
                                                </div>
                                                <div className='flex items-center gap-[8px]'>
                                                    <ImageComponent width={500} height={500} alt='bath' src='/assets/bath-icon.svg' className='w-[18px] h-[18px]' />
                                                    <p className='text-[18px] font-semibold text-[#333]'>{item?.bath}<span className='text-[#757575] font-medium'> bath</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex items-center py-[20px] justify-between border-t border-b border-[#333] border-dashed'>
                                            <p className='text-[25px] text-[#333] font-semibold'>${item?.amount}</p>
                                            <Link href='/detail' className='group bg-[#0c1a27] group-hover:bg-[#caa950] cursor-pointer p-[5px]'>
                                                <CallMadeIcon fontSize='medium' className='text-[#fff] group-hover:text-[#0c1a27]' />
                                            </Link>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        } */}
                    </div>
                </div>
            </section>
        </>
    );
}
