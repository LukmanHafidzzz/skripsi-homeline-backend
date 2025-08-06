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
import UploadRoute from './routes/upload.routes.js'
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
    db: db,
});

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl} from ${req.headers.origin}`);
    next();
});

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://skripsi-homeline-frontend.vercel.app',
        'http://localhost:5173',
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-filename");
    res.header("Access-Control-Expose-Headers", "Set-Cookie");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// (async() => {
//     await db.sync();
// })();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store,
        name: 'connect.sid',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(express.json());

app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 50 * 1024 * 1024 // 20 MB
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
})); 1

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

app.use("/api/upload", UploadRoute);
app.use("/api/admin", AdminRoute);
app.use("/api/surveyor", SurveyorRoute);
app.use("/api/designer", DesignerRoute);
app.use("/api/admin/level-users", LevelUserRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);

// store.sync();

const PORT = process.env.APP_PORT
app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`);
});
