/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import Rating from '@mui/material/Rating';
import Link from 'next/link';
import ImageComponent from '../components/image';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
// import GetCompanyDetail from '../api/get/comapnyDetail';
import GetBrokerDetail from '../api/get/brokerdetail';
import GetEmployeeProfile from '../api/get/employeeProfile';
import { Avatar } from '@mui/material';

export default function Banner() {
    // const { companyDetail, FetchCompanyDetail }: any = GetCompanyDetail()
    const { brokerDetail, FetchBrokerDetail }: any = GetBrokerDetail()
    const { employeeProfile, FetchEmployeeProfile }: any = GetEmployeeProfile()
    const searchParams: any = useSearchParams();
    const brokerId: any = searchParams.get('id');
    const deptId: any = searchParams.get('depId');

    const getInitial = (name: any) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    function stringToColor(string: any) {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += ('00' + value.toString(16)).slice(-2);
        }
        return color;
    }

    useEffect(() => {
        FetchBrokerDetail(brokerId, { tenantId: '381', departmentId: deptId });
        FetchEmployeeProfile({ tenantId: '381', employeeId: brokerId });
    }, [FetchBrokerDetail, FetchEmployeeProfile, brokerId, deptId]);

    return (
        <>
            <section className='bg-[#fff] mt-[90px]'>
                <div className="max-w-[1300px] px-[20px] py-[50px] mx-auto gap-y-[30px] grid grid-cols-1 lg:grid-cols-2 items-center">
                    <div className="flex flex-col">
                        <p className="text-[40px] text-[#333] font-bold leading-[50px]">{brokerDetail.navn}</p>
                        {/* <div className="flex flex-col gap-[8px]">
                            <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly />
                            <p className="text-[16px] font-semibold text-[#333]">4.85 ( 75 reviews)</p>
                        </div>
                        <p className='text-[18px] leading-[30px] font-medium text-[#333] w-full lg:max-w-[550px] my-[20px]'>
                            Nordvik is the real estate agent for you who know what it&apos;s worth, and values ​​knowledge, trust and security when you&apos;re selling or buying. We know all of Sørlandet well, and know what homebuyers in these areas are concerned about when choosing their new home. Through our digital solutions, we create the interest you need from your home in completely new ways, adapted to the digital media people use in their home search.
                        </p> */}
                        {/* <Link href='' className='text-[16px] text-[#757575] font-semibold hover:underline'>Kirkegaten 5, 4836 ARENDAL</Link> */}
                        <p className='text-[18px] text-[#333] font-semibold'>{brokerDetail?.kompetanse}</p>
                        <Link href='mailto:email' className='text-[18px] my-[5px] text-[#757575] font-semibold hover:underline'>{brokerDetail.email}</Link>
                        <Link href='tel:480 03 992' className='text-[18px] text-[#757575] font-semibold hover:underline'>{brokerDetail?.mobiltelefon}</Link>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-[25px] mt-[15px] mr-auto'>
                            <Link href='/selling-a-home' className='bg-[#caa950] h-[40px] flex items-center cursor-pointer rounded-full px-[15px] text-[16px] text-[#fff] font-bold'>
                                Make an appointment
                            </Link>
                            <Link href='/orderValuation' className='bg-[#caa950] h-[40px] flex items-center cursor-pointer rounded-full px-[15px] text-[16px] text-[#fff] font-bold'>
                                Order valuation
                            </Link>
                        </div>
                    </div>
                    <div className='mx-auto'>
                        {employeeProfile ?
                            <ImageComponent alt='broker' src={employeeProfile} width={500} height={500} className='w-[300px] md:w-[400px] h-[300px] md:h-[400px] object-cover' />
                            :
                            <Avatar sx={{ width:{xs:300, md:400}, height: {xs:300, md:400}, fontSize: 50, bgcolor: stringToColor(brokerDetail?.navn || ''), marginBottom: '20px' }}>{getInitial(brokerDetail?.navn)}</Avatar>
                        }
                    </div>
                </div>
            </section >
        </>
    );
}
