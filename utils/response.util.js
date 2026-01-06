const successResponse = (res, data, msg = "Success", code = 200) => {
  const response = { status: "success", message: msg };
  if (data) response.data = data;
  return res.status(code).json(response);
};

const failResponse = (res, msg = "Fail", code = 400) =>
  res.status(code).json({ status: "fail", message: msg });

const errorResponse = (res, msg = "Error", code = 500) =>
  res.status(code).json({ status: "error", message: msg });

module.exports = { successResponse, errorResponse, failResponse };
