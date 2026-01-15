const T = require("./mechanical.types");
const F = require("./mechanical.fieldsets");

module.exports = {
  // 1
  1: {
    code: "tachogenerator",
    label: "Tachogenerator",
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      action: T.enum(["N/A", "Overhaul", "Rewind", "Modify"]),
      note: T.string(),
    },
  },

  // 2–6 (pattern เดียวกัน)
  2: {
    code: "encoder",
    label: "Endcoder",
    fields: F.statusNote,
  },

  3: {
    code: "carbon_brush",
    label: "Carbon Brush",
    fields: F.statusNote,
  },

  4: {
    code: "brush_holder",
    label: "Brush Holder",
    fields: F.statusNote,
  },

  5: {
    code: "commutator",
    label: "Commutator",
    fields: F.statusNote,
  },

  6: {
    code: "slip_ring",
    label: "Slip Ring",
    fields: F.statusNote,
  },

  // 7–12 Bearing / Seal / V-Ring
  7: {
    code: "bearing_de",
    label: "Bearing DE",
    fields: F.bearingLike,
  },

  8: {
    code: "bearing_nde",
    label: "Bearing NDE",
    fields: F.bearingLike,
  },

  9: {
    code: "oil_seal_de",
    label: "Oil Seal DE",
    fields: F.bearingLike,
  },

  10: {
    code: "oil_seal_nde",
    label: "Oil Seal NDE",
    fields: F.bearingLike,
  },

  11: {
    code: "v_ring_de",
    label: "V-Ring DE",
    fields: F.bearingLike,
  },

  12: {
    code: "v_ring_nde",
    label: "V-Ring DE",
    fields: F.bearingLike,
  },

  12: {
    code: "v_ring_nde",
    label: "V-Ring NDE",
    fields: F.bearingLike,
  },

  13: {
    code: "cover_outer_de",
    label: "ฝาประกับนอก DE",
    fields: F.coverOuter,
  },

  14: {
    code: "cover_inner_de",
    label: "ฝาประกับใน DE",
    fields: F.coverOuter,
  },

  15: {
    code: "cover_outer_nde",
    label: "ฝาประกับนอก NDE",
    fields: F.coverOuter,
  },

  16: {
    code: "cover_inner_nde",
    label: "ฝาประกับใน NDE",
    fields: F.coverOuter,
  },

  // 17–28 Diameter based
  17: {
    code: "housing_de",
    label: "Housing DE",
    fields: F.housing,
  },

  18: {
    code: "housing_nde",
    label: "Housing NDE",
    fields: F.housing,
  },

  19: {
    code: "shaft_de_bearing",
    label: "Shaft DE (Bearing)",
    fields: F.housing,
  },

  20: {
    code: "shaft_nde_bearing",
    label: "Shaft NDE (Bearing)",
    fields: F.housing,
  },

  21: {
    code: "shaft_de_seal",
    label: "Shaft DE (Seal)",
    fields: F.housing,
  },

  22: {
    code: "shaft_nde_seal",
    label: "Shaft NDE (Seal)",
    fields: F.housing,
  },

  23: {
    code: "shaft_run_out_de_bearing",
    label: "Shaft Run-out DE (Bearing)",
    fields: F.housing,
  },

  24: {
    code: "shaft_run_out_nde_bearing",
    label: "Shaft Run-out NDE (Bearing)",
    fields: F.housing,
  },

  25: {
    code: "shaft_run_out_de_loadshaft",
    label: "Shaft Run-out DE (loadshaft)",
    fields: F.housing,
  },

  26: {
    code: "shaft_run_out_nde_loadshaft",
    label: "Shaft Run-out NDE (fanshaft)",
    fields: F.housing,
  },

  27: {
    code: "shaft_end_coupling",
    label: "ปลายเพลา ตำแหน่ง คัปปลิ้ง",
    fields: F.shaftEnd,
  },

  28: {
    code: "shaft_end_fan",
    label: "ปลายเพลา ตำแหน่ง ใบพัดลม",
    fields: F.shaftEnd,
  },

  // 29–33 Keyway
  29: {
    code: "keyway_de",
    label: "ร่องลิ่มปลายเพลา DE",
    fields: F.keyway,
  },

  30: {
    code: "keyway_nde",
    label: "ร่องลิ่มปลายเพลา NDE",
    fields: F.keyway,
  },

  31: {
    code: "keyway_pulley",
    label: "ร่องลิ่ม Pulley/Coupling",
    fields: F.keyway,
  },

  32: {
    code: "key_de",
    label: "ลื่ม DE",
    fields: F.keyway,
  },

  33: {
    code: "key_nde",
    label: "ลื่ม NDE",
    fields: F.keyway,
  },

  34: {
    code: "gear",
    label: "เฟือง Gear",
    fields: F.gear,
  },

  35: {
    code: "impeller",
    label: "ใบ Impeller",
    fields: F.gear,
  },

  36: {
    code: "blower",
    label: "ใบ Blower",
    fields: F.gear,
  },

  37: {
    code: "pulley",
    label: "Pulley",
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      action: T.enum([
        "N/A",
        "สภาพดี",
        "ไม่ผ่าน - ซ่อม",
        "เสียหาย - เปลี่ยนใหม่",
        "Modify",
      ]),
      boreSize: T.decimal(3),
      depthType: T.enum(["เสมอ", "ลึก", "ยาว"]),
      depthValue: T.decimal(3),
      note: T.string(),
    },
  },

  38: {
    code: "coupling",
    label: "Coupling",
    fields: {
      status: T.enum(["N/A", "มี", "ซ่อม"]),
      action: T.enum(["N/A", "สภาพดี", "เสียหาย - เปลี่ยนใหม่", "Modify"]),
      boreSize: T.decimal(3),
      depthType: T.enum(["เสมอ", "ลึก", "ยาว"]),
      depthValue: T.decimal(3),
      note: T.string(),
    },
  },

  39: {
    code: "coupling_rubber",
    label: "ยาง Coupling",
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      quantityHave: T.integer(),
      action: T.enum(["N/A", "สภาพดี", "เสียหาย - เปลี่ยนใหม่", "Modify"]),
      quantityReplace: T.integer(),
      typeNo: T.string(),
      note: T.string(),
    },
  },

  40: {
    code: "cooling_fan",
    label: "Cooling Fan",
    fields: F.coolingFan,
  },

  41: {
    code: "cover_fan",
    label: "Cover Fan",
    fields: F.coolingFan,
  },

  42: {
    code: "wave_spring",
    label: "Wave Spring / กันรุน",
    fields: {
      status: T.enum([
        "N/A",
        "มี - ด้าน DE",
        "มี - ด้าน NDE",
        "มี - ทั้งสองด้าน",
      ]),
      action: T.enum(["N/A", "สภาพดี", "เสียหาย - เปลี่ยนใหม่", "Modify"]),
      note: T.string(),
    },
  },

  43: {
    code: "grease",
    label: "จาระบี",
    fields: {
      brandType: T.enum(["N/A", "Shell R2", "Shell R3"]),
      otherBrand: T.string(),
      note: T.string(),
    },
  },

  44: {
    code: "grease_nipple",
    label: "หัวอัดจาระบี",
    fields: F.grease,
  },

  45: {
    code: "eye_bolt",
    label: "Eye bolt / หูหิ้วยก",
    fields: F.grease,
  },

  46: {
    code: "rotor_balance",
    label: "Rotor Balance",
    fields: {
      status: T.enum(["N/A", "ทำ"]),
      sizeNo: T.string(),
      action: T.enum(["N/A", "Dynamic Balance", "Field Balance"]),
      note: T.string(),
    },
  },

  47: {
    code: "cleaning",
    label: "ล้าง / อบ",
    fields: {
      status: T.enum(["N/A", "ทำ"]),
      note: T.string(),
    },
  },

  48: {
    code: "painting",
    label: "การทำสี",
    fields: {
      status: T.enum(["N/A", "ทำ"]),
      colorCode: T.string(),
      brand: T.string(),
      note: T.string(),
    },
  },

  // 49 Screw
  49: {
    code: "screw",
    label: "Screw (น็อต)",
    fields: {
      status: T.enum(["N/A", "เปลี่ยน"]),
      type: T.enum(["ตัวผู้", "ตัวเมีย"]),
      spec: T.object({
        threadSize: T.enum([
          "M4",
          "M5",
          "M6",
          "M7",
          "M8",
          "M9",
          "M10",
          "M11",
          "M12",
          "M13",
          "M14",
          "M15",
          "M16",
        ]),
        length: T.decimal(3),
        unit: T.enum(["mm", "inch"]),
      }),
      quantity: T.object({
        value: T.integer(),
        unit: T.enum(["ชิ้น", "กล่อง"]),
      }),
      note: T.string(),
    },
  },

  // 49–50
  50: {
    code: "note_comment",
    label: "Note/Comment",
    fields: { text: T.string() },
  },

  51: {
    code: "report_summary",
    label: "Report Summary",
    fields: { text: T.string() },
  },
};
