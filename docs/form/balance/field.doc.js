module.exports = {
  "/api/forms/balance/field/{inspNo}": {
    post: {
      tags: ["form balance field"],

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

      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              checkResult: "C1",
              note: "note",
            },
          },
        },
      },

      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              example: {
                status: "success",
                message: "created successfully",
                data: {
                  checkResult: "C1",
                  note: "note",
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance field"],
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
                  checkResult: "C1",
                  note: "note",
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/balance/field/position/{inspNo}": {
    post: {
      tags: ["form balance field"],

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

      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              data: [
                {
                  positionIndex: 1,
                  positionName: 10.11,
                  beforeUnbalance: 10.21,
                  beforeDegree1: 10.31,
                  beforeWeight: 10.41,
                  beforeDegree2: 10.51,
                  afterUnbalance: 10.61,
                  afterDegree1: 10.71,
                  afterWeight: 10.81,
                  afterDegree2: 10.91,
                },
                {
                  positionIndex: 2,
                  positionName: 20.11,
                  beforeUnbalance: 20.21,
                  beforeDegree1: 20.31,
                  beforeWeight: 20.41,
                  beforeDegree2: 20.51,
                  afterUnbalance: 10.61,
                  afterDegree1: 20.71,
                  afterWeight: 20.81,
                  afterDegree2: 20.91,
                },
              ],
            },
          },
        },
      },

      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              example: {
                status: "success",
                message: "created successfully",
                data: [
                  {
                    positionIndex: 1,
                    positionName: 10.11,
                    beforeUnbalance: 10.21,
                    beforeDegree1: 10.31,
                    beforeWeight: 10.41,
                    beforeDegree2: 10.51,
                    afterUnbalance: 10.61,
                    afterDegree1: 10.71,
                    afterWeight: 10.81,
                    afterDegree2: 10.91,
                  },
                  {
                    positionIndex: 2,
                    positionName: 20.11,
                    beforeUnbalance: 20.21,
                    beforeDegree1: 20.31,
                    beforeWeight: 20.41,
                    beforeDegree2: 20.51,
                    afterUnbalance: 10.61,
                    afterDegree1: 20.71,
                    afterWeight: 20.81,
                    afterDegree2: 20.91,
                  },
                ],
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance field"],
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
                data: [
                  {
                    positionIndex: 1,
                    positionName: 10.11,
                    beforeUnbalance: 10.21,
                    beforeDegree1: 10.31,
                    beforeWeight: 10.41,
                    beforeDegree2: 10.51,
                    afterUnbalance: 10.61,
                    afterDegree1: 10.71,
                    afterWeight: 10.81,
                    afterDegree2: 10.91,
                  },
                  {
                    positionIndex: 2,
                    positionName: 20.11,
                    beforeUnbalance: 20.21,
                    beforeDegree1: 20.31,
                    beforeWeight: 20.41,
                    beforeDegree2: 20.51,
                    afterUnbalance: 10.61,
                    afterDegree1: 20.71,
                    afterWeight: 20.81,
                    afterDegree2: 20.91,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/balance/field/location/{inspNo}": {
    post: {
      tags: ["form balance field"],

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

      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              data: [
                {
                  location: "P1",
                  beforeH: 10.21,
                  beforeV: 10.31,
                  beforeA: 10.41,
                  afterH: 10.51,
                  afterV: 10.61,
                  afterA: 10.71,
                },
                {
                  location: "P2",
                  beforeH: 10.21,
                  beforeV: 10.31,
                  beforeA: 10.41,
                  afterH: 10.51,
                  afterV: 10.61,
                  afterA: 10.71,
                },
              ],
            },
          },
        },
      },

      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              example: {
                status: "success",
                message: "created successfully",
                data: [
                  {
                    location: "P1",
                    beforeH: 10.21,
                    beforeV: 10.31,
                    beforeA: 10.41,
                    afterH: 10.51,
                    afterV: 10.61,
                    afterA: 10.71,
                  },
                  {
                    location: "P2",
                    beforeH: 10.21,
                    beforeV: 10.31,
                    beforeA: 10.41,
                    afterH: 10.51,
                    afterV: 10.61,
                    afterA: 10.71,
                  },
                  {
                    location: "P3",
                    beforeH: null,
                    beforeV: null,
                    beforeA: null,
                    afterH: null,
                    afterV: null,
                    afterA: null,
                  },
                  {
                    location: "P4",
                    beforeH: null,
                    beforeV: null,
                    beforeA: null,
                    afterH: null,
                    afterV: null,
                    afterA: null,
                  },
                ],
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance field"],
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
                data: [
                  {
                    location: "P1",
                    beforeH: 10.21,
                    beforeV: 10.31,
                    beforeA: 10.41,
                    afterH: 10.51,
                    afterV: 10.61,
                    afterA: 10.71,
                  },
                  {
                    location: "P2",
                    beforeH: 10.21,
                    beforeV: 10.31,
                    beforeA: 10.41,
                    afterH: 10.51,
                    afterV: 10.61,
                    afterA: 10.71,
                  },
                  {
                    location: "P3",
                    beforeH: null,
                    beforeV: null,
                    beforeA: null,
                    afterH: null,
                    afterV: null,
                    afterA: null,
                  },
                  {
                    location: "P4",
                    beforeH: null,
                    beforeV: null,
                    beforeA: null,
                    afterH: null,
                    afterV: null,
                    afterA: null,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};
