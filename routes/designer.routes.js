import express from "express";
import {
    getListHouse,
    getHouseDetail,
    getHouse3DModel,
    getListHouseMakeReq,
    postMakeRequest,
    getListHouseInput,
    postInputHouseModel,
} from "../controllers/designer.js";

const router = express.Router();

router.get('/house-list', getListHouse);
router.get('/house-detail/:id', getHouseDetail);
router.get('/house-detail/model/:id', getHouse3DModel);
router.get('/make-request', getListHouseMakeReq);
router.post('/make-request', postMakeRequest);
router.get('/result-input', getListHouseInput);
router.post('/input-house-model', postInputHouseModel);

export default router;