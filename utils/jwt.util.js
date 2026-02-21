const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "dev-secret-key";

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY);
};

const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, SECRET_KEY);
    return { status: "success", data: data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = { generateToken, verifyToken };
