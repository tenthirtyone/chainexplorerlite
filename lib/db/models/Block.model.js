const { Sequelize, DataTypes } = require("sequelize");

const Block = {
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

module.exports = Block;
