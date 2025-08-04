import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Address = db.define("address", {
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
    province: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
    city: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
    subdistrict: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
    village: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
    full_address: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Address;