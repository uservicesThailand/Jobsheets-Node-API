const T = require("../mechanical-service/mechanical.types");

const status_group = {
  A: ["N/A", "Overhaul", "Rewind"],                                          // 1-5    52-55
  B: ["N/A", "Stator", "Rotor", "Stator + Rotor"],                           // 6-10,  13
  C: ["N/A", "Yes", "No"],                                                   // 11-12, 29
  D: ["N/A", "ใช้ของเดิม", "เปลี่ยนใหม่", "Repair", "Modify"],                    // 14-16, 20-28, 30-46, 51
  E: ["N/A", "ใช้ของเดิม", "Replace", "Recondition", "Replace + Recondition"], // 17-19
  F: ["N/A", "ใช้ของเดิม", "เปลี่ยนใหม่", "Repair", "Modify", "Test"],            // 47-48
  G: ["N/A", "ใช้ของเดิม", "เปลี่ยนใหม่", "Repair", "Modify", "Restack"],         // 49-50
};

module.exports = {
  // A
  1: {
    code: "stator",
    label: "Stator",
    fields: {
      status: T.enum(status_group.A),
      note1: T.string(),
      note2: T.string(),
    },
  },

  2: {
    code: "rotor",
    label: "Rotor",
    fields: {
      status: T.enum(status_group.A),
      note: T.string(),
    },
  },

  3: {
    code: "excite",
    label: "Excite",
    fields: {
      status: T.enum(status_group.A),
      note: T.string(),
    },
  },

  4: {
    code: "excite_rotor",
    label: "Excite Rotor",
    fields: {
      status: T.enum(status_group.A),
      note: T.string(),
    },
  },

  5: {
    code: "armature_coil",
    label: "Armature Coil",
    fields: {
      status: T.enum(status_group.A),
      note: T.string(),
    },
  },

  // B
  6: {
    code: "restack_laminations_core",
    label: "Restack Laminations Core",
    fields: {
      status: T.enum(status_group.B),
      note: T.string(),
    },
  },

  7: {
    code: "repair_laminations_core",
    label: "Repair Laminations Core",
    fields: {
      status: T.enum(status_group.B),
      note: T.string(),
    },
  },

  8: {
    code: "vpi_system",
    label: "V.P.I System",
    fields: {
      status: T.enum(status_group.B),
      note: T.string(),
    },
  },

  9: {
    code: "dip_varnish",
    label: "Dip Varnish",
    fields: {
      status: T.enum(status_group.B),
      note: T.string(),
    },
  },

  10: {
    code: "coat_varnish",
    label: "Coat Varnish",
    fields: {
      status: T.enum(status_group.B),
      note: T.string(),
    },
  },

  // C
  11: {
    code: "press_bar_rotor",
    label: "Press Bar Rotor",
    fields: {
      status: T.enum(status_group.C),
      note: T.string(),
    },
  },

  12: {
    code: "coat_resin_coil_brake",
    label: "Coat Resin Coil Brake",
    fields: {
      status: T.enum(status_group.C),
      note: T.string(),
    },
  },

  // B
  13: {
    code: "core_loss_test",
    label: "Core Loss Test",
    fields: {
      status: T.enum(status_group.B),
      note: T.string(),
    },
  },

  // D
  14: {
    code: "slot_wedge",
    label: "Slot Wedge",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  15: {
    code: "magnetic_slot_wedge",
    label: "Magnetic Slot Wedge",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  16: {
    code: "rotor_stopper_ring",
    label: "Rotor Stopper Ring",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  // E
  17: {
    code: "commutator",
    label: "Commutator",
    fields: {
      status: T.enum(status_group.E),
      note: T.string(),
    },
  },

  18: {
    code: "slip_ring",
    label: "Slip Ring",
    fields: {
      status: T.enum(status_group.E),
      note: T.string(),
    },
  },

  19: {
    code: "carbon_brush",
    label: "Carbon Brush",
    fields: {
      status: T.enum(status_group.E),
      note: T.string(),
    },
  },

  // D
  20: {
    code: "brush_holder",
    label: "Brush Holder",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  21: {
    code: "encoder",
    label: "Encoder",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  22: {
    code: "tacho",
    label: "Tacho",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  23: {
    code: "spring",
    label: "Spring",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  24: {
    code: "stud_main_stator",
    label: "Stud Main Stator",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  25: {
    code: "bearing_temp_sensor",
    label: "Bearing Temp. Sensor",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  26: {
    code: "stator_temp_sensor",
    label: "Stator Temp. Sensor",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  27: {
    code: "heater",
    label: "Heater",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  28: {
    code: "terminal_box",
    label: "Terminal Box",
    fields: {
      status: T.enum(status_group.D),
      note: T.string(),
    },
  },

  // C
  29: {
    code: "coat_resin_terminal_box",
    label: "Coat Resin Terminal Box",
    fields: {
      status: T.enum(status_group.C),
      note: T.string(),
    },
  },

  // D ต่อ
  30: {
    code: "terminal_board",
    label: "Terminal Board",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  31: {
    code: "cable_lug",
    label: "Cable Lug",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  32: {
    code: "bushing",
    label: "Bushing",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  33: {
    code: "lead_wire",
    label: "Lead Wire",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  34: {
    code: "diode",
    label: "Diode",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  35: {
    code: "rectifier",
    label: "Rectifier",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  36: {
    code: "capacitor",
    label: "Capacitor",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  37: {
    code: "moisture",
    label: "Moisture",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  38: {
    code: "centrifugal_switch",
    label: "Centrifugal Switch",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  39: {
    code: "flow_switch",
    label: "Flow Switch",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  40: {
    code: "cable_gland",
    label: "Cable Gland",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  41: {
    code: "connector",
    label: "Connector",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  42: {
    code: "flexible_conduit",
    label: "Flexible Conduit",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  43: {
    code: "cable",
    label: "Cable",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  44: {
    code: "seal_cable",
    label: "Seal Cable",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  45: {
    code: "copper_bar_terminal_board",
    label: "Copper Bar Terminal Board",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },
  46: {
    code: "insulation_support_terminal_board",
    label: "Insulation Support Terminal Board",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },

  // F
  47: {
    code: "hot_spot_stator",
    label: "Hot Spot Stator",
    fields: { status: T.enum(status_group.F), note: T.string() },
  },
  48: {
    code: "hot_spot_rotor",
    label: "Hot Spot Rotor",
    fields: { status: T.enum(status_group.F), note: T.string() },
  },

  // G
  49: {
    code: "stator_laminate",
    label: "Stator Laminate",
    fields: { status: T.enum(status_group.G), note: T.string() },
  },
  50: {
    code: "rotor_laminate",
    label: "Rotor Laminate",
    fields: { status: T.enum(status_group.G), note: T.string() },
  },

  // D
  51: {
    code: "glass_sleeve",
    label: "Glass Sleeve",
    fields: { status: T.enum(status_group.D), note: T.string() },
  },

  // A
  52: {
    code: "shunt_field",
    label: "Shunt Field",
    fields: { status: T.enum(status_group.A), note: T.string() },
  },
  53: {
    code: "series_field",
    label: "Series Field",
    fields: { status: T.enum(status_group.A), note: T.string() },
  },
  54: {
    code: "interpole",
    label: "Interpole",
    fields: { status: T.enum(status_group.A), note: T.string() },
  },
  55: {
    code: "compensate",
    label: "Compensate",
    fields: { status: T.enum(status_group.A), note: T.string() },
  },

  56: {
    code: "note_comment",
    label: "Note / Comment",
    fields: {
      note: T.string(),
    },
  },
};
