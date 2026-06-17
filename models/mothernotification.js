'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class motherNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  motherNotification.init({
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'motherNotification',
  });
  return motherNotification;
};