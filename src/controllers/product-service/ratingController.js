const ratingService = require("../../services/product-service/ratingService");

exports.saveRate = async (req, res) => {
  try {
    const data = await ratingService.saveRating(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Rating saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateRatingDetails = async (req, res) => {
  try {
    const data = await ratingService.updateRatingDetails(req);
    res.status(200).json({
      message: "Rating Details Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteRatingsByID = async (req, res) => {
  try {
    const data = await ratingService.deleteRatingByID(req);
    res.status(200).json({
      message: "Rating Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getRatingsByProductId = async (req, res) => {
  try {
    const data = await ratingService.getRatingsByProductId(req);
    res.status(200).json({
      message: "Ratings Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getRatingsByUserId = async (req, res) => {
    try {
      const data = await ratingService.getRatingsByUserId(req);
      res.status(200).json({
        message: "Ratings Fetched Successfully",
        data: data,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };