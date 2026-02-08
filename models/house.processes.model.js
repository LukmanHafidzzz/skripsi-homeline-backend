import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const HouseProcesses = db.define("house_processes", {
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
    survey_process: {
        type: DataTypes.ENUM(
            "Perlu Survey",
            "Sedang Survey",
            "Survey Selesai"
        ),
        allowNull: true,
    },
    design_process: {
        type: DataTypes.ENUM(
            "Perlu Desain",
            "Sedang Desain",
            "Desain Selesai"
        ),
        allowNull: true,
    },
    survey_status_input: {
        type: DataTypes.ENUM(
            "Pengecekan Hasil",
            "Revisi",
            "Approved"
        ),
        allowNull: false,
        defaultValue: null
    },
    design_status_input: {
        type: DataTypes.ENUM(
            "Pengecekan Hasil",
            "Revisi",
            "Approved"
        ),
        allowNull: false,
        defaultValue: null
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default HouseProcesses;