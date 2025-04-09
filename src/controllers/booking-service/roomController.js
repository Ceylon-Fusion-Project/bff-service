const roomService = require("../../services/booking-service/roomService");

exports.saveRoom = async (req, res) => {
  try {
    const data = await roomService.saveRoom(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Room saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateRoomDetails = async (req, res) => {
  try {
    const data = await roomService.updateRoomDetails(req);
    res.status(200).json({
      message: "Room Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteRoomByID = async (req, res) => {
  try {
    const data = await roomService.deleteRoomByID(req);
    res.status(200).json({
      message: "Room Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const data = await roomService.getRoomById(req);
    res.status(200).json({
      message: "Room Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getRoomByAccommodationId = async (req, res) => {
  try {
    const data = await roomService.getRoomByAccommodationId(req);
    res.status(200).json({
      message: "Room Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getRoomByFiltering = async (req, res) => {
  try {
    const data = await roomService.getRoomByFiltering(req);
    res.status(200).json({
      message: "Room Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllRoomsWithSort = async (req, res) => {
  try {
    const data = await roomService.getAllRoomsWithSort(req);
    res.status(200).json({
      message: "All Rooms",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllRooms = async (req,res) => {
  try {
    const data = await roomService.getAllRooms();
    res.status(200).json({
      message: "All Rooms",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
