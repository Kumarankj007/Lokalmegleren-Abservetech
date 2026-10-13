'use client'
import Image from 'next/image';
import { useTheme } from "next-themes";

const Logo = () => {
    const { theme: mode } = useTheme();
  return (
    <div>
      <Image
        src={"/logo.png"}
        alt="logo"
        width={100}
        height={100}
        className="object-contain"
      />
    </div>
  );
}

export default Logo;