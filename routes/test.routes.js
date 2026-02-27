import express from "express";
import {
    getAllTests,
    getPresignedUrl,
    createTest,
} from "../controllers/test.js";

const router = express.Router();

router.get("/get", getAllTests);
router.post("/presigned-url", getPresignedUrl);
router.post("/", createTest);

export default router;