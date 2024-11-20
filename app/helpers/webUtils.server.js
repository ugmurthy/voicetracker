

export function getHeaders(request) {
    const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

export function getContentType(request) {
  return request.headers.get("content-type");
}

export function isFormData(request) {
  return getContentType(request) === "application/x-www-form-urlencoded";
}

export function isJson(request) {
  return getContentType(request) === "application/json";
} 


export function getCookies(request) {
    let cookieHeader = request.headers.get("cookie");
    let cookies={};
    if (cookieHeader){
        cookieHeader.split(";").forEach(cookie => {
            let [name,...rest] = cookie.split("=");
            name=name?.trim();
            if (!name) {
                cookies[name] = decodeURIComponent(rest.join("=").trim());
            }
        });
    }
    return cookies;
}

export async function getFormData(request) {
    // Retrieve the form data from the incoming request
    const formData = await request.formData();
    const formDataEntries = {};
    for (const [key, value] of formData.entries()) {
    formDataEntries[key] = value;
    }
    return formDataEntries;
}

export function getSearchParamsAsJson(request) {
    // Create a URL object from the request URL
    const url = new URL(request.url);
    
    // Get all search parameters
    const searchParams = url.searchParams;
    
    // Convert search parameters to a JSON object
    const paramsObj={};
    searchParams.forEach((value, key) => {
        //console.log("key ",key);
        //console.log("value ",value);
      if (paramsObj[key]) {
        // If the key already exists, convert it to an array and add the new value
        if (Array.isArray(paramsObj[key])) {
          paramsObj[key].push(value);
        } else {
          paramsObj[key] = [paramsObj[key], value];
        }
      } else {
        paramsObj[key] = value;
      }
    });
    
    return paramsObj;
}
  
