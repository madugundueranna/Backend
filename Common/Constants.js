// Required fields for User Registration
exports.REGISTRATION_REQUIRED_FIELDS = ["name", "email", "password","companyName", "mobileNumber", "isAgency"];
exports.LOGIN_REQUIRED_FIELDS = ["email", "password"];



exports.ERROR_MESSAGES = {
  LOGIN_CREDENTIALS_CHECK: "Email and Password are required.",
  INVALID_PASSWORD:
    "Password must be at least 8 characters long and include a special character, a lowercase letter, an uppercase letter, and a digit.",
  ALREADY_EXISTS: (name) => `${name} already exists.`,
  ALREADY_REGISTER: (name) => `${name} already Register.`,
  REGISTRATION_FAILED: "Failed to Register",
  CREATE_FAILED: "Failed to Create",
  INVALID_CREDENTIALS_CHECK: "Incorrect Password, please check.",
  INVALID_EMAIL: "Email doesn't exists",
  LOGIN_FAILED: "Failed to login with these credentials",

  NOT_FOUND: (name) => `${name} details not found.`,
  UPDATE_FAILED: (name) => `Failed to update ${name} details.`,
  STATUS_FAILED: (name) => `Failed to change ${name} status.`,
  FETCH_FAILED: "Failed to fetch details",
  STATUS_UPDATE_FAILED: "Failed to update status",
  ROLE_NOT_FOUND:
    "You don't have permission to view this details, check your role",
  INVALID_ATTENDANCE_STATUS: "Invalid attendance Type value. Only 'online' or 'in-person' are allowed",
  INVALID_SCHEDULE_STATUS: "Invalid schedule Type value. Only 'weekly' or 'monthly' or 'allAtOnce' are allowed",
  DELETION_FAILED: (name) => `Failed to delete ${name}`,
  CREATE_SENT: "Failed to sent",
  DELETE_FAILED: (name) => `Failed to delete ${name}`,
  ID_NOT_FOUND: (name) =>
    `${name} ID is required in params and must be a 24 characters HEX Code`,
  LINK_ALREADY_USED: "Link already used",
  RESET_PASSWORD_FAILED: "Failed to reset password, please check.",
  REST_PASSWORD_FAILED: "Failed to create rest password",
  PASSWORD_EXPIRED: "Password reset link has expired.",
};

// Response messages

exports.RESPONSE_MESSAGES = {
  REGISTRATION_SUCCESS: (name) => `${name} registered successfully.`,
  FETCH_SUCCESS: (role) => `${role} details fetched successfully`,
  FETCH_NOT_FOUND: (role) => `${role} details not found`,
  UPDATE_SUCCESS: (role) => `${role} details updated successfully.`,
  STATUS_UPDATED_SUCCESS: (role) => `${role} status updated successfully`,
  LOGIN_SUCCESS: (name) => `${name} Login Successful`,
  CHANGE_PASSWORD_SUCCESS: "Successfully changed password",
  CREATION_SUCCESS: (name) => `${name} created successfully`,
  FILE_UPLOAD_SUCCESS: "File upload successful",
  DELETION_SUCCESS: (name) => `${name} deleted successfully`,
  SENT_SUCCESS: (name) => `${name} Successfully`,
  REST_PASSWORD_SUCCESS: "Password reset link sent to your email",
  RESET_PASSWORD_SUCCESS: "Successfully password Created",
};
