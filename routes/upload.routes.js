import express from 'express';
import { getPresignedUrl } from '../controllers/upload.js';

const router = express.Router();

router.get('/upload-url', getPresignedUrl);

export default router;