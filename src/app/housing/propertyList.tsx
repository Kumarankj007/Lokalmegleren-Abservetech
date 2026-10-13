/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
// import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from "@mui/icons-material/Tune";
import PlaceIcon from "@mui/icons-material/Place";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import Link from "next/link";
import { Skeleton } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import Slider from "@mui/material/Slider";
// import FormGroup from '@mui/material/FormGroup';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
import ImageComponent from "../components/image";
import usePropertyStore from "../store/propertyStore";
import { getGoogleMapsUrl } from "../helper/utils";

export default function PropertyList() {
  const {
    propertyCache,
    propertyImagesCache,
    lastSortBy,
    loading,
    fetchAllPropertiesAndImages,
    propertiesprice,
    propertiesmaxBedroom,
  } = usePropertyStore();
  const properties = propertyCache[lastSortBy] || [];
  const propertyImages = propertyImagesCache[lastSortBy] || {};
  const [open, setOpen] = useState(false);
  const [roomValue, setRoomValue] = useState<number>(0);
  const [priceValue, setPriceValue] = useState([0, 0]);
  const [selectedType, setSelectedType] = useState("");
  const [sortedType, setSortedType] = useState("");
  const [location, setLocation] = useState("");
  const [reset, setReset] = useState(false);
  // console.log("sortedType", sortedType);
  // console.log("propertiesmaxBedroom", propertiesmaxBedroom);

  // initial & sorting call:
  useEffect(() => {
    const body: any = { tenantId: 381, employeeId: 3000004 };
    // if (selectedType && selectedType !== "") body.propertyType = selectedType;
    if (sortedType && sortedType !== "") body.sortBy = sortedType;

    fetchAllPropertiesAndImages(body);
  }, [sortedType]);

  const handleOpen = () => setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);
  const handleSelectedType = (e: any) => {
    setSelectedType(e.target.value);
  };

  const handleSortedType = (e: any) => {
    setSortedType(e.target.value);
  };

  const handlePrice = (event: any, newValue: number | number[]) => {
    setPriceValue(newValue as number[]);
  };

  const handleRoom = (event: any, newValue: number | number[]) => {
    setRoomValue(newValue as number);
  };

  const formatPrice = (price: number) => price.toLocaleString();

  // reset api call
  const handleReset = () => {
    setReset(false);
    setRoomValue(0);
    setPriceValue([0, 0]);
    setSortedType("");
    setSelectedType("");
    setLocation("");
    const body: any = {
      tenantId: 381,
      employeeId: 3000004,
    };
    handleClose();
    fetchAllPropertiesAndImages(body);
  };

  // filter api call:
  const handleSearch = (type = "filter") => {
    setReset(true);
    const body: any = {
      tenantId: 381,
      employeeId: 3000004,
    };
    if (roomValue) {
      body.bedroom = roomValue;
    }
    if (
      priceValue &&
      priceValue[0] >= 0 &&
      priceValue[1] < propertiesprice &&
      priceValue[1] != 0
    ) {
      body.minPrice = priceValue[0];
      body.maxPrice = priceValue[1] == 0 ? propertiesprice : priceValue[1];
    }
    if (selectedType) body.propertyType = selectedType;
    if (sortedType) body.sortBy = sortedType;
    if (location && location !== "") body.location = location;
    if (type == "filter") {
      handleClose();
    }
    fetchAllPropertiesAndImages(body);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // console.log("properties", properties);

  return (
    <>
      <section className="mt-0 bg-[#e2cf9e]">
        <div className="border-b border-[#18344e]/20">
          <h1 className="text-center text-[40px] sm:text-[50px] md:text-[60px] px-3 md:py-44 sm:py-30 py-14  uppercase text-[#18344e]">
            Eiendommer
          </h1>
        </div>

        <div className="grid border-b border-[#18344e]/20 grid-cols-1 md:grid-cols-[0.75fr_0.25fr]">
          <div className="py-4 px-5 flex flex-wrap justify-between items-center gap-4">
            <form
              className="flex items-center border-b border-[#ddd w-full sm:w-[300px] bg-white rounded-[50px] px-5 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch("search");
              }}
            >
              <input
                placeholder="Søk etter eiendom"
                className="placeholder-gray-500 w-full text-[16px] font-medium text-[#333] border-none outline-none h-10"
                type="search"
                enterKeyHint="search"
                onChange={(e) => {
                  setLocation(e?.target?.value);
                }}
                onBlur={() => {
                  // iPhone tick fallback
                  handleSearch("search");
                }}
                // onKeyDown={(e) => {
                //   if (e.key === "Enter") {
                //     handleSearch("search");
                //   }
                // }}
              />
              <RoomOutlinedIcon fontSize="medium" className="text-[#757575]" />

              {/* Required for iOS */}
              <button type="submit" hidden />
            </form>
            <p className="text-[18px] text-[#18344e] font-semibold">
              <span className="text-black">{properties?.length ?? 0}</span>{" "}
              eiendommer
            </p>
          </div>

          {/* <div className="border-t md:border-t-0 md:border-l border-[#18344e]/20 flex items-center justify-start md:justify-center gap-2 px-5 py-4">
            <select
              value={sortedType}
              onChange={handleSortedType}
              className="h-[40px] text-[18px] cursor-pointer text-[#18344e] font-semibold px-[15px] outline-none"
            >
              <option value="all" className="text-[#333] bg-[#fff]">Alle</option>
              <option value="publish" className="text-[#333] bg-[#fff]">Publisert</option>
              <option value="pricelh" className="text-[#333] bg-[#fff]">Pris lav-høy</option>
              <option value="pricehl" className="text-[#333] bg-[#fff]">Pris høy-lav</option>
            </select>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-[#18344e]/20 flex items-center justify-start md:justify-center gap-2 px-5 py-4">
            {roomValue !== 0 || priceValue[0] !== 0 ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-[10px] h-[60px] cursor-pointer text-[#333] font-semibold px-[15px] rounded-[5px]"
              >
                tilbakestille
                <SyncIcon fontSize="small" className="text-[#fff]" />
              </button>
            ) : (
              <button
                onClick={handleOpen}
                className="flex items-center gap-[10px] h-[60px] cursor-pointer text-[#333] font-semibold px-[15px] rounded-[5px]"
              >
                Filter
                <TuneIcon fontSize="small" className="text-[#333]" />
              </button>
            )}
          </div> */}
          <div className="flex sm:flex-nowrap flex-wrap flex-row border-t md:border-t-0 md:border-l border-[#18344e]/20">
            {/* Sort */}
            <div className="flex-1 flex items-center justify-start md:justify-center gap-2 px-5 py-4">
              <select
                value={sortedType}
                onChange={handleSortedType}
                className="h-10 text-[18px] cursor-pointer text-[#18344e] font-semibold px-[15px] outline-none"
              >
                <option value="all">Sorter</option>
                <option value="publish">Publisert</option>
                <option value="pricelh">Pris lav-høy</option>
                <option value="pricehl">Pris høy-lav</option>
              </select>
            </div>
            {reset && (
              <div className="flex-1 flex items-center justify-end md:justify-center border-l border-[#18344e]/20 gap-2 px-5 py-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2.5 h-10 text-[#333] font-semibold px-[15px] rounded-[5px] w-full justify-center"
                >
                  tilbakestille
                  <SyncIcon fontSize="small" className="text-white" />
                </button>
              </div>
            )}
            <div className="flex-1 flex items-center justify-center border-l border-[#18344e]/20 gap-2 px-5 py-4">
              <div className="">
                <button
                  onClick={handleOpen}
                  className="flex items-center gap-2.5 h-10 text-[#333] font-semibold px-[15px] rounded-[5px] w-full justify-center"
                >
                  Filter
                  <TuneIcon fontSize="small" className="text-[#333]" />
                </button>
                {open && false && (
                  <div
                    className={`absolute top-[60px] bottom-0 h-[500px] -right-5
                      ${
                        open ? "translate-x-0" : "translate-x-full"
                      } w-[300px] bg-[antiquewhite] z-1 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-[413px] md:bg-transparent md:z-auto overflow-y-auto block md:hidden`}
                  >
                    <div className="flex flex-col gap-[15px] border-l border-[#898181]">
                      <div className="px-8 py-7 border-b border-[#898181]">
                        <div className="flex justify-between items-center">
                          <p className="text-[18px] font-semibold text-[#333]">
                            Pris
                          </p>
                          <p className="text-[14px] font-semibold text-[#757575]">
                            {priceValue[0] === 0 && priceValue[1] === 0
                              ? `${formatPrice(priceValue[1])}`
                              : `${formatPrice(priceValue[0])} - ${formatPrice(
                                  priceValue[1],
                                )}`}
                          </p>
                        </div>
                        <div className="px-2.5">
                          <Slider
                            sx={{
                              color: "#18344e",
                              "& .MuiSlider-thumb": {
                                backgroundColor: "#fff",
                                borderColor: "#000",
                                borderWidth: 1,
                                width: 17,
                                height: 17,
                              },
                              "& .MuiSlider-track": {
                                backgroundColor: "#18344e",
                                height: 2,
                              },
                              "& .MuiSlider-rail": {
                                backgroundColor: "#000",
                                height: 2,
                              },
                            }}
                            min={10000}
                            max={propertiesprice}
                            step={10000}
                            value={priceValue}
                            onChange={handlePrice}
                            valueLabelDisplay="auto"
                          />
                        </div>
                      </div>
                      <div className="px-8 py-7 border-b border-[#898181]">
                        <div className="flex justify-between items-center">
                          <p className="text-[18px] font-semibold text-[#333]">
                            Antail soverom
                          </p>
                          <p className="text-[14px] font-semibold text-[#757575]">
                            {roomValue}
                          </p>
                        </div>
                        <div className="px-2.5">
                          <Slider
                            sx={{
                              color: "#18344e",
                              "& .MuiSlider-thumb": {
                                backgroundColor: "#fff",
                                borderColor: "#000",
                                borderWidth: 1,
                                width: 17,
                                height: 17,
                              },
                              "& .MuiSlider-track": {
                                backgroundColor: "#000",
                                height: 2,
                              },
                              "& .MuiSlider-rail": {
                                backgroundColor: "#000",
                                height: 2,
                              },
                            }}
                            value={roomValue}
                            onChange={handleRoom}
                            valueLabelDisplay="auto"
                            min={1}
                            max={propertiesmaxBedroom || 10}
                          />
                        </div>
                      </div>
                      <div className="px-8 py-7 border-b border-[#898181]">
                        <select
                          value={selectedType}
                          onChange={handleSelectedType}
                          className="h-10 border-none outline-none w-full text-[18px] font-medium text-[#333]"
                        >
                          <option
                            value=""
                            className="text-[16px] font-medium text-[#333]"
                          >
                            Velg type
                          </option>
                          <option
                            value="Leilighet"
                            className="text-[16px] font-medium text-[#333]"
                          >
                            Leilighet
                          </option>
                          <option
                            value="Tomannsbolig"
                            className="text-[16px] font-medium text-[#333]"
                          >
                            {/* Tomannsbolig  */}
                            Tomannsbolig
                          </option>
                          <option
                            value="Enebolig"
                            className="text-[16px] font-medium text-[#333]"
                          >
                            Enebolig
                          </option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleSearch("filter")}
                        className="h-10 my-5 cursor-pointer bg-[#18344e] text-white text-[18px] font-semibold px-5 rounded-[5px] mx-8"
                      >
                        Søk
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1550px] mx-auto">
          {/* <div className="py-[50px] md:py-[100px]">
            <div className="max-w-[1300px] border border-[#ddd] rounded-[5px] mx-[10px] xl:mx-auto flex flex-col bg-[#fff] md:flex-row items-center p-[25px] shadow-md">
              
              <p className="border-t w-full border-[#dfdfdf] my-[15px] block md:hidden" />
            </div>
          </div> */}

          <div
            className={`flex justify-between ${open ? "px-0" : "sm:px-0 px-0"}`}
          >
            <div
              className={`grid md:grid-cols-2 p-[10px gap-0 ${
                open ? "max-w-[1100px]" : "max-w-auto mx-auto"
              }`}
            >
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx}>
                    <Skeleton
                      className={(open ? "w-[510px]" : "w-[740px]") + " m-5"}
                      variant="rectangular"
                      height="450px"
                    />
                  </div>
                ))
              ) : properties?.length > 0 ? (
                properties?.map((item: any, index: any) => {
                  const filterImg = propertyImages[item.id]?.filter(
                    (img: any) => !img.slettet,
                  );
                  return (
                    <div
                      key={item.id}
                      className="md:p-5 sm:p-3 p-0 transition-transform duration-500 group-hover:rotate-y-[5deg] group-hover:scale-105 border border-[#9f9595] border-l-0"
                      style={{
                        transformStyle: "preserve-3d",
                        perspective: "1000px",
                      }}
                    >
                      <Link
                        href={`/detail?id=${item.id}`}
                        key={index}
                        className="group flex flex-col rounded-[10px] cursor-pointer p-2.5 relative"
                      >
                        {filterImg ? (
                          filterImg?.[0]?.url &&
                          filterImg?.[0]?.url != "" && (
                            <div className="overflow-hidden">
                              <ImageComponent
                                key={index}
                                width={500}
                                height={500}
                                alt="house-image"
                                src={
                                  filterImg?.length > 0
                                    ? filterImg?.[0]?.url
                                    : "/assets/errorImage.webp"
                                }
                                className="w-full md:h-[300px] lg:h-[450px] object-cover animate-slide-in hover:scale-105 duration-200"
                              />
                            </div>
                          )
                        ) : (
                          <Skeleton
                            className={open ? "w-full" : "w-full"}
                            variant="rectangular"
                            height="450px"
                          />
                        )}

                        {/* <p
                      className={`absolute text-[16px] group-hover:text-[#18344e] text-[#333] font-bold mt-[10px] mb-[6px] left-[20px] top-[10px]`}
                      style={{
                        backgroundColor:
                          item?.oppdragstatus === "05.Solgt"
                            ? "rgb(196 8 8)"
                            : item?.oppdragstatus === "03.Markedsføringsklart"
                            ? "green"
                            : item?.oppdragstatus === "02.Oppdrag akseptert"
                            ? "#FFAF1A"
                            : item?.oppdragstatus === "01.Befaring"
                            ? "rgb(47 35 82)"
                            : "#f0f0f0",
                        color:
                          item?.oppdragstatus === "05.Solgt" ||
                          item?.oppdragstatus === "03.Markedsføringsklart" ||
                          item?.oppdragstatus === "01.Befaring"
                            ? "#fff"
                            : "#000",
                        padding: "5px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {item?.oppdragstatus === "05.Solgt" && "Solgt"}
                      {item?.oppdragstatus === "03.Markedsføringsklart" &&
                        "Markedsføringsklart"}
                      {item?.oppdragstatus === "02.Oppdrag akseptert" &&
                        "Oppdrag akseptert"}
                      {item?.oppdragstatus === "01.Befaring" && "Befaring"}
                    </p> */}

                        {[
                          "05.Solgt",
                          "02.Oppdrag akseptert",
                          "01.Befaring",
                        ].includes(item?.oppdragstatus) && (
                          <p
                            className={`absolute text-[16px] group-hover:text-[#18344e] text-[#333] font-bold mt-2.5 mb-1.5 left-5 top-2.5`}
                            style={{
                              backgroundColor:
                                item?.oppdragstatus === "05.Solgt"
                                  ? "#d6bc77"
                                  : item?.oppdragstatus ===
                                      "02.Oppdrag akseptert"
                                    ? "#FFAF1A"
                                    : "rgb(47 35 82)",
                              color:
                                item?.oppdragstatus === "05.Solgt"
                                  ? "#244e75"
                                  : item?.oppdragstatus === "01.Befaring"
                                    ? "#fff"
                                    : "#000",
                              padding: "5px 8px",
                              borderRadius: "5px",
                            }}
                          >
                            {item?.oppdragstatus === "05.Solgt" && "Solgt"}
                            {item?.oppdragstatus === "02.Oppdrag akseptert" &&
                              "Oppdrag akseptert"}
                            {item?.oppdragstatus === "01.Befaring" &&
                              "Befaring"}
                          </p>
                        )}

                        <p className="text-[20px] group-hover:text-[#18344e] text-[#333] mt-2.5 mb-1.5">
                          {item?.overskrift}
                        </p>

                        {/* <p className="text-[18px] text-[#757575] mb-auto font-medium">
                    <span>
                      <PlaceIcon
                        fontSize="small"
                        className="text-[#caa950]"
                      />
                    </span>
                    {item?.eiendom?.adresse}
                  </p> */}
                        {item?.eiendom?.adresse && (
                          <div className="inline-block">
                            <div
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                window.open(getGoogleMapsUrl(item.eiendom));
                                e.stopPropagation();
                              }}
                              className="text-[18px] text-[#757575] mb-auto font-medium flex items-center hover:underline cursor-pointer"
                            >
                              <PlaceIcon
                                fontSize="small"
                                className="text-[#caa950] mr-1"
                              />
                              {item.eiendom.adresse}
                            </div>
                          </div>
                        )}
                        <div className="my-[25px]">
                          <div className="flex flex-wrap items-center gap-y-3 justify-start">
                            <div className="flex flex-wrap items-center gap-2 pr-3">
                              {item?.eiendom?.arealer?.primærrom > 0 && (
                                <>
                                  <ImageComponent
                                    width={500}
                                    height={500}
                                    alt="sqft"
                                    src="/assets/sqft-icon.svg"
                                    className="w-[18px] h-[18px]"
                                  />
                                  <p
                                    className={
                                      "text-[18px] font-semibold text-[#333] " +
                                      ((item?.prisantydning > 0 ||
                                        item?.eiendom?.romfordeling
                                          ?.antallSoverom > 0 ||
                                        item?.oppdragstype) &&
                                        "pr-2 border-r border-black")
                                    }
                                  >
                                    {/* {item?.eiendom?.arealer?.interntbruksareal != 0
                                  ? item?.eiendom?.arealer?.interntbruksareal
                                  : item?.eiendom?.arealer?.primærrom} */}
                                    <span className="text-[#757575] font-medium">
                                      {item?.eiendom?.arealer?.primærrom.toLocaleString(
                                        "no-NO",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        },
                                      )}{" "}
                                      m²
                                    </span>
                                  </p>
                                </>
                              )}
                              {item?.prisantydning > 0 && (
                                <p className="text-[18px] text-[#757575]">
                                  kr{" "}
                                  {item?.prisantydning
                                    ?.toLocaleString("no-NO")
                                    .replace(/,/g, " ")}
                                </p>
                              )}
                            </div>
                            {item?.eiendom?.romfordeling?.antallSoverom > 0 ? (
                              <div
                                className={
                                  "flex items-center gap-2  px-3 " +
                                  ((item?.prisantydning > 0 ||
                                    item?.eiendom?.arealer?.primærrom > 0) &&
                                    "pl-3 border-l border-black")
                                }
                              >
                                <ImageComponent
                                  width={500}
                                  height={500}
                                  alt="bed"
                                  src="/assets/bed-icon.svg"
                                  className="w-[18px] h-[18px]"
                                />

                                <p className="text-[18px] font-semibold text-[#757575]">
                                  {item?.eiendom?.romfordeling?.antallSoverom}
                                  <span className="text-[#757575] font-medium">
                                    {" "}
                                    Soverom
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <></>
                            )}
                            {/* {item?.oppdragstype && (
                              <div className={"flex items-center gap-[8px] " + ((item?.eiendom?.romfordeling?.antallSoverom > 0 || item?.prisantydning > 0 || item?.eiendom?.arealer?.primærrom > 0) && "border-l border-[#000] pl-3")}>
                                <p className="text-[18px] text-[#757575]">
                                  {item?.oppdragstype}
                                </p>
                              </div>
                            )} */}
                            {/* {item?.eiendom?.romfordeling?.antallBad > 0 && (
                              <div className="flex items-center gap-[8px]">
                                <ImageComponent
                                  width={500}
                                  height={500}
                                  alt="bath"
                                  src="/assets/bath-icon.svg"
                                  className="w-[18px] h-[18px]"
                                />
                                <p className="text-[18px] font-semibold text-[#757575]">
                                  {item?.eiendom?.romfordeling?.antallBad}
                                  <span className="text-[#757575] font-medium">
                                    {" "}
                                    {item?.eiendom?.romfordeling?.antallBad > 1
                                      ? "bad"
                                      : "bad"}{" "}
                                  </span>
                                </p>
                              </div>
                            )} */}
                          </div>
                        </div>
                        {/* <div className="flex items-center py-[20px] justify-between border-t border-b border-[#333] border-dashed">
                        <p className="text-[25px] text-[#333] font-semibold">
                          kr{" "}
                          {item?.prisantydning
                            ?.toLocaleString("no-NO")
                            .replace(/,/g, " ")}
                        </p>
                        <Link
                          href={`/detail?id=${item?.id}`}
                          className="group bg-[#0c1a27] group-hover:bg-[#caa950] cursor-pointer p-[5px]"
                        >
                          <CallMadeIcon
                            fontSize="medium"
                            className="text-[#fff] group-hover:text-[#0c1a27]"
                          />
                        </Link>
                      </div> */}
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-[#18344e] text-[25px] font-semibold py-[50px]">
                  Tom eiendom
                </p>
              )}
            </div>
            {open && (
              <div
                className={`fixed top-[43%] bottom-0 right-0 
                ${open ? "translate-x-0" : "translate-x-full"}
                w-[300px] bg-[antiquewhite] z-999
                transition-transform duration-300 ease-in-out
                md:static md:translate-x-0 md:w-[413px] md:bg-transparent md:z-auto
                overflow-y-auto`}
              >
                <div className="flex flex-col gap-[15px] border-l border-[#898181]">
                  <div className="px-8 py-7 border-b border-[#898181]">
                    <div className="flex justify-between items-center">
                      <p className="text-[18px] font-semibold text-[#333]">
                        Pris
                      </p>
                      <p className="text-[14px] font-semibold text-[#757575]">
                        {priceValue[0] === 0 && priceValue[1] === 0
                          ? `${formatPrice(priceValue[1])}`
                          : `${formatPrice(priceValue[0])} - ${formatPrice(
                              priceValue[1],
                            )}`}
                      </p>
                    </div>
                    <div className="px-2.5">
                      <Slider
                        sx={{
                          color: "#18344e",
                          "& .MuiSlider-thumb": {
                            backgroundColor: "#fff",
                            borderColor: "#000",
                            borderWidth: 1,
                            width: 17,
                            height: 17,
                          },
                          "& .MuiSlider-track": {
                            backgroundColor: "#18344e",
                            height: 2,
                          },
                          "& .MuiSlider-rail": {
                            backgroundColor: "#000",
                            height: 2,
                          },
                        }}
                        min={10000}
                        max={propertiesprice}
                        step={10000}
                        value={priceValue}
                        onChange={handlePrice}
                        valueLabelDisplay="auto"
                      />
                    </div>
                  </div>
                  <div className="px-8 py-7 border-b border-[#898181]">
                    <div className="flex justify-between items-center">
                      <p className="text-[18px] font-semibold text-[#333]">
                        Antail soverom
                      </p>
                      <p className="text-[14px] font-semibold text-[#757575]">
                        {roomValue}
                      </p>
                    </div>
                    <div className="px-2.5">
                      <Slider
                        sx={{
                          color: "#18344e",
                          "& .MuiSlider-thumb": {
                            backgroundColor: "#fff",
                            borderColor: "#000",
                            borderWidth: 1,
                            width: 17,
                            height: 17,
                          },
                          "& .MuiSlider-track": {
                            backgroundColor: "#000",
                            height: 2,
                          },
                          "& .MuiSlider-rail": {
                            backgroundColor: "#000",
                            height: 2,
                          },
                        }}
                        value={roomValue}
                        onChange={handleRoom}
                        valueLabelDisplay="auto"
                        min={1}
                        max={propertiesmaxBedroom || 10}
                      />
                    </div>
                  </div>
                  <div className="px-8 py-7 border-b border-[#898181]">
                    <select
                      value={selectedType}
                      onChange={handleSelectedType}
                      className="h-10 border-none outline-none w-full text-[18px] font-medium text-[#333]"
                    >
                      <option
                        value=""
                        className="text-[16px] font-medium text-[#333]"
                      >
                        Velg type
                      </option>
                      <option
                        value="Leilighet"
                        className="text-[16px] font-medium text-[#333]"
                      >
                        Leilighet
                      </option>
                      <option
                        value="Tomannsbolig"
                        className="text-[16px] font-medium text-[#333]"
                      >
                        Tomannsbolig
                      </option>
                      <option
                        value="Enebolig"
                        className="text-[16px] font-medium text-[#333]"
                      >
                        Enebolig
                      </option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleSearch("filter")}
                    className="h-10 mt-5 cursor-pointer bg-[#18344e] text-white text-[18px] font-semibold px-5 rounded-[5px] mx-8"
                  >
                    Søk
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className="w-full sm:max-w-[545px] absolute top-[50%] left-[50%] rounded-[16px] shadow-md translate-x-[-50%] translate-y-[-50%] overflow-y-auto bg-[#fff] max-h-[calc(100vh_-_32px)] min-h-0">
              <div className="p-[16px] flex flex-col">
                <CloseIcon
                  className="text-[#767676] text-[24px] cursor-pointer"
                  onClick={handleClose}
                />
              </div>
              <div className="p-[30px]">
                <div className="flex flex-col gap-[15px]">
                 
                  <div className="flex justify-between items-center">
                    <p className="text-[18px] font-semibold text-[#333]">
                      Pris
                    </p>
                    <p className="text-[14px] font-semibold text-[#757575]">
                      {priceValue[0] === 0 && priceValue[1] === 0
                        ? `${formatPrice(priceValue[1])}`
                        : `${formatPrice(priceValue[0])} - ${formatPrice(
                            priceValue[1]
                          )}`}
                    </p>
                  </div>
                  <div className="px-[10px]">
                    <Slider
                      sx={{
                        color: "#18344e",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#fff",
                          borderColor: "#18344e",
                          borderWidth: 1,
                          width: 17,
                          height: 17,
                        },
                        "& .MuiSlider-track": {
                          backgroundColor: "#18344e",
                          height: 2,
                        },
                        "& .MuiSlider-rail": {
                          backgroundColor: "#ccc",
                          height: 2,
                        },
                      }}
                      min={0}
                      max={10000000}
                      step={10000}
                      value={priceValue}
                      onChange={handlePrice}
                      valueLabelDisplay="auto"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[18px] font-semibold text-[#333]">
                      Antail soverom
                    </p>
                    <p className="text-[14px] font-semibold text-[#757575]">
                      {roomValue}
                    </p>
                  </div>
                  <div className="px-[10px]">
                    <Slider
                      sx={{
                        color: "#18344e",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#fff",
                          borderColor: "#18344e",
                          borderWidth: 1,
                          width: 17,
                          height: 17,
                        },
                        "& .MuiSlider-track": {
                          backgroundColor: "#18344e",
                          height: 2,
                        },
                        "& .MuiSlider-rail": {
                          backgroundColor: "#ccc",
                          height: 2,
                        },
                      }}
                      value={roomValue}
                      onChange={handleRoom}
                      valueLabelDisplay="auto"
                    />
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="h-[40px] mt-[20px] cursor-pointer bg-[#18344e] text-[#fff] text-[18px] font-semibold px-[20px] rounded-[5px]"
                  >
                    Søk
                  </button>
                </div>
              </div>
            </div>
          </Modal> */}
        </div>
      </section>
    </>
  );
}
