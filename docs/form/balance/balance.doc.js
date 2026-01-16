module.exports = {
  "/api/forms/balance/{inspNo}": {
    post: {
      tags: ["form balance"],

      security: [{ BearerAuth: [] }],

      parameters: [
        {
          name: "inspNo",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          example: "URY-251111-001",
        },
      ],

      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              example: {
                status: "success",
                message: "created successfully",
                data: {
                  inspNo: "URY-251111-001",
                  inspSv: "SVRY2501-0001",
                  updatedBy: "dontstarve together",
                  createdBy: "dontstarve together",
                  updatedAt: "1999-01-01T12:59:59.000Z",
                  createdAt: "1999-01-01T12:59:59.000Z",
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance"],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "inspNo",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "URY-251111-001",
        },
      ],
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              example: {
                status: "success",
                message: "fetched successfully",
                data: {
                  inspNo: "URY-251111-001",
                  inspSv: "SVRY2501-0001",
                  updatedBy: "dontstarve together",
                  createdBy: "dontstarve together",
                  updatedAt: "1999-01-01T12:59:59.000Z",
                  createdAt: "1999-01-01T12:59:59.000Z",
                },
              },
            },
          },
        },
      },
    },

    delete: {
      tags: ["form balance"],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "inspNo",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "URY-251111-001",
        },
      ],
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              example: {
                status: "success",
                message: "deleted successfully",
              },
            },
          },
        },
      },
    },
  },
};
