const experienceService = require("../../services/booking-service/experienceService");

exports.saveExperience = async (req, res) => {
  try {
    const data = await experienceService.saveExperience(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Accommodation saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateExperienceDetails = async (req, res) => {
  try {
    const data = await experienceService.updateExperienceDetails(req);
    res.status(200).json({
      message: "Accommodation Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteExperienceByID= async (req, res) => {
  try {
    const data = await experienceService.deleteExperienceByID(req);
    res.status(200).json({
      message: "Accommodation Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getExperienceById = async (req, res) => {
  try {
    const data = await experienceService.getExperienceById(req);
    res.status(200).json({
      message: "Accommodation Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getExperienceByFiltering = async (req, res) => {
  try {
    const data = await experienceService.getExperienceByFiltering(req);
    res.status(200).json({
      message: "Accommodation Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllExperience = async (req, res) => {
  try {
    const data = await experienceService.getAllExperience(req);
    res.status(200).json({
      message: "All Accommodations",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getEntireExperience = async (req, res) => {
  try {
    const data = await experienceService.getEntireExperience();
    res.status(200).json({
      message: "Entire Accommodations",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
