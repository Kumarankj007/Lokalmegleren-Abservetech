'use client'
import Image from 'next/image';
import { useTheme } from "next-themes";

const ShortLogo = () => {
    const { theme: mode } = useTheme();
  return (
    <div>
      <Image
        // src={
        //   mode === "light"
        //     ? "/images/logo/logo-c-white.svg"
        //     : "/images/logo/logo-c2.svg"
        // }
        src={"/logo.png"}
        alt="short-logo"
        width={300}
        height={300}
        className=" w-10 "
      />
    </div>
  );
}

export default ShortLogo;