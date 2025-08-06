import express from "express";
import { handleUpload } from "../controllers/upload.js";

const router = express.Router();

router.post("/s3", handleUpload);

export default router;