const certService = require("../../services/product-service/certificationService");

exports.saveCertificate = async (req, res) => {
  try {
    const data = await certService.saveCertificate(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Certificate saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateCertificateDetails = async (req, res) => {
  try {
    const data = await certService.updateCertificateDetails(req);
    res.status(200).json({
      message: "Certificate Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteCertificateByID = async (req, res) => {
  try {
    const data = await certService.deleteCertificateByID(req);
    res.status(200).json({
      message: "Certificate Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getCertificateById = async (req, res) => {
  try {
    const data = await certService.getCertificateByProductId(req);
    res.status(200).json({
      message: "Certificate Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllCertifications = async (req, res) => {
  try {
    const data = await certService.getCertifications(req);
    res.status(200).json({
      message: "All Certifications Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};