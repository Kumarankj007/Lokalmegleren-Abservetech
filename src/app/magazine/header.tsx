"use client";
import ImageComponent from "../components/image";


export default function Header() {
    return (
        <>
            <section className="mt-[90px] pt-[50px] px-[20px] bg-[#fff]">
                <div className="max-w-[1400px] mx-auto">
                    <p className="text-[30px] sm:text-[50px] text-[#333] font-medium">Tips for home styling</p>
                    <p className="text-[16px] text-[#757575] font-medium mb-[30px]">— October 17, 2024</p>
                    <ImageComponent alt='blog-images' src='/assets/blog1.jpg' width={500} height={500} className='w-full h-[400px] sm:h-[500px] md:h-[700px] lg:h-[900px] object-cover' />
                    <div className="py-[30px] sm:py-[50px] flex flex-col gap-[20px] w-full md:max-w-[850px] mx-auto">
                        <p className="text-[25px] sm:text-[30px] lg:text-[40px] font-medium text-[#333] leading-[35px] sm:leading-[55px]">
                            “Buyers quickly scroll through dozens of real estate ads. It is crucial to capture their attention,” says Veronika Moen.
                        </p>
                        <p className="text-[25px] sm:text-[30px] lg:text-[40px] font-medium text-[#333] leading-[35px] sm:leading-[55px]">
                            She has been taking photos of Norwegian homes since 2006 and just published the book &quot; Sell with Style &quot; with tips for home styling.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
