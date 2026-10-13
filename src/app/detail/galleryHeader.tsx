"use client";
import CollectionsIcon from "@mui/icons-material/Collections";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Navigation } from "swiper/modules";
import CloseIcon from "@mui/icons-material/Close";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ImageComponent from "../components/image";
import { Checkbox, Modal } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ErrorIcon from "@mui/icons-material/Error";
import GetPropertyDetail from "../api/get/propertyDetail";
import { useSearchParams } from "next/navigation";
import usePropertyStore from "../api/get/properties";
import useRootStore from "../store/root";
import GetProductDetail from "../api/get/accordionPdf";
import GetDocumentLink from "../api/get/documentLink";
import GetBriefDetail from "../api/get/accordionDescr";
import { isHydrated } from "./hydration";
import { GalleryHeroSkeleton } from "./skeletons";
// import { useMeta } from "../_context/MetaData";

export default function GalleryHeader() {
  // Narrow selectors: without them every unrelated store write re-renders the
  // whole gallery (and its Swiper) on this page.
  const propertyDetail: any = GetPropertyDetail((s: any) => s.propertyDetail);
  const FetchPropertyDetail: any = GetPropertyDetail(
    (s: any) => s.FetchPropertyDetail,
  );
  const FetchPropertyVisiting: any = GetPropertyDetail(
    (s: any) => s.FetchPropertyVisiting,
  );
  const FetchtitleList: any = GetProductDetail((s: any) => s.FetchtitleList);
  const FetchDocumentLink: any = GetDocumentLink(
    (s: any) => s.FetchDocumentLink,
  );
  const FetchDescribitonList: any = GetBriefDetail(
    (s: any) => s.FetchDescribitonList,
  );
  const singlepropertiesImage: any = usePropertyStore(
    (s: any) => s.singlepropertiesImage,
  );
  const singleImagesLoad: any = usePropertyStore(
    (s: any) => s.singleImagesLoad,
  );
  const FetchSinglePropertiesImage: any = usePropertyStore(
    (s: any) => s.FetchSinglePropertiesImage,
  );

  // const { setMeta } = useMeta();

  const { setImg } = useRootStore();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const swiperRef: any = useRef(null);
  const swipers: any = useRef(null);
  const searchParams: any = useSearchParams();
  const propertyId: any = searchParams.get("id");
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const submit = () => {};
  // console.log("detail--------------", propertyDetail);
  useEffect(() => {
    if (!propertyId) return;

    // Everything below is already prefetched on the server (see serverData.ts)
    // and seeded into the stores by HydrateStores; only fetch what is missing.
    (async () => {
      if (isHydrated(`images:${propertyId}`)) return;
      const res = await FetchSinglePropertiesImage({
        tenantId: "381",
        propertyId: propertyId,
      });
      // console.log(res[0]?.url, "reds");
      if (Array.isArray(res) && res.length > 0) {
        setImg(res[0]?.url);
        // setMeta({
        //   title: res[0]?.beskrivelse || `Demo`,
        //   description: res[0]?.beskrivelse || `Demo`,
        //   ogImage: new URL(
        //     "https://png.pngtree.com/element_our/20200702/ourmid/pngtree-small-url-icon-opened-in-the-browser-image_2291957.jpg"
        //   ).toString() /*res[0]?.url*/,
        // });
      }
    })();

    // Each endpoint is checked on its own: if the server resolved the property
    // but one of these failed, that one still has to be fetched here.
    if (!isHydrated(`detail:${propertyId}`))
      FetchPropertyDetail(propertyId, { tenantId: "381" });
    if (!isHydrated(`visiting:${propertyId}`))
      FetchPropertyVisiting(propertyId, { tenantId: "381" });
    if (!isHydrated(`brief:${propertyId}`))
      FetchDescribitonList({ tenantId: "381", propertyId });
    if (!isHydrated(`docs:${propertyId}`))
      FetchtitleList({ tenantId: "381", propertyId });
    if (!isHydrated(`linker:${propertyId}`))
      FetchDocumentLink({ tenantId: "381", propertyId });
  }, [FetchPropertyDetail, FetchSinglePropertiesImage, propertyId]);

  const visibleImages = useMemo(
    () =>
      Array.isArray(singlepropertiesImage)
        ? singlepropertiesImage.filter((img: any) => !img?.slettet)
        : [],
    [singlepropertiesImage],
  );

  // Keep the reserved space until we know whether there are images, so the
  // block never collapses to 0px and shoves the page around.
  const showSkeleton = singleImagesLoad && visibleImages.length === 0;

  return (
    <>
      <section className="mt-0 md:mt-0 pt-[50px] ">
        <div className="max-w-[1300px] mx-auto relative">
          {showSkeleton ? (
            <GalleryHeroSkeleton />
          ) : visibleImages.length > 0 && (
            <>
              {["05.Solgt", "02.Oppdrag akseptert", "01.Befaring"].includes(
                propertyDetail?.oppdragstatus
              ) && (
                <p
                  className={`absolute z-9 text-[16px] group-hover:text-[#18344e] text-[#333] font-bold left-5 top-2.5`}
                  style={{
                    backgroundColor:
                      propertyDetail?.oppdragstatus === "05.Solgt"
                        ? "#d6bc77"
                        : propertyDetail?.oppdragstatus ===
                          "02.Oppdrag akseptert"
                        ? "#FFAF1A"
                        : "rgb(47 35 82)",
                    color:
                      propertyDetail?.oppdragstatus === "05.Solgt"
                        ? "#244e75"
                        : propertyDetail?.oppdragstatus === "01.Befaring"
                        ? "#fff"
                        : "#000",
                    padding: "5px 8px",
                    borderRadius: "5px",
                  }}
                >
                  {propertyDetail?.oppdragstatus === "05.Solgt" && "Solgt"}
                  {propertyDetail?.oppdragstatus === "02.Oppdrag akseptert" &&
                    "Oppdrag akseptert"}
                  {propertyDetail?.oppdragstatus === "01.Befaring" &&
                    "Befaring"}
                </p>
              )}
              <div
                onClick={() => setGalleryOpen(true)}
                className="z-9 flex items-center gap-[5px] absolute top-2 md:top-auto bottom-auto md:bottom-[100px] h-[35px] bg-[#18344e] px-2 md:px-[15px] rounded-[5px] right-3 cursor-pointer"
              >
                <CollectionsIcon fontSize="small" className="text-white" />
                <p className="hidden md:block text-[16px] font-bold text-white">
                  Galleri
                </p>
              </div>
              <button
                onClick={() => swipers.current?.slidePrev()}
                className="absolute lg:right-6 right-auto lg:left-auto left-2  -translate-y-1/2 lg:top-[47%] top-1/2 cursor-pointer z-9 rounded-full bg-[#18344e] text-white p-2 tab:p-4 shadow-lg"
              >
                <FaChevronLeft size={15} />
              </button>
                <Swiper
                  loop={true}
                  onSwiper={(swiper: any) => (swipers.current = swiper)}
                  modules={[Pagination, Navigation]}
                  slidesPerView={1}
                  spaceBetween={10}
                  className="w-full h-full"
                >
                  {visibleImages
                    .map((img: any, index: any) => (
                      <SwiperSlide key={index}>
                        <div className=" relative">
                          <ImageComponent
                            width={1300}
                            height={700}
                            alt="house-image"
                            src={img?.url}
                            /* Only the first slide is LCP-critical; the rest
                               must not compete for bandwidth with it. */
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="(max-width: 768px) 100vw, 1300px"
                            className="w-full h-[300px] sm:h-[500px] md:h-[700px] object-cover rounded-lg"
                          />
                          {img?.beskrivelse && img?.beskrivelse != 0 && (
                            <p className="md:text-[22px] text-[18px] font-normal text-white absolute py-6 text-center bottom-0 w-full bg-[#00000055]">
                              {img?.beskrivelse}
                            </p>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              <button
                onClick={() => swipers.current?.slideNext()}
                className="absolute right-6 lg:bottom-[47%] bottom-1/2 translate-y-1/2 cursor-pointer z-9 rounded-full bg-[#18344e] text-white p-2 tab:p-4 shadow-lg"
              >
                <FaChevronRight size={15} />
              </button>
            </>
          )}
        </div>
      </section>

      <Dialog open={galleryOpen} onClose={() => setGalleryOpen(false)}>
        <div className="fixed inset-0 bg-[#e2cf9e] bg-opacity-90 z-100 flex justify-center items-center">
          <div className="w-full h-full max-h-screen flex flex-col items-center relative overflow-hidden">
            <p className="text-5 mb-5 text-[#244e75] font-semibold pt-[50px]">
              Alle bilder
            </p>
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-5 right-5 text-white text-2xl cursor-pointer"
            >
              <CloseIcon fontSize="medium" className="text-[#244e75]" />
            </button>
            <div className="overflow-y-auto w-full max-w-5xl p-4 grow custom-scrollbar">
              <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
                {Array.isArray(singlepropertiesImage) &&
                  singlepropertiesImage.map((img, index) => (
                    <div key={index} className="relative">
                      <ImageComponent
                        width={500}
                        height={500}
                        key={index}
                        src={img?.url}
                        alt={`gallery-${index}`}
                        priority={false}
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="w-full rounded-lg shadow-md cursor-pointer hover:opacity-80 transition"
                        onClick={() => {
                          setSelectedIndex(index);
                          setGalleryOpen(false);
                          setSliderOpen(true);
                        }}
                      />
                      {img?.beskrivelse && img?.beskrivelse != 0 && (
                        <p className="md:text-[16px] text-[14px] font-normal text-white rounded-b-lg absolute py-2 text-center bottom-0 w-full bg-[#00000055]">
                          {img?.beskrivelse}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Full-Screen Image Slider */}
      <Dialog open={sliderOpen} onClose={() => setSliderOpen(false)}>
        <div className="fixed inset-0 bg-[#e2cf9e] bg-opacity-90 z-100 flex justify-center items-center">
          <div className="w-full h-full flex flex-col justify-center items-center px-2.5">
            <button
              onClick={() => setSliderOpen(false)}
              className="absolute top-5 right-5 text-white text-2xl cursor-pointer"
            >
              <CloseIcon fontSize="medium" className="text-white" />
            </button>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="hidden xl:block absolute left-[15%] cursor-pointer z-10 rounded-full bg-white text-black p-2 tab:p-4 shadow-lg"
            >
              <FaChevronLeft size={20} />
            </button>
            <Swiper
              loop={true}
              onSwiper={(swiper: any) => (swiperRef.current = swiper)}
              modules={[Pagination, Navigation]}
              slidesPerView={1}
              spaceBetween={10}
              pagination={{ clickable: true }}
              initialSlide={selectedIndex}
              className="w-full max-w-5xl"
            >
              {Array.isArray(singlepropertiesImage) &&
                singlepropertiesImage.map((img, index) => (
                  <SwiperSlide key={index} className="w-full h-[80vh] relative">
                    <ImageComponent
                      width={500}
                      height={500}
                      src={img?.url}
                      alt={`slide-${index}`}
                      priority={index === selectedIndex}
                      loading={index === selectedIndex ? "eager" : "lazy"}
                      className="w-full h-full object-cover "
                    />
                    {img?.beskrivelse && img?.beskrivelse != 0 && (
                      <p className="md:text-[22px] text-[18px] font-normal text-white absolute py-6 text-center bottom-0 w-full bg-[#00000055]">
                        {img?.beskrivelse}
                      </p>
                    )}
                  </SwiperSlide>
                ))}
            </Swiper>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-[15%] cursor-pointer z-10 rounded-full bg-white text-black p-2 tab:p-4 shadow-lg"
            >
              <FaChevronRight size={20} />
            </button>
          </div>
        </div>
      </Dialog>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="w-full relative h-full overflow-y-auto bg-white">
          <div className="absolute top-4 right-4">
            <CloseIcon
              fontSize="large"
              className="text-[#767676] text-[24px] cursor-pointer"
              onClick={handleClose}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-white p-5 sm:p-[50px] h-full">
              <p className="text-[18px] font-semibold text-[#757575] pt-5 md:pt-0">
                Order sales assignment
              </p>
              <p className="text-[40px] font-medium text-[#333]">
                Norefjell Alpine Trail 28
              </p>
              <button className="mt-2.5 h-10 rounded-[5px] px-[15px] text-white text-[18px] bg-[#18344e] cursor-pointer">
                3,350,000 ,-
              </button>
              <p className="text-5 my-5 font-medium text-[#333] max-w-[500px]">
                Check the desired fields, fill out the form and have the sales
                statement sent to Norefjell Alpingrend 28 .
              </p>
              <p className="text-5 my-5 font-medium text-[#333]">
                By ordering the sales statement, you accept that the broker may
                contact you to provide factual information about the property,
                such as corrected content in the sales statement, changed
                viewing times, etc. We would like to point out that inclusion on
                the list of interested parties, including receipt of information
                about the bidding round, requires acceptance by checking the box
                below.
              </p>
              <p className="text-[30px] font-medium text-[#333] underline decoration-[#caa950] mb-5">
                Order sales assignment
              </p>
              <form onSubmit={handleSubmit(submit)}>
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        FirstName<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="firstname"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Firstname is required",
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Only alphabetic characters are allowed",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter firstname"
                            className="w-full placeholder-[#757575] shadow-sm px-5 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.firstname && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.firstname?.message?.toString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        LastName<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="lastname"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "lastname is required",
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Only alphabetic characters are allowed",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter lastname"
                            className="w-full placeholder-[#757575] shadow-sm px-5 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.lastname && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.lastname?.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        Telephone<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="Telephone"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Only numbers are allowed",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter number"
                            className="w-full placeholder-[#757575] shadow-sm p-5 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.Telephone && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.Telephone?.message?.toString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="mb-2 text-[16px] text-[#333] font-semibold">
                        Email<span className="text-[#eb1700]">*</span>
                      </p>
                      <Controller
                        name="email_id"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value:
                              /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email format",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Email ID*"
                            className="w-full placeholder-[#757575] shadow-sm px-5 h-[50px] border border-[#e7e7e7] rounded-[10px]"
                          />
                        )}
                      />
                      {errors.email_id && (
                        <p className="mt-2 flex items-center text-[14px] font-medium leading-5 text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-2 text-[16px] text-[#b71000]"
                          />
                          {errors?.email_id?.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[16px] font-semibold text-[#333]">
                    I would like to be contacted about:
                  </p>
                  <div className="flex flex-col mr-auto">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="SMS notification"
                      />
                      <span className="text-black font-medium">
                        SMS notification
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="Valuation or sale of my home"
                      />
                      <span className="text-black font-medium">
                        Valuation or sale of my home
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="Proof of financing or mortgage offer"
                      />
                      <span className="text-black font-medium">
                        Proof of financing or mortgage offer
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        {...label.inputProps}
                        aria-label="Residential property from Nordvik"
                      />
                      <span className="text-black font-medium">
                        Residential property from Nordvik
                      </span>
                    </label>
                  </div>
                  <button className="w-full shadow-sm h-[50px] rounded-[10px] cursor-pointer bg-[#18344e] text-[18px] font-medium text-white">
                    Order
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-[#F3F5F6] p-5 sm:p-[50px] h-full">
              <p className="text-[40px] mb-[30px] font-medium text-[#333]">
                Current Brokers
              </p>
              <div className="flex flex-col gap-5">
                <div className="bg-white shadow-md rounded-[10px] p-5 flex items-center gap-5">
                  <ImageComponent
                    width={500}
                    height={500}
                    alt="broker-image"
                    src="/assets/broker1.jpeg"
                    className="object-cover rounded-full w-[120px] h-[120px] sm:w-[150px] md:w-[200px] sm:h-[150px] md:h-[200px]"
                  />
                  <div className="flex flex-col pl-2.5">
                    <p className="text-5 md:text-[30px] font-medium text-[#333]">
                      Henrik Bredo Larsen
                    </p>
                    <p className="text-[16px] md:text-5 font-medium text-[#757575]">
                      Property Agent & Broker
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer mt-[15px] font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      8652301479
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      broker@gmail.com
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow-md rounded-[10px] p-5 flex items-center gap-5">
                  <ImageComponent
                    width={500}
                    height={500}
                    alt="broker-image"
                    src="/assets/broker2.jpeg"
                    className="object-cover rounded-full w-[120px] h-[120px] sm:w-[150px] md:w-[200px] sm:h-[150px] md:h-[200px]"
                  />
                  <div className="flex flex-col pl-2.5">
                    <p className="text-5 md:text-[30px] font-medium text-[#333]">
                      Rashed Kabir
                    </p>
                    <p className="text-[16px] md:text-5 font-medium text-[#757575]">
                      Property Agent & Broker
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer mt-[15px] font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      8652301479
                    </p>
                    <p className="text-[16px] md:text-[18px] cursor-pointer font-medium text-[#333] hover:underline hover:text-[#caa950]">
                      broker@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
