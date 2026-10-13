"use client";
import { Checkbox } from "@mui/material";
import { Controller, useForm } from 'react-hook-form';
import ErrorIcon from "@mui/icons-material/Error";

export default function ValuationForm() {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });
    const label = { inputProps: { "aria-label": "Checkbox demo" } };

    const submit = () => { }

    return (
        <>
            <section className="mt-[90px]">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className='bg-[#fff] p-[20px] sm:p-[50px] h-full'>
                        <p className="text-[40px] font-medium lg:max-w-[400px] leading-[50px] text-[#333] pt-[20px] md:pt-0">There can be many possibilities in your home!</p>
                        <p className="text-[25px] my-[20px] leading-[45px] font-medium text-[#333] lg:max-w-[600px]">
                            Order a valuation from a broker who sees everything.
                        </p>
                        <ul className="pl-[30px] list-disc flex flex-col gap-[10px]">
                            <li className="text-[20px] text-[#333] font-medium">Non-binding meeting with a broker</li>
                            <li className="text-[20px] text-[#333] font-medium">Receive tips and advice</li>
                            <li className="text-[20px] text-[#333] font-medium">Set aside 30 – 60 minutes</li>
                        </ul>
                    </div>
                    <div className='bg-[#F3F5F6] p-[20px] sm:p-[50px] h-full'>
                        <p className="px-[20px] text-[#333] text-[20px] text-center font-semibold">Order a valuation from Kristoffer Eastwood</p>
                        <form onSubmit={handleSubmit(submit)}>
                            <div className="p-[20px] flex flex-col gap-[10px]">
                                <div className="flex flex-col">
                                    <p className="mb-[8px] text-[16px] text-[#333] font-semibold">Name<span className="text-[#eb1700]">*</span></p>
                                    <Controller
                                        name="name"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Name is required",
                                            pattern: {
                                                value: /^[A-Za-z\s]+$/,
                                                message: "Only alphabetic characters are allowed",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder="Enter name"
                                                className="w-full placeholder-[#757575] shadow-sm px-[20px] h-[50px] border border-[#e7e7e7] rounded-[10px]"
                                            />
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                                            <ErrorIcon fontSize="small" className="mr-[8px] text-[16px] text-[#b71000]" />
                                            {errors?.name?.message?.toString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <p className="mb-[8px] text-[16px] text-[#333] font-semibold">Address<span className="text-[#eb1700]">*</span></p>
                                    <Controller
                                        name="address"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Address is required",
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder="Enter address"
                                                className="w-full placeholder-[#757575] shadow-sm p-[20px] h-[50px] border border-[#e7e7e7] rounded-[10px]"
                                            />
                                        )}
                                    />
                                    {errors.address && (
                                        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                                            <ErrorIcon fontSize="small" className="mr-[8px] text-[16px] text-[#b71000]" />
                                            {errors?.address?.message?.toString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <p className="mb-[8px] text-[16px] text-[#333] font-semibold">Postal code<span className="text-[#eb1700]">*</span></p>
                                    <Controller
                                        name="code"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "code is required",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Only numbers are allowed",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder="Enter code"
                                                className="w-full placeholder-[#757575] shadow-sm p-[20px] h-[50px] border border-[#e7e7e7] rounded-[10px]"
                                            />
                                        )}
                                    />
                                    {errors.code && (
                                        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                                            <ErrorIcon fontSize="small" className="mr-[8px] text-[16px] text-[#b71000]" />
                                            {errors?.code?.message?.toString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <p className="mb-[8px] text-[16px] text-[#333] font-semibold">Mobile<span className="text-[#eb1700]">*</span></p>
                                    <Controller
                                        name="mobile"
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
                                                className="w-full placeholder-[#757575] shadow-sm p-[20px] h-[50px] border border-[#e7e7e7] rounded-[10px]"
                                            />
                                        )}
                                    />
                                    {errors.mobile && (
                                        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                                            <ErrorIcon fontSize="small" className="mr-[8px] text-[16px] text-[#b71000]" />
                                            {errors?.mobile?.message?.toString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <p className="mb-[8px] text-[16px] text-[#333] font-semibold">Email<span className="text-[#eb1700]">*</span></p>
                                    <Controller
                                        name="email_id"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                message: "Invalid email format",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder="Email ID*"
                                                className="w-full placeholder-[#757575] shadow-sm px-[20px] h-[50px] border border-[#e7e7e7] rounded-[10px]"
                                            />
                                        )}
                                    />
                                    {errors.email_id && (
                                        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                                            <ErrorIcon fontSize="small" className="mr-[8px] text-[16px] text-[#b71000]" />
                                            {errors?.email_id?.message?.toString()}
                                        </p>
                                    )}
                                </div>

                                <div className='flex flex-col'>
                                    <p className="mb-[8px] text-[16px] text-[#333] font-semibold">Comment</p>
                                    <Controller
                                        name="message"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                placeholder="Enter your message"
                                                className="w-full placeholder-[#757575] shadow-sm p-[20px] h-[100px] border border-[#e7e7e7] rounded-[10px]"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="flex flex-row items-center">
                                    <Checkbox {...label}
                                        id='career_subscriber'
                                    />
                                    <p className="text-[#222] font-normal text-[14px]">
                                        Yes, I accept <span className="text-[#caa950] underline cursor-pointer"> the Privacy terms*</span>
                                    </p>
                                </div>
                                <button
                                    id='career_submit'
                                    // disabled={loader}
                                    className="w-full shadow-sm h-[50px] rounded-[10px] cursor-pointer bg-[#18344e] text-[18px] font-medium text-[#fff]">
                                    {/* {loader ? <DotLoader /> : 'Submit'} */}Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
