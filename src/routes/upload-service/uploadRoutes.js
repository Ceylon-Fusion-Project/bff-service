const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const upload = multer({ dest: "temp_uploads/" });

module.exports = (keycloak) => {
  const router = express.Router();

  router.post("/product", upload.single("file"), async (req, res) => {
    try {
      const filePath = req.file.path;
      const form = new FormData();
      const originalName = req.file.originalname;

      form.append("file", fs.createReadStream(filePath), originalName);
      form.append("type", req.body.type || "other");

      const response = await axios.post(
        `${process.env.API_GATEWAY_URL}/product-service/api/v1/upload/upload-file`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${req.cookies.jwt}`,
          },
        }
      );

      fs.unlinkSync(filePath);
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
