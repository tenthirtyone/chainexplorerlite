const { DataTypes } = require("sequelize");

const Block = {
  number: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uncles: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
};

module.exports = Block;
