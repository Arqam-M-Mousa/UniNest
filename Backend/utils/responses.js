const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Standard success response
 */
const sendSuccess = (
  res,
  data,
  message = "Success",
  statusCode = HTTP_STATUS.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard error response
 */
const sendError = (
  res,
  message = "An error occurred",
  statusCode = HTTP_STATUS.SERVER_ERROR,
  error = null,
  details = null
) => {
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    if (error?.message) response.errorDetails = error.message;
    if (error?.stack) response.stack = error.stack;
    if (details) response.details = details;
  } else {
    if (error?.code) response.errorCode = error.code;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 */
const sendValidationError = (res, errors, message = "Validation failed") => {
  return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
    statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Centralized error handler
 */
const handleError = (res, error, defaultMessage = "Server error") => {
  console.error("[ERROR]", {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
  });

  let statusCode = error?.status || HTTP_STATUS.SERVER_ERROR;
  let message = error?.message || defaultMessage;

  switch (error?.name) {
    case "ValidationError":
      statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
      message = "Validation error";
      break;
    case "UnauthorizedError":
      statusCode = HTTP_STATUS.UNAUTHORIZED;
      message = "Unauthorized";
      break;
    case "ForbiddenError":
      statusCode = HTTP_STATUS.FORBIDDEN;
      message = "Forbidden";
      break;
    case "NotFoundError":
      statusCode = HTTP_STATUS.NOT_FOUND;
      message = "Resource not found";
      break;
    default:
      break;
  }

  return sendError(res, message, statusCode, error);
};

/**
 * Shortcuts
 */
const sendNotFound = (res, message = "Resource not found") =>
  sendError(res, message, HTTP_STATUS.NOT_FOUND);

const sendUnauthorized = (res, message = "Unauthorized") =>
  sendError(res, message, HTTP_STATUS.UNAUTHORIZED);

const sendForbidden = (res, message = "Forbidden") =>
  sendError(res, message, HTTP_STATUS.FORBIDDEN);

module.exports = {
  HTTP_STATUS,
  sendSuccess,
  sendError,
  sendValidationError,
  handleError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
};
