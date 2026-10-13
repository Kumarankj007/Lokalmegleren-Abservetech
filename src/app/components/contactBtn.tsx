import Link from "next/link";
import React from "react";

export default function ContactBtn() {
  return (
    <Link
    href={'/contact'}
      className="w-full block text-center p-4 rounded-full bg-white text-[#183443] hover:text-white hover:bg-[#18344e] duration-300 border border-[#fff] cursor-pointer hover:shadow-[0_0_15px_4px_#ffffff66] "
    >
      Kontakt oss
    </Link>
  );
}
