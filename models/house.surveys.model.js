import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const HouseSurveys = db.define("house_surveys", {
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
    photo_video_link: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
    notes_file: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default HouseSurveys;
