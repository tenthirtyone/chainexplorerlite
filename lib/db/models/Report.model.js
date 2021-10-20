const { DataTypes } = require("sequelize");

/*

  Ultimately deprecated. I was overdoing it but left this in to chat about it

*/

const Report = {
  reportId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  startBlock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  endBlock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
};

module.exports = Report;
