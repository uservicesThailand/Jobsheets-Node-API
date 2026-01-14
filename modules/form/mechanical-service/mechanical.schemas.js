const T = require("./mechanical.types");

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
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      note: T.string(),
    },
  },

  3: {
    code: "carbon_brush",
    label: "Carbon Brush",
    fields: module.exports?.[2]?.fields,
  },

  4: {
    code: "brush_holder",
    label: "Brush Holder",
    fields: module.exports?.[2]?.fields,
  },

  5: {
    code: "commutator",
    label: "Commutator",
    fields: module.exports?.[2]?.fields,
  },

  6: {
    code: "slip_ring",
    label: "Slip Ring",
    fields: module.exports?.[2]?.fields,
  },

  // 7–12 Bearing / Seal / V-Ring
  7: {
    code: "bearing_de",
    label: "Bearing DE",
    fields: {
      incoming: T.string(),
      action: T.enum([
        "N/A",
        "ใช้ของเดิม",
        "ใช้ของเดิม - Repair",
        "เปลี่ยนใหม่",
        "เปลี่ยนใหม่ - Customer",
      ]),
      renew: T.object({ no: "string", brand: "string" }),
      note: T.string(),
    },
  },

  8: {
    code: "bearing_nde",
    label: "Bearing NDE",
    fields: module.exports?.[7]?.fields,
  },

  9: {
    code: "oil_seal_de",
    label: "Oil Seal DE",
    fields: module.exports?.[7]?.fields,
  },

  10: {
    code: "oil_seal_nde",
    label: "Oil Seal NDE",
    fields: module.exports?.[7]?.fields,
  },

  11: {
    code: "v_ring_de",
    label: "V-Ring DE",
    fields: module.exports?.[7]?.fields,
  },

  12: {
    code: "v_ring_nde",
    label: "V-Ring DE",
    fields: module.exports?.[7]?.fields,
  },

  12: {
    code: "v_ring_nde",
    label: "V-Ring NDE",
    fields: module.exports?.[7]?.fields,
  },

  13: {
    code: "cover_outer_de",
    label: "ฝาประกับนอก DE",
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      action: T.enum([
        "N/A",
        "สภาพดี - เปลี่ยนใหม่",
        "สภาพดี - ใช้ของเดิม",
        "ชำรุด - เปลี่ยนใหม่",
        "ชำรุด - ใช้ของเดิม",
        "Modify",
      ]),
      note: T.string(),
    },
  },

  14: {
    code: "cover_inner_de",
    label: "ฝาประกับใน DE",
    fields: coverSchema,
  },

  15: {
    code: "cover_outer_nde",
    label: "ฝาประกับนอก NDE",
    fields: coverSchema,
  },

  16: {
    code: "cover_inner_nde",
    label: "ฝาประกับใน NDE",
    fields: coverSchema,
  },

  // 17–28 Diameter based
  17: {
    code: "housing_de",
    label: "Housing DE",
    fields: {
      before: T.decimal(3),
      action: T.enum([
        "N/A",
        "ผ่าน",
        "ไม่ผ่าน - พ่นพอก",
        "ไม่ผ่าน - เชื่อมพอก",
        "ไม่ผ่าน - เปลี่ยนเพลา",
        "ไม่ผ่าน - ลูกค้าไม่ซ่อม",
      ]),
      after: T.decimal(3),
      target: T.decimal(3),
      note: T.string(),
      note2: T.string(),
    },
  },

  18: {
    code: "housing_nde",
    label: "Housing NDE",
    fields: module.exports?.[17]?.fields,
  },

  19: {
    code: "shaft_de_bearing",
    label: "Shaft DE (Bearing)",
    fields: module.exports?.[17]?.fields,
  },

  20: {
    code: "shaft_nde_bearing",
    label: "Shaft NDE (Bearing)",
    fields: module.exports?.[17]?.fields,
  },

  21: {
    code: "shaft_de_seal",
    label: "Shaft DE (Seal)",
    fields: module.exports?.[17]?.fields,
  },

  22: {
    code: "shaft_nde_seal",
    label: "Shaft NDE (Seal)",
    fields: module.exports?.[17]?.fields,
  },

  23: {
    code: "shaft_run_out_de_bearing",
    label: "Shaft Run-out DE (Bearing)",
    fields: module.exports?.[17]?.fields,
  },

  24: {
    code: "shaft_run_out_nde_bearing",
    label: "Shaft Run-out NDE (Bearing)",
    fields: module.exports?.[17]?.fields,
  },

  25: {
    code: "shaft_run_out_de_loadshaft",
    label: "Shaft Run-out DE (loadshaft)",
    fields: module.exports?.[17]?.fields,
  },

  26: {
    code: "shaft_run_out_nde_loadshaft",
    label: "Shaft Run-out NDE (fanshaft)",
    fields: module.exports?.[17]?.fields,
  },

  27: {
    code: "shaft_end_coupling",
    label: "ปลายเพลา ตำแหน่ง คัปปลิ้ง",
    fields: {
      diameterBefore: T.decimal(3),
      action: T.enum([
        "N/A",
        "ผ่าน",
        "ไม่ผ่าน - พ่นพอก",
        "ไม่ผ่าน - เชื่อมพอก",
        "ไม่ผ่าน - เปลี่ยนเพลา",
        "ไม่ผ่าน - ลูกค้าไม่ซ่อม",
      ]),
      diameterAfter: T.decimal(3),
      note: T.string(),
      note2: T.string(),
    },
  },

  28: {
    code: "shaft_end_fan",
    label: "ปลายเพลา ตำแหน่ง ใบพัดลม",
    fields: module.exports?.[27]?.fields,
  },

  // 29–33 Keyway
  29: {
    code: "keyway_de",
    label: "ร่องลิ่มปลายเพลา DE",
    fields: {
      before: T.decimal(3),
      action: T.enum(["N/A", "ผ่าน", "ไม่ผ่าน - ซ่อม", "Modify"]),
      after: T.decimal(3),
      note: T.string(),
    },
  },

  30: {
    code: "keyway_nde",
    label: "ร่องลิ่มปลายเพลา NDE",
    fields: module.exports?.[29]?.fields,
  },

  31: {
    code: "keyway_pulley",
    label: "ร่องลิ่ม Pulley/Coupling",
    fields: module.exports?.[29]?.fields,
  },

  32: {
    code: "key_de",
    label: "ลื่ม DE",
    fields: module.exports?.[29]?.fields,
  },

  33: {
    code: "key_nde",
    label: "ลื่ม NDE",
    fields: module.exports?.[29]?.fields,
  },

  34: {
    code: "gear",
    label: "เฟือง Gear",
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      action: T.enum(["N/A", "ผ่าน", "ไม่ผ่าน - ซ่อม", "Modify"]),
      boreSize: T.decimal(3),
      note: T.string(),
    },
  },

  35: {
    code: "impeller",
    label: "ใบ Impeller",
    fields: module.exports?.[34]?.fields,
  },

  36: {
    code: "blower",
    label: "ใบ Blower",
    fields: module.exports?.[34]?.fields,
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
      quantityHave: T.number(),
      action: T.enum(["N/A", "สภาพดี", "เสียหาย - เปลี่ยนใหม่", "Modify"]),
      quantityReplace: T.integer(),
      typeNo: T.string(),
      note: T.string(),
    },
  },

  40: {
    code: "cooling_fan",
    label: "Cooling Fan",
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      sizeNo: T.string(),
      material: T.enum(["N/A", "พลาสติก", "อลูมิเนียม", "เหล็ก", "อื่นๆ"]),
      action: T.enum([
        "N/A",
        "สภาพดี",
        "เสียหาย - เปลี่ยนใหม่",
        "Modify",
        "Repair",
      ]),
      note: T.string(),
    },
  },

  41: {
    code: "cover_fan",
    label: "Cover Fan",
    fields: module.exports?.[40]?.fields,
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
    fields: {
      status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
      sizeNo: T.string(),
      action: T.enum(["N/A", "ใช้ของเดิม", "เปลี่ยนใหม่", "Modify"]),
      note: T.string(),
    },
  },

  45: {
    code: "eye_bolt",
    label: "Eye bolt / หูหิ้วยก",
    fields: module.exports?.[44]?.fields,
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
        value: T.number(),
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
