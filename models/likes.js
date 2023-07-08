'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. Comments 모델에서
      this.belongsTo(models.Users, {
        // 2. Users 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'user_id', // 3. Users 모델의 userId 컬럼을
        foreignKey: 'User_id', // 4. Comments 모델의 UserId 컬럼과 연결합니다.
      });

      // 1. Comments 모델에서
      this.belongsTo(models.Posts, {
        // 2. Posts 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'post_id', // 3. Posts 모델의 postId 컬럼을
        foreignKey: 'Post_id', // 4. Comments 모델의 PostId 컬럼과 연결합니다.
      });
    }
  }
  Likes.init(
    {
      like_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      User_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },
      Post_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'Posts',
          key: 'post_id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false, // NOT NULL
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false, // NOT NULL
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Likes',
    },
  );
  return Likes;
};
