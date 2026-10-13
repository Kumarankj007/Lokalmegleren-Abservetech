"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import GetBrokersList from "../api/get/brokerlist";
import BrokerCard from "./brokerCard";

const fonts = {
  head: " md:text-[40px] md:text-[35px] text-[27px] font-semibold ",
  name: " mb-7 md:text-[24px] md:text-[20px] text-[18px] font-semibold ",
  role: " mb-7 md:text-[20px] md:text-[18px] text-[16px] font-semibold ",
  pFont: " md:text-[16px] text-[14px] font-normal ",
};
export default function Brokers() {
  const { brokersList, FetchBrokersList }: any = GetBrokersList();
  useEffect(() => {
    FetchBrokersList({ tenantId: "381", departmentId: "3000003" });
  }, [FetchBrokersList]);
  return (
    <div className="bg-[#e2cf9e] py-10">
      <div className="max-w-[1500px] mx-auto md:px-10 px-5">
        <h2 className={fonts?.head + "text-center md:mb-7 mb-3 "}>Våre meglere</h2>
        <p className={fonts?.pFont + "text-center md:mb-20 mb-8"}>
          Vi anvender de samme portrettbildene som benyttes i meglerens sosiale
          medier-kanaler, for å sikre gjenkjennelse og enhetlig profilering.
        </p>
        <section className="flex flex-wrap gap-x-6 md:gap-y-20 gap-y-10 items-start justify-evenly">
          {Array.isArray(brokersList) &&
            brokersList?.length > 0 &&
            brokersList?.map(
              (
                item: {
                  id: number;
                  navn: string;
                  kompetanse: string;
                  email: string;
                  mobiltelefon: string;
                  inaktiv:boolean;
                },
                ind: number
              ) => !item?.inaktiv && (
                <BrokerCard
                  key={ind}
                  id={item.id}
                  navn={item.navn}
                  kompetanse={item.kompetanse}
                  email={item?.email}
                  mobiltelefon={item?.mobiltelefon}
                />
              )
            )}
        </section>
      </div>
    </div>
  );
}
