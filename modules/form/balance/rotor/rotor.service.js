const db = require("../../../../models");
const {
  generateAllCombos,
  mergeRunoutData,
  mergeResultPayload,
  resultGenerate,
} = require("./rotor.generator");

const createRotor = async (inspNo, userKey, body) => {
  let balanceId;
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
    });

    if (!inspection) {
      return {
        success: false,
        message: "Inspection not found",
      };
    }

    const inspectionId = inspection.inspId;

    const existingBalanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
    });

    if (existingBalanceRotor) {
      return {
        success: false,
        message: "Balance rotor already exists",
      };
    }

    const createdBalanceRotor = await db.FormBalance.create({
      inspId: inspectionId,
      createdBy: userKey,
      updatedBy: userKey,
    });

    balanceId = createdBalanceRotor.balId;

    const createdRotor = await db.BalanceRotor.create({
      ...body,
      balanceId: balanceId,
    });

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: createdBalanceRotor.toJSON(),
        balanceRotor: createdRotor.toJSON(),
      },
    };
  } catch (error) {
    balanceId && deleteFormBalance(balanceId);
    throw error;
  }
};

const createRotorBalance = async (inspNo, body) => {
  let balanceId;
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
    });

    if (!inspection) {
      return {
        success: false,
        message: "Inspection not found",
      };
    }

    const inspectionId = inspection.inspId;

    const balanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
      include: [{ model: db.BalanceRotor, required: true }],
    });

    if (!balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    balanceId = balanceRotor.BalanceRotor.balanceId;

    const rotorBalance = await db.BalanceRotorBalance.create({
      ...body,
      balanceRotorId: balanceRotor.BalanceRotor.rotorId,
    });

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: balanceRotor.toJSON(),
        rotorBalance: rotorBalance.toJSON(),
      },
    };
  } catch (error) {
    balanceId && deleteFormBalance(balanceId);
    throw error;
  }
};

const createRotorRunout = async (inspNo, body) => {
  let balanceId;
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
    });

    if (!inspection) {
      return {
        success: false,
        message: "Inspection not found",
      };
    }

    const inspectionId = inspection.inspId;

    const balanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
      include: [{ model: db.BalanceRotor, required: true }],
    });

    if (!balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    balanceId = balanceRotor.BalanceRotor.balanceId;
    const balanceRotorId = balanceRotor.BalanceRotor.rotorId;

    const allCombos = generateAllCombos(balanceRotorId);
    const mergedRows = mergeRunoutData(allCombos, body);

    const rotorRunout = await db.BalanceRotorRunout.bulkCreate(mergedRows);

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: balanceRotor.toJSON(),
        rotorRunout: rotorRunout,
      },
    };
  } catch (error) {
    balanceId && deleteFormBalance(balanceId);
    throw error;
  }
};

const createRotorRunoutResult = async (inspNo, body) => {
  let balanceId;
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
    });

    if (!inspection) {
      return {
        success: false,
        message: "Inspection not found",
      };
    }

    const inspectionId = inspection.inspId;

    const balanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
      include: [{ model: db.BalanceRotor, required: true }],
    });

    if (!balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    balanceId = balanceRotor.BalanceRotor.balanceId;
    const balanceRotorId = balanceRotor.BalanceRotor.rotorId;

    const allCombos = resultGenerate(balanceRotorId);
    const mergedRows = mergeResultPayload(allCombos, body);

    const rotorRunoutResult = await db.BalanceRotorRunoutResult.bulkCreate(
      mergedRows
    );

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: balanceRotor.toJSON(),
        rotorRunoutResult: rotorRunoutResult,
      },
    };
  } catch (error) {
    balanceId && deleteFormBalance(balanceId);
    throw error;
  }
};

const deleteFormBalance = async (balId) => {
  try {
    await db.FormBalance.destroy({ where: { balId } });
  } catch (error) {
    throw error;
  }
};

const getRotor = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceRotor,
              required: true,
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    return {
      success: true,
      data: {
        inspection: inspection,
        formBalance: inspection.FormBalance,
        balanceRotor: inspection.FormBalance.BalanceRotor,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getRotorBalance = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceRotor,
              required: true,
              include: [
                {
                  model: db.BalanceRotorBalance,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: inspection.FormBalance.BalanceRotor,
        rotorBalance: inspection.FormBalance.BalanceRotor.BalanceRotorBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createRotor,
  createRotorBalance,
  createRotorRunout,
  createRotorRunoutResult,
  getRotor,
  getRotorBalance,
};
