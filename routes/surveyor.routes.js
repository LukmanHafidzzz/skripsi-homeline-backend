import express from "express";
import {
    getListHouse,
    getHouseDetail,
    getListHouseMakeReq,
    postMakeRequest,
    getListHouseInput,
    getGeneralFacilityTypes,
    postInputHouseSurvey,
} from "../controllers/surveyor.js";

const router = express.Router();

router.get('/house-list', getListHouse);
router.get('/house-detail/:id', getHouseDetail);
router.get('/make-request', getListHouseMakeReq);
router.post('/make-request', postMakeRequest);
router.get('/result-input', getListHouseInput); 
router.get('/general-facility-types', getGeneralFacilityTypes);
router.post('/input-house-survey', postInputHouseSurvey);

export default router;