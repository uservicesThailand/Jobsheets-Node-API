const db = require("../../../../models");

const uploadImages = async (inspNo, files) => {
  try {
    return {
      success: true,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadImages };
