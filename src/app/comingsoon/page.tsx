"use client";
import ImageComponent from "../components/image";
import Link from 'next/link';

const Comingsoon = () => {

    return (
        <>
        <section className='bg-[#fff] flex flex-col items-center justify-center py-[100px]'>
        <ImageComponent width={500} height={500} alt="logo-image" src="/assets/comingsoon.png" className="w-[300px] sm:w-[400px] h-auto" />
        <Link href="/" className="text-[18px] mb-[50px] flex items-center font-semibold bg-[#18344E] text-[#fff] rounded-[5px] px-[20px] h-[40px]">
            Back to home
        </Link>
        </section>
        </>
    );
};

export default Comingsoon;
