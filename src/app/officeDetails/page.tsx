"use client";
import dynamic from 'next/dynamic';

const Banner = dynamic(() => import('./header'), { ssr: false });

export default function OfficeDetailsPage() {
    return (
        <div>
            <Banner />
        </div>
    );
}
