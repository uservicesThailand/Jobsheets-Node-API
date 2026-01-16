module.exports = {
  "/api/forms/electrical-service/{inspNo}": {
    post: {
      tags: ["form electrical service"],

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
              data: {
                1: {
                  status: "N/A",
                  note1: "note1",
                  note2: "note2",
                },
                2: {
                  status: "N/A",
                  note: "note",
                },
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
                  updatedBy: "John Doe",
                  createdBy: "Jane Doe",
                  updatedAt: "1999-01-01T12:59:59.000Z",
                  createdAt: "1999-01-01T12:59:59.000Z",
                  data: {
                    1: {
                      note1: "note1",
                      note2: "note2",
                      status: "N/A",
                    },
                    2: {
                      note: "note",
                      status: "N/A",
                    },
                    3: {
                      note: null,
                      status: null,
                    },
                    4: {
                      note: null,
                      status: null,
                    },
                    5: {
                      note: null,
                      status: null,
                    },
                    6: {
                      note: null,
                      status: null,
                    },
                    7: {
                      note: null,
                      status: null,
                    },
                    8: {
                      note: null,
                      status: null,
                    },
                    9: {
                      note: null,
                      status: null,
                    },
                    10: {
                      note: null,
                      status: null,
                    },
                    11: {
                      note: null,
                      status: null,
                    },
                    12: {
                      note: null,
                      status: null,
                    },
                    13: {
                      note: null,
                      status: null,
                    },
                    14: {
                      note: null,
                      status: null,
                    },
                    15: {
                      note: null,
                      status: null,
                    },
                    16: {
                      note: null,
                      status: null,
                    },
                    17: {
                      note: null,
                      status: null,
                    },
                    18: {
                      note: null,
                      status: null,
                    },
                    19: {
                      note: null,
                      status: null,
                    },
                    20: {
                      note: null,
                      status: null,
                    },
                    21: {
                      note: null,
                      status: null,
                    },
                    22: {
                      note: null,
                      status: null,
                    },
                    23: {
                      note: null,
                      status: null,
                    },
                    24: {
                      note: null,
                      status: null,
                    },
                    25: {
                      note: null,
                      status: null,
                    },
                    26: {
                      note: null,
                      status: null,
                    },
                    27: {
                      note: null,
                      status: null,
                    },
                    28: {
                      note: null,
                      status: null,
                    },
                    29: {
                      note: null,
                      status: null,
                    },
                    30: {
                      note: null,
                      status: null,
                    },
                    31: {
                      note: null,
                      status: null,
                    },
                    32: {
                      note: null,
                      status: null,
                    },
                    33: {
                      note: null,
                      status: null,
                    },
                    34: {
                      note: null,
                      status: null,
                    },
                    35: {
                      note: null,
                      status: null,
                    },
                    36: {
                      note: null,
                      status: null,
                    },
                    37: {
                      note: null,
                      status: null,
                    },
                    38: {
                      note: null,
                      status: null,
                    },
                    39: {
                      note: null,
                      status: null,
                    },
                    40: {
                      note: null,
                      status: null,
                    },
                    41: {
                      note: null,
                      status: null,
                    },
                    42: {
                      note: null,
                      status: null,
                    },
                    43: {
                      note: null,
                      status: null,
                    },
                    44: {
                      note: null,
                      status: null,
                    },
                    45: {
                      note: null,
                      status: null,
                    },
                    46: {
                      note: null,
                      status: null,
                    },
                    47: {
                      note: null,
                      status: null,
                    },
                    48: {
                      note: null,
                      status: null,
                    },
                    49: {
                      note: null,
                      status: null,
                    },
                    50: {
                      note: null,
                      status: null,
                    },
                    51: {
                      note: null,
                      status: null,
                    },
                    52: {
                      note: null,
                      status: null,
                    },
                    53: {
                      note: null,
                      status: null,
                    },
                    54: {
                      note: null,
                      status: null,
                    },
                    55: {
                      note: null,
                      status: null,
                    },
                    56: {
                      note: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    get: {
      tags: ["form electrical service"],
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
                  updatedBy: "John Doe",
                  createdBy: "Jane Doe",
                  updatedAt: "1999-01-01T12:59:59.000Z",
                  createdAt: "1999-01-01T12:59:59.000Z",
                  data: {
                    1: {
                      note1: "note1",
                      note2: "note2",
                      status: "N/A",
                    },
                    2: {
                      note: "note",
                      status: "N/A",
                    },
                    3: {
                      note: null,
                      status: null,
                    },
                    4: {
                      note: null,
                      status: null,
                    },
                    5: {
                      note: null,
                      status: null,
                    },
                    6: {
                      note: null,
                      status: null,
                    },
                    7: {
                      note: null,
                      status: null,
                    },
                    8: {
                      note: null,
                      status: null,
                    },
                    9: {
                      note: null,
                      status: null,
                    },
                    10: {
                      note: null,
                      status: null,
                    },
                    11: {
                      note: null,
                      status: null,
                    },
                    12: {
                      note: null,
                      status: null,
                    },
                    13: {
                      note: null,
                      status: null,
                    },
                    14: {
                      note: null,
                      status: null,
                    },
                    15: {
                      note: null,
                      status: null,
                    },
                    16: {
                      note: null,
                      status: null,
                    },
                    17: {
                      note: null,
                      status: null,
                    },
                    18: {
                      note: null,
                      status: null,
                    },
                    19: {
                      note: null,
                      status: null,
                    },
                    20: {
                      note: null,
                      status: null,
                    },
                    21: {
                      note: null,
                      status: null,
                    },
                    22: {
                      note: null,
                      status: null,
                    },
                    23: {
                      note: null,
                      status: null,
                    },
                    24: {
                      note: null,
                      status: null,
                    },
                    25: {
                      note: null,
                      status: null,
                    },
                    26: {
                      note: null,
                      status: null,
                    },
                    27: {
                      note: null,
                      status: null,
                    },
                    28: {
                      note: null,
                      status: null,
                    },
                    29: {
                      note: null,
                      status: null,
                    },
                    30: {
                      note: null,
                      status: null,
                    },
                    31: {
                      note: null,
                      status: null,
                    },
                    32: {
                      note: null,
                      status: null,
                    },
                    33: {
                      note: null,
                      status: null,
                    },
                    34: {
                      note: null,
                      status: null,
                    },
                    35: {
                      note: null,
                      status: null,
                    },
                    36: {
                      note: null,
                      status: null,
                    },
                    37: {
                      note: null,
                      status: null,
                    },
                    38: {
                      note: null,
                      status: null,
                    },
                    39: {
                      note: null,
                      status: null,
                    },
                    40: {
                      note: null,
                      status: null,
                    },
                    41: {
                      note: null,
                      status: null,
                    },
                    42: {
                      note: null,
                      status: null,
                    },
                    43: {
                      note: null,
                      status: null,
                    },
                    44: {
                      note: null,
                      status: null,
                    },
                    45: {
                      note: null,
                      status: null,
                    },
                    46: {
                      note: null,
                      status: null,
                    },
                    47: {
                      note: null,
                      status: null,
                    },
                    48: {
                      note: null,
                      status: null,
                    },
                    49: {
                      note: null,
                      status: null,
                    },
                    50: {
                      note: null,
                      status: null,
                    },
                    51: {
                      note: null,
                      status: null,
                    },
                    52: {
                      note: null,
                      status: null,
                    },
                    53: {
                      note: null,
                      status: null,
                    },
                    54: {
                      note: null,
                      status: null,
                    },
                    55: {
                      note: null,
                      status: null,
                    },
                    56: {
                      note: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    delete: {
      tags: ["form electrical service"],
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
