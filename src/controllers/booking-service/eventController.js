const eventService = require("../../services/booking-service/eventService");

exports.saveEvent = async (req, res) => {
  try {
    const data = await eventService.saveEvent(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Room saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateEventDetails = async (req, res) => {
  try {
    const data = await eventService.updateEventDetails(req);
    res.status(200).json({
      message: "Room Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteEventByID = async (req, res) => {
  try {
    const data = await eventService.deleteEventByID(req);
    res.status(200).json({
      message: "Room Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const data = await eventService.getEventById(req);
    res.status(200).json({
      message: "Room Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getEventByExperienceId = async (req, res) => {
  try {
    const data = await eventService.getEventByExperienceId(req);
    res.status(200).json({
      message: "Room Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getEventByFiltering = async (req, res) => {
  try {
    const data = await eventService.getEventByFiltering(req);
    res.status(200).json({
      message: "Room Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllEventWithSort = async (req, res) => {
  try {
    const data = await eventService.getAllEventWithSort(req);
    res.status(200).json({
      message: "All Rooms",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllEvents = async (req,res) => {
  try {
    const data = await eventService.getAllEvents();
    res.status(200).json({
      message: "All Rooms",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
