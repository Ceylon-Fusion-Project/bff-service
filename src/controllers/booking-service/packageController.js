const packageService = require("../../services/booking-service/packageService");

exports.savePackage = async (req, res) => {
  try {
    const data = await packageService.savePackage(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Accommodation saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updatePackageDetails = async (req, res) => {
  try {
    const data = await packageService.updatePackageDetails(req);
    res.status(200).json({
      message: "Accommodation Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deletePackageByID = async (req, res) => {
  try {
    const data = await packageService.deletePackageByID(req);
    res.status(200).json({
      message: "Accommodation Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const data = await packageService.getPackageById(req);
    res.status(200).json({
      message: "Accommodation Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllPackages = async (req, res) => {
  try {
    const data = await packageService.getAllPackages(req);
    res.status(200).json({
      message: "All Accommodations",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getEntirePackages = async (req, res) => {
  try {
    const data = await packageService.getEntirePackages();
    res.status(200).json({
      message: "Entire Accommodations",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
