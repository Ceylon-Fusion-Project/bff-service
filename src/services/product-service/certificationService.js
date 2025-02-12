const axios = require("axios");

exports.saveCertificate = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/certificate/save-certificate`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getCertificateByProductId = async (req) => {
  const { productID, sort, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/certificate/get-certificate-by-product-id`;

  const response = await axios.get(url, {
    params: {
      productID,
      sort,
      page,
      size,
    },
  });
  return response.data;
};

exports.updateCertificateDetails = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { certificationID } = req.query;
  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/certificate/update-certificate`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { certificationID },
  });

  return response.data;
};

exports.deleteCertificateByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { certificationID } = req.query;
  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/certificate/delete-certificate-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { certificationID },
  });

  return response.data;
};
