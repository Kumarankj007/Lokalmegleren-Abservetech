export interface ContactUsItem {
    _id?: string;
    head: string;
    desc: string;
}

export interface HjemData {
    _id?: string;

    banner: {
        title: string;
        image?: File | string | null;
        disc: string[];
    };

    contactUs: {
        title: string;
        data: ContactUsItem[];
    };

    aboutUs: string[];

    createdAt?: string;
    updatedAt?: string;
}

export interface HjemApiResponse {
    data: HjemData;
    error?: boolean;
}