const jwtUtil = require("../utils/jwt.util");
const reqUtil = require("../utils/response.util");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return reqUtil.failResponse(res, "Unauthorized: Token is missing", 401);
  }

  const tokenParts = token.split(" ");

  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return reqUtil.failResponse(res, "Unauthorized: Invalid token format", 401);
  }

  const decoded = jwtUtil.verifyToken(tokenParts[1]);
  if (decoded.status !== "success") {
    return reqUtil.failResponse(res, `Unauthorized: ${decoded.message}`, 401);
  }

  req.userKey = decoded.data.userKey;

  next();
};

module.exports = authMiddleware;
