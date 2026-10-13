/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import InputCard from "../components/InputCard";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import GetContact from "../api/get/contactUs";
import useSnackbarStore from "../store/toaster";
import { useState } from "react";

const fonts = {
  title:
    " lg:text-[60px] md:text-[50px] sm:text-[40px] text-[33px] font-normal  ",
  head: " lg:text-[36px] md:text-[30px] text-[25px] font-normal ",
  subHead: " lg:text-[20px] text-[18px] font-semibold ",
  abtP: " lg:text-[30px] sm:text-[20px] text-[18px] font-normal text-white ",
  pFont: " md:text-[18px] text-[16px] ",
};

const KontaktMegler = () => {
  const { FetchContactUs }: any = GetContact();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [send, setSend] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm();
  // const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const submit = async (e: any) => {
    const res = await FetchContactUs({
      ...e,
      to: "backoffice@lokalmegleren.no",
    });
    if (res?.data) {
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
    <section className="bg-[#e2cf9e] md:py-20 py-7">
      <div className="md:border border-gray-500">
        <div className="max-w-[1300px] mx-auto flex flex-wrap ">
          {/* lft */}
          <div className="md:w-1/2 w-full md:p-10 xs:p-5 p-3 md:border-r border-gray-500">
            <h2 className={fonts?.head}>
              Skal du selge eller trenger en verdivurdering? Bestill en megler
              for en uforpliktende prat
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
                  Sende inn
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      {/* Kontakt Info */}
      <div className="max-w-[1300px] mx-auto md:px-10 sm:px-5 px-3 flex flex-wrap md:mt-14 mt-7 gap-y-7">
        {/* lft */}
        <div className="md:w-1/2 w-full">
          <p className={fonts?.head + "mb-4"}>Kontakt Info</p>
          <div className="flex flex-col gap-[5px] text-left">
            <p className={fonts?.pFont}>
              <a
                className=" hover:underline cursor-pointer"
                href="tel:32 82 25 00"
              >
                32 82 25 00
              </a>
            </p>
            <p className={fonts?.pFont}>Hagaløkkveien 13, 1383 Asker</p>
            <p className={fonts?.pFont}>
              <a
                className=" hover:underline cursor-pointer"
                href="mailto:backoffice@lokalmegleren.no"
              >
                backoffice@lokalmegleren.no
              </a>
            </p>
            <p className={fonts?.pFont}>
              <a
                className=" hover:underline cursor-pointer"
                href="https://lokalmegleren.no/"
              >
                lokalmegleren.no
              </a>
            </p>
          </div>
        </div>
        {/* ryt */}
        <div className="md:w-1/2 w-full">
          <LoadScript googleMapsApiKey="AIzaSyDZ3xBwFg3RHF6w016dMH_kIUrRRqcYfgo">
            <div className="w-full md:h-[500px] h-[400px]">
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "100%",
                }}
                center={{
                  lat: 59.7436032,
                  lng: 10.2074904,
                }}
                zoom={17}
              >
                <MarkerF
                  position={{
                    lat: 59.7436032,
                    lng: 10.2074904,
                  }}
                  title="Property"
                />
              </GoogleMap>
            </div>
          </LoadScript>
        </div>
      </div>
    </section>
  );
};

export default KontaktMegler;
