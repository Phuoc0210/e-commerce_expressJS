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
      Otp.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  Otp.init(
    {
      user_id: DataTypes.UUID,
      otp: DataTypes.STRING,
      expires_at: DataTypes.DATE,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Otp',
      tableName: 'otps',
      underscored: true,
    }
  );
  return Otp;
};
