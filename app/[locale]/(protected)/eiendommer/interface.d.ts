export interface PropertiesResponse {
  message: string;
  data: Property[];
}
export interface Property {
  id: number;
  overskrift: string;
  oppdragstype: string;
  isNybygg: boolean;
  oppdragstatus: string;
  eiendom: Eiendom;
  eierformTomt: Eierform;
  eierformBygning: Eierform;
  ansvarligMegler: Megler;
  megler1: Megler;
  megler2: Megler | null;
  tilgangsrett: any[];
  oppgjorsFirma: OppgjorsFirma;
  registerenheter: Registerenheter;
  meglerFirma: MeglerFirma;
  prosjektRelasjon: any | null;
  akseptDato: string;
  prisantydning: number;
  registrertDato: string;
  endretDato: string;
  oppdragsnummer: number;
  oppdragsnummerFormatert: string;
  okonomi: Okonomi;
  markedsføring: Markedsforing;
  oppdragsavtale: Oppdragsavtale;
  arkivertDato: string;
  randomstring: string;
  modernisert: number;
  takst: Takst;
}
export interface Eiendom {
  adresse: string;
  poststed: string;
  postnummer: string;
  område: string;
  kommune: string;
  fylkeId: number;
  eiendomstypeId: number;
  byggeår: number;
  bolignummer: string;
  leilighetsnummer: number;
  etasje: number;
  energimerking: string;
  arealer: Arealer;
  romfordeling: Romfordeling;
}

export interface Arealer {
  primærrom: number;
  bruksareal: number;
  tomteareal: number;
  bruttoareal: number;
  interntbruksareal: number;
  interntbruksarealtil: number;
  eksterntbruksareal: number;
  eksterntbruksarealtil: number;
  innglassetbalkongareal: number;
  innglassetbalkongarealtil: number;
  aapentareal: number;
  aapentarealtil: number;
}

export interface Romfordeling {
  antallSoverom: number;
  antallRom: number;
  antallBad: number;
}
export interface Eierform {
  typeKode: number;
  navn: string;
}

export interface Megler {
  id: number;
  navn: string;
  email: string;
  mobiltelefon: string;
  telefonAvdeling: string;
}

export interface OppgjorsFirma {
  id: number;
  eksterntFirma: boolean;
  navn: string;
  organisasjonsnummer: string;
  avdelingsId: number;
}

export interface MeglerFirma {
  id: number;
  avdelingsId: number;
  navn: string;
  organisasjonsnummer: string;
  avsluttet: boolean;
}
export interface Registerenheter {
  matrikler: Matrikkel[];
  borettsandeler: any[];
  aksjeboenheter: any[];
}

export interface Matrikkel {
  id: number;
  kommuneNr: number;
  gaardsnummer: number;
  bruksnummer: number;
  seksjonsnummer: number;
  festenummer: number;
  isHovedRegisterenhet: boolean;
  ideellAndel: string;
}
export interface Okonomi {
  totalkostnadSomTall: number;
  totalomkostningSomTall: number;
  totalomkostningSomProsent: number;
  isFastpris: boolean;
}
export interface Markedsforing {
  klart: boolean;
  fra: string;
  til: string;
  eiendommensHjemmesideUrl: string;
  elektroniskBudgivningUrl: string;
  meldPaaVisningUrl: string;
  autoprospekt: Autoprospekt[];
}

export interface Autoprospekt {
  tittel: string;
  url: string;
  registrertdato: string | null;
}
export interface Oppdragsavtale {
  utlopsdato: string;
  oppdragsdato: string;
  trukketdato: string | null;
}

export interface Takst {
  tekniskverdi: number;
  verditakst: number;
  laanetakst: number;
  ligningsverdi: number;
  ligningsverdi2: number;
  ligningsverdidato: string | null;
  skattetakst: number;
  takstdato: string;
  takstmann: string;
  kommentartakst: string;
}

export interface PropertyImage {
  id: number;
  url: string;
  thumbnailUrl: string;
  beskrivelse: string;
  slettet: boolean;
  liktAvSelger: boolean;
  tellesiffer: number;
  bildetypeId: number;
  endretdato: string; // ISO date string
}
export interface PropertyImagesResponse {
  message: string;
  data: PropertyImage[];
  propertyHtml?: boolean;
  propertyPdf?: boolean;
}

export interface Template {
  propertyId: string;
  name: string;
  fileName: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Template[];
}

interface Template {
  fileName: string;
  path: string;
}

interface PropertyTemplate {
  propertyId: string;
  templates: Template[];
}

interface SavedHtmlTemplatesResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: PropertyTemplate[];
}