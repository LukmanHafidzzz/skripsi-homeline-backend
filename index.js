import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/database.js";
import SequelizeStore from "connect-session-sequelize";
import AdminRoute from "./routes/admin.routes.js";
import UserRoute from "./routes/user.routes.js";
import LevelUserRoute from "./routes/level.user.routes.js";
import SurveyorRoute from './routes/surveyor.routes.js';
import DesignerRoute from './routes/designer.routes.js';
import AuthRoute from "./routes/auth.routes.js";
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db,
});

// (async() => {
//     await db.sync();
// })();

app.use(
    cors({
        credentials: true,
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    })
);
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: store,
        cookie: {
            secure: false,
            sameSite: "lax",
        },
    })
);


app.use(express.json());
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 20 * 1024 * 1024
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
}));

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

app.use("/api/admin", AdminRoute);
app.use("/api/surveyor", SurveyorRoute);
app.use("/api/designer", DesignerRoute);
app.use("/api/admin/level-users", LevelUserRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);

// store.sync();

app.listen(process.env.APP_PORT, () => {
    console.log(`The server app running on PORT...`);
});
