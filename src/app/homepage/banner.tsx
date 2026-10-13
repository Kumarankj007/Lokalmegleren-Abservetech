"use client";
import ImageComponent from "../components/image";

const fonts = {
  head: " mb-5 lg:text-[60px] md:text-[50px] sm:text-[40px] text-[33px] font-normal text-[#111] ",
  pFont: " md:text-[16px] text-[14px] font-normal text-[#313131] ",
};

interface BannerProps {
  banner?: {
    title?: string;
    img?: string;
    disc?: string[];
  };
}

export default function Banner({ banner }: BannerProps) {
  return (
    <>
      <section className="w-full mb-10">
        <div className="max-w-[1500px] mx-auto md:px-10 sm:px-5 px-3 my-10">
          {banner?.title && (
            <h2 className={`${fonts.head} text-center`}>{banner.title}</h2>
          )}
          {Array.isArray(banner?.disc) &&
            banner.disc.map((item, ind) => (
              <p key={ind} className={`${fonts.pFont} text-center mb-3`}>
                {item}
              </p>
            ))}
        </div>

        {banner?.img && banner.img !== "" && (
          <ImageComponent
            alt="background-image"
            src={banner.img}
            /* This is the LCP element: full-bleed, so it must be requested at
               viewport width - 500px was upscaled and blurry. */
            width={1920}
            height={1080}
            sizes="100vw"
            priority
            className="w-full object-cover h-[400px] sm:h-[70vh] md:h-[80vh] lg:object-center object-right"
          />
        )}

        {/* <div className="absolute mt-[40px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center px-4">
                    <motion.p
                        initial={{ opacity: 0, y: 50 }} // Starts lower
                        animate={{ opacity: 1, y: 0 }}  // Moves up
                        transition={{ duration: 0.8, ease: "easeOut" }} // Smooth transition
                        className="text-white font-[500] text-center text-[30px] sm:text-[40px] md:text-[60px] lg:text-[80px] xl:text-[100px] leading-[1.1]"
                    >
                        We know what it&apos;s worth
                    </motion.p>
                    <div className="flex items-center justify-center gap-[20px] mt-[20px]">
                        <Link href='/selling-a-home' className="bg-[#18344e] w-[150px] whitespace-nowrap cursor-pointer px-[20px] h-[50px] text-[16px] sm:text-[18px] text-[#fff] font-semibold rounded-full flex items-center justify-center">
                            Selling a home
                        </Link>
                        <Link href='/orderValuation' className="bg-[#18344e] w-[150px] whitespace-nowrap cursor-pointer px-[20px] h-[50px] text-[16px] sm:text-[18px] text-[#fff] font-semibold rounded-full flex items-center justify-center">
                            Valuation
                        </Link>
                    </div>
                    <div className="h-[50px] md:h-[70px] mt-[30px] w-full flex items-center rounded-full bg-[#fff]">
                        <input placeholder="Search offices and brokers" className="h-[40px] w-[92%] px-[20px] text-[#000] text-[18px] border-none outline-none rounded-full placeholder-gray-500" />
                        <SearchIcon className="text-[#18344e] md:text-[60px]" />
                    </div>
                </div> */}
      </section>
    </>
  );
}
