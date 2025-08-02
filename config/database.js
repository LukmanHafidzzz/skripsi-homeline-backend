import { Sequelize } from "sequelize";

const db = new Sequelize('db_homeline', 'root', '', {
    host: "localhost",
    dialect: "mysql"
})


export default db;