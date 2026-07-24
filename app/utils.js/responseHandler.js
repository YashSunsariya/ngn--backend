export const handleResponse = (
  res,
  statusCode,
  message = "Success",
  data = null,
) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data,
  });
};
