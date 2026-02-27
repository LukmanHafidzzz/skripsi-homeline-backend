import { Sequelize, UUID } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Tests = db.define('test', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
}, {
    freezeTableName: true,
});

export default Tests;