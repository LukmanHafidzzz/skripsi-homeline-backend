import express from "express";
import {
    getListHouse,
    getHouseDetail,
    getListHouseNeedDesign,
    startDesign,
    getHouse3DModel,
    getListHouseInput,
    postInputHouseModel,
    getPresignedUrlForDesign,
    saveDesignFileInfo,
    getDesignNeedRevListHouse,
    revHouseDesign,
} from "../controllers/designer.js";

const router = express.Router();

router.get('/house-list', getListHouse);
router.get('/need-design', getListHouseNeedDesign);
router.patch('/start-design/:id', startDesign);
router.get('/house-detail/:id', getHouseDetail);
router.get('/house-detail/model/:id', getHouse3DModel);
router.get('/result-input', getListHouseInput);
router.post('/input-house-model', postInputHouseModel);
router.post('/get-presigned-url', getPresignedUrlForDesign);
router.post('/save-design-file', saveDesignFileInfo);
router.get('/rev-house-design', getDesignNeedRevListHouse);
router.put('/rev-house-design', revHouseDesign);

export default router;