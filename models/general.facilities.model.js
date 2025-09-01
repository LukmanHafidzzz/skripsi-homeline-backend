import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const GeneralFacilities = db.define('general_facilities', {
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
    house_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    maps: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default GeneralFacilities;
