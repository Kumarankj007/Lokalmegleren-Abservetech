"use client";
import dynamic from 'next/dynamic';

const Banner = dynamic(() => import('./banner'), { ssr: false });
const HomesForSale = dynamic(() => import('./homeSale'), { ssr: false });

export default function Home() {
    return (
        <>
            <Banner />
            <HomesForSale/>
        </>
    );
}
