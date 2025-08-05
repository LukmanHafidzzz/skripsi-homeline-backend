import { Sequelize } from "sequelize";

// const db = new Sequelize('db_homeline', 'root', '', {
//     host: "localhost",
//     dialect: "mysql"
// })

const db = new Sequelize('db_homeline', 'lukman', 'LukmanGaming', {
    host: "202.10.36.184",
    dialect: "mysql"
})


export default db;