"use client";
import ImageComponent from "../components/image";

export default function BlogList() {
    return (
        <>
            <section className="py-[50px] px-[20px] bg-[#fff]">
                <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                <ImageComponent alt='blog' src='/assets/magazine1.jpg' width={500} height={500} className='block lg:hidden mb-[40px] lg:mb-0 sm:w-[400px] sm:h-[600px] mx-auto object-cover' />
                    <div className="flex flex-col gap-[20px]">
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            I Norge selges det rundt hundre tusen boliger i året, og da kreves det litt ekstra for ikke å forsvinne i mengden, sier Moen.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Ifølge boligfotografen er det viktig å sitte igjen med noe etter at du har trykket deg gjennom fotoene i en boligannonse.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Det kan være en peis, store vinduer, eller fargerike fliser på kjøkkenet, men det må være et element der som fanger deg. Det er ikke mange som sperrer øynene opp for et par hvite vegger og en beige sofa.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Utover det å fange oppmerksomhet sørger Moen for å gjøre bildene «koselige». Hun forsøker å skape rom som gjør at en potensiell kjøper av boligen faktisk får lyst til å flytte inn.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Jeg tenker nok mye på følelsen fotoene gir. Jeg lar meg ikke styre av at én enkeltting skal ligge på den riktige plassen.
                        </p>
                    </div>
                    <ImageComponent alt='blog' src='/assets/magazine1.jpg' width={500} height={500} className='hidden lg:block mt-[40px] lg:mt-0 sm:w-[400px] sm:h-[600px] mx-auto object-cover' />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center my-[50px]">
                    <ImageComponent alt='blog' src='/assets/magazine2.jpg' width={500} height={500} className='mb-[40px] lg:mb-0 sm:w-[400px] sm:h-[600px] mx-auto object-cover' />
                    <div className="flex flex-col gap-[20px]">
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            I Norge selges det rundt hundre tusen boliger i året, og da kreves det litt ekstra for ikke å forsvinne i mengden, sier Moen.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Ifølge boligfotografen er det viktig å sitte igjen med noe etter at du har trykket deg gjennom fotoene i en boligannonse.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Det kan være en peis, store vinduer, eller fargerike fliser på kjøkkenet, men det må være et element der som fanger deg. Det er ikke mange som sperrer øynene opp for et par hvite vegger og en beige sofa.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Utover det å fange oppmerksomhet sørger Moen for å gjøre bildene «koselige». Hun forsøker å skape rom som gjør at en potensiell kjøper av boligen faktisk får lyst til å flytte inn.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Jeg tenker nok mye på følelsen fotoene gir. Jeg lar meg ikke styre av at én enkeltting skal ligge på den riktige plassen.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                <ImageComponent alt='blog' src='/assets/magazine4.jpg' width={500} height={500} className='block lg:hidden mb-[40px] lg:mb-0 sm:w-[400px] sm:h-[600px] mx-auto object-cover' />
                    <div className="flex flex-col gap-[20px]">
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            I Norge selges det rundt hundre tusen boliger i året, og da kreves det litt ekstra for ikke å forsvinne i mengden, sier Moen.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Ifølge boligfotografen er det viktig å sitte igjen med noe etter at du har trykket deg gjennom fotoene i en boligannonse.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Det kan være en peis, store vinduer, eller fargerike fliser på kjøkkenet, men det må være et element der som fanger deg. Det er ikke mange som sperrer øynene opp for et par hvite vegger og en beige sofa.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Utover det å fange oppmerksomhet sørger Moen for å gjøre bildene «koselige». Hun forsøker å skape rom som gjør at en potensiell kjøper av boligen faktisk får lyst til å flytte inn.
                        </p>
                        <p className="text-[20px] font-medium text-[#000] leading-[37px]">
                            Jeg tenker nok mye på følelsen fotoene gir. Jeg lar meg ikke styre av at én enkeltting skal ligge på den riktige plassen.
                        </p>
                    </div>
                    <ImageComponent alt='blog' src='/assets/magazine4.jpg' width={500} height={500} className='hidden lg:block mt-[40px] lg:mt-0 sm:w-[400px] sm:h-[600px] mx-auto object-cover' />
                </div>
                </div>
            </section>
        </>
    );
}
