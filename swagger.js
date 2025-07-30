// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Inspection API Docs',
            version: '1.0.0',
            description: 'รวม endpoint ทั้งหมดที่ใช้ในระบบ',
        },
    },
    tags: [
        { name: 'Teams', description: 'การจัดการทีมและสมาชิก' },
        { name: 'Auth', description: 'ระบบเข้าสู่ระบบ' },
        { name: 'Inspection', description: 'ข้อมูลตรวจสอบ' },
        { name: 'QA', description: 'งานตรวจสอบคุณภาพ' }
    ],
    apis: ['./swagger-docs.js'], // ⬅️ เขียน doc ในไฟล์ routes ด้วย comment แบบ Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
