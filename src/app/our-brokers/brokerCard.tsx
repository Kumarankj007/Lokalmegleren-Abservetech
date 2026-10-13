/* eslint-disable react-hooks/exhaustive-deps */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import GetEmployeeProfile from "../api/get/employeeProfile";
import ImageComponent from "../components/image";
import { Avatar, Skeleton } from "@mui/material";
import { getInitial, stringToColor } from "../helper/utils";
import Link from "next/link";

const fonts: Record<"head" | "name" | "role" | "pFont", string> = {
  head: " md:text-[40px] md:text-[35px] text-[27px] font-semibold ",
  name: " md:text-[24px] md:text-[20px] text-[18px] font-semibold ",
  role: " lg:text-[20px] md:text-[18px] text-[16px] lg:font-semibold font-normal ",
  pFont: " md:text-[16px] text-[14px] font-normal ",
};
export default function BrokerCard({
  id,
  navn,
  kompetanse,
  email,
  mobiltelefon,
}: {
  id: number;
  navn?: string;
  kompetanse?: string;
  email?: string;
  mobiltelefon?: string;
}) {
  const [load, setLoad] = useState<boolean>(false);
  const [employeeProfile, setEmployeeProfile] = useState<string>("");
  const { FetchEmployeeProfile }: any = GetEmployeeProfile();
  useEffect(() => {
    (async () => {
      setLoad(true);
      const res = await FetchEmployeeProfile({
        tenantId: "381",
        employeeId: id,
      });
      setEmployeeProfile(res);
      setLoad(false);
    })();
  }, []);

  return (
    <div className="xl:w-[32%] md:w-[31%] sm:w-[48%] w-full">
      <Link
        href={`/kontakt-megler?id=${id}`}
        className="block sm:w-full xs:w-4/5 mx-auto aspect-[1] mb-5 md:rounded-4xl rounded-2xl overflow-hidden"
      >
        {load ? (
          <Skeleton
            variant="rectangular"
            height="470px"
            className="h-full w-full"
          ></Skeleton>
        ) : employeeProfile && employeeProfile?.length > 0 ? (
          <ImageComponent
            width={500}
            height={500}
            alt="employeeprofile"
            src={employeeProfile}
            className="object-cover hover:scale-110 h-full w-full"
          />
        ) : (
          <div className=" hover:scale-100 scale-95 h-full w-full">
            <Avatar
              sx={{
                width: "100%",
                height: "100%",
                aspectRatio: 1,
                fontSize: 120,
                bgcolor: stringToColor(navn || ""),
                marginBottom: "20px",
              }}
            >
              {getInitial(navn)}
            </Avatar>
          </div>
        )}
      </Link>
      <strong className={fonts?.name + " block"}>{navn}</strong>
      <strong className={fonts?.role + " block break-words"}>
        {kompetanse}
      </strong>
      <p className={fonts?.pFont + " text-[#313131] mt-5"}>
        Telefon :{" "}
        <a href={"tel:" + mobiltelefon} className="hover:underline">
          {mobiltelefon}
        </a>
      </p>
      <p className={fonts?.pFont + " text-[#313131]"}>
        E-post :{" "}
        <Link href={"mailto:" + email} className="hover:underline">
          {email}
        </Link>
      </p>
      <p className={fonts?.pFont + " text-[#313131]"}>
        <Link href={`/kontakt-megler?id=${id}`} className="inline-block text-center mt-4 px-7 py-2 md:text-[20px] text-sm rounded-md blue_btn">
          Les mer
        </Link>
      </p>
    </div>
  );
}
