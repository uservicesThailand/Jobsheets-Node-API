module.exports = {
  "/api/forms/balance/shaft/{inspNo}": {
    post: {
      tags: ["form balance shaft"],

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
              rotorWeight: 10.12,
              diameterA: 10.12,
              diameterB: 10.13,
              diameterC: 10.14,
              radius1: 10.15,
              radius2: 10.16,
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
                  rotorWeight: 10.12,
                  diameterA: 10.12,
                  diameterB: 10.13,
                  diameterC: 10.14,
                  radius1: 10.15,
                  radius2: 10.16,
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance shaft"],
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
                  rotorWeight: 10.12,
                  diameterA: 10.12,
                  diameterB: 10.13,
                  diameterC: 10.14,
                  radius1: 10.15,
                  radius2: 10.16,
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/balance/shaft/balance/{inspNo}": {
    post: {
      tags: ["form balance shaft"],

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
              balancingSpeed: 10,
              incomingWeightDe: 10.11,
              incomingWeightNde: 10.12,
              incomingPhaseDe: 10.13,
              incomingPhaseNde: 10.14,
              finalWeightDe: 10.15,
              finalWeightNde: 10.16,
              finalPhaseDe: 10.17,
              finalPhaseNde: 10.18,
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
                  balancingSpeed: 10,
                  incomingWeightDe: 10.11,
                  incomingWeightNde: 10.12,
                  incomingPhaseDe: 10.13,
                  incomingPhaseNde: 10.14,
                  finalWeightDe: 10.15,
                  finalWeightNde: 10.16,
                  finalPhaseDe: 10.17,
                  finalPhaseNde: 10.18,
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form balance shaft"],
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
                  balancingSpeed: 10,
                  incomingWeightDe: 10.11,
                  incomingWeightNde: 10.12,
                  incomingPhaseDe: 10.13,
                  incomingPhaseNde: 10.14,
                  finalWeightDe: 10.15,
                  finalWeightNde: 10.16,
                  finalPhaseDe: 10.17,
                  finalPhaseNde: 10.18,
                },
              },
            },
          },
        },
      },
    },
  },
};
