import express from "express";
import {
    getLevelUsers,
    getLevelUserById,
    createLevelUser,
    updateLevelUser,
    deleteLevelUser,
} from "../controllers/level.user.js";

const router = express.Router();

router.get('/', getLevelUsers);
router.get('/:id', getLevelUserById);
router.post('/', createLevelUser);
router.patch('/:id', updateLevelUser);
router.delete('/:id', deleteLevelUser);

export default router;