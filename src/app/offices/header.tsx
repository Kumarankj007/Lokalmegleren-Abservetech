
"use client";
import SearchIcon from '@mui/icons-material/Search';
import ImageComponent from '../components/image';

export default function Banner() {
    return (
        <>
            <section className="relative w-full h-[400px] sm:h-[70vh] md:h-[80vh] lg:h-[100vh]">
                <ImageComponent
                    alt="background-image"
                    src="/assets/room9.jpg"
                    fill
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute w-full sm:w-auto mt-[40px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center px-4">
                    <p className="text-white font-bold text-center text-[30px] sm:text-[40px] md:text-[60px] lg:text-[80px] leading-[1.1]">
                        Offices & Brokers
                    </p>
                    <div className="h-[50px] md:h-[70px] mt-[30px] w-full flex items-center rounded-full bg-[#fff]">
                        <input placeholder="Search offices and brokers" className="h-[40px] w-[92%] px-[20px] text-[#000] text-[18px] border-none outline-none rounded-full placeholder-gray-500" />
                        <SearchIcon className="text-[#18344e] md:text-[60px]" />
                    </div>
                </div>
            </section>
        </>
    );
}
