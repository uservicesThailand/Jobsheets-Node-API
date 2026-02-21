const T = require("./mechanical.types");

module.exports = {
  statusNote: {
    status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
    note: T.string(),
  },

  bearingLike: {
    incoming: T.string(),
    action: T.enum([
      "N/A",
      "ใช้ของเดิม",
      "ใช้ของเดิม - Repair",
      "เปลี่ยนใหม่",
      "เปลี่ยนใหม่ - Customer",
    ]),
    renewNo: T.string(),
    note: T.string(),
  },

  coverOuter: {
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

  housing: {
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

  shaftEnd: {
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

  keyway: {
    before: T.decimal(3),
    action: T.enum(["N/A", "ผ่าน", "ไม่ผ่าน - ซ่อม", "Modify"]),
    after: T.decimal(3),
    note: T.string(),
  },

  gear: {
    status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
    action: T.enum(["N/A", "ผ่าน", "ไม่ผ่าน - ซ่อม", "Modify"]),
    boreSize: T.decimal(3),
    note: T.string(),
  },

  pulley: {
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

  coolingFan: {
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

  grease: {
    status: T.enum(["N/A", "มี", "ไม่มี/เสนอเพิ่ม"]),
    sizeNo: T.string(),
    action: T.enum(["N/A", "ใช้ของเดิม", "เปลี่ยนใหม่", "Modify"]),
    note: T.string(),
  },
};
