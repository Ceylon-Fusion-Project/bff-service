const originService = require("../../services/product-service/originService");

exports.saveOrigin = async (req, res) => {
  try {
    const data = await originService.saveOrigin(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Origin saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateOriginDetails = async (req, res) => {
  try {
    const data = await originService.updateOriginDetails(req);
    res.status(200).json({
      message: "Origin Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteOriginByID = async (req, res) => {
  try {
    const data = await originService.deleteOriginByID(req);
    res.status(200).json({
      message: "Origin Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getOriginById = async (req, res) => {
  try {
    const data = await originService.getOriginById(req);
    res.status(200).json({
      message: "Origin Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};