import ImageComponent from "../components/image";


export default function BrokerDetails() {
    return (
        <>
            <section className="mt-[50px]">
                <div className="bg-[#fff] max-w-[1400px] mx-auto p-[30px] rounded-[10px] shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[30px]">
                        <div className="flex flex-col items-center w-[300px] justify-center mx-auto">
                            <ImageComponent width={500} height={500} alt="broker-image" src="/assets/broker1.jpeg" className="rounded-full w-[200px] h-[200px] object-cover" />
                            <div className="flex flex-col gap-[5px] my-[20px]">
                                <p className="text-[25px] text-[#333] font-semibold">Henrik Bredo Larsen</p>
                                <p className="text-[16px] text-[#757575] font-medium text-center">Property Agent & Broker</p>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full">
                                <p className="text-[16px] font-medium text-[#757575]">Location:</p>
                                <p className="text-[16px] font-semibold text-[#333]">Spain, Barcelona</p>
                            </div>
                            <div className="my-[8px] flex flex-row items-center justify-between w-full">
                                <p className="text-[16px] font-medium text-[#757575]">Email:</p>
                                <p className="text-[16px] font-semibold text-[#333]">broker@gmail.com</p>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full">
                                <p className="text-[16px] font-medium text-[#757575]">Phone:</p>
                                <p className="text-[16px] font-semibold text-[#333]">8520314697</p>
                            </div>
                            <p className="text-[14px] my-[20px] text-[#757575] font-semibold">How I can help you make a good sale</p>
                            <button className="h-[40px] hover:scale-[1.05] transition-transform duration-300 cursor-pointer bg-[#F56726] text-[#fff] font-semibold px-[20px] rounded-[5px]">Make an appointment</button>
                        </div>
                        <div className="flex flex-col items-center w-[300px] justify-center mx-auto">
                            <ImageComponent width={500} height={500} alt="broker-image" src="/assets/broker2.jpeg" className="rounded-full w-[200px] h-[200px] object-cover" />
                            <div className="flex flex-col gap-[5px] my-[20px]">
                                <p className="text-[25px] text-[#333] font-semibold">Rashed Kabir</p>
                                <p className="text-[16px] text-[#757575] font-medium text-center">Property Agent & Broker</p>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full">
                                <p className="text-[16px] font-medium text-[#757575]">Location:</p>
                                <p className="text-[16px] font-semibold text-[#333]">Spain, Barcelona</p>
                            </div>
                            <div className="my-[8px] flex flex-row items-center justify-between w-full">
                                <p className="text-[16px] font-medium text-[#757575]">Email:</p>
                                <p className="text-[16px] font-semibold text-[#333]">broker2@gmail.com</p>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full">
                                <p className="text-[16px] font-medium text-[#757575]">Phone:</p>
                                <p className="text-[16px] font-semibold text-[#333]">8421314679</p>
                            </div>
                            <p className="text-[14px] my-[20px] text-[#757575] font-semibold">How I can help you make a good sale</p>
                            <button className="h-[40px] hover:scale-[1.05] transition-transform duration-300 cursor-pointer mt-[10px] bg-[#F56726] text-[#fff] font-semibold px-[20px] rounded-[5px]">Make an appointment</button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
