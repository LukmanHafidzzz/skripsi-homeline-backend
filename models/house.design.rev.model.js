import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const HouseDesignRevs = db.define("house_design_revs", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        }
    },
    house_design_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default HouseDesignRevs;
