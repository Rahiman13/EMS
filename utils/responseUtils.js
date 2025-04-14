// Standard API Response
exports.sendSuccess = (res, data, message = 'Success') => {
    return res.status(200).json({ success: true, message, data });
  };
  
  // Error Response
  exports.sendError = (res, message = 'Error occurred', statusCode = 400) => {
    return res.status(statusCode).json({ success: false, message });
  };
  