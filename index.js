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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
    db: db,
});

const allowedOrigins = [
    'http://localhost:5173',
    'https://skripsi-homeline-frontend.vercel.app',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(
    cors({
        credentials: true,
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin) || origin === process.env.CORS_ORIGIN) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie']
    })
);

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
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// (async() => {
//     await db.sync();
// })();

app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 50 * 1024 * 1024
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
app.get('/api/test-session', (req, res) => {
    res.json({
        sessionID: req.sessionID,
        session: req.session,
        userId: req.session?.userId,
        isAuthenticated: !!req.session?.userId
    });
});

// store.sync();

const PORT = process.env.APP_PORT
app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`);
});
