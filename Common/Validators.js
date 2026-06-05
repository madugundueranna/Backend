
// Checks if required fields are present in the request body

exports.getMissingFields = (body, requiredFields) => {
  return requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null
  );
};

