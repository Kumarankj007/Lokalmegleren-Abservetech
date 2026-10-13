/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import InputCard from "../components/InputCard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GetBrokerDetail from "../api/get/brokerdetail";
import GetEmployeeProfile from "../api/get/employeeProfile";
// import ImageComponent from "../components/image";
import GetBrokerDesc from "../api/get/brokerDesc";
import { Skeleton } from "@mui/material";
import GetContact from "../api/get/contactUs";
import useSnackbarStore from "../store/toaster";
// import { Checkbox } from "@mui/material";

const fonts = {
  title:
    " lg:text-[60px] md:text-[50px] sm:text-[40px] text-[33px] font-normal  ",
  head: " lg:text-[36px] md:text-[30px] text-[25px] font-normal ",
  subHead: " lg:text-[20px] text-[18px] font-semibold ",
  abtP: " lg:text-[30px] sm:text-[20px] text-[18px] font-normal text-white ",
  pFont: " md:text-[16px] text-[14px] ",
};

const KontaktMegler = () => {
  const { FetchContactUs }: any = GetContact();
  const [send, setSend] = useState<boolean>(false);
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const searchParams: any = useSearchParams();
  const { brokerDetail, FetchBrokerDetail }: any = GetBrokerDetail();
  const { brokerDesc, load, FetchBrokerDesc }: any = GetBrokerDesc();
  const { employeeProfile, FetchEmployeeProfile }: any = GetEmployeeProfile();
  const brokerId: any = searchParams.get("id");
  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm();
  // const label = { inputProps: { "aria-label": "Checkbox demo" } };

  useEffect(() => {
    FetchBrokerDetail(brokerId, { tenantId: "381", departmentId: 3000003 });
    FetchEmployeeProfile({ tenantId: "381", employeeId: brokerId });
  }, [brokerId]);

  useEffect(() => {
    FetchBrokerDesc();
  }, []);
  // console.log(brokerDesc, 'brokerDesc')
  // console.log(brokerDetail, 'brokerDetail')
  const submit = async (e: any) => {
    // console.log(e, "submit");
    if (brokerDetail?.email && brokerDetail?.email != "") {
      const res = await FetchContactUs({ ...e, to: brokerDetail?.email });
      if (res?.message == "Enquiry Sent Successfully") {
        // showSnackbar(
        //   "Takk for at du kontakter oss. Vi vil svare deg så raskt som mulig.",
        //   "success"
        // );
        setSend(true);
        reset();
      } else {
        if (res?.message && res?.message != "") {
          showSnackbar(res?.message, "error");
        } else {
          showSnackbar("Noe gikk galt", "error");
        }
      }
    }
  };

  return (
    <>
      <section className="bg-[#d6bc77] md:py-20 py-7 pb-10">
        {brokerDetail && (
          <div className="max-w-[1300px] mx-auto flex flex-wrap md:px-10 sm:px-5 px-3 ">
            {/* lft */}
            <div className="md:w-1/2 w-full py-14 md:pr-10">
              <strong className={fonts?.title + "block"}>
                {brokerDetail?.navn}
              </strong>
              <strong className={fonts?.subHead + " block break-words"}>
                {brokerDetail?.kompetanse}
              </strong>
              <p className={fonts?.pFont + " text-[#313131] mt-5"}>
                <a
                  href={"tel:" + brokerDetail?.mobiltelefon}
                  className="hover:underline"
                >
                  {brokerDetail?.mobiltelefon}
                </a>
              </p>
              <p className={fonts?.pFont + " text-[#313131]"}>
                <a
                  href={"mailto:" + brokerDetail?.email}
                  className="hover:underline"
                >
                  {brokerDetail?.email}
                </a>
              </p>
              {load
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="my-5">
                      <Skeleton
                        className={"w-full mb-2 rounded-md"}
                        variant="rectangular"
                        height="30px"
                      />
                    </div>
                  ))
                : brokerDesc &&
                  brokerDesc?.length > 0 &&
                  brokerDesc
                    ?.filter((item: any) => item.id == brokerId)
                    .map((item: any, ind: number) => (
                      <p
                        key={ind}
                        className={fonts?.pFont + " text-[#313131] pt-5"}
                      >
                        {item.description}
                      </p>
                    ))}
            </div>
            {/* ryt */}
            <div className="md:w-1/2 w-full">
              <img
                width={500}
                height={500}
                alt="employeeprofile"
                src={employeeProfile ||'/assets/errorImage.webp'}
                className="w-full mx-auto aspect-[1] mb-5 object-cover md:rounded-4xl rounded-2xl"
              />
              {/* <ImageComponent
              /> */}
            </div>
          </div>
        )}
      </section>
      <section className="bg-[#e2cf9e] md:py-20 py-7">
        <div className="">
          <div className="max-w-[1300px] mx-auto flex flex-wrap ">
            {/* lft */}
            <div className="md:w-1/2 w-full md:p-10 xs:p-5 p-3">
              <h2 className={fonts?.head}>
                Hei, jeg hjelper deg gjerne og er tilgjengelig for på svare på
                spørsmål. Fyll ut skjema, så kontakter jeg deg i løpet av kort
                tid!
              </h2>
            </div>
            {/* ryt */}
            <div
              className={
                (send ? "bg-white " : "") + "md:w-1/2 w-full md:p-10 xs:p-5 p-3"
              }
            >
              {send ? (
                <p className={fonts?.subHead + " md:my-14"}>
                  Takk for at du kontakter oss.
                  <span className="block">
                    Vi vil svare deg så raskt som mulig.
                  </span>
                </p>
              ) : (
                <form onSubmit={handleSubmit(submit)}>
                  <InputCard
                    name="firstName"
                    label="Fornavn"
                    placeholder="Skriv ditt fornavn"
                    required={true}
                    requiredMsg="Vennligst oppgi fornavn"
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[A-Za-z\s]+$/,
                      message: "Kun alfabetiske tegn er tillatt",
                    }}
                  />
                  <InputCard
                    name="lastName"
                    label="Etternavn"
                    placeholder="Skriv ditt etternavn"
                    required={true}
                    requiredMsg="Vennligst oppgi etternavn"
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[A-Za-z\s]+$/,
                      message: "Kun alfabetiske tegn er tillatt",
                    }}
                  />
                  <InputCard
                    name="postalCode"
                    label="Postnummer"
                    placeholder="Skriv ditt postnummer"
                    required={true}
                    requiredMsg="Vennligst oppgi et gyldig postnummer"
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[0-9]+$/,
                      message: "Bare tall er tillatt",
                    }}
                  />
                  <InputCard
                    name="email"
                    label="E-post"
                    placeholder="Skriv ditt e-post"
                    required={true}
                    requiredMsg="Vennligst oppgi e-post"
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Ugyldig e-postformat",
                    }}
                  />
                  <InputCard
                    name="phone"
                    label="Telefonnummer"
                    placeholder="Skriv ditt telefonnummer"
                    required={true}
                    requiredMsg="Vennligst oppgi telefonnummer"
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[0-9]+$/,
                      message: "Bare tall er tillatt",
                    }}
                  />
                  <InputCard
                    name="message"
                    label="Melding"
                    textarea={true}
                    placeholder="Fortell gjerne litt om deg"
                    required={false}
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[A-Za-z\s]+$/,
                      message: "Kun alfabetiske tegn er tillatt",
                    }}
                  />
                  <InputCard
                    name="termsAccepted"
                    required={false}
                    control={control}
                    errors={errors}
                    checkBox={true}
                    register={register}
                  />
                  <button
                    type="submit"
                    className={
                      fonts?.pFont +
                      "p-2 px-10 mx-auto text-center inline-block bg-[#fff] border-2 border-[#fff] rounded-full cursor-pointer hover:bg-transparent hover:text-[#fff] duration-200"
                    }
                  >
                    sende inn
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default KontaktMegler;
