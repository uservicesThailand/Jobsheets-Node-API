module.exports = {
  "/api/forms/balance/rotor/{inspNo}": {
    post: {
      tags: ["form balance rotor"],

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
              rotorType: "N/A",
              includeWith: "N/A",
              rotorWeight: 10.11,
              diameterA: 10.11,
              diameterB: 10.11,
              diameterC: 10.11,
              radius1: 10.11,
              radius2: 10.11,
              rotorSpeed: 10.11,
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
                  rotorType: "N/A",
                  includeWith: "N/A",
                  rotorWeight: 10.11,
                  diameterA: 10.11,
                  diameterB: 10.11,
                  diameterC: 10.11,
                  radius1: 10.11,
                  radius2: 10.11,
                  rotorSpeed: 10.11,
                  note: "note",
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance rotor"],
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
                  rotorType: "N/A",
                  includeWith: "N/A",
                  rotorWeight: 10.11,
                  diameterA: 10.11,
                  diameterB: 10.11,
                  diameterC: 10.11,
                  radius1: 10.11,
                  radius2: 10.11,
                  rotorSpeed: 10.11,
                  note: "note",
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/balance/rotor/balance/{inspNo}": {
    post: {
      tags: ["form balance rotor"],

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
              incomingWeightDe: 10.11,
              incomingAngleDe: 10.11,
              incomingWeightNde: 10.11,
              incomingAngleNde: 10.11,
              finalWeightDe: 10.11,
              finalAngleDe: 10.11,
              finalWeightNde: 10.11,
              finalAngleNde: 10.11,
              stdToleranceDe: 10.11,
              stdToleranceNde: 10.11,
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
                  incomingWeightDe: 10.11,
                  incomingAngleDe: 10.11,
                  incomingWeightNde: 10.11,
                  incomingAngleNde: 10.11,
                  finalWeightDe: 10.11,
                  finalAngleDe: 10.11,
                  finalWeightNde: 10.11,
                  finalAngleNde: 10.11,
                  stdToleranceDe: 10.11,
                  stdToleranceNde: 10.11,
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance rotor"],
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
                  incomingWeightDe: 10.11,
                  incomingAngleDe: 10.11,
                  incomingWeightNde: 10.11,
                  incomingAngleNde: 10.11,
                  finalWeightDe: 10.11,
                  finalAngleDe: 10.11,
                  finalWeightNde: 10.11,
                  finalAngleNde: 10.11,
                  stdToleranceDe: 10.11,
                  stdToleranceNde: 10.11,
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/balance/rotor/runout/{inspNo}": {
    post: {
      tags: ["form balance rotor"],

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
                  phase: "BEFORE",
                  side: "DE",
                  point: "A",
                  position: "TOP",
                  value: 10.2,
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
                    phase: "BEFORE",
                    side: "DE",
                    point: "A",
                    position: "TOP",
                    value: 10.2,
                  },
                  {
                    phase: "BEFORE",
                    side: "DE",
                    point: "A",
                    position: "BOTTOM",
                    value: null,
                  },
                ],
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance rotor"],
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
                    phase: "BEFORE",
                    side: "DE",
                    point: "A",
                    position: "TOP",
                    value: 10.2,
                  },
                  {
                    phase: "BEFORE",
                    side: "DE",
                    point: "A",
                    position: "BOTTOM",
                    value: null,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/balance/rotor/runout/result/{inspNo}": {
    post: {
      tags: ["form balance rotor"],

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
                  phase: "BEFORE",
                  result: "NORMAL",
                },
                {
                  phase: "AFTER",
                  result: "NORMAL",
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
                    phase: "BEFORE",
                    result: "NORMAL",
                  },
                  {
                    phase: "AFTER",
                    result: "NORMAL",
                  },
                ],
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance rotor"],
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
                  { phase: "BEFORE", result: "NORMAL" },
                  { phase: "AFTER", result: "NORMAL" },
                ],
              },
            },
          },
        },
      },
    },
  },
};
