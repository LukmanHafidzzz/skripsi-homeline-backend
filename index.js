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

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
    db: db,
});

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL // tambahkan untuk production nanti
].filter(Boolean);

app.use(
    cors({
        credentials: true,
        origin: function (origin, callback) {
            // Allow requests with no origin (Postman, mobile apps)
            if (!origin) return callback(null, true);

            // Check allowed origins or env variable
            if (allowedOrigins.includes(origin) || origin === process.env.CORS_ORIGIN) {
                return callback(null, true);
            } else {
                console.log('❌ Blocked origin:', origin);
                return callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie']
    })
);
// (async() => {
//     await db.sync();
// })();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false, // ubah ke false untuk security
        store: store,
        name: 'connect.sid', // nama session cookie
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only di production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' untuk cross-origin
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 jam
            // domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
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

const PORT = process.env.APP_PORT
app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 CORS Origin:', process.env.CORS_ORIGIN);
});
