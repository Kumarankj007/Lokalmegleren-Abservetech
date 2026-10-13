"use client";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import Link from "next/link";
import ImageComponent from "./image";
import ContactBtn from "./contactBtn";
import { usePathname } from "next/navigation";

const Footer = () => {
    const pathname = usePathname();
  // const menuItems = [
  //     { label: "Bolig", path: "/housing" },
  //     { label: "Selger bolig", path: "/selling-a-home" },
  //     { label: "Kontorer", path: "/offices" },
  // ];

  const socialLinks = {
    fb: "https://www.facebook.com/Lokalmegleren/",
    insta: "https://www.instagram.com/lokalmegleren1/",
    twitter: "",
  };

  const listingItems = [
    // { label: "Kjøp leiligheter"},
    // { label: "Lei hus"},
    // { label: "Lei industri"},
    // { label: "Kjøp villaer"},
    // { label: "Lei kontor"},
    { label: "Ledige stillinger", path: "/ledige-stillinger" },
    { label: "Boligstoff", path: "/boligstoff" },
    // { label: "Kontakt oss"},
    { label: "Om oss", path: "/about" },
    { label: "Våre meglere", path: "/our-brokers" },
    { label: "Eiendommer til salgs", path: "/housing" },
    // { label: "Personvern", path: "/personvernerkl-ringen" },
  ];
  const legalItems = [
    { label: "Vilkår og betingelser", path: "/terms" },
    { label: "Personvernerklæring", path: "/personvernerkl-ringen" },
    // { label: "Vanlige spørsmål"},
  ];

  if (pathname?.startsWith("/pdf-viewer")) return null;

  return (
    <>
      <section className="bg-[#18344e] md:p-[50px] p-5 px-2.5 ogFont">
        <div className="max-w-[1550px] mx-auto pl-0 lg:pl-[50px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:items-start items-center">
          <div className="flex flex-col md:items-start items-center">
            <Link href="/">
              <ImageComponent
                width={500}
                height={500}
                alt="logo-image"
                src="/assets/logo.png"
                className="h-[70px] w-[175px] cursor-pointer mb-3 object-contain"
              />
            </Link>
            <div className="flex flex-col gap-[5px] text-left md:items-start items-center">
              <p className="text-[18px] mb-3 font-medium hover:underline cursor-pointer text-[#fff]">
                <a href="tel:32 82 25 00">32 82 25 00</a>
              </p>
              <p className="text-[18px] mb-3 font-medium hover:underline cursor-pointer text-[#fff]">
                Hagaløkkveien 13, 1383 Asker
              </p>
              <p className="text-[18px] mb-3 font-medium hover:underline cursor-pointer text-[#fff]">
                <a href="mailto:backoffice@lokalmegleren.no">
                  backoffice@lokalmegleren.no
                </a>
              </p>
              <p className="text-[18px] mb-3 font-medium hover:underline cursor-pointer text-[#fff]">
                <a href="https://lokalmegleren.no/">lokalmegleren.no</a>
              </p>
            </div>
            {socialLinks && (
              <div className="flex items-center gap-[20px] my-[20px]">
                {socialLinks?.fb && socialLinks?.fb != "" && (
                  <Link href={socialLinks?.fb} target="_blank">
                    <FacebookIcon
                      fontSize="medium"
                      className="cursor-pointer text-[#fff]"
                    />
                  </Link>
                )}
                {socialLinks?.insta && socialLinks?.insta != "" && (
                  <Link href={socialLinks?.insta} target="_blank">
                    <InstagramIcon
                      fontSize="medium"
                      className="cursor-pointer text-[#fff]"
                    />
                  </Link>
                )}
                {socialLinks?.twitter && socialLinks?.twitter != "" && (
                  <Link href={socialLinks?.twitter} target="_blank">
                    <XIcon
                      fontSize="medium"
                      className="cursor-pointer text-[#fff]"
                    />
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col md:items-start items-center pl-0 md:pl-[20px] ">
            <p className="text-[30px] mb-[25px] text-[#fff] font-semibold">
              Hjem
            </p>
            <ul className="flex flex-col md:items-start items-center">
              {listingItems.map((item: any, index: any) => (
                <Link
                  key={index}
                  href={item?.path ? item?.path : "/comingsoon"}
                  className="text-[18px] font-medium hover:underline cursor-pointer mb-[20px] text-[#fff]"
                >
                  {item.label}
                </Link>
              ))}
            </ul>
          </div>
          {/* <div className="flex flex-col">
                        <p className="text-[30px] mb-[25px] text-[#fff] font-semibold">Links</p>
                        <ul className="flex flex-col">
                            {menuItems.map((item: any, index: any) => (
                                <Link key={index} href={item?.path} className="text-[18px] font-medium hover:underline cursor-pointer mb-[20px] text-[#fff]">
                                    {item.label}
                                </Link>
                            ))}
                        </ul>
                    </div> */}
          <div className="flex flex-col md:items-start items-center">
            <p className="text-[30px] mb-[25px] text-[#fff] font-semibold">
              Juridisk
            </p>
            {legalItems.map((item: any, index: any) => (
              <Link
                key={index}
                href={item?.path ? item?.path : "/comingsoon"}
                className="text-[18px] font-medium hover:underline cursor-pointer mb-[20px] text-[#fff]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col w-full">
            {/* <button className="w-full p-4 rounded-full bg-white text-[#183443] hover:text-white hover:bg-transparent duration-300 border border-[#fff] cursor-pointer hover:shadow-[0_0_15px_4px_#ffffff66] ">Kontakt oss</button> */}
            <ContactBtn />
          </div>
        </div>
        <div className="text-center bg-[#18344e] flex items-center justify-center pt-5">
          <p className="text-[18px] text-[#fff] font-semibold">
            Copyright @2025 lokalmeglern inc.
          </p>
        </div>
      </section>
    </>
  );
};

export default Footer;
