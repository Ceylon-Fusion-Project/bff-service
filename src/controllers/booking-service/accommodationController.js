const accommodationService = require("../../services/booking-service/accommodationService");

exports.saveAccommodation = async (req, res) => {
  try {
    const data = await accommodationService.saveAccommodation(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Accommodation saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateAccommodationDetails = async (req, res) => {
  try {
    const data = await accommodationService.updateAccommodationDetails(req);
    res.status(200).json({
      message: "Accommodation Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteAccommodationByID = async (req, res) => {
  try {
    const data = await accommodationService.deleteAccommodationByID(req);
    res.status(200).json({
      message: "Accommodation Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAccommodationById = async (req, res) => {
  try {
    const data = await accommodationService.getAccommodationById(req);
    res.status(200).json({
      message: "Accommodation Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAccommodationByFiltering = async (req, res) => {
  try {
    const data = await accommodationService.getAccommodationByFiltering(req);
    res.status(200).json({
      message: "Accommodation Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllAccommodation = async (req, res) => {
  try {
    const data = await accommodationService.getAllAccommodation(req);
    res.status(200).json({
      message: "All Accommodations",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getEntireAccommodation = async (req, res) => {
  try {
    const data = await accommodationService.getEntireAccommodations();
    res.status(200).json({
      message: "Entire Accommodations",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
