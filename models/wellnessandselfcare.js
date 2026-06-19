'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class wellnessAndSelfCare extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  wellnessAndSelfCare.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'wellnessAndSelfCare',
  });
  return wellnessAndSelfCare;
};