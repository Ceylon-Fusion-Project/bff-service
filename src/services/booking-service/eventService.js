const axios = require("axios");

// exports.saveEvent = async (req) => {
//   //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
//   const token = req.cookies.jwt;
//   if (!token) throw new Error("Unauthorized");
//   const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/save-event`;

//   const {
//     startDateTime,
//     endDateTime,
//     isAvailable,
//     ...rest
//   } = req.body;

//   function parseTime(datetimeString) {
//     const date = new Date(datetimeString);
//     return {
//       hour: date.getHours(),
//       minute: date.getMinutes(),
//       second: date.getSeconds(),
//       nano: 0, // Assuming nano not needed or always zero
//     };
//   }

//   const payload = {
//     ...rest,
//     startTime: parseTime(startDateTime),
//     endTime: parseTime(endDateTime),
//     available: isAvailable ?? true,
//   };

//   console.log("🚀 Transformed Event Payload:", payload);

//   const response = await axios.post(url, payload, {
//     headers: {
//       Authorization: `Bearer ${token}`, // Attach token for authorization
//     },
//   });

//   return response.data; // Return backend response to the front-end
// };

// exports.saveEvent = async (req) => {
//     const token = req.cookies.jwt;
//     if (!token) throw new Error("Unauthorized");
  
//     const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/save-event`;
  
//     const {
//       startDateTime,
//       endDateTime,
//       isAvailable,
//       ...rest
//     } = req.body;
  
//     // Convert datetime string (e.g., "2025-04-22T08:00") -> "08:00:00"
//     function toLocalTimeString(datetime) {
//       const date = new Date(datetime);
//       return date.toTimeString().split(" ")[0]; // "08:00:00"
//     }
  
//     const payload = {
//       ...rest,
//       startTime: toLocalTimeString(startDateTime),
//       endTime: toLocalTimeString(endDateTime),
//       available: isAvailable ?? true,
//     };
  
//     console.log("🚀 Final Payload for Spring Boot:", payload);
  
//     const response = await axios.post(url, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
  
//     return response.data;
//   };

// exports.saveEvent = async (req) => {
//     const token = req.cookies.jwt;
//     if (!token) throw new Error("Unauthorized");
  
//     const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/save-event`;
  
//     const {
//       startDateTime,
//       endDateTime,
//       isAvailable,
//       ...rest
//     } = req.body;
  
//     // ✅ Function to extract time from ISO datetime
//     function toLocalTimeString(datetime) {
//       const date = new Date(datetime);
//       return date.toTimeString().split(" ")[0]; // returns "HH:MM:SS"
//     }
  
//     // ✅ Function to extract date from ISO datetime
//     function toDateString(datetime) {
//       const date = new Date(datetime);
//       return date.toISOString().split("T")[0]; // returns "YYYY-MM-DD"
//     }
  
//     const payload = {
//       ...rest,
//       startDate: toDateString(startDateTime),
//       endDate: toDateString(endDateTime),
//       startTime: toLocalTimeString(startDateTime),
//       endTime: toLocalTimeString(endDateTime),
//       available: isAvailable ?? true,
//     };
  
//     console.log("🚀 Final Payload for Spring Boot:", payload);
  
//     const response = await axios.post(url, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
  
//     return response.data;
//   };  
  
exports.saveEvent = async (req) => {
    const token = req.cookies.jwt;
    if (!token) throw new Error("Unauthorized");
  
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/save-event`;
  
    const {
      startDateTime,
      endDateTime,
      isAvailable,
      ...rest
    } = req.body;
  
    const payload = {
      ...rest,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      available: isAvailable ?? true,
    };
  
    console.log("🚀 Final Payload for Spring Boot:", payload);
  
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.data;
  };  

exports.getAllEventWithSort = async (req) => {
  const { status, sort, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/get-all-events-paginated`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const params = Object.fromEntries(
    Object.entries({
      status,
      sort,
      page:0,
      size:10,
    }).filter(([_, value]) => value !== undefined)
  );

  const response = await axios.get(url, {
    //headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};

exports.getAllEvents = async () => {
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/get-all-events`;
    const response = await axios.get(url);
    return response.data;
  };

exports.getEventById = async (req) => {
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/get-event-details-by-id`;

  const response = await axios.get(url, {
    params: { id },
  });
  return response.data;
};

exports.getEventByExperienceId = async (req) => {
  const { experienceId, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/get-events-by-experience-id-paginated`;

  const response = await axios.get(url, {
    params: { experienceId, page, size },
  });
  return response.data;
};

// exports.updateEventDetails = async (req) => {
//   //const token = req.kauth.grant.access_token.token;
//   const token = req.cookies.jwt;
//   if (!token) throw new Error("Unauthorized");
//   const { id } = req.query;
//   const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/update-event-details`;

//   const response = await axios.patch(url, req.body, {
//     headers: { Authorization: `Bearer ${token}` },
//     params: { id },
//   });

//   return response.data;
// };

exports.updateEventDetails = async (req) => {
    const token = req.cookies.jwt;
    if (!token) throw new Error("Unauthorized");
  
    const { id } = req.query;
  
    const {
      startDateTime,
      endDateTime,
      isAvailable,
      ...rest
    } = req.body;
  
    const payload = {
      ...rest,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      available: isAvailable ?? true,
    };
  
    console.log("✅ FINAL PAYLOAD TO BACKEND:", payload);
  
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/update-event-details`;
  
    const response = await axios.patch(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });
  
    return response.data;
  };  

exports.deleteEventByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/delete-event-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.getEventByFiltering = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const { eventName, minPrice, maxPrice, startTime, endTime, isAvailable, sort, page, size } =
    req.query;

  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/event/get-event-by-filtering`;

  // Remove undefined values from the params object
  const params = Object.fromEntries(
    Object.entries({
        eventName, 
        minPrice, 
        maxPrice, 
        startTime, 
        endTime, 
        isAvailable, 
        sort, 
        page, 
        size
    }).filter(([_, value]) => value !== undefined)
  );

  const response = await axios.get(url, {
    //headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};


