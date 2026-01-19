const { sequelize } = require("../../models");
const { formatDate } = require("../../utils/dateJs.util");

const getDbHealthStatus = async () => {
  try {
    await sequelize.authenticate();
    const [result] = await sequelize.query(
      `
      SELECT
        table_schema AS db_name,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables
      WHERE table_schema = :database
      GROUP BY table_schema
      `,
      {
        replacements: { database: sequelize.config.database },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return {
      database: sequelize.config.database,
      sizeMB: result?.size_mb || 0,
      status: "connected",
      timestamp: formatDate(new Date(), true),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { getDbHealthStatus };
