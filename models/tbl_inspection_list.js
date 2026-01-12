"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TblInspectionList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.ListMotorType, {
        foreignKey: "inspMotorCode",
        targetKey: "motorCode",
      });

      this.hasOne(models.FormBalance, {
        foreignKey: "inspId",
        targetKey: "inspId",
      });

      this.hasOne(models.FormCoilBrakeTest, {
        foreignKey: "inspId",
        targetKey: "inspId",
      });
    }
  }
  TblInspectionList.init(
    {
      inspId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "insp_id",
      },

      inspNo: {
        type: DataTypes.STRING(100),
        field: "insp_no",
      },

      inspCustomerNo: {
        type: DataTypes.STRING(50),
        field: "insp_customer_no",
      },

      inspCustomerName: {
        type: DataTypes.STRING(255),
        field: "insp_customer_name",
      },

      inspSaleQuote: {
        type: DataTypes.STRING(50),
        field: "insp_sale_quote",
      },

      inspServiceOrder: {
        type: DataTypes.STRING(50),
        field: "insp_service_order",
      },

      inspServiceItem: {
        type: DataTypes.STRING(100),
        field: "insp_service_item",
      },

      inspServiceType: {
        type: DataTypes.STRING(50),
        field: "insp_service_type",
      },

      inspStatus: {
        type: DataTypes.STRING(50),
        field: "insp_status",
      },

      inspCreatedAt: {
        type: DataTypes.DATE,
        field: "insp_created_at",
        defaultValue: DataTypes.NOW,
      },

      inspMotorCode: {
        type: DataTypes.STRING(50),
        field: "insp_motor_code",
      },

      inspPriority: {
        type: DataTypes.STRING(45),
        field: "insp_priority",
      },

      inspStationUser: {
        type: DataTypes.STRING(45),
        field: "insp_station_user",
      },

      inspStationManpower: {
        type: DataTypes.INTEGER,
        field: "insp_station_manpower",
      },

      inspStationNow: {
        type: DataTypes.STRING(45),
        field: "insp_station_now",
      },

      inspStationAccept: {
        type: DataTypes.INTEGER,
        field: "insp_station_accept",
        defaultValue: 0,
      },

      inspStationPrev: {
        type: DataTypes.STRING(45),
        field: "insp_station_prev",
      },

      inspDocumentDate: {
        type: DataTypes.DATEONLY,
        field: "insp_document_date",
      },

      inspectionUpdatedAt: {
        type: DataTypes.DATE,
        field: "inspection_updated_at",
      },

      inspIncomingDate: {
        type: DataTypes.DATEONLY,
        field: "insp_incoming_date",
      },

      inspFinalDate: {
        type: DataTypes.DATEONLY,
        field: "insp_final_date",
      },

      inspBranch: {
        type: DataTypes.STRING(45),
        field: "insp_branch",
      },

      inspUrgent: {
        type: DataTypes.INTEGER,
        field: "insp_urgent",
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "TblInspectionList",
      tableName: "tbl_inspection_list",
      underscored: true,
      timestamps: false,
    }
  );
  return TblInspectionList;
};
