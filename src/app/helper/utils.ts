/* eslint-disable @typescript-eslint/no-explicit-any */
export function setCookie(cname?: any, cvalue?: any, exdays?: any) {
    if (typeof window !== "undefined") {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
  }
  
  export function getCookie(cname: any) {
    if (typeof window !== "undefined") {
        const name = cname + "=";
        const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
  }


  export const getInitial = (name: any) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };
    
  export const stringToColor = (string: any) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
  }

export const getGoogleMapsUrl = (eiendom: any): string => {
  const addresses = eiendom?.adresse?.includes(" og ")
              ? eiendom?.adresse?.split(" og ").map((part: string) => part.trim())
              : [eiendom?.adresse];
  const query = `${addresses[0]}, ${eiendom.postnummer} ${eiendom.poststed}, Norway`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}