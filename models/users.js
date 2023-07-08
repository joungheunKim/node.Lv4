'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Posts, {
        // 2. Posts 모델에게 1:N 관계 설정을 합니다.
        sourceKey: 'user_id', // 3. Users 모델의 userId 컬럼을
        foreignKey: 'User_id', // 4. Posts 모델의 UserId 컬럼과 연결합니다.
      });
    }
  }
  Users.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      nickname: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Users',
    },
  );
  return Users;
};
