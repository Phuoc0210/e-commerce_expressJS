'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Otp.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: DataTypes.UUID,
      email: DataTypes.STRING,
      otp: DataTypes.STRING,
      expiresAt: DataTypes.DATE,
      isUsed: DataTypes.BOOLEAN,
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Otp',
    }
  );
  return Otp;
};
