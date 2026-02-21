'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class static_test_section extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  static_test_section.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'static_test_section',
  });
  return static_test_section;
};