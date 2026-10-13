/* eslint-disable @typescript-eslint/no-explicit-any */
// config


// ----------------------------------------------------------------------

const fetchAPI = async (url:any, { ...options}:any) => {
  try {
    const response = await fetch(url,{
      ...options,
    });
    if (!response.ok) {
      const status = response.status;
      if (status === 401) {
        // handle unauthorized
        // setCookie('appToken', '', -1)
        localStorage.clear();
        window.location.href = "/";
      }
       else if (status === 404) {
        const res = await response.json();
        return {
          data:res,
          response 
        }
      } else if (status === 500) {
        // handle server error\
        // const res = await response.json();
        return {
          // data:res,
          status,
          response 
        }
      } else {
        const errorData = await response.json();
        return Promise.reject(errorData);
      }
    }
    const res = await response.json();

    return {
        data:res,
        response 
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

export default fetchAPI;
