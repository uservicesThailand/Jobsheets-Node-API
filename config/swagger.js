const swaggerUi = require("swagger-ui-express");
const docs = require("../docs");

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Inspection API Docs",
    version: "1.0.0",
    description: "รวม endpoint ทั้งหมดที่ใช้ในระบบ",
  },
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  ...docs,
};

module.exports = { swaggerUi, swaggerSpec };
