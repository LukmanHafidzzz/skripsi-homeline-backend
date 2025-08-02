import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Houses from "./houses.model.js";
import Users from "./user.model.js";

const SurveyRequests = db.define("survey_requests", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
    },
    house_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    request_status: {
        type: DataTypes.ENUM("Approved", "Rejected", "Waiting"),
        allowNull: false,
        defaultValue: "Waiting",
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default SurveyRequests;
