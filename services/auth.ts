export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
    const exp = payload.exp * 1000; // convert seconds → ms
    return Date.now() > exp;
  } catch (e) {
    return true;
  }
};