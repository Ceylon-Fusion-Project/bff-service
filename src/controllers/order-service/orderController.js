const orderService = require("../../services/order-service/orderService");

exports.getOrdersByUserId = async (req, res) => {
  try {
    const data = await orderService.getOrdersByUserId(req);
    res.status(200).json({
      message: "Orders Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllOrders= async (req, res) => {
    try {
      const data = await orderService.getAllOrders(req);
      res.status(200).json({
        message: "Orders Fetched Successfully",
        data: data,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  exports.placeOrderFromCart= async (req, res) => {
    try {
      const data = await orderService.placeOrderFromCart(req);
      res.status(200).json({
        message: "Order Placed Successfully",
        data: data,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  exports.placeDirectOrder= async (req, res) => {
    try {
      const data = await orderService.placeDirectOrder(req);
      res.status(200).json({
        message: "Order Placed Successfully",
        data: data,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  exports.cancelOrderByOrderId= async (req, res) => {
    try {
      const data = await orderService.cancelOrderByOrderId(req);
      res.status(200).json({
        message: "Order Cancelled Successfully",
        data: data,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

