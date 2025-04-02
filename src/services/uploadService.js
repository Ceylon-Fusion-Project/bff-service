const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const upload = multer({ dest: "temp_uploads/" }); // temporary storage

router.post("/upload-certificate", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const form = new FormData();

    form.append("file", fs.createReadStream(filePath));
    form.append("type", req.body.type || "other"); // 'image' or 'other'

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

    fs.unlinkSync(filePath); // clean temp
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
