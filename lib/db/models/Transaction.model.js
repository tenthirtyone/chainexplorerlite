const { Sequelize, DataTypes } = require("sequelize");

const Transaction = {
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
};

module.exports = Transaction;
