module.exports = {
  "/api/forms/coil-brake/{inspNo}": {
    post: {
      tags: ["form coil brake"],

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
              frame: "IEC-132M",
              type: "INDUCTION_MOTOR",
              manufacture: "Mitsubishi Electric",
              model: "SF-JR-15KW-4P",
              serialNo: "SN-2026-000984",
              design: "B3 Foot Mount",
              pe: "PE-TH-08921",
              ip: "IP55",
              insulationClass: "F",
              note: "Motor for conveyor line A, continuous operation 24/7",

              power: {
                value: 15,
                unit: "KW",
              },

              speed: {
                value: 1450,
                unit: "RPM",
              },

              frequency: 50,
              current: 28.4,
              volt: 380,
              eff: 92.5,
              year: 2024,
              weight: 118.6,
              cos: 0.86,

              brakeTypes: ["DC_COIL_BRAKE", "AC_COIL_BRAKE"],
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
                  frame: "IEC-132M",
                  type: "INDUCTION_MOTOR",
                  manufacture: "Mitsubishi Electric",
                  model: "SF-JR-15KW-4P",
                  serialNo: "SN-2026-000984",
                  design: "B3 Foot Mount",
                  pe: "PE-TH-08921",
                  ip: "IP55",
                  insulationClass: "F",
                  note: "Motor for conveyor line A, continuous operation 24/7",

                  power: {
                    value: 15,
                    unit: "KW",
                  },

                  speed: {
                    value: 1450,
                    unit: "RPM",
                  },

                  frequency: 50,
                  current: 28.4,
                  volt: 380,
                  eff: 92.5,
                  year: 2024,
                  weight: 118.6,
                  cos: 0.86,

                  brakeTypes: ["DC_COIL_BRAKE", "AC_COIL_BRAKE"],
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form coil brake"],
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
                  frame: "IEC-132M",
                  type: "INDUCTION_MOTOR",
                  manufacture: "Mitsubishi Electric",
                  model: "SF-JR-15KW-4P",
                  serialNo: "SN-2026-000984",
                  design: "B3 Foot Mount",
                  pe: "PE-TH-08921",
                  ip: "IP55",
                  insulationClass: "F",
                  note: "Motor for conveyor line A, continuous operation 24/7",

                  power: {
                    value: 15,
                    unit: "KW",
                  },

                  speed: {
                    value: 1450,
                    unit: "RPM",
                  },

                  frequency: 50,
                  current: 28.4,
                  volt: 380,
                  eff: 92.5,
                  year: 2024,
                  weight: 118.6,
                  cos: 0.86,

                  brakeTypes: ["DC_COIL_BRAKE", "AC_COIL_BRAKE"],
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/coil-brake/insulation/{inspNo}": {
    post: {
      tags: ["form coil brake"],

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
              volt: 10,
              incoming: {
                value: 10.23,
                unit: "kΩ",
              },
              final: {
                value: 10.25,
                unit: "kΩ",
              },
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
                  volt: 10,
                  incoming: {
                    value: 10.23,
                    unit: "kΩ",
                  },
                  final: {
                    value: 10.25,
                    unit: "kΩ",
                  },
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form coil brake"],
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
                  volt: 10,
                  incoming: {
                    value: 10.23,
                    unit: "kΩ",
                  },
                  final: {
                    value: 10.25,
                    unit: "kΩ",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/coil-brake/resistance/{inspNo}": {
    post: {
      tags: ["form coil brake"],

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
              marking: [10.21, 10.22, 10.23],
              incoming: {
                values: [10.31, 10.32, 10.33],
                unit: "kΩ",
              },
              final: {
                values: [null, 10.42, 10.43],
                unit: "kΩ",
              },
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
                  marking: [10.21, 10.22, 10.23],
                  incoming: {
                    values: [10.31, 10.32, 10.33],
                    unit: "kΩ",
                  },
                  final: {
                    values: [null, 10.42, 10.43],
                    unit: "kΩ",
                  },
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form coil brake"],
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
                  marking: [10.21, 10.22, 10.23],
                  incoming: {
                    values: [10.31, 10.32, 10.33],
                    unit: "kΩ",
                  },
                  final: {
                    values: [null, 10.42, 10.43],
                    unit: "kΩ",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/forms/coil-brake/coil-test/{inspNo}": {
    post: {
      tags: ["form coil brake"],

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
              volt: {
                incoming: [220.1, 221.0, 219.8],
                final: [218.5, 217.9, 218.2],
              },
              current: {
                incoming: [1.21, 1.19, 1.2],
                final: [1.1, 1.09, 1.11],
              },
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
                  volt: {
                    incoming: [220.1, 221.0, 219.8],
                    final: [218.5, 217.9, 218.2],
                  },
                  current: {
                    incoming: [1.21, 1.19, 1.2],
                    final: [1.1, 1.09, 1.11],
                  },
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form coil brake"],
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
                  volt: {
                    incoming: [220.1, 221.0, 219.8],
                    final: [218.5, 217.9, 218.2],
                  },
                  current: {
                    incoming: [1.21, 1.19, 1.2],
                    final: [1.1, 1.09, 1.11],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
