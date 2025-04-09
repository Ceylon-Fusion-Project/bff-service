const axios = require("axios");

exports.saveRoom = async (req) => {
  //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/save-room`;

  const roomData = {
    ...req.body,
    isAvailable: true, // ✅ explicitly set here
  };

  console.log(roomData);

  const response = await axios.post(url, roomData, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getAllRoomsWithSort = async (req) => {
  const { status, sort, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/get-all-rooms-paginated`;
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

exports.getAllRooms = async () => {
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/get-all-rooms`;
    const response = await axios.get(url);
    return response.data;
  };

exports.getRoomById = async (req) => {
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/get-room-details-by-id`;

  const response = await axios.get(url, {
    params: { id },
  });
  return response.data;
};

exports.getRoomByAccommodationId = async (req) => {
  const { accommodationId, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/get-rooms-by-accommodation-id-paginated`;

  const response = await axios.get(url, {
    params: { accommodationId, page, size },
  });
  return response.data;
};

exports.updateRoomDetails = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/update-room-details`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.deleteRoomByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/delete-room-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.getRoomByFiltering = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const { roomType, minPrice, maxPrice, isAvailable, sort, page, size } =
    req.query;

  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/room/get-room-by-filtering`;

  // Remove undefined values from the params object
  const params = Object.fromEntries(
    Object.entries({
      roomType,
      minPrice,
      maxPrice,
      isAvailable,
      sort,
      page,
      size,
    }).filter(([_, value]) => value !== undefined)
  );

  const response = await axios.get(url, {
    //headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};


