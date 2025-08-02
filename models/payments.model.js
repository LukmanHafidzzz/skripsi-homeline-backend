import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Payments = db.define("payments", {
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
    qr: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Payments;
