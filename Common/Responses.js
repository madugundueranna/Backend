// Standard Error Response Function

exports.sendErrorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

// Standard Success Response Function

exports.sendSuccessResponse = (
  res,
  status,
  message,
  data = {},
  keyName = "list"
) => {
  let responseData = {};

  // Check if data is an array, object, or empty

  if (Array.isArray(data)) {
    responseData[keyName] = data;
  } else if (data !== null && typeof data === "object" && Object.keys(data).length > 0) {
    responseData[keyName] = data;
  }

  return res.status(status).json({ success: true, message, ...responseData });
};

// Creation Success Response Function

exports.sendCreateSuccessResponse = (res, status, message, data = {}) => {
  return res.status(status).json({ success: true, message, ...data });
};

// Login Success Response Function

exports.sendLoginSuccessResponse = (res, status, message, user) => {
  return res.status(status).json({
    success: true,
    message,
    user,
  });
};
