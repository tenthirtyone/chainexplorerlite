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
  from: {
    type: DataTypes.STRING,
  },
  to: {
    type: DataTypes.STRING,
  },
  input: {
    type: DataTypes.STRING,
  },
  value: {
    type: DataTypes.INTEGER,
  },
  gas: {
    type: DataTypes.INTEGER,
  },
};

module.exports = Transaction;
