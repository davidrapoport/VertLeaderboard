const {
  isSnowBirdLift,
  getSnowBirdLiftName,
  getSnowBirdVert,
} = require("./SnowbirdUtils");
const { log } = require("firebase-functions/logger");
const fetch = require("node-fetch");

async function scrapeRides(webId) {
  const authCookies = await getAuthCookies();
  const headers = Object.assign({}, authCookies);
  headers["Content-Type"] = "application/json";
  headers.Accept = "application/json";
  const metadataResponse = await getUserMetadata(headers, webId);
  const metadataResponseBody = await metadataResponse.json();
  return await getRideData(
    metadataResponseBody,
    metadataResponse.headers,
    headers
  );
}

const getAuthCookies = async () => {
  const lookupUrl = "https://shop.alta.com/customer/login";
  const lookupResponse = await fetch(lookupUrl, {
    method: "GET",
  });
  if (lookupResponse.status !== 200) {
    throw new Error(`Lookup request failed with  
                        code ${lookupResponse.status}`);
  }
  const cookies = getCookiesFromResponseHeader(lookupResponse.headers);
  const headers = Object.assign(
    {
      "Content-Type": "application/json",
      Referer: "https://shop.alta.com/customer/login",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0",
      Origin: "https://shop.alta.com",
      Accept: "application/json",
    },
    cookies
  );
  const url = "https://shop.alta.com/customer/login";
  const data = {
    email: "drapoport847@gmail.com",
    password: "9d6JQ47JZrhG",
  };
  const headersResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: headers,
  });
  if (headersResponse.status > 299) {
    log("403 headers:", headersResponse.headers.raw());
    throw new Error(`Request to alta.com failed with error 
                        code ${headersResponse.status}
                        Maybe the server is down or you aren't connected
                        to the internet?`);
  }
  let authedCookies = getCookiesFromResponseHeader(headersResponse.headers);
  // responseBody = await headersResponse.text();
  // Old version No longer needed
  // CSRFToken = getCSRFToken(responseBody);
  // authedCookies["X-CSRF-TOKEN"] = CSRFToken;
  return authedCookies;
};

const getUserMetadata = async (requestHeaders, webId) => {
  const data = { axess_wtp: webId };
  const url = "https://shop.alta.com/axess/ski-history";
  const webIdResponse = await fetch(url, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(data),
  });
  if (webIdResponse.status !== 200) {
    if (webIdResponse.status === 422) {
      throw new Error("Invalid Web Id, please re-enter it and try again.");
    }
    throw new Error(
      "Request to alta.com failed with error " +
        `code ${webIdResponse.status}. ` +
        "Maybe the server is down or you aren't connected " +
        "to the internet?"
    );
  }
  return webIdResponse;
};

const getCookiesFromResponseHeader = (responseHeader) => {
  const headers = responseHeader.get("set-cookie");
  // Split into individual cookies
  const cookiesText = headers.split(",");
  let xsrfToken = "";
  let xsrfCookie = "";
  let altaSessionCookie = "";
  // Remove cookie metadata and keep COOKIE-NAME=COOKIEVALUE
  for (const cookieText of cookiesText) {
    const cookieData = cookieText.split(";")[0].trim();
    if (cookieData.startsWith("XSRF-TOKEN")) {
      xsrfCookie = cookieData;
      xsrfToken = decodeURIComponent(
        cookieData.split("=").slice(1).join("=").trim()
      );
    } else if (cookieData.startsWith("alta_ski_area_session")) {
      altaSessionCookie = cookieData;
    }
  }
  const cookies = {
    "X-XSRF-TOKEN": xsrfToken,
  };
  // if (Platform.OS !== 'ios') {
  cookies.Cookie = xsrfCookie + "; " + altaSessionCookie;
  // }
  return cookies;
};

const getCSRFToken = (response) => {
  return /<meta name="csrf-token"\s*content="(\w*)"/gm.exec(response)[1];
};

// Need to extract the data from the auth response to use in the rides request.
// Also need to update to the new XSRF-TOKEN
const getRideData = async (
  authResponseBody,
  authResponseHeaders,
  requestHeaders
) => {
  let ridesResponse;
  // TODO error handling of malformed WTP.
  for (let i = 0; i < authResponseBody.transactions.length; i++) {
    const transactions = authResponseBody.transactions[i];
    const rideRequestBody = {
      nposno: transactions.nposno,
      nprojno: transactions.nprojno,
      nserialno: transactions.nserialno,
      szvalidfrom: transactions.szvalidfrom,
    };
    const cookies = getCookiesFromResponseHeader(authResponseHeaders);
    Object.assign(cookies, requestHeaders);
    ridesResponse = await fetch(
      "https://shop.alta.com/axess/ski-history/rides",
      {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(rideRequestBody),
      }
    );
    if (ridesResponse.status !== 200) {
      continue;
    }
    const data = await ridesResponse.json();
    return parseRides(data);
  }
  throw new Error(`Request to alta.com failed with error 
                        code ${ridesResponse.status}
                        Maybe the server is down or you aren't connected
                        to the internet?`);
};

const parseDate = (str) => new Date(str.replace(/(\d+)(st|nd|rd|th)/, "$1"));

const to24Hour = (time) => {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");
  if (modifier === "am" && hours === "12") hours = "00";
  if (modifier === "pm" && hours !== "12") hours = String(parseInt(hours) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
};

const parseRides = (ridesJson) => {
  const rides = ridesJson.rides;
  const parsed = [];
  rides.forEach((daysRides) => {
    if (daysRides.length === 0) {
      return;
    }

    let parsedRides = daysRides.map((ride) => {
      const rideData = {
        date: parseDate(ride.szdateofride),
        isSnowBird: isSnowBirdLift(ride.szpoename),
        time: to24Hour(ride.sztimeofride),
        timestamp:
          parseDate(ride.szdateofride) + "T" + to24Hour(ride.sztimeofride),
      };
      if (isSnowBirdLift(ride.szpoename)) {
        Object.assign(rideData, {
          vert: getSnowBirdVert(ride.szpoename),
          lift: getSnowBirdLiftName(ride.szpoename),
          isSnowBird: true,
        });
      } else {
        Object.assign(rideData, {
          vert: ride.nverticalfeet.replace(",", "") ?? 0,
          lift: ride.szpoename,
          isSnowBird: false,
        });
      }
      log(rideData);
      return rideData;
    });
    parsedRides = filterOutSugarPass(parsedRides);
    parsedRides = dedupeLaps(parsedRides);

    parsed.push({
      date: parseDate(daysRides[0].szdateofride),
      totalVert: getDaysVert(parsedRides),
      rides: parsedRides,
    });
  });
  return parsed;
};

const filterOutSugarPass = (rides) => {
  return rides.filter((ride) => !ride.lift.startsWith("Sugar Pass"));
};

const dedupeLaps = (rides) => {
  const filteredRides = [];
  if (rides.length <= 1) {
    return rides;
  }
  for (let i = 0; i < rides.length - 1; i++) {
    const thisLapTime = new Date("1970-01-01T" + rides[i].time).getTime();
    const nextLapTime = new Date("1970-01-01T" + rides[i + 1].time).getTime();
    const diffSec = (nextLapTime - thisLapTime) / 1000;
    if (diffSec < 120) {
      continue;
    }
    filteredRides.push(rides[i]);
  }
  filteredRides.push(rides[rides.length - 1]);
  return filteredRides;
};

const getDaysVert = (rides) => {
  return rides.reduce((acc, { vert }) => {
    return parseInt(vert) + acc;
  }, 0);
};

exports.scrapeRides = scrapeRides;
